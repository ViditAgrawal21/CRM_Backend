import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase.js';
import { config } from '../../config/index.js';

export const login = async (phone, password) => {
  // Find user by phone
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !user) {
    throw new Error('Invalid phone or password');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid phone or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Return user data (without password) and token
  const { password_hash, ...userData } = user;
  
  return {
    user: userData,
    token
  };
};
