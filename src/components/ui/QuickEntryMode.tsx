import React from 'react';
import { motion } from 'framer-motion';
import { QuickToggle } from './QuickToggle';
import { StepperInput } from './StepperInput';

interface QuickEntryModeProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export const QuickEntryMode: React.FC<QuickEntryModeProps> = ({
  formData,
  onFieldChange,
  onComplete,
  isLoading = false
}) => {
  // Essential habits for quick entry
  const essentialHabits = [
    { name: 'coffee', label: '☕ Morning Coffee', type: 'toggle' },
    { name: 'morning_walk', label: '🚶 Morning Walk', type: 'toggle' },
    { name: 'water_bottles_count', label: '💧 Water Bottles', type: 'stepper', min: 0, max: 10, unit: 'bottles' },
    { name: 'pages_read_count', label: '📖 Pages Read', type: 'stepper', min: 0, max: 100, unit: 'pages' },
    { name: 'workout', label: '💪 Workout', type: 'toggle' },
    { name: 'brushed_teeth_night', label: '🦷 Brushed Teeth', type: 'toggle' },
  ];

  const completedCount = essentialHabits.filter(habit => {
    if (habit.type === 'toggle') {
      return formData[habit.name];
    } else if (habit.type === 'stepper') {
      return formData[habit.name] > 0;
    }
    return false;
  }).length;

  const completionRate = Math.round((completedCount / essentialHabits.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Daily Entry</h2>
        <p className="text-gray-600">Track your essential habits in seconds</p>
        
        {/* Progress Ring */}
        <div className="flex items-center justify-center mt-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-500 ${
                  completionRate >= 80 ? 'text-green-500' :
                  completionRate >= 60 ? 'text-yellow-500' : 'text-blue-500'
                }`}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${completionRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Habits */}
      <div className="space-y-4 mb-6">
        {essentialHabits.map((habit, index) => (
          <motion.div
            key={habit.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {habit.type === 'toggle' ? (
              <QuickToggle
                name={habit.name}
                label={habit.label}
                checked={formData[habit.name] || false}
                onChange={(checked) => onFieldChange(habit.name, checked)}
              />
            ) : (
              <StepperInput
                name={habit.name}
                label={habit.label}
                value={formData[habit.name] || 0}
                onChange={(value) => onFieldChange(habit.name, value)}
                min={habit.min || 0}
                max={habit.max || 100}
                unit={habit.unit}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Saving...
            </span>
          ) : (
            `Complete Quick Entry (${completedCount}/${essentialHabits.length})`
          )}
        </motion.button>
      </div>

      {/* Encouragement Message */}
      {completionRate === 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
        >
          <span className="text-green-700 font-medium">🎉 Amazing! All essential habits completed!</span>
        </motion.div>
      )}
    </div>
  );
};