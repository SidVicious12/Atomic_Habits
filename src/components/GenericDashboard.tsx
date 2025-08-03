import React, { useState, useMemo, Suspense } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { today, getLocalTimeZone } from '@internationalized/date';
import { JollyDateRangePicker } from './ui/date-range-picker';
import { ErrorBoundary } from '@/lib/error-boundary';
import { useToast } from './ui/toast';

const allMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface DashboardConfig {
  title: string;
  dataSource: Record<string, Record<string, number>>;
  color: string;
  icon?: string;
  unit?: string;
  description?: string;
}

interface GenericDashboardProps {
  config: DashboardConfig;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

function DashboardError({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-500">⚠️</span>
        <h3 className="font-semibold text-red-800">Dashboard Error</h3>
      </div>
      <p className="text-red-600 text-sm mb-3">
        Unable to load dashboard data. Please try again.
      </p>
      <button
        onClick={resetError}
        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function GenericDashboardContent({ config, className = "" }: GenericDashboardProps) {
  const { error: showError } = useToast();
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ years: 1 }),
    end: today(getLocalTimeZone()),
  });

  const { chartData, totalValue, avgValue } = useMemo(() => {
    try {
      if (!dateRange?.start || !dateRange?.end) {
        return { chartData: [], totalValue: 0, avgValue: 0 };
      }

      const data = [];
      let total = 0;
      let current = dateRange.start;
      
      while (current.compare(dateRange.end) <= 0) {
        const year = current.year.toString();
        const monthName = allMonths[current.month - 1];
        const value = config.dataSource[year]?.[monthName] || 0;
        
        data.push({
          name: `${monthName.slice(0, 3)}-${year.slice(2)}`,
          value,
          fullMonth: monthName,
          year
        });
        
        total += value;
        current = current.add({ months: 1 });
      }

      return {
        chartData: data,
        totalValue: total,
        avgValue: data.length > 0 ? Math.round((total / data.length) * 10) / 10 : 0
      };
    } catch (error) {
      console.error(`Error processing ${config.title} dashboard data:`, error);
      showError('Data Processing Error', `Failed to process ${config.title} data`);
      return { chartData: [], totalValue: 0, avgValue: 0 };
    }
  }, [dateRange, config.dataSource, config.title, showError]);

  const handleDateRangeChange = (newRange: any) => {
    try {
      setDateRange(newRange);
    } catch (error) {
      console.error('Error updating date range:', error);
      showError('Date Range Error', 'Failed to update date range');
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {config.icon && <span className="text-2xl">{config.icon}</span>}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
            {config.description && (
              <p className="text-sm text-gray-600">{config.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: config.color }}>
            {totalValue}{config.unit && ` ${config.unit}`}
          </div>
          <div className="text-sm text-gray-600">
            Avg: {avgValue}{config.unit && ` ${config.unit}`}/month
          </div>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="mb-6">
        <JollyDateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          className="w-full max-w-sm"
        />
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [
                  `${value}${config.unit ? ` ${config.unit}` : ''}`, 
                  config.title
                ]}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={config.color} 
                name={config.title}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GenericDashboard(props: GenericDashboardProps) {
  return (
    <ErrorBoundary fallback={<DashboardError error={undefined} resetError={() => window.location.reload()} />}>
      <Suspense fallback={<LoadingSkeleton />}>
        <GenericDashboardContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Factory function to create specific dashboard components
export function createDashboard(config: DashboardConfig) {
  const DashboardComponent = (props: Omit<GenericDashboardProps, 'config'>) => (
    <GenericDashboard config={config} {...props} />
  );
  
  DashboardComponent.displayName = `${config.title}Dashboard`;
  return DashboardComponent;
}