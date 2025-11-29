/**
 * Monthly Chart Utilities
 * Provides helper functions to compute target months and transform data for monthly trend charts.
 */

export interface MonthRange {
  year: number;
  month: number; // 0-indexed (0 = January)
  startDate: Date;
  endDate: Date;
  label: string; // e.g., "November 2025"
  shortLabel: string; // e.g., "Nov 2025"
  daysInMonth: number;
}

export interface DailyDataPoint {
  day: number;
  dayLabel: string;
  value: number;
  date: string; // YYYY-MM-DD format
}

export interface MonthlyChartData {
  monthRange: MonthRange;
  dailyData: DailyDataPoint[];
  totalValue: number;
  daysWithData: number;
}

/**
 * Get the target months relative to today.
 * Returns an array of MonthRange objects for the specified number of months,
 * starting from the current month and going backwards.
 * 
 * @param numberOfMonths - How many months to include (default: 3)
 * @param referenceDate - The reference date (default: today)
 */
export function getTargetMonths(
  numberOfMonths: number = 3,
  referenceDate: Date = new Date()
): MonthRange[] {
  const months: MonthRange[] = [];
  
  for (let i = 0; i < numberOfMonths; i++) {
    const targetDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Calculate days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Start and end dates
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month, daysInMonth, 23, 59, 59);
    
    // Generate labels
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.push({
      year,
      month,
      startDate,
      endDate,
      label: `${monthNames[month]} ${year}`,
      shortLabel: `${shortMonthNames[month]} ${year}`,
      daysInMonth,
    });
  }
  
  return months;
}

/**
 * Format a date as YYYY-MM-DD string
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Transform daily log data into monthly chart data for a specific habit.
 * 
 * @param logs - Array of daily log objects
 * @param monthRange - The target month range
 * @param columnName - The column/key name for the habit in the data
 * @param isNumeric - Whether this habit tracks numeric values (vs boolean)
 */
export function transformLogsToMonthlyData(
  logs: any[],
  monthRange: MonthRange,
  columnName: string,
  isNumeric: boolean = false
): MonthlyChartData {
  // Create a map of date -> value for quick lookup
  const dateValueMap = new Map<string, number>();
  
  logs.forEach(log => {
    if (!log.log_date) return;
    
    const logDate = new Date(log.log_date);
    const dateKey = formatDateKey(logDate);
    const value = log[columnName];
    
    if (isNumeric) {
      if (typeof value === 'number' && value > 0) {
        dateValueMap.set(dateKey, value);
      }
    } else {
      if (value === true) {
        dateValueMap.set(dateKey, 1);
      }
    }
  });
  
  // Generate daily data points for all days in the month
  const dailyData: DailyDataPoint[] = [];
  let totalValue = 0;
  let daysWithData = 0;
  
  for (let day = 1; day <= monthRange.daysInMonth; day++) {
    const date = new Date(monthRange.year, monthRange.month, day);
    const dateKey = formatDateKey(date);
    const value = dateValueMap.get(dateKey) || 0;
    
    dailyData.push({
      day,
      dayLabel: String(day),
      value,
      date: dateKey,
    });
    
    totalValue += value;
    if (value > 0) daysWithData++;
  }
  
  return {
    monthRange,
    dailyData,
    totalValue,
    daysWithData,
  };
}

/**
 * Compute monthly chart data for multiple months.
 * This is the main function to use in components.
 * 
 * @param logs - Array of daily log objects
 * @param columnName - The column/key name for the habit
 * @param isNumeric - Whether this habit tracks numeric values
 * @param numberOfMonths - How many months to compute (default: 3)
 */
export function computeMonthlyChartData(
  logs: any[],
  columnName: string,
  isNumeric: boolean = false,
  numberOfMonths: number = 3
): MonthlyChartData[] {
  const targetMonths = getTargetMonths(numberOfMonths);
  
  return targetMonths.map(monthRange => 
    transformLogsToMonthlyData(logs, monthRange, columnName, isNumeric)
  );
}
