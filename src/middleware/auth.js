import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, role, parent_id, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
    
    if (!user) {
      console.error('User not found for ID:', decoded.userId);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account deactivated', 
        message: 'Your account has been deactivated. Please contact your administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
