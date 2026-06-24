// 1. Catch requests made to non-existent routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the global error handler below
};

// 2. Global Error Handler: Formats all errors into a clean JSON response
const errorHandler = (err, req, res, next) => {
  // Sometimes a controller might throw an error but still have a 200 OK status code.
  // We force it to a 500 Server Error if that happens.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only show the line-by-line stack trace if we are NOT in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };