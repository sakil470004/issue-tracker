export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: '24h'
  };