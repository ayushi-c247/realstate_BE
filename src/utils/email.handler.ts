import { sendMail } from "templates";
import { emailVariables } from "@constants";
import { SendEmailPayload, TemplateVariables } from "@customTypes";

export const sendSystemEmail = async (
  type: keyof typeof emailVariables.EMAIL_CONFIG,
  payload: SendEmailPayload
) => {
  const config = emailVariables.EMAIL_CONFIG[type];
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (!config) {
    throw new Error(`Invalid email type: ${type}`);
  }
  const data: TemplateVariables = {
    name: payload.name,
    ...payload.variables,
  };

  if (payload.token) {
    data.link = `${appUrl}${config.path}?token=${payload.token}`;
  }
  await sendMail(payload.email, config.subject, config.template, data);
};
