import { PostgrestError } from '@supabase/supabase-js';

export interface DatabaseError {
  message: string;
  code: string;
  userMessage: string;
  shouldRetry: boolean;
  details?: string;
}

/**
 * Enhanced database error handler that provides user-friendly messages
 * and determines retry strategies
 */
export function handleDatabaseError(error: PostgrestError | Error): DatabaseError {
  // Default error structure
  const dbError: DatabaseError = {
    message: error.message,
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again.',
    shouldRetry: true
  };

  // Handle Supabase-specific errors
  if ('code' in error && error.code) {
    dbError.code = error.code;
    
    switch (error.code) {
      // Authentication errors
      case 'PGRST301':
        dbError.userMessage = 'You need to be logged in to perform this action.';
        dbError.shouldRetry = false;
        break;
        
      // Permission/RLS errors  
      case 'PGRST116':
        dbError.userMessage = 'No data found or you don\'t have permission to access this data.';
        dbError.shouldRetry = false;
        break;
        
      // Unique constraint violations
      case '23505':
        if (error.message.includes('daily_logs_user_id_log_date_key')) {
          dbError.userMessage = 'A log entry already exists for this date. Try updating instead.';
        } else {
          dbError.userMessage = 'This record already exists.';
        }
        dbError.shouldRetry = false;
        break;
        
      // Check constraint violations
      case '23514':
        if (error.message.includes('day_rating_valid_values')) {
          dbError.userMessage = 'Please select a valid day rating.';
        } else if (error.message.includes('dabs_count')) {
          dbError.userMessage = 'Dabs count must be between 0 and 6.';
        } else if (error.message.includes('water_bottles_count')) {
          dbError.userMessage = 'Water bottles count must be between 1 and 10.';
        } else if (error.message.includes('weight_reasonable')) {
          dbError.userMessage = 'Please enter a reasonable weight (50-1000 lbs).';
        } else if (error.message.includes('calories_reasonable')) {
          dbError.userMessage = 'Please enter a reasonable calorie count (500-10000).';
        } else if (error.message.includes('log_date_not_future')) {
          dbError.userMessage = 'Cannot create logs for future dates.';
        } else if (error.message.includes('dream_length_limit')) {
          dbError.userMessage = 'Dream description is too long (max 1000 characters).';
        } else if (error.message.includes('latest_hype_length_limit')) {
          dbError.userMessage = 'Latest hype text is too long (max 500 characters).';
        } else {
          dbError.userMessage = 'The data you entered doesn\'t meet the requirements.';
        }
        dbError.shouldRetry = false;
        break;
        
      // Foreign key violations
      case '23503':
        dbError.userMessage = 'Referenced data no longer exists. Please refresh and try again.';
        dbError.shouldRetry = false;
        break;
        
      // Connection/timeout errors
      case 'PGRST000':
      case 'PGRST503':
        dbError.userMessage = 'Database is temporarily unavailable. Please try again in a moment.';
        dbError.shouldRetry = true;
        break;
        
      // Rate limiting
      case '429':
        dbError.userMessage = 'Too many requests. Please wait a moment before trying again.';
        dbError.shouldRetry = true;
        break;
        
      default:
        // Check for common error patterns in message
        if (error.message.includes('JWT')) {
          dbError.userMessage = 'Your session has expired. Please log in again.';
          dbError.shouldRetry = false;
        } else if (error.message.includes('timeout')) {
          dbError.userMessage = 'The request timed out. Please try again.';
          dbError.shouldRetry = true;
        } else if (error.message.includes('network')) {
          dbError.userMessage = 'Network error. Please check your connection and try again.';
          dbError.shouldRetry = true;
        }
        break;
    }
  }

  // Add technical details for debugging (not shown to user)
  dbError.details = `Code: ${dbError.code}, Message: ${error.message}`;
  
  return dbError;
}

/**
 * Retry wrapper for database operations with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const dbError = handleDatabaseError(lastError);
      
      // Don't retry if error indicates it won't help
      if (!dbError.shouldRetry) {
        throw dbError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw dbError;
      }
      
      // Exponential backoff: wait longer after each failed attempt
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Database operation failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
    }
  }
  
  throw handleDatabaseError(lastError!);
}

/**
 * Log database errors for monitoring and debugging
 */
export function logDatabaseError(error: DatabaseError, context: string) {
  console.error(`Database Error in ${context}:`, {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    shouldRetry: error.shouldRetry,
    details: error.details,
    timestamp: new Date().toISOString()
  });
  
  // In production, you might want to send this to an error monitoring service
  // like Sentry, LogRocket, or custom analytics
}