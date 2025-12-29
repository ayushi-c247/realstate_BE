export const EMAIL_TYPES = {
  VERIFY_EMAIL: "VERIFY_EMAIL",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
} as const;

export const EMAIL_SUBJECTS = {
  VERIFY_EMAIL: "Verify your email",
  FORGOT_PASSWORD: "Reset your password",
} as const;

export const EMAIL_TEMPLATES = {
  VERIFY_EMAIL: "verify.email",
  FORGOT_PASSWORD: "forgot.password",
} as const;

export const EMAIL_CONFIG = {
  [EMAIL_TYPES.VERIFY_EMAIL]: {
    subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
    template: EMAIL_TEMPLATES.VERIFY_EMAIL,
    path: "/create-password",
  },
  [EMAIL_TYPES.FORGOT_PASSWORD]: {
    subject: EMAIL_SUBJECTS.FORGOT_PASSWORD,
    template: EMAIL_TEMPLATES.FORGOT_PASSWORD,
    path: "/reset-password",
  },
} as const;

