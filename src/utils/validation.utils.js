import { ZodError } from 'zod';

/**
 * Validation utilities following Single Responsibility Principle
 */

/**
 * Validate data against a Zod schema
 * @param {Object} schema - Zod schema
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} If validation fails with formatted error message
 */
export function validateSchema(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const formattedErrors = issues
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Validation failed:\n${formattedErrors}`);
    }
    throw error;
  }
}

/**
 * Safely validate data and return result with success flag
 * @param {Object} schema - Zod schema
 * @param {Object} data - Data to validate
 * @returns {Object} { success: boolean, data?: Object, error?: string }
 */
export function safeValidateSchema(schema, data) {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const formattedErrors = issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: formattedErrors };
    }
    return { success: false, error: error.message };
  }
}
