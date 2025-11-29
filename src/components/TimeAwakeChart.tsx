'use client';

import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Scatter,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface TimeAwakeChartProps {
  data: Array<{
    date: string;
    timeAwake: string | null;
  }>;
  targetTime?: string; // e.g., "6:00 AM"
  className?: string;
}

// Convert time string to decimal hours for charting
function timeToDecimal(timeStr: string | null): number | null {
  if (!timeStr) return null;
  
  // Handle various time formats
  const cleanTime = timeStr.trim().toUpperCase();
  
  // Try to parse "HH:MM AM/PM" format
  const match12h = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = parseInt(match12h[2], 10);
    const period = match12h[3]?.toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours + minutes / 60;
  }
  
  // Try to parse "HH:MM" 24h format
  const match24h = cleanTime.match(/(\d{1,2}):(\d{2})/);
  if (match24h) {
    const hours = parseInt(match24h[1], 10);
    const minutes = parseInt(match24h[2], 10);
    return hours + minutes / 60;
  }
  
  return null;
}

// Convert decimal hours back to time string
function decimalToTime(decimal: number): string {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate rolling average
function calculateRollingAverage(data: (number | null)[], windowSize: number): (number | null)[] {
  return data.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1).filter((v): v is number => v !== null);
    if (window.length === 0) return null;
    return window.reduce((a, b) => a + b, 0) / window.length;
  });
}

type DateRange = '7days' | '30days' | '90days' | '12months' | 'all';

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
  { value: '12months', label: 'Last 12 months' },
  { value: 'all', label: 'All Time' },
];

export const TimeAwakeChart: React.FC<TimeAwakeChartProps> = ({
  data,
  targetTime = '6:00 AM',
  className,
}) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (selectedRange === 'all') return data;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    const cutoffDate = new Date(now);
    
    switch (selectedRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '12months':
        cutoffDate.setMonth(now.getMonth() - 12);
        break;
    }
    
    return data.filter(d => {
      if (!d.date) return false;
      
      // Try to parse the date
      let itemDate = new Date(d.date);
      
      // If parsing fails, try manual parsing for MM/DD/YYYY
      if (isNaN(itemDate.getTime())) {
        const parts = d.date.split('/');
        if (parts.length === 3) {
          itemDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      }
      
      // If still invalid, try YYYY-MM-DD
      if (isNaN(itemDate.getTime())) {
        const parts = d.date.split('-');
        if (parts.length === 3) {
          itemDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }
      
      if (isNaN(itemDate.getTime())) return false;
      
      itemDate.setHours(0, 0, 0, 0); // Reset to start of day for comparison
      return itemDate >= cutoffDate;
    });
  }, [data, selectedRange]);

  const chartData = useMemo(() => {
    // Convert times to decimal and calculate rolling average
    const decimals = filteredData.map((d) => timeToDecimal(d.timeAwake));
    const rollingAvg = calculateRollingAverage(decimals, 90); // 90-day rolling average
    
    return filteredData.map((d, i) => {
      // Parse date more robustly
      let dateLabel = '';
      const dateStr = d.date;
      
      if (dateStr) {
        // Try different parsing approaches
        // 1. Try direct Date parsing
        let parsed = new Date(dateStr);
        
        // 2. If that fails, try manual parsing for MM/DD/YYYY format
        if (isNaN(parsed.getTime())) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // MM/DD/YYYY
            parsed = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          }
        }
        
        // 3. If still invalid, try YYYY-MM-DD
        if (isNaN(parsed.getTime())) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            parsed = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
        }
        
        // Format the date if valid
        if (!isNaN(parsed.getTime())) {
          const year = parsed.getFullYear();
          const month = parsed.toLocaleDateString('en-US', { month: 'short' });
          dateLabel = `${month} '${String(year).slice(-2)}`;
        } else {
          // Last resort: just use the raw string or index
          dateLabel = dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr;
        }
      }
      
      return {
        date: d.date,
        rawTime: decimals[i],
        rollingAvg: rollingAvg[i],
        dateLabel: dateLabel || `#${i + 1}`,
      };
    });
  }, [filteredData]);

  const targetDecimal = timeToDecimal(targetTime) || 6;
  
  // Success window: target time ± 30 minutes
  const successTop = targetDecimal + 0.5;
  const successBottom = targetDecimal - 0.5;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rawTime = payload.find((p: any) => p.dataKey === 'rawTime');
      const avg = payload.find((p: any) => p.dataKey === 'rollingAvg');
      
      return (
        <div className="bg-zinc-900/95 backdrop-blur-lg border border-zinc-700 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-zinc-400 text-xs mb-2">{label}</p>
          {rawTime?.value && (
            <p className="text-white font-medium">
              Wake Time: <span className="text-blue-400">{decimalToTime(rawTime.value)}</span>
            </p>
          )}
          {avg?.value && (
            <p className="text-zinc-300 text-sm">
              90-Day Avg: <span className="text-emerald-400">{decimalToTime(avg.value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Y-axis formatter
  const formatYAxis = (value: number) => {
    return decimalToTime(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wake-Up Time Analysis</h2>
            <p className="text-gray-500 mt-1">Track your morning routine consistency</p>
          </div>
          
          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className="text-sm font-medium text-gray-700">
                {dateRangeOptions.find(opt => opt.value === selectedRange)?.label}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedRange(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        selectedRange === option.value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {selectedRange === option.value && (
                        <span className="mr-2">✓</span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                {/* Gradient for the rolling average line */}
                <linearGradient id="avgLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                
                {/* Gradient for success zone */}
                <linearGradient id="successZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              
              {/* Success Zone (Green area around target) */}
              <ReferenceArea
                y1={successBottom}
                y2={successTop}
                fill="url(#successZoneGradient)"
                fillOpacity={1}
                stroke="#10B981"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                interval={Math.floor(chartData.length / 10)}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              
              <YAxis
                domain={[4, 10]}
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                width={70}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Target Line (Red dashed) */}
              <ReferenceLine
                y={targetDecimal}
                stroke="#DC2626"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{
                  value: `Target: ${targetTime}`,
                  position: 'right',
                  fill: '#DC2626',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              {/* Grey dots for daily wake-up times */}
              <Scatter
                dataKey="rawTime"
                fill="#9CA3AF"
                opacity={0.6}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {/* Blue rolling average line */}
              <Line
                type="monotone"
                dataKey="rollingAvg"
                stroke="url(#avgLineGradient)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600">Daily Wake-Up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500" />
            <span className="text-sm text-gray-600">90-Day Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-red-500" />
            <span className="text-sm text-gray-600">Target Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-emerald-200 border border-emerald-400" />
            <span className="text-sm text-gray-600">Success Window</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeAwakeChart;
