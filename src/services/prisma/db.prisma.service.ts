/* eslint-disable no-useless-catch */

import { logger } from "@config/logger";
import { commonMessages } from "@constants";
import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});
interface QueryOptions {
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  distinct?: any;
}

const sanitizeInclude = (user: any, keys: string[]) => {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => keys.includes(key))
  );
};

/**
 * @description This method insert a record into the database
 * @param modelName ,
 * @param record
 * @returns
 */
export const createRecord = async (
  modelName: string,
  record: any
): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `create` method
     */
    const userDoc = await prisma[modelName].create({
      data: record,
    });
    return userDoc;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method update record in Database
 * @param record
 * @param modelName
 * @param identifierId
 * @returns
 */
export const updateRecord = async (
  modelName: string,
  record: any,
  identifierId: number | any
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `update` method
     */
    await prisma[modelName].update({
      where: identifierId, // Unique identifier for the record
      data: record, // Fields to update
    });
    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      return true;
    } else {
      throw error; // re-throw other unexpected errors
    }
  }
};

/**
 * @description Update the order of sections in the database
 * @param modelName - The name of the Prisma model
 * @param updates - Array of objects containing section id and new order
 * @returns Promise<boolean>
 */
export const updateSectionOrder = async (
  modelName: string,
  updates: any
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Update each section's order in a transaction */
    await prisma.$transaction(
      updates.map(({ section_id, order }: any) =>
        prisma[modelName].update({
          where: { section_id },
          data: order,
        })
      )
    );

    return true;
  } catch (error) {
    throw error;
  }
};

