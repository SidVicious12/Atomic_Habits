import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { MonthlyChartData } from '@/lib/monthly-chart-utils';

interface MonthlyTrendChartProps {
  data: MonthlyChartData;
  isNumeric?: boolean;
  barColor?: string;
  showSummary?: boolean;
}

/**
 * MonthlyTrendChart Component
 * Displays a bar/line chart showing daily trend data for a single month.
 * Matches the visual style of the main yearly chart.
 */
export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  isNumeric = false,
  barColor = '#8884d8',
  showSummary = true,
}) => {
  const { monthRange, dailyData, totalValue, daysWithData } = data;

  // Calculate completion rate for boolean habits
  const completionRate = monthRange.daysInMonth > 0 
    ? Math.round((daysWithData / monthRange.daysInMonth) * 100) 
    : 0;

  // For numeric habits, calculate average
  const average = daysWithData > 0 
    ? Math.round((totalValue / daysWithData) * 10) / 10 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-gray-900">
          {monthRange.label} Daily Trend
        </h3>
        {showSummary && (
          <div className="flex gap-4 text-sm">
            {isNumeric ? (
              <>
                <span className="text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{totalValue}</span>
                </span>
                <span className="text-gray-600">
                  Avg: <span className="font-semibold text-gray-900">{average}</span>
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-600">
                  Days: <span className="font-semibold text-gray-900">{daysWithData}/{monthRange.daysInMonth}</span>
                </span>
                <span className="text-gray-600">
                  Rate: <span className="font-semibold text-gray-900">{completionRate}%</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        {isNumeric ? (
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="dayLabel" 
              tick={{ fontSize: 10 }} 
              interval="preserveStartEnd"
              tickMargin={5}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              width={30}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Value']}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{ 
                fontSize: '12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={barColor} 
              strokeWidth={2}
              dot={{ r: 2, fill: barColor }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="dayLabel" 
              tick={{ fontSize: 10 }} 
              interval="preserveStartEnd"
              tickMargin={5}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              width={30}
              allowDecimals={false}
              domain={[0, 1]}
              ticks={[0, 1]}
            />
            <Tooltip 
              formatter={(value: number) => [value === 1 ? 'Yes' : 'No', 'Completed']}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{ 
                fontSize: '12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={barColor} 
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

interface MonthlyTrendChartsProps {
  monthlyData: MonthlyChartData[];
  isNumeric?: boolean;
  barColor?: string;
}

/**
 * MonthlyTrendCharts Component
 * Renders multiple monthly trend charts in a vertical stack.
 * This is the main component to use in the HabitDetailPage.
 */
export const MonthlyTrendCharts: React.FC<MonthlyTrendChartsProps> = ({
  monthlyData,
  isNumeric = false,
  barColor = '#8884d8',
}) => {
  if (!monthlyData || monthlyData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Recent Monthly Trends</h2>
      <div className="grid grid-cols-1 gap-4">
        {monthlyData.map((data, index) => (
          <MonthlyTrendChart
            key={`${data.monthRange.year}-${data.monthRange.month}`}
            data={data}
            isNumeric={isNumeric}
            barColor={barColor}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthlyTrendCharts;
