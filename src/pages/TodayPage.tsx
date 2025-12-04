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
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Check, 
  ChevronDown, 
  Home, 
  Calendar,
  History,
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
import { useUpsertDailyLog, useLatestDailyLog, useCanWrite, useEntryForDate } from '@/hooks/useDailyLogs';
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
  { key: 'pages_read_count', label: 'Pages Read', icon: BookOpen, type: 'number', min: 0, max: 200, step: 1, section: 'Wellness' },
  { key: 'relaxed_today', label: 'Relaxed', icon: Heart, type: 'boolean', section: 'Wellness' },
  { key: 'day_rating', label: 'Day Rating', icon: Zap, type: 'select', options: ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Legendary'], section: 'Wellness' },
  { key: 'dream', label: 'Dream', icon: CloudMoon, type: 'text', section: 'Wellness' },
  { key: 'latest_hype', label: 'Latest Hype', icon: Star, type: 'text', section: 'Wellness' },
] as const;

type HabitKey = typeof HABITS[number]['key'];

// Helper to get local date string in YYYY-MM-DD format without timezone issues
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to convert 12-hour time format to 24-hour format for HTML input
function convertTo24Hour(time12h: string | null | undefined): string {
  if (!time12h || typeof time12h !== 'string') return '';

  // Already in 24-hour format (HH:MM or HH:MM:SS)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time12h) && !time12h.includes('AM') && !time12h.includes('PM')) {
    return time12h.slice(0, 5); // Return just HH:MM
  }

  // Parse 12-hour format (e.g., "9:51:00 AM" or "3:53:00 PM")
  const match = time12h.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
  if (!match) return '';

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();

  // Convert to 24-hour format
  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// Helper to find a value in log by searching for keys containing patterns
function findValue(log: any, patterns: string[]): any {
  if (!log) return undefined;

  for (const key of Object.keys(log)) {
    const lowerKey = key.toLowerCase();
    for (const pattern of patterns) {
      if (lowerKey.includes(pattern.toLowerCase())) {
        const value = log[key];
        // Return the value even if it's falsy (except null/undefined)
        // This ensures empty strings, false, and 0 are preserved
        if (value !== null && value !== undefined) {
          return value;
        }
      }
    }
  }
  return undefined;
}

