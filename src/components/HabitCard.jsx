import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HabitChart from './HabitChart';

const TIME_RANGES = ['Month', 'Year', 'All'];

export default function HabitCard({ habit }) {
  const [selectedRange, setSelectedRange] = useState('Month');
  const isDone = habit.status === 'Done';

  let displayData = habit.history;
  if (selectedRange === 'Month') {
    displayData = displayData.slice(-30);
  } else if (selectedRange === 'Year') {
    displayData = displayData.slice(-365);
  }

  return (
    <motion.div
      className="p-6 rounded-2xl shadow-lg bg-white w-full min-h-[400px] transition-shadow hover:shadow-xl flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top section: Info */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{habit.habit_name}</h2>
          <p className="text-md mt-2 text-gray-600">
            🔥 <span className="font-semibold">{habit.streak}</span> day streak
          </p>
          <p className="text-md text-gray-500 mt-1">
            Total: <span className="font-semibold">{habit.total}</span>
          </p>
        </div>
        <span
          className={`flex-shrink-0 px-3 py-1 text-sm font-bold rounded-full ${isDone ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {habit.status}
        </span>
      </div>

      {/* Middle section: Time Range Toggle */}
      <div className="flex gap-3 mt-4">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedRange === range
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Bottom section: Chart */}
      <div className="flex-grow mt-6">
        <HabitChart history={displayData} />
      </div>
    </motion.div>
  );
}