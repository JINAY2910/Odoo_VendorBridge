import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// AUTH BYPASSED — inject mock admin user, skip token verification
export const protect = async (req, res, next) => {
  // Attach a mock admin user so all downstream controllers work
  req.user = {
    _id: 1,
    id: 1,
    name: 'System Admin',
    email: 'admin@company.com',
    role: 'ADMIN'
  };
  return next();

  /* --- ORIGINAL AUTH (re-enable later) ---
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_jwt_key');
      req.user = await User.findByPk(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
  */
};

// AUTH BYPASSED — role check skipped, always passes
export const authorize = (...roles) => {
  return (req, res, next) => {
    return next();
    /* --- ORIGINAL ROLE CHECK (re-enable later) ---
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
    */
  };
};