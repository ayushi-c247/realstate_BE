export const TOKEN_EXPIRE = 1; // TOKEN expiration time (e.g., '1d' for one day)
export const TOKEN_EXPIRE_UNIT = "day"; // Supported units: year, month, day, hour, minute, second, millisecond
export const CAST_ERROR = "CastError"; // Error name for cast errors
export const DUPLICATE_KEY_ERROR = 11000; // Error code for duplicate key errors
export const ERROR_MESSAGE_REGEX = /[^a-zA-Z0-9-']/g; // Regular expression to clean error messages of any special characters
export const SERVER_URL = "http://localhost"; // Frontend base URL which the email link will point to
export const HASH_METHOD = "sha256"; // Hashing algorithm used for storing passwords
export const JSON_WEB_TOKEN_ERROR = "JsonWebTokenError"; // Error name for JSON Web Token errors
export const PASSWORD_REGEX =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,20}$";
export const NAME_REGEX = /^[A-Za-z\s]+$/; // Regular expression to validate name format
export const PASSWORD_MIN_LENGTH = 8; // Minimum length of the password
export const PASSWORD_MAX_LENGTH = 20; // Minimum length of the password
export const SCHEMA_KEYS = ["params", "query", "body"]; // Validation schema keys (params, query, body) for the JOI validation
export const TOKEN_EXPIRED_ERROR = "TokenExpiredError"; // Error name for token expired errors
export const JWT_TOKEN_EXPIRE = "1d"; // expire after 1 day(24h)  1d
export const RESET_ATTEMPT_LIMIT_TIME = 15; // 15 minutes
export const DEVELOPMENT = "development";
export const MILLISECOND = "millisecond";
export const COOKIE_SAME_SITE = "strict"; // Set a cross-site cookie for third-party contexts
export const MYSQL_ERRORS: string[] = ["MySqlError", "MySqlError"]; // Error names for MongoDB errors

// Pagination response schema
export const PAGINATION_META_SCHEMA = {
  type: "object",
  properties: {
    total: { type: "integer", example: 100 },
    totalPages: { type: "integer", example: 10 },
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 10 },
    hasNextPage: { type: "boolean", example: true },
    hasPrevPage: { type: "boolean", example: false },
  },
};

export const paginations = {
  ITEM_LIMIT: 50,
  DEFAULT_PAGE: 0,
};

export const DB_COLLECTIONS = {
  USER: "user",
};

// Basic name validation
export const NAME_MAX_LENGTH = 50;

// Basic email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX_LENGTH = 80;
