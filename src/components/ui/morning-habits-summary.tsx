'use client';

'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, AreaSeries, Area, Gradient, GradientStop, LinearXAxis, LinearYAxis, GridlineSeries, Gridline, LinearXAxisTickSeries, LinearXAxisTickLabel, LinearYAxisTickSeries } from 'reaviz';
import { IconCoffee, IconToolsKitchen2, IconDeviceMobile, IconWalk } from '@tabler/icons-react';
import { SimpleDateRangePicker } from './simple-date-range-picker';
import { today, getLocalTimeZone } from '@internationalized/date';
import { isWithinInterval } from 'date-fns';

// Define types for chart data
interface ChartDataPoint {
  key: Date;
  data: number;
}

interface ChartSeries {
  key: string;
  data: ChartDataPoint[];
}

// Mock Data generation for a wider range to allow filtering
const generateMockData = (days = 90): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({ key: date, data: Math.random() > 0.5 ? 1 : 0 });
  }
  return data;
};

// Group daily data into monthly totals
const groupByMonth = (data: ChartDataPoint[]): ChartDataPoint[] => {
  const result: { [key: string]: number } = {};
  data.forEach(({ key, data }) => {
    const month = key.toISOString().slice(0, 7); // "2025-07"
    if (!result[month]) {
      result[month] = 0;
    }
    result[month] += data;
  });

  return Object.entries(result).map(([month, total]) => ({
    key: new Date(month + '-02'), // Use day 2 to avoid timezone issues
    data: total,
  }));
};

const allHabitData: ChartSeries[] = [
  { key: "Coffee", data: generateMockData() },
  { key: "Breakfast", data: generateMockData() },
  { key: "Phone Use", data: generateMockData() },
  { key: "Morning Walk", data: generateMockData() },
];

const colorScheme = ['#D97706', '#F97316', '#3B82F6', '#10B981'];
const habitIcons: { [key: string]: React.ReactNode } = {
  Coffee: <IconCoffee className="w-5 h-5 text-yellow-600" />,
  Breakfast: <IconToolsKitchen2 className="w-5 h-5 text-orange-500" />,
  'Phone Use': <IconDeviceMobile className="w-5 h-5 text-blue-500" />,
  'Morning Walk': <IconWalk className="w-5 h-5 text-green-500" />,
};

export const MorningHabitsSummary: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ days: 89 }), // Default to 90 days
    end: today(getLocalTimeZone()),
  });

  // 1. Filter daily data based on date picker
  const filteredDailyData = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return [];

    const start = dateRange.start.toDate(getLocalTimeZone());
    const end = dateRange.end.toDate(getLocalTimeZone());

    return allHabitData.map(series => ({
      ...series,
      data: series.data.filter(point => isWithinInterval(point.key, { start, end })),
    }));
  }, [dateRange]);

  // 2. Aggregate filtered daily data into monthly buckets for the chart
  const monthlyChartData = useMemo(() => {
    return filteredDailyData.map(series => ({
      ...series,
      data: groupByMonth(series.data),
    }));
  }, [filteredDailyData]);

  // 3. Calculate summary stats from the filtered daily data
  const summaryItems = useMemo(() => {
    return filteredDailyData.map(series => ({
      label: series.key,
      icon: habitIcons[series.key],
      count: series.data.filter(d => d.data === 1).length,
    }));
  }, [filteredDailyData]);

  return (
    <div className="rounded-xl shadow-md p-6 bg-white dark:bg-black space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Morning Habits Overview</h3>
        <SimpleDateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-auto"
          description=""
          errorMessage=""
        />
      </div>
      
      <div className="h-72">
        <AreaChart
          data={monthlyChartData} // Use monthly data for the chart
          height={300}
          series={<AreaSeries type="grouped" interpolation="smooth" colorScheme={colorScheme} area={<Area gradient={<Gradient stops={[<GradientStop key={1} offset="0%" stopOpacity={0.1} />, <GradientStop key={2} offset="80%" stopOpacity={0} />]} />} />} />}
          xAxis={
            <LinearXAxis 
              type="time" 
              tickSeries={
                <LinearXAxisTickSeries 
                  label={
                    <LinearXAxisTickLabel 
                      format={v => new Date(v as number).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} 
                    />
                  } 
                />
              }
            />
          }
          yAxis={<LinearYAxis type="value" axisLine={null} tickSeries={<LinearYAxisTickSeries line={null} label={null} />} />}
          gridlines={<GridlineSeries line={<Gridline strokeColor="#EDF2F7" />} />}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {summaryItems.map((habit) => (
          <div key={habit.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-800">
            <div className="flex items-center space-x-2">
              {habit.icon}
              <span className="text-gray-700 dark:text-gray-300">{habit.label}</span>
            </div>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">{habit.count} days</span>
          </div>
        ))}
      </div>
    </div>
  );
};
