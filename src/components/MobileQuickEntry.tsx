/**
 * MobileQuickEntry - One-hand optimized mobile habit logging
 * 
 * Design principles:
 * - Large tap targets (min 48px)
 * - Bottom-heavy layout for thumb reach
 * - Minimal typing required
 * - Haptic feedback ready
 * - Swipeable sections
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Minus, Plus, Save, X } from 'lucide-react';
import { useUpsertDailyLog, useLatestDailyLog, useCanWrite } from '@/hooks/useDailyLogs';
import type { DailyLogEntry } from '@/lib/google-sheets-write';

// Simplified habit categories for mobile
const MOBILE_HABITS = {
  morning: [
    { name: 'coffee' as const, label: 'Coffee', emoji: '☕' },
    { name: 'morning_walk' as const, label: 'Walk', emoji: '🚶' },
    { name: 'breakfast' as const, label: 'Breakfast', emoji: '🥐' },
  ],
  counts: [
    { name: 'water_bottles_count' as const, label: 'Water', emoji: '💧', max: 12 },
    { name: 'pages_read_count' as const, label: 'Pages', emoji: '📖', max: 100 },
    { name: 'dabs_count' as const, label: 'Dabs', emoji: '🌿', max: 10 },
  ],
  substances: [
    { name: 'green_tea' as const, label: 'Tea', emoji: '🍵' },
    { name: 'alcohol' as const, label: 'Alcohol', emoji: '🍷' },
    { name: 'soda' as const, label: 'Soda', emoji: '🥤' },
    { name: 'chocolate' as const, label: 'Choco', emoji: '🍫' },
  ],
  night: [
    { name: 'brushed_teeth_night' as const, label: 'Teeth', emoji: '🦷' },
    { name: 'washed_face_night' as const, label: 'Face', emoji: '🧴' },
    { name: 'netflix_in_bed' as const, label: 'Netflix', emoji: '📺' },
  ],
  wellness: [
    { name: 'workout' as const, label: 'Workout', emoji: '💪' },
    { name: 'relaxed_today' as const, label: 'Relaxed', emoji: '😌' },
  ],
};

const SECTIONS = ['morning', 'counts', 'substances', 'night', 'wellness'] as const;
type Section = typeof SECTIONS[number];

interface MobileQuickEntryProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function MobileQuickEntry({ onSuccess, onClose }: MobileQuickEntryProps) {
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    water_bottles_count: 0,
    pages_read_count: 0,
    dabs_count: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const canWrite = useCanWrite();
  const upsertMutation = useUpsertDailyLog();
  const { data: lastLog } = useLatestDailyLog();

  const updateField = useCallback((name: keyof DailyLogEntry, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleField = useCallback((name: keyof DailyLogEntry) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const incrementField = useCallback((name: keyof DailyLogEntry, max: number) => {
    setFormData(prev => {
      const current = (prev[name] as number) || 0;
      return { ...prev, [name]: Math.min(max, current + 1) };
    });
  }, []);

  const decrementField = useCallback((name: keyof DailyLogEntry) => {
    setFormData(prev => {
      const current = (prev[name] as number) || 0;
      return { ...prev, [name]: Math.max(0, current - 1) };
    });
  }, []);

  const handleSwipe = (info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      } else if (info.offset.x < 0 && currentSection < SECTIONS.length - 1) {
        setCurrentSection(prev => prev + 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canWrite) return;

    try {
      const entry: DailyLogEntry = {
        date: formData.date || new Date().toISOString().split('T')[0],
        ...formData,
      };
      
      const result = await upsertMutation.mutateAsync(entry);
      
      if (result.success) {
        setShowSuccess(true);
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const section = SECTIONS[currentSection];
  const habits = MOBILE_HABITS[section];

  // Calculate overall progress
  const totalHabits = Object.values(MOBILE_HABITS).flat().length;
  const completedHabits = Object.values(MOBILE_HABITS).flat().filter(h => {
    const value = formData[h.name];
    if ('max' in h) return (value as number) > 0;
    return value === true;
  }).length;
  const progress = Math.round((completedHabits / totalHabits) * 100);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full active:bg-white/10">
          <X size={24} />
        </button>
        <div className="text-center">
          <div className="text-sm text-white/60">Today's Log</div>
          <div className="font-semibold">{progress}% Complete</div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Section Dots */}
      <div className="flex justify-center gap-2 py-3">
        {SECTIONS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSection(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentSection ? 'bg-white w-6' : 'bg-white/30'
            )}
          />
        ))}
      </div>

      {/* Main Content - Swipeable */}
      <motion.div 
        className="flex-1 overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => handleSwipe(info)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="h-full flex flex-col px-4 py-6"
          >
            {/* Section Title */}
            <h2 className="text-2xl font-bold text-center mb-6 capitalize">{section}</h2>

            {/* Habits Grid */}
            <div className="flex-1 flex flex-col justify-center">
              {section === 'counts' ? (
                // Counter habits
                <div className="space-y-6">
                  {habits.map((habit) => (
                    <CounterHabit
                      key={habit.name}
                      habit={habit as any}
                      value={(formData[habit.name] as number) || 0}
                      onIncrement={() => incrementField(habit.name, (habit as any).max)}
                      onDecrement={() => decrementField(habit.name)}
                    />
                  ))}
                </div>
              ) : (
                // Toggle habits
                <div className="grid grid-cols-3 gap-4">
                  {habits.map((habit) => (
                    <ToggleHabit
                      key={habit.name}
                      habit={habit}
                      checked={formData[habit.name] === true}
                      onToggle={() => toggleField(habit.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation Arrows */}
      <div className="flex justify-between px-4 py-2">
        <button
          onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          disabled={currentSection === 0}
          className={cn(
            "p-3 rounded-full",
            currentSection === 0 ? 'opacity-30' : 'active:bg-white/10'
          )}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentSection(prev => Math.min(SECTIONS.length - 1, prev + 1))}
          disabled={currentSection === SECTIONS.length - 1}
          className={cn(
            "p-3 rounded-full",
            currentSection === SECTIONS.length - 1 ? 'opacity-30' : 'active:bg-white/10'
          )}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Save Button - Fixed at Bottom */}
      <div className="px-4 pb-6 pt-2">
        <motion.button
          onClick={handleSubmit}
          disabled={upsertMutation.isPending || !canWrite}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg",
            "bg-gradient-to-r from-blue-500 to-purple-600",
            "active:scale-95 transition-transform",
            "disabled:opacity-50 flex items-center justify-center gap-2"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={20} />
          {upsertMutation.isPending ? 'Saving...' : 'Save Habits'}
        </motion.button>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Check size={80} strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toggle Habit - Large tap target
function ToggleHabit({ 
  habit, 
  checked, 
  onToggle 
}: { 
  habit: { name: string; label: string; emoji: string }; 
  checked: boolean; 
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
        checked 
          ? 'bg-green-500/20 border-2 border-green-500' 
          : 'bg-white/5 border-2 border-white/10 active:border-white/30'
      )}
      whileTap={{ scale: 0.9 }}
    >
      <span className="text-3xl">{habit.emoji}</span>
      <span className={cn(
        "text-xs font-medium",
        checked ? 'text-green-400' : 'text-white/60'
      )}>
        {habit.label}
      </span>
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Check size={14} />
        </motion.div>
      )}
    </motion.button>
  );
}

// Counter Habit - +/- buttons with large tap targets
function CounterHabit({
  habit,
  value,
  onIncrement,
  onDecrement,
}: {
  habit: { name: string; label: string; emoji: string; max: number };
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{habit.emoji}</span>
        <span className="font-medium">{habit.label}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onDecrement}
          disabled={value <= 0}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            value <= 0 ? 'bg-white/5 text-white/30' : 'bg-red-500/20 text-red-400 active:bg-red-500/40'
          )}
          whileTap={{ scale: 0.9 }}
        >
          <Minus size={24} />
        </motion.button>
        
        <span className="text-2xl font-bold w-8 text-center">{value}</span>
        
        <motion.button
          onClick={onIncrement}
          disabled={value >= habit.max}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            value >= habit.max ? 'bg-white/5 text-white/30' : 'bg-green-500/20 text-green-400 active:bg-green-500/40'
          )}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  );
}

export default MobileQuickEntry;
