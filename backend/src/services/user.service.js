const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw new AppError('Failed to fetch users', 500);

  return data;
};

const createUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash,
      role,
    })
    .select('id, name, email, role, created_at')
    .single();

  if (error) throw new AppError('Failed to create user', 500);

  return data;
};

module.exports = { getUsers, createUser };
