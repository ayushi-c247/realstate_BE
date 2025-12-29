import express from "express";
import { UserRole } from "@prisma/client";
// Controllers
import { authVariables } from "@constants";
import { authController } from "@controllers";
// Middlewares
import { authenticate, authorize, validate } from "@middlewares";
import { commonHandler } from "@utils";
// Validations
import { authValidations } from "@validations";

const router = express.Router();
const forgetPasswordLimiter = commonHandler.createRateLimiter(
  authVariables.FORGET_PASSWORD_MAX_ATTEMPTS,
  authVariables.FORGET_PASSWORD_WINDOW_MS
);
router.post(
  "/login",
  validate(authValidations.loginSchema),
  authController.login
);
router.get("/me", authenticate, authController.fetchDetails);
router.post(
  "/forgot-password",
  validate(authValidations.forgetPasswordSchema),
  forgetPasswordLimiter,
  authController.forgetPassword
);
router.post(
  "/activate-user",
  validate(authValidations.passwordResetSchema),
  authController.activateUser
);

router.post("/logout", authController.logout);

export default router;