export const fetchRecordsWithFilter = async (
  modelName: string,
  filterValue: any | null
): Promise<any> => {
  try {
    let list = [];
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get all` method
     */
    list = await prisma[modelName].findMany({
      where: filterValue,
    });
    return list;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method retrieves multiple records from the database.
 * @param modelName - The name of the Prisma model.
 * @param fieldName - The field name for ordering results.
 * @param filterValue - The exam ID to filter records.
 * @param difficultyLevel - (Optional) The difficulty level to filter questions.
 * @param searchName - (Optional) The name keyword to search questions.
 * @returns List of records.
 */
export const getManyAnsRecord = async (
  modelName: string,
  fieldName: string,
  difficultyLevel?: string,
  searchName?: string,
  sectionId?: number | null,
  numeric_difficulty_level?: string | null
): Promise<any[]> => {
  try {
    let list = [];
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Construct where condition dynamically */
    const whereCondition: any = {};
    if (sectionId) {
      whereCondition.section_id = sectionId;
    }
    if (difficultyLevel) {
      whereCondition.difficulty_level = difficultyLevel;
    }

    if (numeric_difficulty_level) {
      whereCondition.numeric_difficulty_level = Number(
        numeric_difficulty_level
      );
    }

    if (searchName) {
      whereCondition.question_text = {
        contains: searchName,
        mode: "insensitive", // Case-insensitive search
      };
    }

    /** Fetch records */
    list = await prisma[modelName].findMany({
      where: whereCondition,
      orderBy: {
        [fieldName]: "asc", // Sort by field in ascending order
      },
    });

    return list;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description Fetch paginated records from the database with multiple filters, sorting, and searching.
 * @param modelName - The Prisma model name
 * @param page - Current page number
 * @param pageSize - Number of records per page
 * @param filters - Object containing filters (e.g., { name: 'john', section: 'math' })
 * @param sortField - (Optional) Field to sort by (defaults to 'name')
 * @param sortOrder - (Optional) Sorting order: 'asc' or 'desc' (defaults to 'asc')
 * @returns Paginated records
 */
export const paginateRecords = async (
  modelName: string,
  page: number,
  pageSize: number,
  filters: Record<string, string | undefined> = {}, // Multiple filter options
  sortField: string = "name",
  sortOrder: "asc" | "desc" = "asc"
): Promise<any> => {
  try {
    // Build the `where` clause dynamically based on provided filters
    const whereClause: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        whereClause[key] = {
          contains: value,
          mode: "insensitive", // Case-insensitive search
        };
      }
    }

    const data = await prisma[modelName].findMany({
      where: Object.keys(whereClause).length ? whereClause : undefined, // Apply filters only if any exist
      skip: (page - 1) * pageSize, // Skip records for previous pages
      take: pageSize, // Limit to page size
      orderBy: {
        [sortField]: sortOrder, // Dynamic sorting based on provided field and order
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching paginated data:", error);
  }
};

export const paginateExamsRecords = async (
  modelName: string,
  page: number,
  pageSize: number,
  filters: Record<string, string | undefined> = {}, // Multiple filter options
  sortField: string = "name",
  sortOrder: "asc" | "desc" = "asc"
): Promise<any> => {
  try {
    // Build the `where` clause dynamically based on provided filters
    const whereClause: Record<string, any> = {};
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          whereClause[key] = {
            contains: value,
            // mode: 'insensitive', // Case-insensitive search
          };
        }
      }
    }

    const data = await prisma[modelName].findMany({
      where: Object.keys(whereClause).length ? whereClause : undefined, // Apply filters only if any exist
      skip: page, // Skip records for previous pages
      take: pageSize, // Limit to page size
      orderBy: {
        [sortField]: sortOrder, // Dynamic sorting based on provided field and order
      },
      include: {
        sections: {
          include: {
            questions: {
              select: {
                question_id: true,
              },
            },
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching paginated data:", error);
  }
};

/**
 * @description Get the total count of exams with optional filters.
 * @param filters - (Optional) Object containing filters (e.g., { status: 'active' })
 * @returns Total count of exams
 */
export const getExamCount = async (
  filters: Record<string, string | undefined> = {}
): Promise<number> => {
  try {
    // Build the `where` clause dynamically based on provided filters
    const whereClause: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        whereClause[key] = {
          contains: value,
          mode: "insensitive", // Case-insensitive search
        };
      }
    }

    const totalCount = await prisma.exam.count({
      where: Object.keys(whereClause).length ? whereClause : undefined, // Apply filters if present
    });
    return totalCount;
  } catch (error) {
    console.error("Error fetching total exam count:", error);
    return 0;
  }
};

/**
 * @description This method Get One record from Database
 * @param modelName
 * @param identifierId
 * @param selectedValues
 * @returns
 */
export const getOneRecord = async (
  modelName: string,
  identifierId: any,
  selectedValues: any,
  includedFilter: any
): Promise<any> => {
  try {
    let data = null;
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get one` method
     */
    if (selectedValues) {
      data = await prisma[modelName].findUnique({
        where: identifierId,
        select: selectedValues /** ex: { name: true, email: true} */,
      });
    } else if (includedFilter) {
      data = await prisma[modelName].findUnique({
        where: identifierId, // Exam ID pass karein
        include: includedFilter,
      });
    } else {
      data = await prisma[modelName].findUnique({
        where: identifierId, // Exam ID pass karein
      });
    }
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method Get One record from Database
 * @param modelName
 * @param identifierId
 * @param selectedValues
 * @returns
 */
export const getQuestionsWithAnswerChoices = async (
  modelName: string,
  identifierId: any,
  selectedValues: any,
  includedFilter: any
): Promise<any> => {
  try {
    let data = null;
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get one` method
     */
    data = await prisma[modelName].findUnique({
      where: identifierId, // Exam ID pass karein
      include: {
        AnswerChoice: {
          orderBy: {
            composite_key: "asc", // Sort AnswerChoice by composite_key in ascending order
          },
        },
      },
    });
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

export const getSectionsRecord = async (
  modelName: string,
  identifierId: any
): Promise<any> => {
  try {
    let data = null;
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get one` method
     */

    data = await prisma[modelName].findUnique({
      where: identifierId, // Exam ID pass karein
      include: {
        questions: {
          select: {
            question_id: true,
          },
        },
      },
    });
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method retrieves a single record from the database.
 * @param modelName - The name of the Prisma model.
 * @param identifierId - The identifier object to find the record.
 * @param selectedValues - The specific fields to select.
 * @returns The retrieved record.
 */
export const getQuestionRecordById = async (
  modelName: string,
  identifierId: any
): Promise<any> => {
  try {
    let data = null;
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    data = await prisma[modelName].findUnique({
      where: identifierId,
      include: {
        AnswerChoice: {
          orderBy: {
            composite_key: "asc",
          },
        },
      },
    });
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method Delete One record from Database
 * @param modelName
 * @param identifierId
 * @returns
 */
export const deleteOneRecord = async (
  modelName: string,
  identifierId: string | number | any
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `delete one ` method
     */
    await prisma[modelName].delete({
      where: identifierId, //  the unique identifier
    });
    return true;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method Delete Many record f db
 * @param modelName
 * @returns
 */
export const deleteManyRecord = async (modelName: string): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `delete all` method
     */
    await prisma[modelName].deleteMany({}); // No `where` condition deletes all
    return true;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method Delete Many record in db
 * @param modelName
 * @param identifierId
 * @param includesModalName
 * @returns
 */
export const includesRelatedModalsRecord = async (
  modelName: string,
  identifierId: string | number,
  includesModalName: string
): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get records with modal` method
     */
    const data = await prisma[modelName].findUnique({
      where: identifierId, // lile {id:1}
      include: {
        [includesModalName]: true, // Include the related groups for the user
      },
    });
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method insert a record into the database
 * @param modelName ,
 * @param record
 * @returns
 */
export const createManyRecord = async (
  modelName: string,
  record: any
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `create` method
     */
    await prisma[modelName].createMany({
      data: record, // ex: [{name: "John Doe", email: "john.doe@example.com"}]
      skipDuplicates: true, // Optionally skip duplicates based on unique fields (like `email`)
    });
    return true;
  } catch (error) {
    throw commonMessages.GENERIC_ERROR_MESSAGE; // Re-throw the error to propagate it
  }
};

/**
 * @description This method finds a record by email from Database
 * @param modelName
 * @param email
 * @returns
 */
export const findRecordByEmail = async (
  modelName: string,
  email: string,
  include: any
): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and find by email
     */
    const data = await prisma[modelName].findUnique({
      where: {
        email,
      },
      // select: include
    });
    const sanitizedUser = data ? sanitizeInclude(data, include) : null;
    return sanitizedUser;
  } catch (error) {
    logger.error(`${error}`);
    throw error;
  }
};

/**
 * @description This method finds a record by email from Database
 * @param modelName
 * @param email
 * @returns
 */
export const findRecordByEmailV2 = async (
  modelName: string,
  email: string,
  include: any
): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and find by email
     */
    const data = await prisma[modelName].findFirst({
      where: {
        email,
      },
      // select: include
    });
    const sanitizedUser = data ? sanitizeInclude(data, include) : null;
    return sanitizedUser;
  } catch (error) {
    logger.error(`${error}`);
    throw error;
  }
};
export const getRecords = async (
  modelName: any,
  options: QueryOptions = {}
): Promise<any> => {
  try {
    const validModels = Object.keys(prisma);

    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];

    const data = await model.findMany({
      ...options,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCounts = async (
  modelName: any,
  options: QueryOptions = {}
): Promise<any> => {
  try {
    const validModels = Object.keys(prisma);

    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];

    const data = await model.count({
      ...options,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCountsV2 = async (
  modelName: any,
  options: QueryOptions = {}
): Promise<any> => {
  try {
    const validModels = Object.keys(prisma);

    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];

    // if distinct is used, fallback to findMany
    if (options.distinct) {
      const result = await model.findMany({
        where: options.where,
        distinct: options.distinct,
        select: options.select || { [options.distinct]: true },
      });

      return result.length;
    }

    return await model.count({
      where: options.where,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * @description Generic groupBy helper for Prisma models
 * @param modelName - The Prisma model name
 * @param args - Arguments passed directly to Prisma's groupBy
 * @returns Grouped aggregation result
 */
export const groupByRecords = async (
  modelName: string,
  args: any
): Promise<any> => {
  try {
    const validModels = Object.keys(prisma);

    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];

    const data = await model.groupBy({
      ...args,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getRecord = async (
  modelName: any,
  options: QueryOptions = {}
): Promise<any> => {
  try {
    const validModels = Object.keys(prisma);

    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];

    const data = await model.findUnique({
      ...options,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * @description This method deletes a user record by ID from the database
 * @param userId - The ID of the user to delete
 * @returns Promise<boolean>
 */
export const deleteUserById = async (
  modelName: string,
  userId: number
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid Prisma model.`);
    }

    const model = prisma[modelName];
    /**
     * Dynamically access the model and call the `delete` method
     */
    await model.delete({
      where: { id: userId }, // The unique identifier for the user
    });
    return true;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method retrieves the last partner record from the database.
 * @returns The last partner record with the highest partner_id.
 */
export const getLastPartner = async (modelName: string): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    const model = prisma[modelName];
    const lastPartner = await model.findFirst({
      where: {
        partner_id: {
          not: null,
        },
      },
      orderBy: {
        partner_id: "desc",
      },
      select: {
        partner_id: true,
      },
    });
    return lastPartner;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method retrieves multiple records from the database using findMany.
 * @param modelName - The name of the Prisma model.
 * @param filters - (Optional) Object containing filters for the query.
 * @param options - (Optional) Additional query options like include, select, orderBy, etc.
 * @returns List of records.
 */
export const findManyRecords = async (
  modelName: string,
  filters: Record<string, any> = {},
  options: QueryOptions = {}
): Promise<any[]> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Build the `where` clause dynamically based on provided filters */
    const whereClause = Object.keys(filters).length ? filters : undefined;

    /** Fetch records using findMany */
    const data = await prisma[modelName].findMany({
      where: whereClause,
      ...options,
    });

    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method deletes multiple records from the database based on a condition.
 * @param modelName - The name of the Prisma model.
 * @param condition - The condition to filter records for deletion.
 * @returns Promise<number> - The count of deleted records.
 */
export const deleteManyRecords = async (
  modelName: string,
  condition: Record<string, any> = {}
): Promise<number> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Delete records based on the condition */
    const result = await prisma[modelName].deleteMany({
      where: condition,
    });

    return result; // Return the count of deleted records
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

export const getOne = async (
  modelName: string,
  selectedValues: any
): Promise<any> => {
  try {
    let data = null;
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }
    /**
     * Dynamically access the model and call the `get one` method
     */
    if (selectedValues) {
      data = await prisma[modelName].findFirst({
        select: selectedValues /** ex: { name: true, email: true} */,
      });
    }
    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

/**
 * @description This method retrieves the first record from the database that matches the given condition.
 * @param modelName - The name of the Prisma model.
 * @param condition - The condition to filter records.
 * @param options - (Optional) Additional query options like include, select, orderBy, etc.
 * @returns The first matching record.
 */
export const findFirstRecord = async (
  modelName: string,
  condition: Record<string, any> = {},
  options: QueryOptions = {}
): Promise<any> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Fetch the first record using findFirst */
    const data = await prisma[modelName].findFirst({
      where: condition,
      ...options,
    });

    return data;
  } catch (error) {
    throw error; // Re-throw the error to propagate it
  }
};

export const softDeleteOneRecord = async (
  modelName: string,
  identifierId: string | number | any,
  deletedBy: number
): Promise<boolean> => {
  try {
    /** Validate Model Names */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Dynamically access the model and call update */
    await prisma[modelName].update({
      where: identifierId,
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * function to update multiple records based on a specific field value
 * @param modelName
 * @param fieldName
 * @param fieldValue
 * @param updateData
 * @returns
 */
export const updateRecordsByField = async (
  modelName: string,
  fieldName: string,
  fieldValue: any,
  updateData: Record<string, any>
): Promise<boolean> => {
  try {
    /** Validate model name */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Dynamically access the model and update all matching records */
    await prisma[modelName].updateMany({
      where: {
        [fieldName]: fieldValue,
      },
      data: updateData,
    });

    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found, treat as success
      return true;
    } else {
      throw error; // re-throw other unexpected errors
    }
  }
};

/**
 * Run multiple operations in a single transaction
 */
export const runTransaction = async <T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  try {
    return await prisma.$transaction(
      async (tx: PrismaClient) => {
        return callback(tx);
      },
      {
        timeout: 20000,
      }
    );
  } catch (error) {
    throw error;
  }
};
/**
 * Update multiple records based on a condition
 * @param modelName
 * @param whereCondition
 * @param updateData
 * @returns
 */
export const updateManyRecords = async (
  modelName: string,
  whereCondition: Record<string, any>, // <-- use this instead of single field
  updateData: Record<string, any>
): Promise<boolean> => {
  try {
    /** Validate model name */
    const validModels = Object.keys(prisma);
    if (!validModels.includes(modelName)) {
      throw new Error(`${modelName} is not a valid model.`);
    }

    /** Dynamically access the model and update all matching records */
    await prisma[modelName].updateMany({
      where: whereCondition,
      data: updateData,
    });

    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found, treat as success
      return true;
    } else {
      throw error; // re-throw other unexpected errors
    }
  }
};

/**
 * function to get the count of records
 * @param model
 * @param where
 * @returns
 */
export const countRecords = (model: string, where: any) => {
  return prisma[model].count({ where });
};
