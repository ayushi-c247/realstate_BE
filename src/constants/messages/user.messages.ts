import {
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from "../variables/common.variables";

/* Created Success Messages */
export const getUserCreatedMessage = (
  role: string,
  sendEmail: boolean = false
): string => {
  const successMessage = `${role} added successfully.`;
  return sendEmail
    ? `${successMessage} Onboarding link sent via email.`
    : successMessage;
};

/* Upadate Success Messages */
export const getUserInformationUpdatedMessage = (role: string) => {
  return `${role} information updated successfully.`;
};

/* Delete Success Messages */
export const getUserDeletedMessage = (role: string) => {
  return `${role} deleted successfully.`;
};

/* User detail fetch Messages */
export const getUserInformationFetchedMessage = (role: string) => {
  return `${role} details fetched successfully.`;
};

/* Status Update Messages */
export const getUseStatusUpdatedMessage = (role: string) => {
  return `${role} status updated successfully.`;
};
/* Tour Status Update Message */
export const getProfileCreatedMessage = (role: string) => {
  return `${role} profile created successfully.`;
};
/* Tour Status Update Message */
export const userProfileAlreadyExistsMessage = (role: string) => {
  return `${role} profile already exists.`;
};

/* Already Exists Messages */
export const USER_ALREADY_EXISTS = "This email address already exists";
export const UPDATE_FAILED = "Failed to update user.";
export const DELETE_FAILED = "Failed to delete user.";

/* Resend Invitation Messages */
export const RESEND_INVITATION =
  "Invitation email has been resent successfully.";
export const RESEND_INVITATION_ERROR = "Failed to resend invitation email.";
export const LETTERS_LIMIT_ACCESSED = `must not exceed ${NAME_MAX_LENGTH} characters`;
export const EMAIL_LIMIT_ACCESSED = `Email must not exceed ${EMAIL_MAX_LENGTH} characters`;
export const INVALID_ROLE_FILTER = "The provided role filter is invalid.";
/* ----User Validation---- */

/* Letters Allowed Validation */
export const ONLY_LETTERS_ALLOWED = (field: string) =>
  `${field} must contain only letters.`;

/* Role must be one of */
export const ROLE_MUST_BE_ONE_OF = (field: string[]) =>
  `Role must be one of ${field.join(", ")}.`;

/* Role Required */
export const ROLE_REQUIRED = "Role is required.";
