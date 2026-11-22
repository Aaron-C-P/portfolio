// Express 4 does not catch errors from async route handlers: a rejected promise would hang the request. This wraps
// every handler so a rejection goes to the normal error handler (a clean 500) instead.
import Layer from 'express/lib/router/layer.js';

const original = Layer.prototype.handle_request;
Layer.prototype.handle_request = function handle(req, res, next) {
  const fn = this.handle;
  if (fn.length > 3) return next(); // error-handling middleware keeps its normal path
  try {
    const out = fn(req, res, next);
    if (out && typeof out.catch === 'function') out.catch(next);
  } catch (e) {
    next(e);
  }
};
Layer.prototype.handle_request.original = original;
