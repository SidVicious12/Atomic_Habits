import React from 'react';
import { motion } from 'framer-motion';

interface IntensityToggleProps {
  name: string;
  label: string;
  value: number; // 0, 25, 50, 75, 100
  onChange: (value: number) => void;
  disabled?: boolean;
}

const intensityLevels = [
  { value: 0, label: 'Not Done', color: 'bg-gray-200', emoji: '⭕' },
  { value: 25, label: '25%', color: 'bg-red-200', emoji: '🟡' },
  { value: 50, label: '50%', color: 'bg-yellow-200', emoji: '🟠' },
  { value: 75, label: '75%', color: 'bg-orange-200', emoji: '🔶' },
  { value: 100, label: '100%', color: 'bg-green-200', emoji: '✅' },
];

export const IntensityToggle: React.FC<IntensityToggleProps> = ({
  name,
  label,
  value,
  onChange,
  disabled = false
}) => {
  const currentLevel = intensityLevels.find(level => level.value === value) || intensityLevels[0];
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Current Status Display */}
      <div className={`p-3 rounded-lg border-2 ${currentLevel.color} border-opacity-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLevel.emoji}</span>
            <span className="font-medium text-gray-700">{currentLevel.label}</span>
          </div>
          {value > 0 && (
            <div className="text-sm text-gray-600">
              {value}% complete
            </div>
          )}
        </div>
      </div>

      {/* Intensity Level Buttons */}
      <div className="grid grid-cols-5 gap-1">
        {intensityLevels.map((level) => (
          <motion.button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            disabled={disabled}
            className={`
              p-2 rounded-lg text-xs font-medium transition-all duration-200
              ${value === level.value
                ? `${level.color} border-2 border-gray-400 text-gray-800`
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm">{level.emoji}</span>
              <span>{level.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full transition-all duration-500 ${
            value >= 75 ? 'bg-green-500' :
            value >= 50 ? 'bg-orange-500' :
            value >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};