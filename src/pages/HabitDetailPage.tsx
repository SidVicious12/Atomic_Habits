import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowLeft, TrendingUp, Calendar, Award } from 'lucide-react';
import TimeAwakeChart from '@/components/TimeAwakeChart';

// Map habit keys to human-readable names
const habitDisplayNames: Record<string, string> = {
  time_awake: 'Time Awake',
  time_at_work: 'Time at Work',
  time_left_work: 'Time Left Work',
  morning_walk: 'Morning Walk',
  coffee: 'Coffee',
  breakfast: 'Breakfast',
  phone_on_wake: 'Phone on Wake',
  water_bottles_count: 'Water Bottles',
  green_tea: 'Green Tea',
  alcohol: 'Alcohol',
  soda: 'Soda',
  smoke: 'Smoke',
  dabs_count: 'Dabs',
  brushed_teeth_night: 'Brushed Teeth',
  washed_face_night: 'Washed Face',
  netflix_in_bed: 'Netflix in Bed',
  workout: 'Workout',
  calories: 'Calories Burned',
  pages_read_count: 'Pages Read',
  relaxed_today: 'Relaxed Today',
  day_rating: 'Day Rating',
  weight_lbs: 'Weight (lbs)',
};

const habitTypes: Record<string, 'boolean' | 'numeric' | 'time'> = {
  time_awake: 'time',
  time_at_work: 'time',
  time_left_work: 'time',
  morning_walk: 'boolean',
  coffee: 'boolean',
  breakfast: 'boolean',
  phone_on_wake: 'boolean',
  water_bottles_count: 'numeric',
  green_tea: 'boolean',
  alcohol: 'boolean',
  soda: 'boolean',
  smoke: 'boolean',
  dabs_count: 'numeric',
  brushed_teeth_night: 'boolean',
  washed_face_night: 'boolean',
  netflix_in_bed: 'boolean',
  workout: 'boolean',
  calories: 'numeric',
  pages_read_count: 'numeric',
  relaxed_today: 'boolean',
  day_rating: 'numeric',
  weight_lbs: 'numeric',
};

const HabitDetailPage: React.FC = () => {
  const { habitName } = useParams<{ habitName: string }>();
  const { data: dailyLogs = [], isLoading, error } = useDailyLogs();

  if (!habitName) {
    return (
      <div className="p-6">
        <p className="text-red-600">Habit key not specified.</p>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const habitDisplayName = habitDisplayNames[habitName] || habitName;
  const habitType = habitTypes[habitName] || 'boolean';
  const isNumeric = habitType === 'numeric';
  const isTime = habitType === 'time';

  // Prepare time chart data if it's a time-based habit
  const timeChartData = useMemo(() => {
    if (!isTime || !dailyLogs.length) return [];
    return dailyLogs
      .filter(log => log[habitName])
      .map(log => ({
        date: log.log_date,
        timeAwake: log[habitName] as string,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dailyLogs, habitName, isTime]);

  // Calculate habit statistics
  const habitStats = useMemo(() => {
    if (!dailyLogs.length) {
      return {
        totalTracked: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageValue: 0,
        monthlyData: [],
        recentLogs: [],
      };
    }

    // Filter logs with this habit tracked
    const logsWithHabit = dailyLogs.filter(log => {
      const value = log[habitName];
      return isNumeric ? (typeof value === 'number' && value > 0) : value === true;
    });

    // Calculate streaks
    const sortedLogs = [...dailyLogs].sort((a, b) =>
      new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].log_date);
      logDate.setHours(0, 0, 0, 0);
      const value = sortedLogs[i][habitName];
      const hasHabit = isNumeric ? (typeof value === 'number' && value > 0) : value === true;

      if (hasHabit) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate average for numeric habits
    const averageValue = isNumeric && logsWithHabit.length > 0
      ? logsWithHabit.reduce((sum, log) => sum + (log[habitName] as number), 0) / logsWithHabit.length
      : 0;

    // Group by month
    const monthlyData: Record<string, any> = {};
    dailyLogs.forEach(log => {
      const logDate = new Date(log.log_date);
      const monthKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = logDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          count: 0,
          total: 0,
          sum: 0,
        };
      }

      monthlyData[monthKey].total++;
      const value = log[habitName];
      if (isNumeric) {
        if (typeof value === 'number' && value > 0) {
          monthlyData[monthKey].count++;
          monthlyData[monthKey].sum += value;
        }
      } else {
        if (value === true) {
          monthlyData[monthKey].count++;
        }
      }
    });

    const monthlyDataArray = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => ({
        month: data.month,
        value: isNumeric ? (data.count > 0 ? Math.round((data.sum / data.count) * 10) / 10 : 0) : data.count,
        total: data.total,
      }));

    // Get recent logs (last 10)
    const recentLogs = sortedLogs.slice(0, 10).map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      value: log[habitName],
    }));

    return {
      totalTracked: logsWithHabit.length,
      currentStreak,
      longestStreak,
      averageValue: Math.round(averageValue * 10) / 10,
      monthlyData: monthlyDataArray,
      recentLogs,
    };
  }, [dailyLogs, habitName, isNumeric]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {habitDisplayName} data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-red-500 text-sm mt-1">Please check your connection and try again.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{habitDisplayName}</h1>
          <p className="text-gray-600 mt-1">Detailed analysis and history</p>
        </div>
      </div>

      {/* Stats Cards - hide for time-based habits since TimeAwakeChart has its own stats */}
      {/* Also hide for morning_walk as requested */}
      {!isTime && habitName !== 'morning_walk' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Tracked</p>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{habitStats.totalTracked}</p>
            <p className="text-xs text-gray-500 mt-1">Times logged</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{habitStats.currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Consecutive days</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Longest Streak</p>
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{habitStats.longestStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Best performance</p>
          </div>

          {isNumeric && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Average</p>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{habitStats.averageValue}</p>
              <p className="text-xs text-gray-500 mt-1">Per occurrence</p>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {isTime ? (
        <TimeAwakeChart 
          data={timeChartData} 
          targetTime="6:00 AM"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trend</h2>
          {habitStats.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              {isNumeric ? (
                <LineChart data={habitStats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Average" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={habitStats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No data available for this habit yet.</p>
              <Link to="/log" className="text-blue-600 hover:underline mt-2 inline-block">
                Start logging →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity - hide for time-based habits */}
      {/* Also hide for morning_walk as requested */}
      {!isTime && habitName !== 'morning_walk' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {habitStats.recentLogs.length > 0 ? (
            <div className="space-y-2">
              {habitStats.recentLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{log.date}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {isNumeric 
                      ? log.value 
                      : log.value === true 
                        ? '✓ Completed' 
                        : '✗ Not completed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HabitDetailPage;
