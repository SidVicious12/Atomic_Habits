import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  streak?: number;
  completionRate?: number;
  defaultExpanded?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  icon = '📝',
  streak = 0,
  completionRate = 0,
  defaultExpanded = true,
  priority = 'medium'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const priorityColors = {
    high: 'border-l-red-400 bg-red-50',
    medium: 'border-l-blue-400 bg-blue-50', 
    low: 'border-l-gray-400 bg-gray-50'
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className={`border-l-4 ${priorityColors[priority]} rounded-lg shadow-sm mb-4`}>
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-white/50 transition-colors rounded-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {streak > 0 && (
                <span className="flex items-center gap-1">
                  🔥 <span className="font-medium">{streak} day streak</span>
                </span>
              )}
              {completionRate > 0 && (
                <span className={`${getCompletionColor(completionRate)} font-medium`}>
                  {completionRate}% this week
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {completionRate > 0 && (
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  completionRate >= 80 ? 'bg-green-500' :
                  completionRate >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={20} className="text-gray-500" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 bg-white rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};