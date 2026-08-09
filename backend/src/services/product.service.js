const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const socketService = require('./socket.service');

const getProducts = async (query) => {
  const { page = 1, limit = 10, search, category, low_stock } = query;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (search) {
    dbQuery = dbQuery.or(
      `product_name.ilike.%${search}%,sku.ilike.%${search}%`
    );
  }

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  if (low_stock === 'true') {
    dbQuery = dbQuery.filter('current_stock', 'lte', supabase.rpc ? 0 : 'minimum_stock');
    // Use raw filter for comparing two columns
  }

  dbQuery = dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) throw new AppError('Failed to fetch products', 500);

  // Add low_stock flag to each product
  const productsWithFlag = data.map((p) => ({
    ...p,
    is_low_stock: p.current_stock <= p.minimum_stock,
  }));

  return {
    data: productsWithFlag,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new AppError('Product not found', 404);

  return {
    ...data,
    is_low_stock: data.current_stock <= data.minimum_stock,
  };
};

const createProduct = async (productData) => {
  // Check SKU uniqueness
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('sku', productData.sku)
    .single();

  if (existing) {
    throw new AppError('A product with this SKU already exists', 409);
  }

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError('A product with this SKU already exists', 409);
    }
    throw new AppError('Failed to create product', 500);
  }

  return data;
};

const updateProduct = async (id, productData) => {
  await getProductById(id);

  // If SKU is being updated, check uniqueness
  if (productData.sku) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .neq('id', id)
      .single();

    if (existing) {
      throw new AppError('A product with this SKU already exists', 409);
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError('Failed to update product', 500);

  return data;
};

const stockIn = async (productId, quantity, reason, userId) => {
  const product = await getProductById(productId);

  // Update stock
  const { error: updateError } = await supabase
    .from('products')
    .update({ current_stock: product.current_stock + quantity })
    .eq('id', productId);

  if (updateError) throw new AppError('Failed to update stock', 500);

  // Create stock movement
  const { data: movement, error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      product_id: productId,
      quantity,
      movement_type: 'IN',
      reason: reason || 'Manual stock in',
      created_by: userId,
    })
    .select()
    .single();

  if (movementError) throw new AppError('Failed to create stock movement', 500);

  return {
    product_id: productId,
    product_name: product.product_name,
    previous_stock: product.current_stock,
    new_stock: product.current_stock + quantity,
    movement: movement,
  };
};

const stockOut = async (productId, quantity, reason, userId) => {
  const product = await getProductById(productId);

  if (product.current_stock < quantity) {
    throw new AppError(
      `Insufficient stock for ${product.product_name}. Available: ${product.current_stock}, Requested: ${quantity}`,
      400
    );
  }

  // Update stock
  const newStock = product.current_stock - quantity;
  const { error: updateError } = await supabase
    .from('products')
    .update({ current_stock: newStock })
    .eq('id', productId);

  if (updateError) throw new AppError('Failed to update stock', 500);

  // Send real-time notification if stock drops below minimum stock limit
  if (newStock <= product.minimum_stock) {
    socketService.sendNotification(
      ['Admin', 'Warehouse'],
      'LOW_STOCK',
      `Low Stock Alert: "${product.product_name}" is down to ${newStock} units (SKU: ${product.sku}).`
    );
  }

  // Create stock movement
  const { data: movement, error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      product_id: productId,
      quantity,
      movement_type: 'OUT',
      reason: reason || 'Manual stock out',
      created_by: userId,
    })
    .select()
    .single();

  if (movementError) throw new AppError('Failed to create stock movement', 500);

  return {
    product_id: productId,
    product_name: product.product_name,
    previous_stock: product.current_stock,
    new_stock: product.current_stock - quantity,
    movement: movement,
  };
};

const getStockMovements = async (productId, query) => {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('stock_movements')
    .select('*, products:product_id(product_name, sku), users:created_by(name)', {
      count: 'exact',
    });

  if (productId) {
    dbQuery = dbQuery.eq('product_id', productId);
  }

  dbQuery = dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) throw new AppError('Failed to fetch stock movements', 500);

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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  stockIn,
  stockOut,
  getStockMovements,
};
