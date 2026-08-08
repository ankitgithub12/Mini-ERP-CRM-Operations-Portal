const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

const login = async (email, password) => {
  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { login };
