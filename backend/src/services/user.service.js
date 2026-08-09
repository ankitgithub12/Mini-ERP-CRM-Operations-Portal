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

const updateUser = async (id, userData) => {
  const { name, email, password, role } = userData;

  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingUser) {
    throw new AppError('User not found', 404);
  }

  if (email && email.toLowerCase() !== existingUser.email) {
    const { data: emailConflict } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (emailConflict) {
      throw new AppError('A user with this email already exists', 409);
    }
  }

  const updateFields = {
    name: name || existingUser.name,
    email: email ? email.toLowerCase() : existingUser.email,
    role: role || existingUser.role,
    updated_at: new Date().toISOString(),
  };

  if (password) {
    const salt = await bcrypt.genSalt(12);
    updateFields.password_hash = await bcrypt.hash(password, salt);
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateFields)
    .eq('id', id)
    .select('id, name, email, role, created_at, updated_at')
    .single();

  if (error) throw new AppError('Failed to update user', 500);

  return data;
};

const deleteUser = async (id) => {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !user) {
    throw new AppError('User not found', 404);
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new AppError('Cannot delete this user because they have associated transactional history (challans, followups, or stock movements).', 400);
    }
    throw new AppError('Failed to delete user', 500);
  }

  return { message: 'User deleted successfully' };
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
