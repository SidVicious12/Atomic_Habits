import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { today, getLocalTimeZone } from '@internationalized/date';
import washedFaceData from '../data/washedFaceDataByYear.json';
import { SimpleDateRangePicker } from './ui/simple-date-range-picker';

const allMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WashFaceDashboard = () => {
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ years: 1 }),
    end: today(getLocalTimeZone()),
  });

  const chartData = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) {
      return [];
    }

    const data = [];
    let current = dateRange.start;
    while (current.compare(dateRange.end) <= 0) {
      const year = current.year.toString();
      const monthName = allMonths[current.month - 1];
      const value = washedFaceData[year]?.[monthName] || 0;
      data.push({
        name: `${monthName.slice(0, 3)}-${year.slice(2)}`,
        value: value,
      });
      current = current.add({ months: 1 });
    }
    return data;
  }, [dateRange]);

  return (
    <div className="p-6 rounded-2xl shadow-lg bg-white w-full min-h-[400px] transition-shadow hover:shadow-xl flex flex-col">
      <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Wash Face at Night Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">Date range analysis of washing face habit.</p>
        </div>
        <SimpleDateRangePicker
          
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="flex-grow mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '8px' }}
              cursor={{ fill: 'rgba(130, 202, 157, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="value" fill="#82ca9d" name="Times Washed Face" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WashFaceDashboard;
