import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, AlertCircle, CalendarDays } from 'lucide-react';
import { Time } from '@internationalized/date';
import { cn } from '@/lib/utils';
import { useUpsertDailyLog, useLatestDailyLog, useCanWrite } from '@/hooks/useDailyLogs';
import type { DailyLogEntry } from '@/lib/google-sheets-write';
import { TimeField, DateInput } from '@/components/ui/datefield';

type Section = 'morning' | 'afternoon' | 'evening';

interface SteppedHabitFormProps {
  onSuccess?: () => void;
}

export default function SteppedHabitForm({ onSuccess }: SteppedHabitFormProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('morning');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    water_bottles_count: 4,
    pages_read_count: 10,
  });

  const canWrite = useCanWrite();
  const upsertMutation = useUpsertDailyLog();
  const { data: lastLog } = useLatestDailyLog();

  // Pre-fill from previous day's log
  useEffect(() => {
    if (lastLog) {
      setFormData(prev => ({
        ...prev,
        weight_lbs: lastLog.weight_lbs || prev.weight_lbs,
      }));
    }
  }, [lastLog]);

  const updateField = (name: keyof DailyLogEntry, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (activeSection === 'morning') setActiveSection('afternoon');
    else if (activeSection === 'afternoon') setActiveSection('evening');
  };

  const handleBack = () => {
    if (activeSection === 'afternoon') setActiveSection('morning');
    else if (activeSection === 'evening') setActiveSection('afternoon');
  };

  const handleFinish = async () => {
    if (!canWrite) {
      alert('Google Sheets write not configured. See GOOGLE_SHEETS_WRITE_SETUP.md');
      return;
    }

    try {
      const entry: DailyLogEntry = {
        date: formData.date || new Date().toISOString().split('T')[0],
        ...formData,
      };

      const result = await upsertMutation.mutateAsync(entry);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
          navigate('/');
        }, 1500);
      } else {
        alert(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save: ${message}`);
    }
  };

  const sections: { id: Section; label: string }[] = [
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
  ];

  // Format the selected date for display
  const selectedDate = formData.date ? new Date(formData.date + 'T12:00:00') : new Date();
  const dateDisplay = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('date', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Config Warning */}
        {!canWrite && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">Google Sheets not configured. See GOOGLE_SHEETS_WRITE_SETUP.md</p>
          </div>
        )}

        {/* Date Picker */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{dateDisplay}</h1>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={formData.date || ''}
              onChange={handleDateChange}
              className="border-none outline-none text-gray-700 font-medium bg-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-center transition-all font-medium",
                activeSection === section.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {activeSection === 'morning' && (
            <MorningSection formData={formData} updateField={updateField} />
          )}
          {activeSection === 'afternoon' && (
            <AfternoonSection formData={formData} updateField={updateField} />
          )}
          {activeSection === 'evening' && (
            <EveningSection formData={formData} updateField={updateField} />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={activeSection === 'morning'}
              className={cn(
                "flex items-center gap-1 px-4 py-2 rounded-lg transition-all",
                activeSection === 'morning'
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            {activeSection === 'evening' ? (
              <button
                onClick={handleFinish}
                disabled={upsertMutation.isPending || !canWrite}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                  "bg-gray-900 text-white hover:bg-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {upsertMutation.isPending ? 'Saving...' : 'Finish'}
                <Check size={18} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center mx-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Saved!</h3>
              <p className="text-gray-500 mt-1">Your habits have been logged.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SECTION COMPONENTS
// ============================================

interface SectionProps {
  formData: Partial<DailyLogEntry>;
  updateField: (name: keyof DailyLogEntry, value: any) => void;
}

function MorningSection({ formData, updateField }: SectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Morning Habits</h2>
      <p className="text-gray-500 mb-6">Let's charge up your day.</p>

      <div className="space-y-3">
        <TimeInput
          label="Time Awake"
          value={formData.time_awake || ''}
          onChange={(v) => updateField('time_awake', v)}
        />
        <CheckboxInput
          label="Morning Coffee"
          checked={formData.coffee === true}
          onChange={(v) => updateField('coffee', v)}
        />
        <CheckboxInput
          label="Morning Walk"
          checked={formData.morning_walk === true}
          onChange={(v) => updateField('morning_walk', v)}
        />
        <CheckboxInput
          label="Breakfast"
          checked={formData.breakfast === true}
          onChange={(v) => updateField('breakfast', v)}
        />
        <CheckboxInput
          label="Phone within 30min of waking"
          checked={formData.phone_on_wake === true}
          onChange={(v) => updateField('phone_on_wake', v)}
        />
      </div>
    </div>
  );
}

function AfternoonSection({ formData, updateField }: SectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Afternoon Habits</h2>
      <p className="text-gray-500 mb-6">Track your work schedule, intake and substances.</p>

      <div className="space-y-3">
        <TimeInput
          label="Time at Work"
          value={formData.time_at_work || ''}
          onChange={(v) => updateField('time_at_work', v)}
        />
        <TimeInput
          label="Time Left Work"
          value={formData.time_left_work || ''}
          onChange={(v) => updateField('time_left_work', v)}
        />
        <NumberInput
          label="Water Bottles"
          value={formData.water_bottles_count ?? 0}
          onChange={(v) => updateField('water_bottles_count', v)}
          min={0}
          max={12}
        />
        <NumberInput
          label="Pages Read"
          value={formData.pages_read_count ?? 0}
          onChange={(v) => updateField('pages_read_count', v)}
          min={0}
          max={200}
          step={5}
        />
        <NumberInput
          label="Dabs"
          value={formData.dabs_count ?? 0}
          onChange={(v) => updateField('dabs_count', v)}
          min={0}
          max={10}
        />
        <CheckboxInput
          label="Green Tea"
          checked={formData.green_tea === true}
          onChange={(v) => updateField('green_tea', v)}
        />
        <CheckboxInput
          label="Alcohol"
          checked={formData.alcohol === true}
          onChange={(v) => updateField('alcohol', v)}
        />
        <CheckboxInput
          label="Smoke"
          checked={formData.smoke === true}
          onChange={(v) => updateField('smoke', v)}
        />
        <CheckboxInput
          label="Soda"
          checked={formData.soda === true}
          onChange={(v) => updateField('soda', v)}
        />
        <CheckboxInput
          label="Chocolate"
          checked={formData.chocolate === true}
          onChange={(v) => updateField('chocolate', v)}
        />
      </div>
    </div>
  );
}

function EveningSection({ formData, updateField }: SectionProps) {
  const workoutOptions = ['None', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Cardio', 'Full Body'];
  const dayRatingOptions = ['Terrible', 'Bad', 'Okay', 'Good', 'Legendary'];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Evening Habits</h2>
      <p className="text-gray-500 mb-6">Wrap up your day and reflect.</p>

      <div className="space-y-3">
        <SelectInput
          label="Workout"
          value={formData.workout as string || 'None'}
          options={workoutOptions}
          onChange={(v) => updateField('workout', v === 'None' ? undefined : v)}
        />
        <NumberInput
          label="Calories"
          value={formData.calories ?? 0}
          onChange={(v) => updateField('calories', v)}
          min={0}
          max={10000}
          step={100}
        />
        <NumberInput
          label="Weight (lbs)"
          value={formData.weight_lbs ?? 0}
          onChange={(v) => updateField('weight_lbs', v)}
          min={50}
          max={500}
          step={0.1}
        />
        <CheckboxInput
          label="Brush Teeth"
          checked={formData.brushed_teeth_night === true}
          onChange={(v) => updateField('brushed_teeth_night', v)}
        />
        <CheckboxInput
          label="Wash Face"
          checked={formData.washed_face_night === true}
          onChange={(v) => updateField('washed_face_night', v)}
        />
        <CheckboxInput
          label="Netflix in Bed"
          checked={formData.netflix_in_bed === true}
          onChange={(v) => updateField('netflix_in_bed', v)}
        />
        <TimeInput
          label="Bed Time"
          value={formData.bed_time || ''}
          onChange={(v) => updateField('bed_time', v)}
        />
        <CheckboxInput
          label="Relaxed Today"
          checked={formData.relaxed_today === true}
          onChange={(v) => updateField('relaxed_today', v)}
        />
        <SelectInput
          label="How was my day?"
          value={formData.day_rating || ''}
          options={dayRatingOptions}
          onChange={(v) => updateField('day_rating', v)}
          placeholder="Select rating..."
        />
        <TextInput
          label="Dream I had"
          value={formData.dream || ''}
          onChange={(v) => updateField('dream', v)}
          placeholder="Describe your dream... (optional)"
        />
        <TextInput
          label="Latest Hype"
          value={formData.latest_hype || ''}
          onChange={(v) => updateField('latest_hype', v)}
          placeholder="What are you excited about? (optional)"
        />
      </div>
    </div>
  );
}

// ============================================
// INPUT COMPONENTS
// ============================================

function CheckboxInput({ label, checked, onChange }: { 
  label: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left"
    >
      <div className={cn(
        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
        checked 
          ? "bg-gray-900 border-gray-900" 
          : "border-gray-300"
      )}>
        {checked && <Check size={16} className="text-white" />}
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : 0)}
        min={min}
        max={max}
        step={step}
        className="w-24 text-right border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );
}

function TimeInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Convert string "HH:mm" to Time object
  const timeValue = value ? (() => {
    const [hours, minutes] = value.split(':').map(Number);
    return new Time(hours, minutes);
  })() : undefined;

  // Convert Time object back to "HH:mm" string
  const handleChange = (time: Time | null) => {
    if (time) {
      const hours = time.hour.toString().padStart(2, '0');
      const minutes = time.minute.toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <TimeField 
        value={timeValue} 
        onChange={handleChange}
        hourCycle={12}
        aria-label={label}
      >
        <DateInput className="w-32" />
      </TimeField>
    </div>
  );
}

function SelectInput({ label, value, options, onChange, placeholder }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="p-4 rounded-xl border-2 border-gray-200">
      <span className="font-medium text-gray-700 block mb-2">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
      />
    </div>
  );
}
