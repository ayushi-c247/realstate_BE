import express, { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  authenticate,
  authorize,
  validate,
  validateParams,
} from "@middlewares";

import { userController } from "@controllers";
import { commonValidations, userValidation } from "@validations";

const router: Router = express.Router();

router.post(
  "/add",
  // authorize(UserRole.ADMIN, UserRole.INVESTOR),
  validate(userValidation.addUserValidation),
  userController.createUser
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INVESTOR, UserRole.AGENT), // allow only admin and parent to update user
  validateParams(commonValidations.idSchema),
  userController.updateUserById
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(commonValidations.idSchema),
  userController.deleteUserById
);

router.patch(
  "/status/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.updateStatusSchema),
  validateParams(commonValidations.idSchema),
  userController.updateUserStatusById
);
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  userController.getUsers
);

router.get(
  "/:id",
  authenticate,
  validateParams(commonValidations.idSchema),
  userController.getUserById
);

export default router;
