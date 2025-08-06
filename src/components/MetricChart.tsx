"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MetricChartProps {
  data: any[];
  metricKey: string;
  title: string;
  lineColor?: string;
}

const formatXAxis = (tickItem: string) => {
  try {
    return format(parseISO(tickItem), 'MMM d');
  } catch (e) {
    return tickItem;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const record = payload[0].payload;
    
    // Determine if this was originally boolean data
    const isBooleanMetric = record && typeof record.count !== 'undefined';
    
    let displayValue;
    if (isBooleanMetric && value <= 100) {
      displayValue = `${value}% (${record.count} days)`;
    } else {
      displayValue = value;
    }
    
    return (
      <div className="p-3 bg-white border border-gray-200 rounded-md shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{formatXAxis(label)}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {`${payload[0].name}: ${displayValue}`}
        </p>
        {record.count && (
          <p className="text-xs text-gray-500 mt-1">
            Week of {formatXAxis(label)}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export const MetricChart: React.FC<MetricChartProps> = ({ data, metricKey, title, lineColor = '#8884d8' }) => {
  console.log(`MetricChart ${title}: received ${data.length} records`);
  console.log(`Sample data for ${metricKey}:`, data.slice(0, 3).map(item => ({ date: item.log_date, value: item[metricKey] })));
  
  // Transform data and filter out entries where the metric is null or undefined
  const filteredData = data
    .filter(item => {
      const hasValue = item[metricKey] != null && item[metricKey] !== undefined && item[metricKey] !== '';
      return hasValue;
    })
    .map(item => ({
      ...item,
      [metricKey]: typeof item[metricKey] === 'boolean' ? (item[metricKey] ? 1 : 0) : item[metricKey]
    }));

  console.log(`MetricChart ${title}: filtered to ${filteredData.length} records with data`);
  
  // Aggregate daily data to prevent thin bars - group by week for better visualization
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...filteredData].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
    
    // For boolean data, show weekly success rate; for numeric data, show weekly averages
    const isBooleanData = sortedData.every(item => item[metricKey] === 0 || item[metricKey] === 1);
    
    const weeklyData = {};
    
    sortedData.forEach(item => {
      const date = new Date(item.log_date);
      // Get the start of the week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          date: weekKey,
          values: [],
          count: 0
        };
      }
      
      weeklyData[weekKey].values.push(item[metricKey]);
      weeklyData[weekKey].count++;
    });
    
    // Convert to chart format
    return Object.values(weeklyData).map(week => {
      const values = week.values;
      let aggregatedValue;
      
      if (isBooleanData) {
        // For boolean data, calculate success rate as percentage
        const successCount = values.filter(v => v === 1).length;
        aggregatedValue = Math.round((successCount / values.length) * 100);
      } else {
        // For numeric data, calculate average
        aggregatedValue = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 100) / 100;
      }
      
      return {
        log_date: week.date,
        [metricKey]: aggregatedValue,
        count: week.count
      };
    }).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  }, [filteredData, metricKey]);

  if (chartData.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">No data available for this metric yet.</p>
        <p className="text-xs text-gray-400 mt-2">
          Total records: {data.length}, Records with {metricKey}: {filteredData.length}
        </p>
      </div>
    );
  }

  // Check if this is boolean data (values are percentages 0-100 for boolean metrics)
  const originalIsBooleanData = filteredData.length > 0 && filteredData.every(item => item[metricKey] === 0 || item[metricKey] === 1);
  
  const yAxisProps = originalIsBooleanData 
    ? {
        domain: [0, 100],
        tickFormatter: (value: number) => `${value}%`
      }
    : {};

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="log_date" 
            tickFormatter={formatXAxis} 
            stroke="#666"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#666" tick={{ fontSize: 12 }} {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey={metricKey} 
            name={title}
            fill={lineColor}
            radius={[2, 2, 0, 0]}
            minPointSize={2}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
