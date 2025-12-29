import { Request } from 'express';

export interface IRegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface IUpdateProfile {
  first_name: string;
  last_name: string;
  email: string;
}

export interface IForgetPasswordBody {
  email: string;
}

export interface IResetPasswordBody {
  token: string;
  password: string;
}

export interface IChangePasswordBody {
  newPassword: string;
}

export interface IAuthRequest extends Request {
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    status?: string;
  };
}
