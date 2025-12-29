import crypto from "node:crypto";
import type { Response } from "express";
import { UserStatus } from "@prisma/client";

import { prismaService } from "@services";
import { authHandler, generateTokenHandler, emailHandler } from "@utils";
import {
  BAD_REQUEST,
  CREATED,
  OK,
  SERVER_ERROR,
  authMessages,
  commonMessages,
  commonVariables,
  emailVariables,
} from "@constants";
import { IApiResponse, ILoginBody, IResetPasswordBody } from "@customTypes";

/**
 * Login a user with email and password.
 * @param {ILoginBody} data - The login data
 * @param {Response} res - The response
 * @returns {Promise<IApiResponse>} - The response
 */
export const login = async (
  data: ILoginBody,
  res: Response
): Promise<IApiResponse> => {
  const { email, password } = data;
  const formatEmail = email.toLowerCase();
  const user = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      email: formatEmail,
      deleted_at: null,
    },
    {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        status: true,
        password: true,
        is_email_verified: true,
      }, // Fields to select
    }
  );
  if (!user) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: authMessages.ACCOUNT_NOT_FOUND_MESSAGE,
      data: null,
    };
  }
  // if (user.status === UserStatus.PENDING) {
  //   throw new Error(authMessages.ACCOUNT_PENDING);
  // }
  if (user.status === UserStatus.INACTIVE) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: commonMessages.ACCOUNT_INACTIVE,
      data: null,
    };
  }

  const isMatch = await authHandler.comparePassword(password, user.password);

  if (!isMatch) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: commonMessages.INVALID_CREDENTIALS,
      data: null,
    };
  }
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const authToken = await generateTokenHandler.generateAuthToken(res, payload);
  // store token for verify user while login
  await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { access_token: authToken, last_login_date: new Date() },
    { id: user.id }
  );

  return {
    status: OK,
    success: true,
    message: authMessages.LOGIN_SUCCESS,
    data: {
      token: authToken,
      role: user.role,
    },
  };
};

/**
 * Retrieves users from the database.
 * If a userId is provided, fetch that specific user; otherwise, fetch all users.
 * @param {Request} req Express request object
 * @returns {Promise<GetUsersResponse>} Response containing the user(s) or error information
 */
export const fetchDetails = async (id: number): Promise<IApiResponse> => {
  const user = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { id, deleted_at: null },
    {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        full_name: true,
        status: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    }
  );

  return {
    status: user ? OK : BAD_REQUEST,
    success: Boolean(user),
    message: user
      ? commonMessages.DETAIL_FETCH_SUCCESS
      : commonMessages.ACCOUNT_NOT_FOUND,
    data: user ?? null,
  };
};

/**
 * Logs out the user by clearing the authentication token.
 * @param {Response} res - The response object.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, and message.
 */
export const logout = async (user_id: number): Promise<IApiResponse> => {
  const user = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      id: user_id,
    }
  );

  if (!user) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: commonMessages.ACCOUNT_NOT_FOUND,
      data: null,
    };
  }

  await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { access_token: null },
    { id: user.id }
  );
  return {
    status: OK,
    success: true,
    message: authMessages.LOGOUT_SUCCESS,
    data: null,
  };
};

/**
 * Handles user forget password by sending an email with a reset link.
 * @param {IForgetPasswordBody} data - The user email to be used for sending the reset link.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message and data.
 */

export const forgetPassword = async (email: string): Promise<IApiResponse> => {
  try {
    const formatEmail = email.toLocaleLowerCase();
    // Check if the email already exists
    const user = await prismaService.findFirstRecord(
      commonVariables.DB_COLLECTIONS.USER,
      {
        email: formatEmail,
        deleted_at: null,
      }
    );
    if (!user) {
      return {
        status: BAD_REQUEST,
        success: false,
        message: commonMessages.ACCOUNT_NOT_FOUND,
        data: null,
      };
    }
    // send password to user in mail
    const { token, hashedToken, expireDate } =
      await authHandler.generateResetToken();
    const updatedData = {
      reset_token: hashedToken,
      password_reset_at: expireDate,
    };
    await prismaService.updateRecord(
      commonVariables.DB_COLLECTIONS.USER,
      updatedData,
      {
        id: user.id,
      }
    );
    await emailHandler.sendSystemEmail(
      emailVariables.EMAIL_TYPES.FORGOT_PASSWORD,
      {
        email: formatEmail,
        name: user.full_name,
        token,
      }
    );
    return {
      status: OK,
      success: true,
      message: authMessages.SHARE_RESET_LINK,
      data: null,
    };
  } catch (error) {
    return {
      status: SERVER_ERROR,
      success: false,
      message: authMessages.FORGET_PASSWORD_ERROR,
      data: error,
    };
  }
};

export const activateUser = async (
  data: IResetPasswordBody,
  res: Response
): Promise<IApiResponse> => {
  const { token: getNewToken, password } = data;

  const resetToken = crypto
    .createHash(`${commonVariables.HASH_METHOD}`)
    .update(getNewToken)
    .digest("hex");

  const user = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      deleted_at: null,
      reset_token: resetToken,
    }, // Check if token hasn't expired},
    {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        password: true,
        reset_token: true,
        password_reset_at: true,
      }, // Fields to select
    }
  );

  if (!user) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: authMessages.RESET_LINK_EXPIRED,
      data: user,
    };
  }
  const hashedPassword = await authHandler.hashPassword(password);
  const formattedUpdateFields = {
    password: hashedPassword,
    reset_token: null,
    password_reset_at: null,
    is_email_verified: true,
    last_login_date: new Date(),
  };
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const authToken = await generateTokenHandler.generateAuthToken(res, payload);
  await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      ...formattedUpdateFields,
      access_token: authToken,
    },
    {
      id: user.id,
    }
  );

  const userData = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      id: user.id,
    }, // Check if token hasn't expired},
    {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        is_email_verified: true,
      }, // Fields to select
    }
  );

  return {
    status: CREATED,
    success: true,
    message:
      user.password !== ""
        ? authMessages.PASSWORD_CHANGED
        : authMessages.PASSWORD_CREATED,
    data: { ...userData, token: authToken },
  };
};
