import {
  PASSWORD_MAX_LENGTH,
  RESET_ATTEMPT_LIMIT_TIME,
  PASSWORD_MIN_LENGTH,
} from "../../constants/variables/common.variables";
export const DATABASE_ERROR = "Mysql database error.";
export const MISSING_ENV_VARIABLES = "Missing required environment variable";
export const FORBIDDEN_ERROR = "Forbidden.";
export const UNAUTHORIZED = "Unauthorized.";
export const INTERNAL_SERVER_ERROR = "Internal server error.";
export const RESOURCE_NOT_FOUND = "Resource not found.";
export const UNKNOWN_ERROR = "Unknown error occurred.";
export const EXPIRE_TOKEN = "Token is expired.";
export const INVALID_TOKEN = "Invalid token.";
export const SESSION_TIMEOUT = "Session timeout.";
export const USER_DEACTIVATE = "User is deactivated.";
export const INVALID_CREDENTIALS = "Invalid email or password";
export const INVALID_FROM_UNIT = "Invalid from unit";
export const INVALID_TO_UNIT = "Invalid to unit";
export const SUPPORTED_TIME_UNITS =
  "Supported units: year, month, day, hour, minute, second, millisecond.";
export const INVALID_PASSWORD_FORMAT = `Password must be between ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with an uppercase, lowercase, number, and special character.`;
export const INVALID_PARAMETERS = "Invalid parameters provided.";
export const INVALID_PASSWORD_FORMAT_MESSAGE = {
  "string.pattern.base": INVALID_PASSWORD_FORMAT,
};
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const TOO_MANY_RESET_ATTEMPTS = `Too many password reset attempts. Please try again after ${RESET_ATTEMPT_LIMIT_TIME} minutes.`;
export const SMTP_DOMAIN_NOT_FOUND =
  "The provided email address or domain is invalid.";

/*Generates a standardized error message when an invalid sort field is provided.*/
export const getInvalidSortFieldMessage = (
  sortBy: string,
  allowedFields: string[]
): string => {
  return `Invalid sort field: ${sortBy}. Allowed fields are: ${allowedFields.join(", ")}`;
};

/* User Account Inactive */
export const ACCOUNT_INACTIVE =
  "Your account is currently inactive. Please reach out to the realstate team for help.";

/* User Detail Fetch */
export const DETAIL_FETCH_SUCCESS = "Detail fetched successfully.";

/* User Not Found */
export const ACCOUNT_NOT_FOUND = "Account not found.";
