const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const socketService = require('./socket.service');

const getChallans = async (query) => {
  const { page = 1, limit = 10, search, status, customer_id } = query;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('challans')
    .select(
      '*, customers:customer_id(customer_name, business_name), users:created_by(name)',
      { count: 'exact' }
    );

  if (search) {
    dbQuery = dbQuery.ilike('challan_number', `%${search}%`);
  }

  if (status) {
    dbQuery = dbQuery.eq('status', status);
  }

  if (customer_id) {
    dbQuery = dbQuery.eq('customer_id', customer_id);
  }

  dbQuery = dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) throw new AppError('Failed to fetch challans', 500);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getChallanById = async (id) => {
  const { data: challan, error } = await supabase
    .from('challans')
    .select(
      '*, customers:customer_id(id, customer_name, business_name, mobile, email, gst_number, address), users:created_by(name, email)'
    )
    .eq('id', id)
    .single();

  if (error || !challan) throw new AppError('Challan not found', 404);

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from('challan_items')
    .select('*')
    .eq('challan_id', id)
    .order('created_at', { ascending: true });

  if (itemsError) throw new AppError('Failed to fetch challan items', 500);

  return { ...challan, items };
};

const createChallan = async (challanData, userId) => {
  const { customer_id, items } = challanData;

  // Validate customer exists
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, customer_name')
    .eq('id', customer_id)
    .single();

  if (custError || !customer) {
    throw new AppError('Customer not found', 404);
  }

  // Generate challan number
  const { data: challanNumber, error: genError } = await supabase.rpc(
    'generate_challan_number'
  );

  if (genError) throw new AppError('Failed to generate challan number', 500);

  // Fetch product details for snapshots and calculate totals
  let totalQuantity = 0;
  let totalAmount = 0;
  const challanItems = [];

  for (const item of items) {
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', item.product_id)
      .single();

    if (prodError || !product) {
      throw new AppError(`Product not found: ${item.product_id}`, 404);
    }

    const itemTotal = product.unit_price * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += itemTotal;

    challanItems.push({
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: product.unit_price,
      quantity: item.quantity,
      total_price: itemTotal,
    });
  }

  // Create challan
  const { data: challan, error: challanError } = await supabase
    .from('challans')
    .insert({
      challan_number: challanNumber,
      customer_id,
      total_quantity: totalQuantity,
      total_amount: totalAmount,
      status: 'DRAFT',
      created_by: userId,
    })
    .select()
    .single();

  if (challanError) throw new AppError('Failed to create challan', 500);

  // Insert challan items with snapshots
  const itemsWithChallanId = challanItems.map((item) => ({
    ...item,
    challan_id: challan.id,
  }));

  const { error: itemsInsertError } = await supabase
    .from('challan_items')
    .insert(itemsWithChallanId);

  if (itemsInsertError) {
    // Cleanup challan if items fail
    await supabase.from('challans').delete().eq('id', challan.id);
    throw new AppError('Failed to create challan items', 500);
  }

  const newChallan = await getChallanById(challan.id);
  socketService.sendNotification(
    'all',
    'NEW_CHALLAN',
    `New Draft Challan created: ${newChallan.challan_number} for customer ${newChallan.customers?.customer_name || 'N/A'}.`
  );
  return newChallan;
};

const updateChallan = async (id, updateData, userId) => {
  const existingChallan = await getChallanById(id);

  if (existingChallan.status !== 'DRAFT') {
    throw new AppError('Only DRAFT challans can be updated', 400);
  }

  const { customer_id, items } = updateData;

  // Update customer if provided
  if (customer_id) {
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .single();

    if (custError || !customer) {
      throw new AppError('Customer not found', 404);
    }
  }

  // If items are provided, recalculate and replace
  if (items && items.length > 0) {
    let totalQuantity = 0;
    let totalAmount = 0;
    const challanItems = [];

    for (const item of items) {
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (prodError || !product) {
        throw new AppError(`Product not found: ${item.product_id}`, 404);
      }

      const itemTotal = product.unit_price * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += itemTotal;

      challanItems.push({
        challan_id: id,
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity: item.quantity,
        total_price: itemTotal,
      });
    }

    // Delete existing items
    await supabase.from('challan_items').delete().eq('challan_id', id);

    // Insert new items
    const { error: itemsError } = await supabase
      .from('challan_items')
      .insert(challanItems);

    if (itemsError) throw new AppError('Failed to update challan items', 500);

    // Update challan totals
    const updateFields = {
      total_quantity: totalQuantity,
      total_amount: totalAmount,
    };

    if (customer_id) updateFields.customer_id = customer_id;

    await supabase.from('challans').update(updateFields).eq('id', id);
  } else if (customer_id) {
    await supabase
      .from('challans')
      .update({ customer_id })
      .eq('id', id);
  }

  return getChallanById(id);
};

const confirmChallan = async (id, userId) => {
  // Use the PostgreSQL RPC for atomic confirmation
  const { data, error } = await supabase.rpc('confirm_challan', {
    p_challan_id: id,
    p_user_id: userId,
  });

  if (error) {
    // Parse PostgreSQL error message
    const msg = error.message || 'Failed to confirm challan';
    if (msg.includes('Insufficient stock')) {
      throw new AppError(msg, 400);
    }
    if (msg.includes('DRAFT')) {
      throw new AppError('Only DRAFT challans can be confirmed', 400);
    }
    if (msg.includes('not found')) {
      throw new AppError('Challan not found', 404);
    }
    throw new AppError(msg, 500);
  }

  if (data && !data.success) {
    throw new AppError(data.message, 400);
  }

  const confirmedChallan = await getChallanById(id);
  
  // Send real-time notification to Accounts, Warehouse and Admin
  socketService.sendNotification(
    ['Admin', 'Warehouse', 'Accounts'],
    'CHALLAN_CONFIRMED',
    `Challan confirmed: ${confirmedChallan.challan_number} has been confirmed. Stock has been deducted.`
  );

  // Check and trigger low stock alerts on the deducted items
  try {
    for (const item of confirmedChallan.items || []) {
      const { data: prod } = await supabase
        .from('products')
        .select('current_stock, minimum_stock, product_name, sku')
        .eq('id', item.product_id)
        .single();
      if (prod && prod.current_stock <= prod.minimum_stock) {
        socketService.sendNotification(
          ['Admin', 'Warehouse'],
          'LOW_STOCK',
          `Low Stock Alert: "${prod.product_name}" is down to ${prod.current_stock} units (SKU: ${prod.sku}).`
        );
      }
    }
  } catch (err) {
    console.error('Error triggering low stock notifications post challan confirmation:', err);
  }

  return confirmedChallan;
}

const cancelChallan = async (id) => {
  const challan = await getChallanById(id);

  if (challan.status !== 'DRAFT') {
    throw new AppError('Only DRAFT challans can be cancelled', 400);
  }

  const { error } = await supabase
    .from('challans')
    .update({ status: 'CANCELLED' })
    .eq('id', id);

  if (error) throw new AppError('Failed to cancel challan', 500);

  return getChallanById(id);
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
};
