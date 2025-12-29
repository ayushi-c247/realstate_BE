// Third-party modules
import Joi from "joi";
// Constants
import { commonMessages, commonVariables } from "@constants";

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).unknown(false),
};

export const passwordResetSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .pattern(new RegExp(`${commonVariables.PASSWORD_REGEX}`))
      .required()
      .messages(commonMessages.INVALID_PASSWORD_FORMAT_MESSAGE),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string()
      .pattern(new RegExp(`${commonVariables.PASSWORD_REGEX}`))
      .required()
      .messages(commonMessages.INVALID_PASSWORD_FORMAT_MESSAGE),
  }).unknown(false),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};
