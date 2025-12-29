import Joi from "joi";
import { UserRole, UserStatus } from "@prisma/client";
import { commonVariables, userMessages } from "@constants";
import { commonHandler } from "@utils";

/* Add User Schema */
export const addUserValidation = {
  body: Joi.object({
    role: Joi.string()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .optional()
      .messages({
        "any.invalid": `role must be one of [${UserRole.INVESTOR.toLowerCase()}, ${UserRole.AGENT.toLowerCase()}]`,
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(commonVariables.EMAIL_MAX_LENGTH),
    first_name: Joi.string()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("First name")),
    last_name: Joi.string()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("Last name")),
  }).unknown(false),
};

/* Forgot Password Schema */
export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

/* Resend Invitation Schema */
export const resendInvitationSchema = {
  body: Joi.object({
    user_id: Joi.number().required(),
  }),
};

/* Update Status Schema */
export const updateStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid(UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING)
      .required(),
  }),
};
