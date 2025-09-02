class ApiResponse {
  constructor(
    statusCode,
    data = null,
    message = "Success",
    success = true,
    meta = {},
  ) {
    this.success = success ?? statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = {
      ...meta,
      timestamp: meta.timestamp || new Date().toISOString(),
    };
  }
}

export { ApiResponse };
