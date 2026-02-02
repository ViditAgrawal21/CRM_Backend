import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  properties: {
    apiUrl: process.env.PROPERTIES_API_URL,
    apiKey: process.env.PROPERTIES_API_KEY
  }
};
