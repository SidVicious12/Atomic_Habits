import React from 'react';
import { motion } from 'framer-motion';

interface QuickToggleProps {
  name: string;
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  streak?: number;
  disabled?: boolean;
}

export const QuickToggle: React.FC<QuickToggleProps> = ({
  name,
  label,
  checked = false,
  onChange,
  streak = 0,
  disabled = false
}) => {
  return (
    <motion.div
      className="flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
      style={{
        borderColor: checked ? '#22c55e' : '#e5e7eb',
        backgroundColor: checked ? '#f0fdf4' : '#ffffff'
      }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => onChange(!checked)}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
            transition-all duration-200 shadow-sm
            ${checked 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={!disabled ? { scale: 1.1 } : {}}
          whileTap={!disabled ? { scale: 0.9 } : {}}
        >
          {checked ? '✓' : '○'}
        </motion.button>
        
        <div>
          <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onChange(!checked)}>
            {label}
          </label>
          {streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-orange-600 font-medium">🔥 {streak} day streak</span>
            </div>
          )}
        </div>
      </div>
      
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-green-500 text-lg"
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
};