import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export const StepperInput: React.FC<StepperInputProps> = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  disabled = false
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg p-2">
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled || value <= min
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
            }
          `}
          whileHover={!disabled && value > min ? { scale: 1.1 } : {}}
          whileTap={!disabled && value > min ? { scale: 0.9 } : {}}
        >
          <Minus size={16} />
        </motion.button>

        <div className="flex-1 px-4 text-center">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            disabled={disabled}
            className="w-full text-center text-lg font-semibold bg-transparent border-none focus:outline-none"
          />
          {unit && (
            <span className="text-xs text-gray-500 block mt-1">{unit}</span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled || value >= max
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer'
            }
          `}
          whileHover={!disabled && value < max ? { scale: 1.1 } : {}}
          whileTap={!disabled && value < max ? { scale: 0.9 } : {}}
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* Quick preset buttons for common values */}
      {name === 'water_bottles_count' && (
        <div className="flex gap-1 justify-center mt-2">
          {[2, 4, 6, 8].map((preset) => (
            <motion.button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`
                px-2 py-1 text-xs rounded
                ${value === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {preset}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};