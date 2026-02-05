import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase.js';
import { config } from '../../config/index.js';

export const initializeOwner = async (name, phone, password) => {
  // Check if owner already exists
  const { data: existingOwner } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'owner')
    .single();

  if (existingOwner) {
    throw new Error('Owner account already exists');
  }

  // Check if phone is already taken
  const { data: existingPhone } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existingPhone) {
    throw new Error('Phone number already registered');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create owner account
  const { data: owner, error } = await supabase
    .from('users')
    .insert({
      name,
      phone,
      password_hash,
      role: 'owner',
      parent_id: null,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create owner account');
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: owner.id, role: owner.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const { password_hash: _, ...userData } = owner;
  
  return {
    user: userData,
    token
  };
};

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
