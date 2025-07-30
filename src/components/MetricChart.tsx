"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm">
        <p className="font-bold text-gray-800">{formatXAxis(label)}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {`${payload[0].name}: ${payload[0].value}`}
        </p>
      </div>
    );
  }

  return null;
};

export const MetricChart: React.FC<MetricChartProps> = ({ data, metricKey, title, lineColor = '#8884d8' }) => {
  // Filter out entries where the metric is null or undefined
  const chartData = data.filter(item => item[metricKey] != null);

  if (chartData.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">No data available for this metric yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
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
          />
          <YAxis stroke="#666" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={metricKey} 
            name={title}
            stroke={lineColor} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
