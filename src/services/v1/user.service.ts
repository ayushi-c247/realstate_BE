import { Prisma, UserRole, UserStatus } from "@prisma/client";
import {
  BAD_REQUEST,
  commonMessages,
  commonVariables,
  CONFLICT,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  SERVER_ERROR,
  userMessages,
  userVariables,
  emailVariables,
} from "@constants";
import {
  AddUserRequestDto,
  CreateAgentProfileDto,
  CreatedUser,
  CreateInvestorProfileDto,
  CreateProfileRequestDto,
  IApiResponse,
  IUser,
  IUserFilter,
  RoleMap,
  UpdateAgentProfileDto,
  UpdateInvestorProfileDto,
  UpdateUserProfileRequestDto,
} from "@customTypes";
import { prismaService } from "@services";
import { authHandler, commonHandler, emailHandler } from "@utils";

/**
 * Retrieves an users from the database .
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const getUsers = async (
  pageNumber: number,
  pageSize: number,
  search: string,
  sortOrder: string, // 'asc' | 'desc'
  sortBy: string,
  filterParams: IUserFilter
): Promise<IApiResponse> => {
  search = search ? search.trim() : "";

  // fallback to safe defaults
  let orderBy: Prisma.UserOrderByWithRelationInput[] = [
    { id: Prisma.SortOrder.desc },
  ];
  const sortOrderBy =
    sortOrder === Prisma.SortOrder.asc
      ? Prisma.SortOrder.asc
      : Prisma.SortOrder.desc;

  let filters: Record<string, unknown> = {
    role: UserRole.INVESTOR,
    deleted_at: null,
    ...filterParams,
  };

  // filter by
  const allowedRoles = Object.values(UserRole);
  if (filterParams?.role) {
    const filterRole = commonHandler.toUpperAndValidateEnums(
      filterParams.role
    ) as UserRole;
    if (!allowedRoles.includes(filterRole)) {
      throw new Error(userMessages.INVALID_ROLE_FILTER);
    }

    filters.role = filterRole;
  }

  // Pagination
  const { limit, offset } = commonHandler.getPagination(pageNumber, pageSize);
  if (sortBy) {
    if (!userVariables.ALLOW_SORTED_FIELDS.includes(sortBy)) {
      return {
        status: BAD_REQUEST,
        success: false,
        message: commonMessages.getInvalidSortFieldMessage(
          sortBy,
          userVariables.ALLOW_SORTED_FIELDS
        ),
        data: null,
      };
    }

    // Full name sorting (first_name + last_name)
    if (sortBy === userVariables.USER_SORTING_FILEDS.full_name) {
      orderBy = [{ first_name: sortOrderBy }, { last_name: sortOrderBy }];
    } else {
      orderBy = [
        {
          [sortBy]: sortOrderBy,
        },
      ];
    }
  }
  // Search conditions
  if (search) {
    const searchTerms = search.split(" ").filter(Boolean);
    const orConditions = [
      { first_name: { contains: searchTerms[0] } },
      { last_name: { contains: searchTerms[0] } },
      { email: { contains: search } },
    ];
    filters = {
      ...filters,
      OR: orConditions,
    };
  }

  // Fetch data
  const userList = await prismaService.getRecords(
    commonVariables.DB_COLLECTIONS.USER,
    {
      where: { ...filters, deleted_at: null },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
        role: true,
        status: true,
        last_login_date: true,
      },
      skip: offset,
      take: limit,
      orderBy,
    }
  );

  const total = await prismaService.getCounts(
    commonVariables.DB_COLLECTIONS.USER,
    { where: filters }
  );

  return {
    status: OK,
    success: true,
    message: userMessages.DELETE_FAILED,
    data: { total, users: userList },
  };
};

/**
 * Service to get the user BY id
 * @param {number} id user id
 * @returns {IApiResponse}
 */
