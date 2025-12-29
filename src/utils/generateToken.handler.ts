// Third-party modules
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

// Config
import env from '@config/envVar';

// Constants
import { commonVariables } from '@constants';
// Utils
import { commonHandler } from '@utils';

export const clearToken = (res: Response) => {
  res.cookie(env.AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

/**
 * Generates an authentication token and sets it as a cookie in the response.
 * @param {Response} res - The response object
 * @param {object} payload - The payload to be signed in the token
 * @returns {Promise<string>} - The generated token
 */
export const generateAuthToken = async (
  res: Response,
  payload: object,
): Promise<string> => {
  const jwtSecret = env.JWT_SECRET;
  const expireIn = await commonHandler.convertTime(
    Number(commonVariables.TOKEN_EXPIRE),
    String(commonVariables.TOKEN_EXPIRE_UNIT),
    commonVariables.MILLISECOND, // Supported units: year, month, day, hour, minute, second, millisecond.
  );

  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: commonVariables.JWT_TOKEN_EXPIRE,
  });

  res.cookie(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !commonHandler.isLogger,
    sameSite: commonVariables.COOKIE_SAME_SITE,
    maxAge: expireIn,
  });
  return token;
};
