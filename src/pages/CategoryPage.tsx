import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getAllDailyLogs } from '../lib/daily-logs';
import { MetricChart } from '../components/MetricChart';
import { DataTable } from '../components/DataTable';
import { supabase } from '../lib/supabase';
import { RefreshCw } from 'lucide-react';
import { HiSun, HiGlobeAlt, HiMoon, HiLightningBolt, HiStar, HiChartBar } from 'react-icons/hi';
import { SimpleDateRangePicker } from '../components/ui/simple-date-range-picker';
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date';

// Category icon mapping
const categoryIconMap = {
  'Morning': HiSun,
  'Intake': HiGlobeAlt,
  'Night': HiMoon,
  'Fitness': HiLightningBolt,
  'Wellness': HiStar,
  'Metrics': HiChartBar,
};

// Mapping from URL category name to the metrics and their display titles/colors
const categoryMetricMap = {
  Morning: [
    { key: 'phone_on_wake', title: 'Phone on Wake', color: '#ff4d4f', isNumeric: false },
    { key: 'breakfast', title: 'Ate Breakfast', color: '#ff7300', isNumeric: false },
    { key: 'coffee', title: 'Coffee', color: '#8884d8', isNumeric: false },
    { key: 'morning_walk', title: 'Morning Walk', color: '#82ca9d', isNumeric: false },
  ],
  Intake: [
    { key: 'water_bottles_count', title: 'Water Bottles', color: '#8884d8', isNumeric: true },
    { key: 'soda', title: 'Soda', color: '#ff7300', isNumeric: false },
    { key: 'alcohol', title: 'Alcohol', color: '#ffc658', isNumeric: false },
    { key: 'dabs_count', title: 'Dabs', color: '#82ca9d', isNumeric: true },
    { key: 'smoke', title: 'Smoke', color: '#d0ed57', isNumeric: false },
  ],
  Night: [
    { key: 'netflix_in_bed', title: 'Netflix in Bed', color: '#ff7300', isNumeric: false },
    { key: 'brushed_teeth_night', title: 'Brushed Teeth', color: '#82ca9d', isNumeric: false },
    { key: 'washed_face_night', title: 'Washed Face', color: '#ffc658', isNumeric: false },
  ],
  Fitness: [
    { key: 'workout', title: 'Workout', color: '#8884d8', isNumeric: false },
    { key: 'calories', title: 'Calories Burned', color: '#82ca9d', isNumeric: true },
  ],
  Wellness: [
    { key: 'day_rating', title: 'Day Rating (1-10)', color: '#8884d8', isNumeric: false },
    { key: 'pages_read_count', title: 'Pages Read', color: '#82ca9d', isNumeric: true },
  ],
  Metrics: [
    { key: 'weight_lbs', title: 'Weight (lbs)', color: '#8884d8', isNumeric: true },
  ],
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null); // Will be set after data loads

  const handleDateRangeChange = (newRange) => {
    if (!newRange) return;
    
    console.log('Date range changing to:', newRange);
    
    // Convert plain objects to CalendarDate objects if needed
    const convertToCalendarDate = (dateObj) => {
      if (dateObj && typeof dateObj === 'object' && dateObj.year && dateObj.month) {
        // If it's a plain object with year, month, day
        return new CalendarDate(dateObj.year, dateObj.month, dateObj.day || 1);
      }
      // If it's already a CalendarDate or similar, return as is
      return dateObj;
    };

    const newDateRange = {
      start: convertToCalendarDate(newRange.start),
      end: convertToCalendarDate(newRange.end),
    };
    
    console.log('Converted date range:', newDateRange);
    setDateRange(newDateRange);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllDailyLogs();
      console.log(`📊 DETAILED DATA ANALYSIS:`);
      console.log(`Fetched ${data?.length || 0} daily log entries from Supabase`);
      
      setAllLogs(data || []);
      
      // COMPREHENSIVE DATE RANGE ANALYSIS
      if (data && data.length > 0) {
        // Get all dates and analyze them
        const allDates = data.map(log => log.log_date).filter(date => date);
        const parsedDates = allDates.map(dateStr => new Date(dateStr)).filter(date => !isNaN(date.getTime()));
        
        console.log(`📅 DATE ANALYSIS:`);
        console.log(`- Total records: ${data.length}`);
        console.log(`- Records with dates: ${allDates.length}`);
        console.log(`- Valid parsed dates: ${parsedDates.length}`);
        
        if (parsedDates.length > 0) {
          const sortedDates = [...parsedDates].sort((a, b) => a - b);
          const earliest = sortedDates[0];
          const latest = sortedDates[sortedDates.length - 1];
          
          console.log(`📊 FULL RANGE DISCOVERED:`);
          console.log(`- Earliest: ${earliest.toISOString().split('T')[0]} (${earliest.toLocaleDateString()})`);
          console.log(`- Latest: ${latest.toISOString().split('T')[0]} (${latest.toLocaleDateString()})`);
          console.log(`- Total span: ${Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))} days`);
          
          // Show sample dates to understand distribution
          const sampleDates = [0, Math.floor(parsedDates.length * 0.25), Math.floor(parsedDates.length * 0.5), Math.floor(parsedDates.length * 0.75), parsedDates.length - 1]
            .map(i => sortedDates[i]?.toISOString().split('T')[0]).filter(Boolean);
          console.log(`- Sample dates (quartiles): [${sampleDates.join(', ')}]`);
          
          // DETAILED COLUMN ANALYSIS
          console.log(`🔍 DETAILED COLUMN ANALYSIS:`);
          const sampleRecord = data[0];
          console.log(`- Sample record keys:`, Object.keys(sampleRecord));
          console.log(`- Sample record:`, sampleRecord);
          
          // Check for water bottles data in different periods
          const waterBottlesData = data.filter(log => log.water_bottles_count !== null && log.water_bottles_count !== undefined);
          console.log(`💧 WATER BOTTLES DETAILED ANALYSIS:`);
          console.log(`- Records with water_bottles_count: ${waterBottlesData.length}/${data.length}`);
          
          // Check all possible water-related column names
          const waterColumns = Object.keys(sampleRecord).filter(key => 
            key.toLowerCase().includes('water') || 
            key.toLowerCase().includes('bottle') ||
            key.toLowerCase().includes('drink')
          );
          console.log(`- Water-related columns found:`, waterColumns);
          
          // Check for any numeric columns that might be water bottles
          const numericColumns = Object.keys(sampleRecord).filter(key => {
            const value = sampleRecord[key];
            return typeof value === 'number' && value !== null;
          });
          console.log(`- Numeric columns in sample:`, numericColumns);
          
          // Show all unique values for water_bottles_count to see what's actually there
          const allWaterValues = data.map(log => log.water_bottles_count);
          const uniqueWaterValues = [...new Set(allWaterValues)];
          console.log(`- All unique water_bottles_count values:`, uniqueWaterValues);
          console.log(`- Types of water values:`, uniqueWaterValues.map(v => typeof v));
          
          if (waterBottlesData.length > 0) {
            const waterDates = waterBottlesData.map(log => log.log_date).sort();
            console.log(`- Water data date range: ${waterDates[0]} to ${waterDates[waterDates.length - 1]}`);
            console.log(`- Sample water values: [${waterBottlesData.slice(0, 5).map(log => log.water_bottles_count).join(', ')}]`);
          } else {
            console.log(`❌ NO WATER BOTTLES DATA FOUND - This is the problem!`);
          }
          
          // Always reset to show ALL data - this will override any previous date range
          setDateRange({
            start: new CalendarDate(earliest.getFullYear(), earliest.getMonth() + 1, earliest.getDate()),
            end: new CalendarDate(latest.getFullYear(), latest.getMonth() + 1, latest.getDate())
          });
          
          console.log(`✅ Set date range to FULL span: ${earliest.toISOString().split('T')[0]} to ${latest.toISOString().split('T')[0]}`);
        }
      }
    } catch (err) {
      setError('Failed to fetch daily logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on date range
  const logs = useMemo(() => {
    if (!allLogs.length) {
      console.log('No logs available yet');
      return allLogs;
    }

    // If no date range is set or there's an issue, return all logs
    if (!dateRange?.start || !dateRange?.end) {
      console.log('No date range set, returning all logs:', allLogs.length);
      return allLogs;
    }

    try {
      const filtered = allLogs.filter(log => {
        if (!log.log_date) return false;
        
        // Parse log date more reliably
        const logDate = new Date(log.log_date);
        if (isNaN(logDate.getTime())) {
          console.warn('Invalid log date:', log.log_date);
          return false;
        }
        
        // Convert date range to simple Date objects
        let startDate, endDate;
        
        try {
          if (dateRange.start.toDate) {
            startDate = dateRange.start.toDate(getLocalTimeZone());
          } else if (dateRange.start.year) {
            startDate = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day || 1);
          } else {
            console.warn('Invalid start date format:', dateRange.start);
            return true; // Include if we can't parse
          }
          
          if (dateRange.end.toDate) {
            endDate = dateRange.end.toDate(getLocalTimeZone());
          } else if (dateRange.end.year) {
            endDate = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day || 1);
          } else {
            console.warn('Invalid end date format:', dateRange.end);
            return true; // Include if we can't parse
          }
          
          // Set times for proper comparison
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          logDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
          
          const isInRange = logDate >= startDate && logDate <= endDate;
          return isInRange;
        } catch (dateError) {
          console.error('Error processing dates:', dateError, { start: dateRange.start, end: dateRange.end });
          return true; // Include if there's an error parsing dates
        }
      });
      
      console.log(`✅ Filtered ${filtered.length} logs from ${allLogs.length} total logs`);
      console.log('📅 Current date range:', {
        start: dateRange.start,
        end: dateRange.end
      });
      
      if (filtered.length === 0) {
        console.log('⚠️ No logs match current date range. Sample log dates:', 
          allLogs.slice(0, 5).map(log => log.log_date)
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('❌ Error filtering logs:', error);
      return allLogs; // Return all logs if filtering fails
    }
  }, [allLogs, dateRange]);

  useEffect(() => {
    fetchLogs();
    

    // Set up real-time subscription to daily_logs table
    const subscription = supabase
      .channel('daily_logs_changes')
      .on('postgres_changes', {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'daily_logs'
      }, (payload) => {
        console.log('Daily logs table changed:', payload);
        // Refresh the data when changes occur
        fetchLogs();
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const metricsToShow = categoryMetricMap[categoryName] || [];
  const CategoryIcon = categoryIconMap[categoryName];

  // Define columns for the data table, always including the date
  const tableColumns = [
    { key: 'log_date', title: 'Date' },
    ...metricsToShow,
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {categoryName} data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600 font-medium mb-2">Error loading data</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            {CategoryIcon && <CategoryIcon className="h-8 w-8" />}
            {categoryName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Displaying historical data for the {categoryName} category.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              📊 Showing {logs.length} of {allLogs.length} total entries
            </span>
            {logs.length !== allLogs.length && (
              <span className="flex items-center gap-1 text-blue-600">
                🔍 (filtered by date range)
              </span>
            )}
            {logs.length === 0 && allLogs.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                ⚠️ No data in current range
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SimpleDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchLogs();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            title="Refresh data from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {/* Data Range Info */}
      {allLogs.length > 0 && logs.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-amber-600 mt-0.5">
              ⚠️
            </div>
            <div>
              <h3 className="font-medium text-amber-800 mb-1">No data in selected date range</h3>
              <p className="text-sm text-amber-700 mb-2">
                Your selected date range doesn't contain any data. Your habit data ranges from:
              </p>
              <p className="text-sm font-mono bg-amber-100 px-2 py-1 rounded text-amber-800">
                {(() => {
                  const dates = allLogs.map(log => new Date(log.log_date)).sort((a, b) => a - b);
                  const earliest = dates[0]?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  const latest = dates[dates.length - 1]?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return `${earliest} - ${latest}`;
                })()} 
                ({allLogs.length} total entries)
              </p>
              <button
                onClick={() => {
                  const dates = allLogs.map(log => new Date(log.log_date)).sort((a, b) => a - b);
                  const earliest = dates[0];
                  const latest = dates[dates.length - 1];
                  if (earliest && latest) {
                    setDateRange({
                      start: new CalendarDate(earliest.getFullYear(), earliest.getMonth() + 1, earliest.getDate()),
                      end: new CalendarDate(latest.getFullYear(), latest.getMonth() + 1, latest.getDate())
                    });
                  }
                }}
                className="mt-2 px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
              >
                Show All My Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {metricsToShow.length > 0 ? (
          metricsToShow.map(metric => (
            <div key={`${categoryName}-${metric.key}-${logs.length}`} className="w-full">
              <MetricChart 
                data={logs} 
                metricKey={metric.key} 
                title={metric.title} 
                lineColor={metric.color}
                isNumeric={metric.isNumeric}
              />
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No metrics defined for this category.</p>
          </div>
        )}
      </div>

      {/* Render the sortable data table - Hidden for now */}
      {false && logs.length > 0 && (
        <DataTable data={logs} columns={tableColumns} />
      )}
    </>
  );
};

export default CategoryPage;