export const getUserById = async (id: number) => {
  const isExits = await prismaService.findFirstRecord(
    commonVariables.DB_COLLECTIONS.USER,
    {
      id: Number(id),
      deleted_at: null,
    },
    {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        role: true,
      },
    }
  );

  if (isExits === null) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: commonMessages.ACCOUNT_NOT_FOUND,
      data: null,
    };
  }

  const message = userMessages.getUserInformationFetchedMessage(
    commonHandler.formatRoleForMessage(isExits.role)
  );

  return {
    status: OK,
    success: true,
    message,
    data: isExits,
  };
};
/**
 * Updates a student's information in the database.
 * @param {string} userId - The ID of the student to be updated.
 * @param {object} updateData - The data to update for the student.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const updateUserById = async (
  userId: number,
  updateData: IUser
): Promise<IApiResponse> => {
  const { role } = updateData;

  const existingUser = await prismaService.getOneRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { id: userId, role: RoleMap[role], deleted_at: null },
    { id: true, role: true, status: true },
    null
  );

  if (!existingUser) {
    return {
      status: NOT_FOUND,
      success: false,
      message: commonMessages.ACCOUNT_NOT_FOUND,
      data: null,
    };
  }
  let updateUser: Partial<IUser> = {};
  if (RoleMap[role] === UserRole.ADMIN) {
    const { first_name, last_name } = updateData;
    updateUser = { first_name, last_name };
  }
  const updatedUser = await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.USER,
    updateUser,
    {
      id: userId,
    }
  );

  const message = userMessages.getUserInformationUpdatedMessage(
    commonHandler.formatRoleForMessage(role)
  );

  return {
    status: updatedUser ? OK : BAD_REQUEST,
    success: Boolean(updatedUser),
    message: updatedUser ? message : userMessages.UPDATE_FAILED,
    data: null,
  };
};

/**
 * Deletes a student from the database.
 * @param {string} userId - The ID of the student to be deleted.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const deleteUserById = async (
  user_id: number
): Promise<IApiResponse> => {
  try {
    const existingUser = await prismaService.getOneRecord(
      commonVariables.DB_COLLECTIONS.USER,
      { id: user_id, deleted_at: null },
      { id: true, status: true, role: true },
      null
    );
    if (!existingUser) {
      return {
        status: NOT_FOUND,
        success: false,
        message: commonMessages.ACCOUNT_NOT_FOUND,
        data: null,
      };
    }

    const deletedUser = await prismaService.deleteUserById(
      commonVariables.DB_COLLECTIONS.USER,
      user_id
    );

    const message = userMessages.getUserDeletedMessage(
      commonHandler.formatRoleForMessage(existingUser.role)
    );
    return {
      status: deletedUser ? OK : BAD_REQUEST,
      success: Boolean(deletedUser),
      message: deletedUser ? message : userMessages.DELETE_FAILED,
      data: null,
    };
  } catch (error) {
    return {
      status: BAD_REQUEST,
      success: false,
      message: userMessages.DELETE_FAILED,
      data: null,
    };
  }
};

/**
 * Adds a new user to the database.
 * @param {IUser} data - The user data to be added.
 * @returns {Promise<IApiResponse>} - The response object with the status, success, message, and data.
 */
export const createUser = async (
  data: AddUserRequestDto
): Promise<IApiResponse> => {
  const { role } = data;
  const userRole = commonHandler.toUpperAndValidateEnums(role) as UserRole;
  try {
    const result = await prismaService.runTransaction(async (tx) => {
      let createdUser: CreatedUser = null;
      const { email, first_name, last_name } = data;
      const emailToLower = email.toLowerCase();
      const existing = await tx.user.findFirst({
        where: { email: emailToLower },
      });
      if (existing) {
        return {
          status: CONFLICT,
          success: false,
          message: userMessages.USER_ALREADY_EXISTS,
          data: null,
        };
      }
      const { hashedToken, token } = await authHandler.generateResetToken();
      const fullName =
        `${commonHandler.capitalize(first_name)} ${commonHandler.capitalize(last_name)}`.trim();
      createdUser = await tx.user.create({
        data: {
          email: emailToLower,
          first_name,
          last_name,
          full_name: fullName,
          role: userRole,
          status: UserStatus.PENDING,
          reset_token: hashedToken,
          created_at: new Date(),
        },
      });
      // Re-fetch full user
      if (createdUser) {
        const userId = createdUser.id;
        createdUser = await tx.user.findFirst({
          where: { id: userId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            role: true,
          },
        });
      }
      await emailHandler.sendSystemEmail(
        emailVariables.EMAIL_TYPES.VERIFY_EMAIL,
        {
          email: emailToLower,
          name: fullName,
          token,
        }
      );
      const message = userMessages.getUserCreatedMessage(
        commonHandler.formatRoleForMessage(userRole),
        true
      );

      return {
        status: CREATED,
        success: true,
        message,
        data: createdUser ?? null,
      };
    });

    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === commonMessages.SMTP_DOMAIN_NOT_FOUND
    ) {
      return {
        status: SERVER_ERROR,
        success: false,
        message: error.message, // pass through the same message
        data: null,
      };
    }
    return {
      status: SERVER_ERROR,
      success: false,
      message: commonMessages.INTERNAL_SERVER_ERROR,
      data: null,
    };
  }
};

/**
 * Update status of a user by ID service
 * @param userId
 * @param status
 * @returns
 */
