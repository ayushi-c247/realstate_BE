import { IUser } from "@customTypes";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface User extends IUser {} // Extending Passport's User type
  }
}

export interface IApiResponse {
  status: number;
  success: boolean;
  message: string;
  data: any | undefined;
}

export interface CustomError extends Error {
  statusCode?: number;
  success?: boolean;
  error?: any;
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
}

export type TemplateVariables = Record<string, unknown>;

export type SendEmailPayload = {
  email: string;
  name: string;
  token?: string;
  variables?: TemplateVariables;
};
