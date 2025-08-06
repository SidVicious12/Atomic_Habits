import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';
import { JollyDateRangePicker } from './ui/date-range-picker';
import { useDailyLogs } from '../hooks/useDailyLogs';

const allMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Generic Live Habit Dashboard Component
 * Connects to Supabase and displays real habit data
 */
const LiveHabitDashboard = ({ 
  habitKey, 
  title, 
  color = "#8884d8", 
  description,
  isNumeric = false 
}) => {
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ months: 6 }), // Show last 6 months by default
    end: today(getLocalTimeZone()),
  });

  // Get live data from Supabase
  const { data: dailyLogs = [], isLoading, error } = useDailyLogs();

  const handleDateRangeChange = (newRange) => {
    if (!newRange) return;
    
    const convertToCalendarDate = (dateObj) => {
      if (dateObj && typeof dateObj === 'object' && dateObj.year && dateObj.month) {
        return new CalendarDate(dateObj.year, dateObj.month, dateObj.day || 1);
      }
      return dateObj;
    };

    setDateRange({
      start: convertToCalendarDate(newRange.start),
      end: convertToCalendarDate(newRange.end),
    });
  };

  const chartData = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end || !dailyLogs.length) {
      return [];
    }

    // Filter logs by date range
    const filteredLogs = dailyLogs.filter(log => {
      if (!log.log_date) return false;
      
      const logDate = new Date(log.log_date);
      const startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day || 1);
      const endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day || 31);
      
      return logDate >= startDate && logDate <= endDate;
    });

    // Group by month and aggregate data
    const monthlyData = {};
    
    filteredLogs.forEach(log => {
      const logDate = new Date(log.log_date);
      const year = logDate.getFullYear();
      const month = logDate.getMonth();
      const monthKey = `${allMonths[month].slice(0, 3)}-${year.toString().slice(2)}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          total: 0, 
          positiveCount: 0, 
          numericSum: 0,
          numericCount: 0,
          month, 
          year 
        };
      }
      
      monthlyData[monthKey].total++;
      
      const value = log[habitKey];
      if (isNumeric) {
        // For numeric fields (like water bottles, pages read)
        if (typeof value === 'number' && value > 0) {
          monthlyData[monthKey].numericSum += value;
          monthlyData[monthKey].numericCount++;
        }
      } else {
        // For boolean fields (like coffee, breakfast)
        if (value === true) {
          monthlyData[monthKey].positiveCount++;
        }
      }
    });

    // Convert to chart format
    const data = Object.entries(monthlyData)
      .map(([monthKey, data]) => {
        let displayValue;
        let tooltip;
        
        if (isNumeric) {
          // Show average for numeric fields
          displayValue = data.numericCount > 0 
            ? Math.round((data.numericSum / data.numericCount) * 100) / 100
            : 0;
          tooltip = {
            average: displayValue,
            total: data.numericSum,
            daysWithData: data.numericCount,
            totalDays: data.total
          };
        } else {
          // Show count for boolean fields  
          displayValue = data.positiveCount;
          const percentage = data.total > 0 ? Math.round((data.positiveCount / data.total) * 100) : 0;
          tooltip = {
            count: data.positiveCount,
            totalDays: data.total,
            percentage
          };
        }
        
        return {
          name: monthKey,
          value: displayValue,
          tooltip,
          month: data.month,
          year: data.year
        };
      })
      .filter(item => item.tooltip.totalDays > 0) // Show months where we have ANY data (even if habit wasn't done)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    return data;
  }, [dateRange, dailyLogs, habitKey, isNumeric]);

  // Count entries that have this habit tracked
  const entriesWithHabit = dailyLogs.filter(log => {
    const value = log[habitKey];
    return isNumeric ? (typeof value === 'number' && value > 0) : (value === true);
  }).length;

  // Loading and error states
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl shadow-lg bg-white w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl shadow-lg bg-white w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload.tooltip) {
      const data = payload[0].payload.tooltip;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{label}</p>
          {isNumeric ? (
            <>
              <p style={{ color }}>
                Average: {data.average}
              </p>
              <p className="text-gray-600 text-sm">
                Total: {data.total} over {data.daysWithData} days
              </p>
            </>
          ) : (
            <>
              <p style={{ color }}>
                {title}: {data.count}/{data.totalDays} days
              </p>
              <p className="text-gray-600 text-sm">
                Success Rate: {data.percentage}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl shadow-lg bg-white w-full min-h-[400px] transition-shadow hover:shadow-xl flex flex-col">
      <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {description || `Tracking ${title.toLowerCase()}.`} ({dailyLogs.length} total entries, {entriesWithHabit} with {title.toLowerCase()})
          </p>
        </div>
        <JollyDateRangePicker
          label="Date Range"
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      <div className="flex-grow mt-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No {title.toLowerCase()} data found</p>
              <p className="text-sm mt-1">Try adjusting your date range or add some daily logs</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="value" 
                fill={color} 
                name={title} 
                radius={[2, 2, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LiveHabitDashboard;