import { UserRole, UserStatus } from "@prisma/client";

export interface IUser {
  id: number; // Primary key for MySQL
  first_name: string;
  last_name?: string;
  full_name?: string;
  email: string;
  role: UserRole;
  access_token?: string;
  last_login_date?: Date;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export const RoleMap: Record<string, UserRole> = {
  investor: UserRole.INVESTOR,
  admin: UserRole.ADMIN,
  Agent: UserRole.AGENT,
};
export interface IUserFilter {
  status?: string;
  role?: string;
}

export type CreatedUser = {
  id: number;
} | null;

export interface AddUserRequestDto {
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
}

export interface CreateInvestorProfileDto {
  risk_tolerance: string;
  budget_min: number;
  budget_max: number;
  preferred_property_types: any;
}

export interface CreateAgentProfileDto {
  company_name: string;
  contact_number: string;
  license_number: string;
}
export type CreateProfileRequestDto =
  | CreateInvestorProfileDto
  | CreateAgentProfileDto;

export interface UpdateUserBaseDto {
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface UpdateInvestorProfileDto extends UpdateUserBaseDto {
  risk_tolerance: string;
  budget_min: number;
  budget_max: number;
  preferred_property_types: any;
}

export interface UpdateAgentProfileDto extends UpdateUserBaseDto {
  company_name: string;
  contact_number: string;
  license_number: string;
}

export type UpdateUserProfileRequestDto =
  | UpdateInvestorProfileDto
  | UpdateAgentProfileDto;
