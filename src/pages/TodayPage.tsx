/**
 * TodayPage - Mobile-first quick habit entry screen
 * 
 * This is the primary entry point for mobile users.
 * Features:
 * - Large tap targets for easy finger interaction
 * - Single-scroll form with all habits visible
 * - Immediate visual feedback on toggle
 * - One-tap save at the bottom
 * - Minimal chrome - no sidebar/topbar on mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  ChevronDown, 
  Home, 
  Calendar,
  Sun,
  Coffee,
  Utensils,
  Smartphone,
  Building2,
  Clock,
  Droplets,
  Leaf,
  Wine,
  Cigarette,
  Flame,
  Tv,
  Sparkles,
  Moon,
  BedDouble,
  Dumbbell,
  Scale,
  BookOpen,
  Heart,
  Zap,
  FootprintsIcon,
  Candy,
  GlassWater,
  Loader2,
  CloudMoon,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpsertDailyLog, useLatestDailyLog, useCanWrite } from '@/hooks/useDailyLogs';
import type { DailyLogEntry } from '@/lib/google-sheets-write';

// Habit definitions with icons and types
const HABITS = [
  // Morning
  { key: 'time_awake', label: 'Time Awake', icon: Sun, type: 'time', section: 'Morning' },
  { key: 'morning_walk', label: 'Morning Walk', icon: FootprintsIcon, type: 'boolean', section: 'Morning' },
  { key: 'coffee', label: 'Coffee', icon: Coffee, type: 'boolean', section: 'Morning' },
  { key: 'breakfast', label: 'Breakfast', icon: Utensils, type: 'boolean', section: 'Morning' },
  { key: 'phone_on_wake', label: 'Phone (30min)', icon: Smartphone, type: 'boolean', section: 'Morning' },
  
  // Work
  { key: 'time_at_work', label: 'Time at Work', icon: Building2, type: 'time', section: 'Work' },
  { key: 'time_left_work', label: 'Time Left Work', icon: Clock, type: 'time', section: 'Work' },
  
  // Intake
  { key: 'water_bottles_count', label: 'Water Bottles', icon: Droplets, type: 'number', min: 0, max: 12, step: 1, section: 'Intake' },
  { key: 'green_tea', label: 'Green Tea', icon: Leaf, type: 'boolean', section: 'Intake' },
  { key: 'alcohol', label: 'Alcohol', icon: Wine, type: 'boolean', section: 'Intake' },
  { key: 'soda', label: 'Soda', icon: GlassWater, type: 'boolean', section: 'Intake' },
  { key: 'chocolate', label: 'Chocolate', icon: Candy, type: 'boolean', section: 'Intake' },
  { key: 'smoke', label: 'Smoke', icon: Cigarette, type: 'boolean', section: 'Intake' },
  { key: 'dabs_count', label: 'Dabs', icon: Flame, type: 'number', min: 0, max: 10, step: 1, section: 'Intake' },
  
  // Night
  { key: 'netflix_in_bed', label: 'Netflix in Bed', icon: Tv, type: 'boolean', section: 'Night' },
  { key: 'brushed_teeth_night', label: 'Brush Teeth', icon: Sparkles, type: 'boolean', section: 'Night' },
  { key: 'washed_face_night', label: 'Wash Face', icon: Moon, type: 'boolean', section: 'Night' },
  { key: 'bed_time', label: 'Bed Time', icon: BedDouble, type: 'time', section: 'Night' },
  
  // Fitness
  { key: 'workout', label: 'Workout', icon: Dumbbell, type: 'select', options: ['None', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Cardio', 'Full Body'], section: 'Fitness' },
  { key: 'calories', label: 'Calories', icon: Flame, type: 'number', min: 0, max: 10000, step: 100, section: 'Fitness' },
  { key: 'weight_lbs', label: 'Weight (lbs)', icon: Scale, type: 'number', min: 50, max: 500, step: 0.5, section: 'Fitness' },
  
  // Wellness
  { key: 'pages_read_count', label: 'Pages Read', icon: BookOpen, type: 'number', min: 0, max: 200, step: 5, section: 'Wellness' },
  { key: 'relaxed_today', label: 'Relaxed', icon: Heart, type: 'boolean', section: 'Wellness' },
  { key: 'day_rating', label: 'Day Rating', icon: Zap, type: 'select', options: ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Legendary'], section: 'Wellness' },
  { key: 'dream', label: 'Dream', icon: CloudMoon, type: 'text', section: 'Wellness' },
  { key: 'latest_hype', label: 'Latest Hype', icon: Star, type: 'text', section: 'Wellness' },
] as const;

type HabitKey = typeof HABITS[number]['key'];

export default function TodayPage() {
  const navigate = useNavigate();
  const canWrite = useCanWrite();
  const upsertMutation = useUpsertDailyLog();
  const { data: lastLog, isLoading: loadingLast } = useLatestDailyLog();
  
  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    water_bottles_count: 0,
    pages_read_count: 0,
    dabs_count: 0,
    calories: 0,
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Pre-fill weight from last log
  useEffect(() => {
    if (lastLog?.weight_lbs) {
      setFormData(prev => ({ ...prev, weight_lbs: lastLog.weight_lbs }));
    }
  }, [lastLog]);

  const updateField = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    
    if (!canWrite) {
      setSaveError('Google Sheets webhook not configured. Check VITE_GOOGLE_SHEETS_WEBHOOK_URL in .env');
      return;
    }

    try {
      const entry: DailyLogEntry = {
        date: formData.date || new Date().toISOString().split('T')[0],
        ...formData,
      };

      console.log('Saving entry:', entry);
      const result = await upsertMutation.mutateAsync(entry);
      console.log('Save result:', result);

      if (result.success) {
        setShowSuccess(true);
        setSaveError(null);
        // Haptic feedback on mobile if available
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setSaveError(result.error || 'Unknown error saving');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Group habits by section
  const sections = HABITS.reduce((acc, habit) => {
    if (!acc[habit.section]) acc[habit.section] = [];
    acc[habit.section].push(habit);
    return acc;
  }, {} as Record<string, typeof HABITS[number][]>);

  // Date navigation
  const selectedDate = new Date(formData.date || new Date().toISOString().split('T')[0]);
  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    updateField('date', newDate.toISOString().split('T')[0]);
  };

  const isToday = formData.date === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Sticky Header with Date Picker */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">{isToday ? "Today's Habits" : 'Log Habits'}</h1>
          <Link 
            to="/" 
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            aria-label="Go home"
          >
            <Home size={22} />
          </Link>
        </div>
        {/* Date Picker Row */}
        <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-2 py-1">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-slate-600 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => updateField('date', new Date().toISOString().split('T')[0])}
            className="flex-1 text-center py-1"
          >
            <p className="text-white font-medium">{dateDisplay}</p>
            {!isToday && <p className="text-xs text-blue-300">Tap for today</p>}
          </button>
          <button 
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg hover:bg-slate-600 transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      {/* Loading state */}
      {loadingLast && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      )}

      {/* Habit Sections */}
      <main className="px-4 py-4 space-y-4">
        {Object.entries(sections).map(([sectionName, habits]) => (
          <section 
            key={sectionName}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Section Header - Tappable to collapse */}
            <button
              onClick={() => setExpandedSection(expandedSection === sectionName ? null : sectionName)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100"
            >
              <h2 className="font-semibold text-gray-700">{sectionName}</h2>
              <ChevronDown 
                size={20} 
                className={cn(
                  "text-gray-400 transition-transform",
                  expandedSection !== sectionName && "rotate-180"
                )}
              />
            </button>

            {/* Habit List - Always visible unless collapsed */}
            <div className={cn(
              "divide-y divide-gray-100",
              expandedSection === sectionName && "hidden"
            )}>
              {habits.map((habit) => (
                <HabitRow
                  key={habit.key}
                  habit={habit}
                  value={formData[habit.key as keyof DailyLogEntry]}
                  onChange={(value) => updateField(habit.key, value)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Error Message */}
        {saveError && (
          <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm text-center">
            {saveError}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-lg transition-all",
            "flex items-center justify-center gap-2",
            showSuccess
              ? "bg-green-500 text-white"
              : saveError
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "active:scale-[0.98]"
          )}
        >
          {upsertMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving...
            </>
          ) : showSuccess ? (
            <>
              <Check size={20} />
              Saved!
            </>
          ) : saveError ? (
            'Retry Save'
          ) : (
            <>
              <Check size={20} />
              Save Habits
            </>
          )}
        </button>
      </div>

      {/* Bottom Navigation - Mobile only (Today + Home only) */}
      <nav className="fixed bottom-20 left-0 right-0 px-4 pb-4 md:hidden z-40">
        <div className="bg-slate-900 rounded-2xl px-8 py-3 flex justify-around shadow-xl">
          <Link to="/today" className="flex flex-col items-center text-blue-400">
            <Calendar size={24} />
            <span className="text-xs mt-1">Today</span>
          </Link>
          <Link to="/" className="flex flex-col items-center text-slate-400 hover:text-white">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// Individual habit row component with appropriate input type
interface HabitRowProps {
  habit: typeof HABITS[number];
  value: any;
  onChange: (value: any) => void;
}

function HabitRow({ habit, value, onChange }: HabitRowProps) {
  const Icon = habit.icon;

  // Boolean toggle (checkbox-style)
  if (habit.type === 'boolean') {
    const isChecked = value === true;
    return (
      <button
        type="button"
        onClick={() => onChange(!isChecked)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <div className={cn(
          "w-12 h-7 rounded-full transition-colors relative",
          isChecked ? "bg-green-500" : "bg-gray-200"
        )}>
          <div className={cn(
            "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0.5"
          )} />
        </div>
      </button>
    );
  }

  // Number input with +/- buttons
  if (habit.type === 'number') {
    const numValue = typeof value === 'number' ? value : 0;
    const step = habit.step || 1;
    const min = habit.min ?? 0;
    const max = habit.max ?? 999;

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, numValue - step))}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-600"
          >
            −
          </button>
          <span className="w-12 text-center font-semibold text-gray-800 text-lg">
            {numValue}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, numValue + step))}
            className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 active:bg-blue-300 flex items-center justify-center text-xl font-bold text-blue-600"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  // Time input
  if (habit.type === 'time') {
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 bg-gray-100 rounded-lg border-0 text-gray-800 font-medium text-right"
        />
      </div>
    );
  }

  // Select dropdown
  if (habit.type === 'select' && habit.options) {
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="px-3 py-2 bg-gray-100 rounded-lg border-0 text-gray-800 font-medium"
        >
          {habit.options.map(opt => (
            <option key={opt} value={opt}>{opt || 'Select...'}</option>
          ))}
        </select>
      </div>
    );
  }

  // Text input (for dream, latest_hype, etc.)
  if (habit.type === 'text') {
    return (
      <div className="flex flex-col px-4 py-3 gap-2">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">{habit.label}</span>
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${habit.label.toLowerCase()}...`}
          className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 text-gray-800 placeholder-gray-400"
        />
      </div>
    );
  }

  return null;
}
