const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const socketService = require('./socket.service');

const getCustomers = async (query) => {
  const { page = 1, limit = 10, search, status, customer_type } = query;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  if (search) {
    dbQuery = dbQuery.or(
      `customer_name.ilike.%${search}%,mobile.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`
    );
  }

  if (status) {
    dbQuery = dbQuery.eq('status', status);
  }

  if (customer_type) {
    dbQuery = dbQuery.eq('customer_type', customer_type);
  }

  dbQuery = dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) throw new AppError('Failed to fetch customers', 500);

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

const getCustomerById = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new AppError('Customer not found', 404);

  return data;
};

const createCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError('A customer with this email already exists', 409);
    }
    throw new AppError('Failed to create customer', 500);
  }

  // Trigger notification for new customer
  socketService.sendNotification(
    ['Admin', 'Sales'],
    'NEW_LEAD',
    `New Customer Lead: "${data.customer_name}" has been registered as a ${data.customer_type}.`
  );

  return data;
};

const updateCustomer = async (id, customerData) => {
  // Check customer exists
  await getCustomerById(id);

  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError('Failed to update customer', 500);

  return data;
};

const deleteCustomer = async (id) => {
  await getCustomerById(id);

  const { error } = await supabase
    .from('customers')
    .update({ status: 'Inactive' })
    .eq('id', id);

  if (error) throw new AppError('Failed to deactivate customer', 500);

  return { message: 'Customer deactivated successfully' };
};

const getFollowUps = async (customerId) => {
  await getCustomerById(customerId);

  const { data, error } = await supabase
    .from('customer_followups')
    .select('*, users:created_by(name, email)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new AppError('Failed to fetch follow-ups', 500);

  return data;
};

const createFollowUp = async (customerId, followUpData, userId) => {
  await getCustomerById(customerId);

  const { data, error } = await supabase
    .from('customer_followups')
    .insert({
      customer_id: customerId,
      follow_up_date: followUpData.follow_up_date,
      notes: followUpData.notes,
      created_by: userId,
    })
    .select('*, users:created_by(name, email)')
    .single();

  if (error) throw new AppError('Failed to create follow-up', 500);

  // Update customer's follow_up_date
  await supabase
    .from('customers')
    .update({ follow_up_date: followUpData.follow_up_date })
    .eq('id', customerId);

  // Trigger notification
  try {
    const customer = await getCustomerById(customerId);
    socketService.sendNotification(
      ['Admin', 'Sales'],
      'NEW_FOLLOWUP',
      `CRM Follow-up scheduled for "${customer.customer_name}" on ${followUpData.follow_up_date}.`
    );
  } catch (err) {
    console.error('Failed to send follow-up socket notification:', err);
  }

  return data;
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getFollowUps,
  createFollowUp,
};
