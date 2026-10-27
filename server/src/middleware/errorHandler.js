function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred.';

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    // If it's the booking unique slot constraint
    if (err.keyPattern && (err.keyPattern.venue || err.keyPattern.startTime)) {
      statusCode = 409;
      message = 'This time slot has already been confirmed by another player. Please choose another slot.';
    } else if (err.keyPattern && err.keyPattern.email) {
      statusCode = 400;
      message = 'An account with this email address already exists. Please log in instead.';
    } else {
      statusCode = 409;
      message = 'A conflicting record with these details already exists.';
    }
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier format for field '${err.path}'.`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
  }

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
