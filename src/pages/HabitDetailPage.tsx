import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHabitStats, habitNameKeyMap } from '../lib/habitUtils';
import HabitPerformanceChart, { ChartSeries } from '../components/ui/area-chart-medium';
import { HabitMenuBar } from '../components/HabitMenuBar';

const HabitDetailPage: React.FC = () => {
  const { habitName } = useParams<{ habitName: string }>();

  if (!habitName) {
    return <div className="p-6">Habit not specified.</div>;
  }

  const habitKey = habitNameKeyMap[habitName as keyof typeof habitNameKeyMap];
  if (!habitKey) {
    return <div className="p-6">Invalid habit: {habitName}</div>;
  }

  const [selectedYear, setSelectedYear] = useState('2017');
  const [selectedMonth, setSelectedMonth] = useState('Dec');

  const { chartData, totalCount } = getHabitStats(habitKey, selectedYear, selectedMonth);

  const performanceChartData: ChartSeries[] = [
    {
      key: habitName,
      data: chartData,
    },
  ];

  const summaryStats = [
    {
      id: 'total',
      title: 'Total Occurrences',
      count: totalCount,
      comparisonText: 'All-time data',
      trend: 'up' as 'up' | 'down',
    },
  ];

  const legendItems = [
    {
      name: habitName,
      color: '#8884d8',
    },
  ];

  const colorScheme = ['#8884d8'];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <HabitMenuBar onYearSelect={setSelectedYear} onMonthSelect={setSelectedMonth} />
      </div>
      <div className="flex justify-center">
        <HabitPerformanceChart
          title={habitName}
          chartData={performanceChartData}
          summaryStats={summaryStats}
          legendItems={legendItems}
          colorScheme={colorScheme}
        />
      </div>
    </div>
  );
};

export default HabitDetailPage;
