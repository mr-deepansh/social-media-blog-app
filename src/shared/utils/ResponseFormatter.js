// src/shared/utils/ResponseFormatter.js
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Standard API response formatter
 */
export class ResponseFormatter {
  /**
	 * Success response
	 */
  static success(res, data = null, message = "Success", statusCode = HTTP_STATUS.OK, meta = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  }

  /**
	 * Error response
	 */
  static error(res, message = "Error occurred", statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
	 * Paginated response
	 */
  static paginated(res, data, pagination, message = "Data retrieved successfully") {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        totalItems: pagination.total,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrevPage: pagination.page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
	 * Created response
	 */
  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
	 * No content response
	 */
  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
	 * Validation error response
	 */
  static validationError(res, errors, message = "Validation failed") {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  /**
	 * Unauthorized response
	 */
  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
	 * Forbidden response
	 */
  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
	 * Not found response
	 */
  static notFound(res, message = "Resource not found") {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
	 * Conflict response
	 */
  static conflict(res, message = "Resource conflict") {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  /**
	 * Too many requests response
	 */
  static tooManyRequests(res, message = "Too many requests") {
    return this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  /**
	 * Internal server error response
	 */
  static internalError(res, message = "Internal server error") {
    return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
