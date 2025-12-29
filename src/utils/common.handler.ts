// Third party
import fs from "node:fs";
import path from "node:path";
import * as crypto from "crypto";
// Internal modules
import env from "@config/envVar";
// Constants
import {
  BAD_REQUEST,
  commonMessages,
  commonVariables,
  TOO_MANY_REQUESTS,
} from "@constants";
// Types
import type { AuthTokenPayload, IApiResponse } from "@customTypes";
import jwt from "jsonwebtoken";
export const isLogger = env.NODE_ENV === "development";

import dayjs from "dayjs";
import rateLimit from "express-rate-limit";
import utc from "dayjs/plugin/utc";
import { prismaService } from "@services";
import { ALL_ENUMS } from "@enums";
import { Prisma, UserRole } from "@prisma/client";

dayjs.extend(utc);

/**
 * Conditionally imports a module based on the existence of a file.
 * @param {string} modulePath The path to the module to import.
 * @param {string} importPath The path to the import statement.
 * @returns {Promise<object | T>} A promise that resolves to the imported module if the file exists, or an empty object if it does not.
 */
export const conditionalImport = <T = Record<string, unknown>>(
  modulePath: string,
  importPath: string
): Promise<object | T> => {
  const absolutePath = path.resolve(modulePath);

  if (fs.existsSync(absolutePath)) {
    return import(importPath).catch((_e) => {
      return {};
    });
  }
  return Promise.resolve({});
};
/**
 * Verifies a JWT token using a secret key.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The secret key to use for verification.
 * @returns {Promise<AuthTokenPayload>} - A promise that resolves to the decoded payload,
 *   or rejects with an error if the token is invalid.
 */
export const verifyJwt = (
  token: string,
  secret: string
): Promise<AuthTokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secret, (err, decoded) => {
      if (err || typeof decoded !== "object" || !("role" in decoded)) {
        return reject(err || new Error(commonMessages.INVALID_TOKEN));
      }
      resolve(decoded as AuthTokenPayload);
    })
  );

/**
 * Converts a time duration from one unit to another.
 * @param {number} duration The duration of time in the given unit.
 * @param {string} fromUnit The unit that the given duration is in.
 * @param {string} toUnit The unit to convert the duration to.
 * @returns {number} The duration of time in the given unit.
 * @throws {Error} If either the fromUnit or toUnit is not a valid unit.
 */
export const convertTime = async (
  duration: number,
  fromUnit: string,
  toUnit: string
) => {
  // Time conversion units in milliseconds
  const unitsInMilliseconds: { [key: string]: number } = {
    year: 365 * 24 * 60 * 60 * 1000, // 1 year = 365 days in milliseconds
    month: 30 * 24 * 60 * 60 * 1000, // 1 month = 30 days in milliseconds
    day: 24 * 60 * 60 * 1000, // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    hour: 60 * 60 * 1000, // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds
    minute: 60 * 1000, // 1 minute = 60 seconds * 1000 milliseconds
    second: 1000, // 1 second = 1000 milliseconds
    millisecond: 1, // 1 millisecond
  };

  // Normalize units to lowercase to handle case-insensitivity
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();

  // Check if the provided units are valid
  if (!unitsInMilliseconds[fromUnitLower]) {
    throw new Error(
      `${commonMessages.INVALID_FROM_UNIT} "${fromUnit}". ${commonMessages.SUPPORTED_TIME_UNITS}`
    );
  }

  if (!unitsInMilliseconds[toUnitLower]) {
    throw new Error(
      `${commonMessages.INVALID_TO_UNIT} "${toUnit}". ${commonMessages.SUPPORTED_TIME_UNITS}`
    );
  }

  // Convert from `fromUnit` to milliseconds
  const durationInMilliseconds = duration * unitsInMilliseconds[fromUnitLower];

  // Convert from milliseconds to `toUnit`

  return durationInMilliseconds / unitsInMilliseconds[toUnitLower];
};

/**
 * Calculates pagination parameters.
 *
 * @param _page - The current page number.
 * @param _limit - The number of items per page.
 * @returns An object containing the limit and offset for pagination.
 *          - limit: The adjusted number of items per page.
 *          - offset: The offset from the start of the dataset for the current page.
 */

