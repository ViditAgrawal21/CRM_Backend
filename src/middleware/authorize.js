export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const authorizeOwner = authorize('owner');
export const authorizeAdmin = authorize('owner', 'admin');
export const authorizeManager = authorize('owner', 'admin', 'manager');
export const authorizeAll = authorize('owner', 'admin', 'manager', 'employee');
