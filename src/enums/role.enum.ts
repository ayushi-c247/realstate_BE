import {
  UserRole,
  UserStatus,
} from '@prisma/client';

export const ALL_ENUMS = [
  ...Object.values(UserRole),
  ...Object.values(UserStatus),
];
