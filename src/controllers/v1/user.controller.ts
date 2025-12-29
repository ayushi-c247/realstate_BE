import type { NextFunction, Request, Response } from "express";
import { UserStatus } from "@prisma/client";
import { userService } from "@services";

import { ErrorHandler, catchHandler } from "@utils";
import { responseHandler } from "@middlewares";
import { IAuthRequest } from "@customTypes";
import { BAD_REQUEST } from "@constants";

/**
 * Handles adding a new user
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req.body;
    const response = await userService.createUser(payload);
    const { success, message, status, data } = response;
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

/**
 * Controller to get the all users
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search, sortBy, sortOrder, filter } = req.query;
    const filters = filter ? JSON.parse(filter as string) : {};
    const { status, success, message, data } = await userService.getUsers(
      Number(page),
      Number(limit),
      search as string,
      sortOrder as string,
      sortBy as string,
      filters
    );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
/**
 * Controller to get a single user by id
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return next(new ErrorHandler("Invalid user id", BAD_REQUEST));
    }
    const { status, success, message, data } =
      await userService.getUserById(userId);
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
/**
 * Controller to update a user by id
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { body } = req;
    const { status, success, message, data } = await userService.updateUserById(
      Number(id),
      body
    );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
/**
 * Controller to delete a user by id
 * @param req
 * @param res
 * @param next
 */
export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = (req as IAuthRequest).params;

    const { status, success, message, data } = await userService.deleteUserById(
      Number(id)
    );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

/**
 * Update user status controller
 * @param req  {userId, status}
 * @param res
 * @param next
 */
export const updateUserStatusById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: userStatus } = (req as IAuthRequest).body;
    const { status, success, message, data } =
      await userService.updateUserStatusById(
        Number(id),
        userStatus as UserStatus
      );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