export const updateUserStatusById = async (
  user_id: number,
  status: UserStatus
): Promise<IApiResponse> => {
  const existingUser = await prismaService.getOneRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { id: user_id, deleted_at: null },
    { id: true, status: true, role: true, user_name: true },
    null
  );

  if (!existingUser) {
    return {
      status: NOT_FOUND,
      success: false,
      message: commonMessages.ACCOUNT_NOT_FOUND,
      data: null,
    };
  }

  // Update user status
  await prismaService.updateRecord(
    commonVariables.DB_COLLECTIONS.USER,
    { status: status as UserStatus },
    { id: user_id }
  );

  const message = userMessages.getUseStatusUpdatedMessage(
    commonHandler.formatRoleForMessage(existingUser.role)
  );

  return {
    status: OK,
    success: true,
    message,
    data: null,
  };
};

export const createUserProfile = async (
  user_id: number,
  role: string,
  data: CreateProfileRequestDto
): Promise<IApiResponse> => {
  try {
    const result = prismaService.runTransaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: user_id, deleted_at: null },
      });
      if (!user) {
        return {
          status: NOT_FOUND,
          success: false,
          message: commonMessages.ACCOUNT_NOT_FOUND,
          data: null,
        };
      }
      const exists = await commonHandler.checkUserProfileExists(
        tx,
        role,
        user_id
      );
      if (exists) {
        return {
          status: CONFLICT,
          success: false,
          message: userMessages.userProfileAlreadyExistsMessage(
            commonHandler.formatRoleForMessage(role)
          ),
          data: null,
        };
      }

      // INVESTOR
      if (role === UserRole.INVESTOR) {
        const {
          risk_tolerance,
          budget_min,
          budget_max,
          preferred_property_types,
        } = data as CreateInvestorProfileDto;
        await tx.investorProfile.create({
          data: {
            user_id,
            risk_tolerance,
            budget_min,
            budget_max,
            preferred_property_types,
          },
        });
      } else if (role === UserRole.AGENT) {
        //Agent
        const { company_name, contact_number, license_number } =
          data as CreateAgentProfileDto;
        await tx.agentProfile.create({
          data: {
            user_id,
            company_name,
            contact_number,
            license_number,
          },
        });
      }
      return {
        status: CREATED,
        success: true,
        message: userMessages.getProfileCreatedMessage(
          commonHandler.formatRoleForMessage(role)
        ),
        data: null,
      };
    });
    return result;
  } catch (error) {
    return {
      status: SERVER_ERROR,
      success: false,
      message: commonMessages.INTERNAL_SERVER_ERROR,
      data: null,
    };
  }
};

export const updateUserAndAgentProfile = async (
  targetUserId: number,
  authUserId: number,
  data: UpdateUserProfileRequestDto
): Promise<IApiResponse> => {
  try {
    const result = await prismaService.runTransaction(async (tx) => {
      const [authUser, targetUser] = await Promise.all([
        tx.user.findFirst({
          where: { id: authUserId, deleted_at: null },
          select: { id: true, role: true },
        }),
        tx.user.findFirst({
          where: { id: targetUserId, deleted_at: null },
          select: { id: true, role: true },
        }),
      ]);

      if (!authUser || !targetUser) {
        return {
          status: NOT_FOUND,
          success: false,
          message: commonMessages.ACCOUNT_NOT_FOUND,
          data: null,
        };
      }

      const isAdmin = authUser.role === UserRole.ADMIN;
      const isSelf = authUserId === targetUserId;

      // Permission check
      if (!isAdmin && !isSelf) {
        return {
          status: FORBIDDEN,
          success: false,
          message: commonMessages.UNAUTHORIZED,
          data: null,
        };
      }

      /* UPDATE USER BASIC INFO */
      const { first_name, last_name } = data;
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          first_name,
          last_name,
          full_name:
            `${commonHandler.capitalize(first_name)} ${commonHandler.capitalize(last_name)}`.trim(),
        },
      });

      /* ROLE-BASED PROFILE UPDATE */
      // INVESTOR PROFILE
      if (targetUser.role === UserRole.INVESTOR) {
        const {
          risk_tolerance,
          budget_min,
          budget_max,
          preferred_property_types,
        } = data as UpdateInvestorProfileDto;

        await tx.investorProfile.update({
          where: { user_id: targetUserId },
          data: {
            risk_tolerance,
            budget_min,
            budget_max,
            preferred_property_types,
          },
        });
      }
      // AGENT PROFILE
      if (targetUser.role === UserRole.AGENT) {
        const { company_name, contact_number, license_number } =
          data as UpdateAgentProfileDto;

        await tx.agentProfile.update({
          where: { user_id: targetUserId },
          data: {
            company_name,
            contact_number,
            license_number,
          },
        });
      }

      return {
        status: OK,
        success: true,
        message: userMessages.getUserInformationUpdatedMessage(
          commonHandler.formatRoleForMessage(targetUser.role)
        ),
        data: null,
      };
    });

    return result;
  } catch (error) {
    console.error(error);
    return {
      status: SERVER_ERROR,
      success: false,
      message: commonMessages.INTERNAL_SERVER_ERROR,
      data: null,
    };
  }
};
