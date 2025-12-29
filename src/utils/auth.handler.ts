import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
// Third-party modules
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

// Config
import env from '@config/envVar';

// Constants
import { authVariables, commonVariables } from '@constants';

// Utils
import { commonHandler } from '@utils';
const SECRET = process.env.ID_TOKEN_SECRET;

// Generate a 32-byte key for AES-256
const ENCRYPTION_KEY = crypto
  .createHash(commonVariables.HASH_METHOD)
  .update(String(SECRET))
  .digest()
  .slice(0, 32);
export const clearToken = (res: Response) => {
  res.cookie(env.AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

/**
 * Compares a given password with a hashed password.
 * @param {string} enteredPassword - The password entered by the user
 * @param {string} hashedPassword - The hashed password
 * @returns {Promise<boolean>} - A boolean indicating whether the comparison is successful or not
 */
export const comparePassword = async (
  enteredPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

/**
 * Generates a verification token for verifying email addresses.
 * @param {object} payload - The payload to be signed in the token
 * @returns {Promise<string>} - The generated token
 */
export const generateVerifyEmailToken = async (
  payload: object,
): Promise<string> => {
  const jwtSecret = env.JWT_SECRET;
  const expireIn = await commonHandler.convertTime(
    Number(authVariables.VERIFY_EMAIL_TOKEN_EXPIRE),
    String(authVariables.VERIFY_EMAIL_TOKEN_EXPIRE_UNIT),
    commonVariables.MILLISECOND, // Supported units: year, month, day, hour, minute, second, millisecond.
  );

  const token = jwt.sign(payload, jwtSecret as string, {
    expiresIn: expireIn,
  });
  return token;
};

/**
 * Generates a password reset token.
 * @returns {Promise<{ token: string; hashedToken: string; expireDate: Date; }>} - The generated token and its hashed version, as well as the expiration date.
 */
export const generateResetToken = async (): Promise<{
  token: string;
  hashedToken: string;
  expireDate: Date;
}> => {
  const resetToken = crypto.randomBytes(32)?.toString('hex');

  const hashedToken = crypto
    .createHash(`${commonVariables.HASH_METHOD}`)
    .update(resetToken)
    .digest('hex');
  const expireIn = await commonHandler.convertTime(
    Number(authVariables.RESET_TOKEN_EXPIRE),
    String(authVariables.RESET_TOKEN_UNIT),
    commonVariables.MILLISECOND, // Supported units: year, month, day, hour, minute, second, millisecond.
  );
  const expireDate = new Date(Date.now() + expireIn); // Expires based on configured time

  return { token: resetToken, hashedToken, expireDate };
};

/**
 * Hashes a given password using bcrypt.
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const getSubscriptionMismatches = (response: any, user: any) => {
  return Object.keys(response).reduce((acc: any, key) => {
    const responseValue = response[key];
    const userValue = user[key];
    const isDate =
      String(responseValue).includes('T') && !isNaN(Date.parse(responseValue));
    const isDifferent = isDate
      ? new Date(responseValue).toISOString() !==
        new Date(userValue).toISOString()
      : responseValue !== userValue;
    if (isDifferent) {
      acc[key] = responseValue;
    }
    return acc;
  }, {});
};

// 16-byte IV filled with zeros (for demo only — not secure for production)
const IV = Buffer.alloc(16, 0);

// Base64 URL-safe encode
function base64UrlEncode(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64 URL-safe decode
function base64UrlDecode(urlSafe: string) {
  urlSafe = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  while (urlSafe.length % 4) urlSafe += '=';
  return urlSafe;
}

// Encrypt function
export function encryptId({ token }: { token: string | number }) {
  const id = token;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(id?.toString(), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return base64UrlEncode(encrypted);
}

// Decrypt function
export function decryptId(encryptedId: string) {
  let decrypted;
  try {
    const base64 = base64UrlDecode(encryptedId);
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    decrypted = decipher.update(base64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
  } catch (error) {
    return;
  }
  return decrypted;
}

export const isString = (id: any): boolean => {
  return typeof id === 'string' && isNaN(Number(id));
};