export default function TodayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canWrite = useCanWrite();
  const upsertMutation = useUpsertDailyLog();
  const { data: lastLog, isLoading: loadingLast } = useLatestDailyLog();
  
  // Get initial date from URL param or use today
  const initialDate = searchParams.get('date') || getLocalDateString();

  // Fetch existing entry for this date (for editing)
  const { entry: existingEntry, isLoading: loadingEntry } = useEntryForDate(initialDate);

  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({
    date: initialDate,
    water_bottles_count: 0,
    pages_read_count: 0,
    dabs_count: 0,
    calories: 0,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);

  // Pre-fill form with existing entry data when editing
  // Reload whenever the date changes
  useEffect(() => {
    // Only load if we have an entry and haven't loaded this specific date yet
    if (existingEntry && loadedDate !== initialDate) {
      console.log('📝 Loading existing entry for date:', initialDate);
      console.log('📋 Existing entry data:', existingEntry);
      console.log('🔍 Available keys:', Object.keys(existingEntry));

      // Check for time fields specifically
      console.log('⏰ Time field values in entry:');
      console.log('  time_awake:', existingEntry.time_awake, typeof existingEntry.time_awake);
      console.log('  time_at_work:', existingEntry.time_at_work, typeof existingEntry.time_at_work);
      console.log('  time_left_work:', existingEntry.time_left_work, typeof existingEntry.time_left_work);
      console.log('  bed_time:', existingEntry.bed_time, typeof existingEntry.bed_time);

      const timeAwakeValue = findValue(existingEntry, ['time_awake', 'awake']);
      console.log('⏰ findValue result for time_awake:', timeAwakeValue, typeof timeAwakeValue);
      console.log('⏰ Converted to 24h:', convertTo24Hour(timeAwakeValue));

      setFormData({
        date: initialDate,
        time_awake: convertTo24Hour(timeAwakeValue),
        time_at_work: convertTo24Hour(findValue(existingEntry, ['time_at_work', 'at_work'])),
        time_left_work: convertTo24Hour(findValue(existingEntry, ['time_left_work', 'left_work'])),
        bed_time: convertTo24Hour(findValue(existingEntry, ['bed_time', 'bedtime'])),
        coffee: findValue(existingEntry, ['coffee']) || false,
        breakfast: findValue(existingEntry, ['breakfast']) || false,
        phone_on_wake: findValue(existingEntry, ['phone', 'social_media']) || false,
        netflix_in_bed: findValue(existingEntry, ['netflix']) || false,
        brushed_teeth_night: findValue(existingEntry, ['brush', 'teeth']) || false,
        washed_face_night: findValue(existingEntry, ['wash', 'face']) || false,
        green_tea: findValue(existingEntry, ['green_tea']) || false,
        alcohol: findValue(existingEntry, ['drink', 'alcohol']) || false,
        smoke: findValue(existingEntry, ['smoke']) || false,
        soda: findValue(existingEntry, ['soda']) || false,
        chocolate: findValue(existingEntry, ['chocolate']) || false,
        relaxed_today: findValue(existingEntry, ['relax']) || false,
        morning_walk: findValue(existingEntry, ['morning_walk', 'walk']) || false,
        dabs_count: findValue(existingEntry, ['dabs', '#_of_dabs']) || 0,
        water_bottles_count: findValue(existingEntry, ['water', 'bottles']) || 0,
        pages_read_count: findValue(existingEntry, ['pages', 'read']) || 0,
        weight_lbs: findValue(existingEntry, ['weight']) || lastLog?.weight_lbs || undefined,
        calories: findValue(existingEntry, ['calories']) || 0,
        workout: findValue(existingEntry, ['workout']) || '',
        day_rating: findValue(existingEntry, ['how_was', 'day']) || '',
        dream: findValue(existingEntry, ['dream']) || '',
        latest_hype: findValue(existingEntry, ['hype', 'latest_hype']) || '',
      });
      setLoadedDate(initialDate);
    }
    // If no existing entry but date changed, reset form to defaults
    else if (!existingEntry && loadedDate !== initialDate) {
      console.log('📝 No existing entry for date:', initialDate, '- resetting form');
      setFormData({
        date: initialDate,
        water_bottles_count: 0,
        pages_read_count: 0,
        dabs_count: 0,
        calories: 0,
        weight_lbs: lastLog?.weight_lbs || undefined,
      });
      setLoadedDate(initialDate);
    }
  }, [existingEntry, loadedDate, initialDate, lastLog?.weight_lbs]);

  // Pre-fill weight from last log (only if no existing entry)
  useEffect(() => {
    if (!existingEntry && lastLog?.weight_lbs && loadedDate !== initialDate) {
      setFormData(prev => ({ ...prev, weight_lbs: lastLog.weight_lbs }));
    }
  }, [lastLog, existingEntry, loadedDate, initialDate]);

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

  // Date navigation - parse date parts to avoid timezone issues
  const currentDateStr = formData.date || getLocalDateString();
  const dateParts = currentDateStr.split('-');
  const selectedDate = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    12, 0, 0 // noon to avoid any edge cases
  );
  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    updateField('date', getLocalDateString(newDate));
  };

  const isToday = formData.date === getLocalDateString();

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Sticky Header with Date Picker - includes safe area for notch */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 shadow-lg" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{isToday ? "Today's Habits" : existingEntry ? 'Edit Entry' : 'Log Habits'}</h1>
            {loadingEntry && <p className="text-xs text-slate-400">Loading existing data...</p>}
          </div>
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
            onClick={() => updateField('date', getLocalDateString())}
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

      {/* Bottom Navigation - Mobile only */}
      <nav className="fixed bottom-20 left-0 right-0 px-4 pb-4 md:hidden z-40">
        <div className="bg-slate-900 rounded-2xl px-6 py-3 flex justify-around shadow-xl">
          <Link to="/today" className="flex flex-col items-center text-blue-400">
            <Calendar size={24} />
            <span className="text-xs mt-1">Today</span>
          </Link>
          <Link to="/mobile" className="flex flex-col items-center text-slate-400 hover:text-white">
            <History size={24} />
            <span className="text-xs mt-1">Hub</span>
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
