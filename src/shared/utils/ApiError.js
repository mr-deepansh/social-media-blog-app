class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    data = null,
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