export const getPagination = (_page: number, _limit: number) => {
  const limit = _limit ? +_limit : commonVariables.paginations.ITEM_LIMIT;
  const offset = _page
    ? (_page - 1) * limit
    : commonVariables.paginations.DEFAULT_PAGE;

  return { limit, offset };
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatDateToLongString = (dateInput: Date | string): string => {
  const date = new Date(dateInput);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-GB", options);
};

export const parseDateFromISO = (isoDate: string) => {
  return new Date(isoDate).toISOString().split("T")[0];
};

/**
 * Returns a JavaScript Date object for N days ago from now.
 * @param daysAgo Number of days ago
 */
export function getDateDaysAgo(daysAgo: number): Date {
  return dayjs().subtract(daysAgo, "day").toDate();
}

/**
 * Creates a rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests allowed in the time window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} errorMessage - Message to send when rate limit is exceeded
 * @returns {rateLimit} - Express middleware for rate limiting
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      status: TOO_MANY_REQUESTS,
      success: false,
      message: commonMessages.TOO_MANY_RESET_ATTEMPTS,
      data: null,
    },
    standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: any) => req.body.email || req.query.email,
  });
};

export const formatToUtc = (date: Date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};

export const roundToTwoDecimalPlaces = (value: string) => {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Number(num.toFixed(2));
};

export const compareFirstTwoDecimals = (a: number, b: number) => {
  const getFirstTwoDecimals = (num: number) => {
    const [intPart, decPart = ""] = String(num).split(".");
    return `${intPart}.${decPart.slice(0, 2).padEnd(2, "0")}`;
  };

  return getFirstTwoDecimals(a) === getFirstTwoDecimals(b);
};

export const formatDateInUtc = (input: Date) => {
  return dayjs.utc(input).startOf("day").toDate();
};

/**
 * Parses an Express query `filter` parameter into a plain object.
 * Accepts stringified JSON, ParsedQs, or string/ParsedQs arrays.
 * Returns undefined if parsing fails or input is invalid.
 */
export function parseQueryFilter<T = any>(filter: unknown): T | undefined {
  if (!filter) return undefined;
  if (typeof filter === "string") {
    try {
      return JSON.parse(filter) as T;
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(filter)) {
    const first = filter[0] as unknown;
    if (typeof first === "string") {
      try {
        return JSON.parse(first) as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  return filter as T;
}

/**
 * Function to generate the uniq slug anf if slug exists then add 1 to it
 * @param text
 * @param model
 * @returns
 */
export const generateSlug = async (
  text: string,
  model: string
): Promise<string> => {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  // check if slug exists in DB
  let exists = await prismaService.findFirstRecord(model, { slug });

  while (exists) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    exists = await prismaService.findFirstRecord(model, { slug });
  }

  return slug;
};

const SECRET_KEY = crypto
  .createHash("sha256")
  .update("my-secret-passphrase")
  .digest(); // 32 bytes

// Encrypt
export function encrypt(text: string) {
  const iv = crypto.randomBytes(16); // generate a new IV
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Prepend IV to encrypted text
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt
export function decrypt(encryptedText: string) {
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed");
  }
}
/**
 * Function to upper case the enum values
 * @param value
 * @returns
 */
export function toUpperAndValidateEnums(value: string) {
  const upper = value.toUpperCase();
  // removing this check as some enums are dynamic
  if (!(ALL_ENUMS as string[]).includes(upper)) {
    throw new Error(
      `Invalid value: ${value}. Allowed values are: ${ALL_ENUMS.join(", ")}`
    );
  }
  return upper;
}

export const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

/**
 * Check record exists by id
 * @param modelName
 * @param id
 * @param notFoundMessage
 * @returns
 */
export const checkRecordExistsById = async (
  modelName: string,
  id: number,
  notFoundMessage: string
): Promise<IApiResponse | null> => {
  const record = await prismaService.findFirstRecord(modelName, {
    id: Number(id),
    deleted_at: null,
    deleted_by: null,
  });

  if (!record) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: notFoundMessage,
      data: null,
    };
  }

  return null; // record exists, so no error
};

export const normalizeForSuggestion = (value: string) => {
  let clean = value
    .trim()
    .toLowerCase()

    // 1. Remove invalid chars (only allow letters, numbers, ., _)
    .replace(/[^a-z0-9._]/g, "")

    // 2. Remove consecutive .. or __
    .replace(/\.{2,}/g, ".")
    .replace(/_{2,}/g, "_")

    // 3. Cannot end with . or _
    .replace(/[._]+$/g, "");

  // 4. Must start with a letter → force add "u" if invalid
  if (!/^[a-z]/.test(clean)) {
    clean = "u" + clean;
  }

  return clean;
};

export const formatRoleForMessage = (role: string): string => {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const checkUserProfileExists = async (
  tx: Prisma.TransactionClient,
  role: string,
  user_id: number
): Promise<boolean> => {
  if (role === UserRole.INVESTOR) {
    return !!(await tx.investorProfile.findFirst({
      where: { user_id },
    }));
  }

  if (role === UserRole.AGENT) {
    return !!(await tx.agentProfile.findFirst({
      where: { user_id },
    }));
  }

  return false;
};
