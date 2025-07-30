import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HabitChart = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-4">No data to display</div>;
  }

  const data = history.map((value, index) => ({ name: `Day ${index + 1}`, value }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="value" fill="#6366f1" isAnimationActive={true} animationDuration={800} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HabitChart;