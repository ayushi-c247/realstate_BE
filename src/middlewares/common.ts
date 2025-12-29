// Internal modules
import env from "@config/envVar";
// Constants
import {
  UNAUTHORIZE,
  UNPROCESSABLE_ENTITY,
  commonMessages,
  commonVariables,
} from "@constants";
// Custom types
import {
  type AuthTokenPayload,
  type CustomError,
  type ICustomError,
} from "@customTypes";
import { prismaService } from "@services";
// Enums
// Utils
import { ErrorHandler, commonHandler } from "@utils";
// Third-party modules
import type { NextFunction, Response, Request } from "express";
import Joi from "joi";
import { UserStatus } from "@prisma/client";

const base64Key = process.env.SHARED_SECRET_KEY_BASE64 as string;

/**
 * AES-GCM decrypts an ivB64.cipherB64 token with the shared key
 * @param token - ${ivB64}.${cipherB64}
 * @param base64Key - Base64-encoded 32-byte key
 * @returns decrypted object with email and partnerType
 */
export const decryptPayload = async (
  token: string
): Promise<{ email: string; partnerType: string }> => {
  if (!base64Key) throw new Error("Shared key not found");
  const [ivB64, cipherB64] = token.split(".");
  if (!ivB64 || !cipherB64) throw new Error("Invalid token format");

  const keyBytes = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const cipher = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    cipher
  );

  const text = new TextDecoder().decode(plainBuffer);
  return JSON.parse(text);
};

/**
 * Middleware to authenticate a user from a JWT token.
 * @param {Request} req - Express request object.
 * @param {Response} _res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {ErrorHandler} An error handler with a 401 status code if the token is invalid or missing.
 */
export const authenticate = async (
  req: any,
  _res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.body.token", req.body.token);

    if (req.body.token) {
      await decryptPayload(req.body.token);
      return next();
    } else {
      // Extract token
      const token = req.headers.authorization?.split(" ")[1];

      if (!token)
        return next(new ErrorHandler(commonMessages.UNAUTHORIZED, UNAUTHORIZE));
      // Verify JWT token
      const jwtSecret = env.JWT_SECRET;
      let decoded: AuthTokenPayload;
      try {
        decoded = await commonHandler.verifyJwt(token, jwtSecret);
      } catch (error) {
        const err = error as ICustomError;
        const errorMessage =
          err.name === commonVariables.TOKEN_EXPIRED_ERROR
            ? commonMessages.SESSION_TIMEOUT
            : commonMessages.INVALID_TOKEN;
        return next(new ErrorHandler(errorMessage, UNAUTHORIZE));
      }
      const userDetails = await prismaService.getOneRecord(
        commonVariables.DB_COLLECTIONS.USER,
        {
          id: decoded.id,
        },
        {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
        null
      );

      if (!userDetails)
        return next(new ErrorHandler(commonMessages.UNAUTHORIZED, UNAUTHORIZE));
      if (userDetails.status === UserStatus.INACTIVE)
        // Check if the user is deactivated
        return next(
          new ErrorHandler(commonMessages.USER_DEACTIVATE, UNAUTHORIZE)
        );
      req.user = userDetails;
      next();
    }
  } catch (err) {
    next(new ErrorHandler(commonMessages.INVALID_TOKEN, UNAUTHORIZE, err));
  }
};

/**
 * Middleware to authenticate a user from a JWT token.
 * @param {Request} req - Express request object.
 * @param {Response} _res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {ErrorHandler} An error handler with a 401 status code if the token is invalid or missing.
 */

/**
 * Middleware to authorize user access based on their role.
 *
 * This function checks if the user's role is included in the allowed roles.
 * If the user is not authorized, it returns a forbidden error.
 * If the user is authorized, it calls the next middleware in the chain.
 *
 * @param {...number[]} roles - Array of allowed roles.
 * @returns {Function} Middleware function to handle authorization.
 */
export const authorize = (...roles: string[]) => {
  return (req: any, _res: Response, next: NextFunction) => {
    const { user } = req;

    if (
      !user ||
      !roles.includes(commonHandler.toUpperAndValidateEnums(user.role))
    ) {
      return next(
        // FORBIDDEN
        new ErrorHandler(commonMessages.FORBIDDEN_ERROR, UNAUTHORIZE, null)
      );
    }
    next();
  };
};

/**
 * Middleware to validate request data against provided schemas.
 *
 * This function iterates over a set of schemas and validates the corresponding
 * parts of the request (e.g., body, params, query). If any validation errors
 * occur, it aggregates the error messages and passes them to the next middleware
 * as a `BAD_REQUEST`. If no errors occur, it calls the next middleware in the chain.
 *
 * @param {object} schemas - An object containing Joi schemas for validation.
 * @returns {Function} Middleware function to validate request data.
 */

export const validate = (schemas: any) => {
  return (req: any, _res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const joiContext = {
      loggedInRole: req.user?.role, // 👈 minimal addition
    };
    commonVariables.SCHEMA_KEYS.forEach((key) => {
      // Ensure that `schemas[key]` exists and is properly typed
      const schema = schemas[key];
      if (schema) {
        const { error } = schema.validate(req[key], {
          abortEarly: false,
          context: joiContext,
        });

        if (error) {
          // .replace(commonVariables.ERROR_MESSAGE_REGEX, '')
          // Safe mapping and error handling
          const errorMessages = error.details
            .map((detail: CustomError) =>
              // eslint-disable-next-line no-useless-escape
              detail.message.replace(/\"/g, "")
            )
            .filter(Boolean); // Filter out any null/undefined messages
          errors.push(...errorMessages);
        }
      }
    });
    if (errors.length > 0) {
      return next(
        new ErrorHandler(errors.join(", "), UNPROCESSABLE_ENTITY, null)
      );
    }

    next();
  };
};

/**
 * Function to validate request parameters using a Joi schema.
 * @param schema
 * @returns
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};
