"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MetricChartProps {
  data: any[];
  metricKey: string;
  title: string;
  lineColor?: string;
  isNumeric?: boolean;
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

export const MetricChart: React.FC<MetricChartProps> = ({ data, metricKey, title, lineColor = '#8884d8', isNumeric = false }) => {
  console.log(`MetricChart ${title}: received ${data.length} records`);
  console.log(`Sample data for ${metricKey}:`, data.slice(0, 5).map(item => ({ 
    date: item.log_date, 
    value: item[metricKey], 
    type: typeof item[metricKey],
    raw: JSON.stringify(item[metricKey])
  })));
  
  // Special debugging for water bottles
  if (metricKey === 'water_bottles_count') {
    console.log('🔍 WATER BOTTLES DEBUG:');
    console.log('isNumeric prop:', isNumeric);
    const allValues = data.map(item => item[metricKey]);
    const uniqueValues = [...new Set(allValues)];
    console.log('All unique values:', uniqueValues);
    console.log('Value types:', uniqueValues.map(v => typeof v));
    const nonNullValues = allValues.filter(v => v !== null && v !== undefined && v !== '');
    console.log(`Non-null values: ${nonNullValues.length}/${data.length}`);
    if (nonNullValues.length > 0) {
      console.log('Sample non-null values:', nonNullValues.slice(0, 10));
    }
  }
  
  // Transform data and filter out entries where the metric is null or undefined
  const filteredData = data
    .filter(item => {
      const value = item[metricKey];
      // For boolean fields, accept false as valid data
      if (typeof value === 'boolean') {
        return true;
      }
      // For numeric fields, accept 0 as valid data
      if (typeof value === 'number') {
        return true;
      }
      // Filter out null, undefined, and empty strings
      return value != null && value !== undefined && value !== '';
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
    const isBooleanData = !isNumeric && sortedData.every(item => item[metricKey] === 0 || item[metricKey] === 1);
    
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
    // Analyze why there's no data
    const nullCount = data.filter(item => item[metricKey] === null || item[metricKey] === undefined).length;
    const emptyStringCount = data.filter(item => item[metricKey] === '').length;
    const hasDataCount = data.length - nullCount - emptyStringCount;
    
    return (
      <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-amber-400">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="bg-amber-50 p-3 rounded-md">
          <p className="text-amber-800 font-medium mb-2">📊 Data Analysis</p>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• Total records: <span className="font-medium">{data.length}</span></p>
            <p>• Records with NULL values: <span className="font-medium">{nullCount}</span></p>
            <p>• Records with empty values: <span className="font-medium">{emptyStringCount}</span></p>
            <p>• Records with data: <span className="font-medium">{hasDataCount}</span></p>
          </div>
          {hasDataCount === 0 && (
            <div className="mt-3 p-2 bg-amber-100 rounded text-amber-800 text-xs">
              💡 <strong>Tip:</strong> This column appears to be empty in your database. 
              You may need to add data for "{metricKey}" in your daily logs.
            </div>
          )}
          {hasDataCount > 0 && filteredData.length === 0 && (
            <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-xs">
              💡 <strong>Note:</strong> Data exists but was filtered out during processing. 
              Check the date range or data format.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if this is boolean data (values are percentages 0-100 for boolean metrics)
  const originalIsBooleanData = !isNumeric && filteredData.length > 0 && filteredData.every(item => item[metricKey] === 0 || item[metricKey] === 1);
  
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
