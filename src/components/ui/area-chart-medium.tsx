'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
} from 'reaviz';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

// Type definitions
export interface ChartDataPoint {
  key: number;
  data: number | null | undefined;
}

export interface ChartSeries {
  key: string;
  data: ChartDataPoint[];
}

interface LegendItem {
  name: string;
  color: string;
}

interface SummaryStat {
  id: string;
  title: string;
  count: number;
  comparisonText: string;
  trend: 'up' | 'down';
}

// A simplified trend icon
const TrendIcon: React.FC<{ trend: 'up' | 'down' }> = ({ trend }) => {
  if (trend === 'up') {
    return <IconTrendingUp className="w-5 h-5 text-green-500" />;
  }
  return <IconTrendingDown className="w-5 h-5 text-red-500" />;
};



interface HabitPerformanceChartProps {
  title: string;
  chartData: ChartSeries[];
  summaryStats: SummaryStat[];
  legendItems: LegendItem[];
  colorScheme: string[];
}

const HabitPerformanceChart: React.FC<HabitPerformanceChartProps> = ({
  title,
  chartData,
  summaryStats,
  legendItems,
  colorScheme,
}) => {
  const validatedData = chartData.map(series => ({
    ...series,
    data: series.data.map(d => ({ key: d.key, data: d.data ?? 0 }))
  }));

  return (
    <>
      
      <div className="flex flex-col justify-between pt-4 pb-4 bg-white dark:bg-black rounded-3xl shadow-lg w-full max-w-2xl overflow-hidden transition-colors duration-300 mb-12">
        {/* Header */}
        <div className="flex justify-between items-center p-7 pt-6 pb-8">
          <h3 className="text-3xl text-left font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {title}
          </h3>
        </div>

        {/* Legend */}
        <div className="flex gap-8 w-full pl-8 pr-8 mb-4">
          {legendItems.map((item) => (
            <div key={item.name} className="flex gap-2 items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="reaviz-chart-container h-[280px] px-2">
          <AreaChart
            height={280}
            data={validatedData}
            xAxis={
              <LinearXAxis
                type="time"
                tickSeries={
                  <LinearXAxisTickSeries
                    label={
                      <LinearXAxisTickLabel
                        format={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                        fill="var(--reaviz-tick-fill)"
                      />
                    }
                  />
                }
              />
            }
            yAxis={
              <LinearYAxis
                axisLine={null}
                tickSeries={<LinearYAxisTickSeries line={null} label={null} />}
              />
            }
            series={
              <AreaSeries
                type="grouped"
                interpolation="smooth"
                area={
                  <Area
                    gradient={
                      <Gradient
                        stops={[
                          <GradientStop key={1} stopOpacity={0} />,
                          <GradientStop key={2} offset="100%" stopOpacity={0.4} />,
                        ]}
                      />
                    }
                  />
                }
                colorScheme={colorScheme}
              />
            }
          />
        </div>

        {/* Summary Stats */}
        <div className="flex flex-col sm:flex-row w-full pl-8 pr-8 justify-between pb-2 pt-8 gap-4 sm:gap-8">
          {summaryStats.map(stat => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-2 w-full sm:w-1/2"
            >
              <span className="text-xl text-gray-800 dark:text-gray-200 transition-colors duration-300">{stat.title}</span>
              <div className="flex items-center gap-2">
                <CountUp
                  className="font-mono text-4xl font-semibold text-gray-900 dark:text-white transition-colors duration-300"
                  end={stat.count}
                  duration={2}
                />
                <TrendIcon trend={stat.trend} />
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                {stat.comparisonText}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HabitPerformanceChart;