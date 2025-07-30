import React from 'react';
import type { DailyLogFormData } from '../DailyLogForm';
import { CheckCircle, XCircle, Coffee, Droplets, BookOpen, Bed, Sun, Star, Scale, Flame } from 'lucide-react';

const MetricCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: React.ReactNode, unit?: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
    <div className="text-blue-500 mb-2">{icon}</div>
    <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    <p className="text-xl font-bold text-gray-800">
      {value} {unit}
    </p>
  </div>
);

const BooleanMetric = ({ value }: { value: boolean | undefined }) => {
    return value ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />;
};

export const DailyLogSummary = ({ log }: { log: DailyLogFormData }) => {
  if (!log) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
        <h3 className="text-2xl font-bold text-center mb-4">Summary for {new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard icon={<Sun size={24} />} title="Woke Up" value={log.time_awake || 'N/A'} />
            <MetricCard icon={<Bed size={24} />} title="Bed Time" value={log.bed_time || 'N/A'} />
            <MetricCard icon={<Star size={24} />} title="Day Rating" value={log.day_rating || 'N/A'} />
            <MetricCard icon={<Scale size={24} />} title="Weight" value={log.weight_lbs ? log.weight_lbs : 'N/A'} unit="lbs" />
            <MetricCard icon={<Flame size={24} />} title="Calories" value={log.calories ? log.calories : 'N/A'} unit="kcal" />
            <MetricCard icon={<Coffee size={24} />} title="Coffee" value={<BooleanMetric value={log.coffee} />} />
            <MetricCard icon={<Droplets size={24} />} title="Water Bottles" value={log.water_bottles_count ?? 'N/A'} />
            <MetricCard icon={<BookOpen size={24} />} title="Pages Read" value={log.pages_read_count ?? 'N/A'} />
        </div>
    </div>
  );
};
