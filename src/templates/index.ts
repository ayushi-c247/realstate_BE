import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 20_000,
});
export const sendMail = async (
  to: string,
  subject: string,
  templateName: string,
  payload: Record<string, any>
) => {
  const templatePath = path.join(__dirname, `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);
  const html = template(payload);
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    const err = error as {
      responseCode?: number;
      response?: string;
      rejected?: string[];
    };
    if (err.responseCode === 550 && err.rejected && err.rejected.length > 0) {
      console.error(`Invalid email or domain: ${to}`, err.response);
      throw new Error();
    }
    console.error(`Error sending verification email to ${to}:`, error);
    throw new Error("Failed to send verification email");
  }
};
