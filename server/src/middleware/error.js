/** Errors that carry an HTTP status code. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    if (errors) this.errors = errors;
  }
}

/** Wrap async route handlers so rejected promises reach the error middleware. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/* eslint-disable no-unused-vars */
export function errorHandler(error, req, res, next) {
  // Zod validation errors → 400 with per-field messages for the form UI.
  if (error?.name === 'ZodError') {
    const fieldErrors = {};
    for (const issue of error.issues) {
      const field = issue.path.join('.') || 'form';
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return res.status(400).json({
      message: 'Please check the highlighted fields.',
      errors: fieldErrors,
    });
  }

  // Malformed ObjectId → treat as "not found" rather than a 500.
  if (error?.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${error.path}` });
  }

  if (error?.name === 'ValidationError') {
    const fieldErrors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
    );
    return res.status(400).json({ message: 'Validation failed', errors: fieldErrors });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message, errors: error.errors });
  }

  console.error('[api] Unhandled error:', error);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}
