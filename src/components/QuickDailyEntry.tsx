import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Zap, MoreHorizontal, Sun, Moon, Droplets, 
  Dumbbell, Heart, Brain, Clock, 
  ChevronDown, ChevronUp, Check, Minus, Plus, Save,
  AlertCircle, Coffee
} from 'lucide-react';
import { useUpsertDailyLog, useAppendDailyLog, useLatestDailyLog, useCanWrite } from '@/hooks/useDailyLogs';
import type { DailyLogEntry } from '@/lib/google-sheets-write';

// ============================================
// TYPES & CONFIGURATION
// ============================================

interface HabitSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  habits: HabitConfig[];
}

interface HabitConfig {
  name: keyof DailyLogEntry;
  label: string;
  emoji: string;
  type: 'toggle' | 'stepper' | 'time' | 'select' | 'text' | 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
  presets?: number[];
  invertGood?: boolean; // true if "no" is the good answer
  essential?: boolean; // appears in quick mode
}

const HABIT_SECTIONS: HabitSection[] = [
  {
    id: 'morning',
    title: 'Morning',
    icon: <Sun className="w-5 h-5" />,
    color: 'from-amber-400 to-orange-500',
    habits: [
      { name: 'time_awake', label: 'Time Awake', emoji: '⏰', type: 'time', essential: true },
      { name: 'coffee', label: 'Morning Coffee', emoji: '☕', type: 'toggle', essential: true },
      { name: 'morning_walk', label: 'Morning Walk', emoji: '🚶', type: 'toggle', essential: true },
      { name: 'breakfast', label: 'Breakfast', emoji: '🥐', type: 'toggle' },
      { name: 'phone_on_wake', label: 'Phone within 30min', emoji: '📱', type: 'toggle', invertGood: true },
    ],
  },
  {
    id: 'intake',
    title: 'Intake',
    icon: <Droplets className="w-5 h-5" />,
    color: 'from-blue-400 to-cyan-500',
    habits: [
      { name: 'water_bottles_count', label: 'Water Bottles', emoji: '💧', type: 'stepper', min: 0, max: 12, unit: 'bottles', presets: [2, 4, 6, 8], essential: true },
      { name: 'pages_read_count', label: 'Pages Read', emoji: '📖', type: 'stepper', min: 0, max: 200, step: 5, unit: 'pages', presets: [10, 20, 30, 50], essential: true },
      { name: 'dabs_count', label: 'Dabs', emoji: '🌿', type: 'stepper', min: 0, max: 10, unit: 'dabs', presets: [0, 1, 2, 3] },
    ],
  },
  {
    id: 'substances',
    title: 'Substances',
    icon: <Coffee className="w-5 h-5" />,
    color: 'from-emerald-400 to-teal-500',
    habits: [
      { name: 'green_tea', label: 'Green Tea', emoji: '🍵', type: 'toggle' },
      { name: 'alcohol', label: 'Alcohol', emoji: '🍷', type: 'toggle', invertGood: true },
      { name: 'smoke', label: 'Smoke', emoji: '🚬', type: 'toggle', invertGood: true },
      { name: 'soda', label: 'Soda', emoji: '🥤', type: 'toggle', invertGood: true },
      { name: 'chocolate', label: 'Chocolate', emoji: '🍫', type: 'toggle' },
    ],
  },
  {
    id: 'fitness',
    title: 'Fitness',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'from-red-400 to-pink-500',
    habits: [
      { name: 'workout', label: 'Workout', emoji: '💪', type: 'select', options: ['None', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Cardio', 'Full Body'], essential: true },
      { name: 'calories', label: 'Calories', emoji: '🔥', type: 'number', min: 0, max: 10000, step: 100, unit: 'cal' },
      { name: 'weight_lbs', label: 'Weight', emoji: '⚖️', type: 'number', min: 50, max: 500, step: 0.1, unit: 'lbs' },
    ],
  },
  {
    id: 'night',
    title: 'Night',
    icon: <Moon className="w-5 h-5" />,
    color: 'from-indigo-400 to-purple-500',
    habits: [
      { name: 'brushed_teeth_night', label: 'Brush Teeth', emoji: '🦷', type: 'toggle', essential: true },
      { name: 'washed_face_night', label: 'Wash Face', emoji: '🧴', type: 'toggle' },
      { name: 'netflix_in_bed', label: 'Netflix in Bed', emoji: '📺', type: 'toggle', invertGood: true },
      { name: 'bed_time', label: 'Bed Time', emoji: '🛏️', type: 'time' },
    ],
  },
  {
    id: 'wellness',
    title: 'Wellness',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-400 to-rose-500',
    habits: [
      { name: 'relaxed_today', label: 'Relaxed Today', emoji: '😌', type: 'toggle' },
      { name: 'day_rating', label: 'How was my day?', emoji: '⭐', type: 'select', options: ['Terrible', 'Bad', 'Okay', 'Good', 'Legendary'] },
    ],
  },
  {
    id: 'reflection',
    title: 'Reflection',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-violet-400 to-purple-500',
    habits: [
      { name: 'dream', label: 'Dream I Had', emoji: '💭', type: 'text' },
      { name: 'latest_hype', label: 'Latest Hype', emoji: '🎉', type: 'text' },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

interface QuickDailyEntryProps {
  onSuccess?: () => void;
  defaultDate?: string;
}

export function QuickDailyEntry({ onSuccess, defaultDate }: QuickDailyEntryProps) {
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['morning', 'intake']));
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({
    date: defaultDate || new Date().toISOString().split('T')[0],
    water_bottles_count: 4,
    pages_read_count: 10,
  });

  const canWrite = useCanWrite();
  const upsertMutation = useUpsertDailyLog();
  const appendMutation = useAppendDailyLog();
  const { data: lastLog } = useLatestDailyLog();

  // Apply smart defaults from last log
  useEffect(() => {
    if (lastLog) {
      setFormData(prev => ({
        ...prev,
        weight_lbs: lastLog.weight_lbs || prev.weight_lbs,
        time_awake: lastLog.time_awake || prev.time_awake,
      }));
    }
  }, [lastLog]);

  const updateField = useCallback((name: keyof DailyLogEntry, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Calculate completion
  const calculateCompletion = useCallback(() => {
    const habits = isQuickMode 
      ? HABIT_SECTIONS.flatMap(s => s.habits).filter(h => h.essential)
      : HABIT_SECTIONS.flatMap(s => s.habits);
    
    const completed = habits.filter(habit => {
      const value = formData[habit.name];
      if (habit.type === 'toggle') return value === true;
      if (habit.type === 'stepper' || habit.type === 'number') return value !== undefined && value !== null && Number(value) > 0;
      if (habit.type === 'time') return value !== undefined && value !== '';
      if (habit.type === 'select') return value !== undefined && value !== '' && value !== 'None';
      if (habit.type === 'text') return value !== undefined && value !== '';
      return false;
    });

    return Math.round((completed.length / habits.length) * 100);
  }, [formData, isQuickMode]);

  const completionRate = calculateCompletion();

  const handleSubmit = useCallback(async () => {
    if (!canWrite) {
      alert('Google Sheets write not configured yet.\n\nTo enable saving:\n1. Set up the Apps Script webhook\n2. Add VITE_GOOGLE_SHEETS_WEBHOOK_URL to .env\n\nSee GOOGLE_SHEETS_WRITE_SETUP.md for details.');
      return;
    }

    try {
      const entry: DailyLogEntry = {
        date: formData.date || new Date().toISOString().split('T')[0],
        ...formData,
      };

      console.log('📝 Submitting daily log:', entry);

      // Use upsert to update if date exists, or append if new
      const result = await upsertMutation.mutateAsync(entry);

      console.log('📝 Upsert result:', result);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 2000);
      } else if (result.error) {
        console.error('Save returned error:', result.error);
        alert(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to save (exception):', error);
      // Don't throw - just show the error
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save: ${message}`);
    }
  }, [canWrite, formData, upsertMutation, onSuccess]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        setIsQuickMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  const visibleSections = isQuickMode
    ? HABIT_SECTIONS.map(section => ({
        ...section,
        habits: section.habits.filter(h => h.essential)
      })).filter(s => s.habits.length > 0)
    : HABIT_SECTIONS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Write Config Warning */}
        {!canWrite && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Google Sheets write not configured</p>
              <p className="text-amber-600 text-sm">Set up the Apps Script webhook to enable saving. See GOOGLE_SHEETS_WRITE_SETUP.md</p>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => setIsQuickMode(true)}
              className={cn(
                "px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium",
                isQuickMode 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Zap size={18} />
              Quick Entry
            </button>
            <button
              type="button"
              onClick={() => setIsQuickMode(false)}
              className={cn(
                "px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium",
                !isQuickMode 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <MoreHorizontal size={18} />
              Full Form
            </button>
          </div>
        </div>

        {/* Main Card */}
        <motion.div layout className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 text-center border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">Quick Daily Entry</h1>
            <p className="text-gray-500 mt-1">Track your essential habits in seconds</p>
            
            {/* Progress Ring */}
            <div className="flex items-center justify-center mt-5">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="text-gray-100"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    cx="18" cy="18" r="15.9"
                  />
                  <motion.circle
                    className={cn(
                      completionRate >= 80 ? 'text-green-500' :
                      completionRate >= 50 ? 'text-blue-500' : 'text-amber-500'
                    )}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    cx="18" cy="18" r="15.9"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - completionRate }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">{completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Habit Sections */}
          <div className="divide-y divide-gray-100">
            {visibleSections.map((section) => (
              <div key={section.id} className="px-4">
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br",
                      section.color
                    )}>
                      {section.icon}
                    </div>
                    <span className="font-semibold text-gray-800">{section.title}</span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                <AnimatePresence initial={false}>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 space-y-3">
                        {section.habits.map((habit) => (
                          <HabitInput
                            key={habit.name}
                            habit={habit}
                            value={formData[habit.name]}
                            onChange={(value) => updateField(habit.name, value)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="p-4 bg-gray-50">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={upsertMutation.isPending || !canWrite}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-white transition-all",
                "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              )}
              whileHover={{ scale: canWrite ? 1.01 : 1 }}
              whileTap={{ scale: canWrite ? 0.99 : 1 }}
            >
              {upsertMutation.isPending ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Zap size={20} />
                  </motion.div>
                  Saving to Google Sheets...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Today's Habits
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-3">
              ⌘+Enter to save • ⌘+Q to toggle mode
            </p>
          </div>
        </motion.div>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Check size={32} className="text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Habits Logged!</h3>
                <p className="text-gray-500 mt-1">Saved to Google Sheets 🎉</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// HABIT INPUT COMPONENTS
// ============================================

interface HabitInputProps {
  habit: HabitConfig;
  value: any;
  onChange: (value: any) => void;
}

function HabitInput({ habit, value, onChange }: HabitInputProps) {
  if (habit.type === 'toggle') {
    return <ToggleHabit habit={habit} value={value} onChange={onChange} />;
  }

  if (habit.type === 'stepper') {
    return <StepperHabit habit={habit} value={value} onChange={onChange} />;
  }

  if (habit.type === 'time') {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{habit.emoji}</span>
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  }

  if (habit.type === 'number') {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{habit.emoji}</span>
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            min={habit.min}
            max={habit.max}
            step={habit.step || 1}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500"
          />
          {habit.unit && <span className="text-sm text-gray-500">{habit.unit}</span>}
        </div>
      </div>
    );
  }

  if (habit.type === 'select') {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{habit.emoji}</span>
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {habit.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (habit.type === 'text') {
    return (
      <div className="p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">{habit.emoji}</span>
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={`Enter your ${habit.label.toLowerCase()}...`}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    );
  }

  return null;
}

// Toggle component
function ToggleHabit({ habit, value, onChange }: { habit: HabitConfig; value: boolean; onChange: (v: boolean) => void }) {
  const isChecked = value === true;
  const isGood = habit.invertGood ? !isChecked : isChecked;

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
        isChecked 
          ? isGood ? 'bg-green-50 border-2 border-green-400' : 'bg-amber-50 border-2 border-amber-400'
          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
      )}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isChecked
            ? isGood ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
            : 'bg-gray-200 text-gray-400'
        )}>
          {isChecked ? <Check size={20} /> : <span className="text-lg">{habit.emoji}</span>}
        </div>
        <span className="font-medium text-gray-700">{habit.label}</span>
      </div>
      {isChecked && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-lg",
            isGood ? 'text-green-500' : 'text-amber-500'
          )}
        >
          {isGood ? '✨' : '⚠️'}
        </motion.span>
      )}
    </motion.button>
  );
}

// Stepper component
function StepperHabit({ habit, value, onChange }: { habit: HabitConfig; value: number; onChange: (v: number) => void }) {
  const currentValue = value ?? 0;
  const min = habit.min ?? 0;
  const max = habit.max ?? 100;
  const step = habit.step ?? 1;

  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{habit.emoji}</span>
        <span className="font-medium text-gray-700">{habit.label}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          onClick={() => onChange(Math.max(min, currentValue - step))}
          disabled={currentValue <= min}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            currentValue <= min
              ? 'bg-gray-100 text-gray-300'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          )}
          whileHover={{ scale: currentValue > min ? 1.1 : 1 }}
          whileTap={{ scale: currentValue > min ? 0.9 : 1 }}
        >
          <Minus size={20} />
        </motion.button>

        <div className="text-center">
          <span className="text-3xl font-bold text-gray-800">{currentValue}</span>
          {habit.unit && <span className="text-sm text-gray-500 block">{habit.unit}</span>}
        </div>

        <motion.button
          type="button"
          onClick={() => onChange(Math.min(max, currentValue + step))}
          disabled={currentValue >= max}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            currentValue >= max
              ? 'bg-gray-100 text-gray-300'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          )}
          whileHover={{ scale: currentValue < max ? 1.1 : 1 }}
          whileTap={{ scale: currentValue < max ? 0.9 : 1 }}
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* Quick preset buttons */}
      {habit.presets && (
        <div className="flex gap-2 justify-center mt-3">
          {habit.presets.map((preset) => (
            <motion.button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all",
                currentValue === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
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
}

export default QuickDailyEntry;
