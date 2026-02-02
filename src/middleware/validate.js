export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: formattedErrors 
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
};
