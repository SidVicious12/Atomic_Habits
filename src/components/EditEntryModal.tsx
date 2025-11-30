/**
 * EditEntryModal - Modal for editing existing habit entries
 * 
 * Pre-fills form with existing data from Google Sheets
 * Includes confirmation before saving changes
 */

import React, { useState, useCallback } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateRow } from '@/hooks/useDailyLogs';
import { type DailyLogEntry } from '@/lib/google-sheets-write';

interface EditEntryModalProps {
  date: string;
  initialData: Partial<DailyLogEntry>;
  onClose: () => void;
  onSaveSuccess: () => void;
}

// Form field configuration
const FORM_FIELDS = [
  { key: 'time_awake', label: 'Time Awake', type: 'time' },
  { key: 'time_at_work', label: 'Time at Work', type: 'time' },
  { key: 'time_left_work', label: 'Time Left Work', type: 'time' },
  { key: 'bed_time', label: 'Bed Time', type: 'time' },
  { key: 'water_bottles_count', label: 'Water Bottles', type: 'number', min: 0, max: 20 },
  { key: 'pages_read_count', label: 'Pages Read', type: 'number', min: 0, max: 500 },
  { key: 'dabs_count', label: '# of Dabs', type: 'number', min: 0, max: 50 },
  { key: 'weight_lbs', label: 'Weight (lbs)', type: 'number', min: 50, max: 500 },
  { key: 'calories', label: 'Calories', type: 'number', min: 0, max: 10000 },
  { key: 'coffee', label: 'Coffee', type: 'boolean' },
  { key: 'breakfast', label: 'Breakfast', type: 'boolean' },
  { key: 'green_tea', label: 'Green Tea', type: 'boolean' },
  { key: 'alcohol', label: 'Alcohol', type: 'boolean' },
  { key: 'smoke', label: 'Smoke', type: 'boolean' },
  { key: 'soda', label: 'Soda', type: 'boolean' },
  { key: 'chocolate', label: 'Chocolate', type: 'boolean' },
  { key: 'netflix_in_bed', label: 'Netflix in Bed', type: 'boolean' },
  { key: 'phone_on_wake', label: 'Phone on Wake', type: 'boolean' },
  { key: 'brushed_teeth_night', label: 'Brushed Teeth', type: 'boolean' },
  { key: 'washed_face_night', label: 'Washed Face', type: 'boolean' },
  { key: 'relaxed_today', label: 'Relaxed Today', type: 'boolean' },
  { key: 'morning_walk', label: 'Morning Walk', type: 'boolean' },
  { key: 'workout', label: 'Workout', type: 'text', placeholder: 'e.g., Running, Weights' },
  { key: 'day_rating', label: 'Day Rating', type: 'select', options: ['Great', 'Good', 'Okay', 'Bad', 'Terrible'] },
  { key: 'latest_hype', label: 'Latest Hype', type: 'text', placeholder: "What's exciting?" },
  { key: 'dream', label: 'Dream', type: 'textarea', placeholder: 'Any dreams last night?' },
] as const;

export default function EditEntryModal({ date, initialData, onClose, onSaveSuccess }: EditEntryModalProps) {
  const [formData, setFormData] = useState<Partial<DailyLogEntry>>({ ...initialData, date });
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateMutation = useUpdateRow();

  const handleChange = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setError(null);
    try {
      const result = await updateMutation.mutateAsync(formData as DailyLogEntry);
      if (result.success) {
        onSaveSuccess();
      } else {
        setError(result.error || 'Failed to save changes');
        setShowConfirm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setShowConfirm(false);
    }
  }, [formData, updateMutation, onSaveSuccess]);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div>
            <h2 className="text-lg font-bold">Edit Entry</h2>
            <p className="text-sm text-white/80">{formatDateDisplay(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Time Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Times</h3>
            <div className="grid grid-cols-2 gap-3">
              {FORM_FIELDS.filter(f => f.type === 'time').map(field => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="time"
                    value={formData[field.key as keyof DailyLogEntry] as string || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Number Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Numbers</h3>
            <div className="grid grid-cols-2 gap-3">
              {FORM_FIELDS.filter(f => f.type === 'number').map(field => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={formData[field.key as keyof DailyLogEntry] as number || ''}
                    onChange={e => handleChange(field.key, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Boolean Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Habits</h3>
            <div className="grid grid-cols-2 gap-2">
              {FORM_FIELDS.filter(f => f.type === 'boolean').map(field => (
                <label
                  key={field.key}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    formData[field.key as keyof DailyLogEntry]
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={!!formData[field.key as keyof DailyLogEntry]}
                    onChange={e => handleChange(field.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                    formData[field.key as keyof DailyLogEntry]
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  )}>
                    {formData[field.key as keyof DailyLogEntry] && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Notes</h3>
            
            {/* Day Rating */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Day Rating</label>
              <select
                value={formData.day_rating || ''}
                onChange={e => handleChange('day_rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select rating...</option>
                <option value="Great">Great</option>
                <option value="Good">Good</option>
                <option value="Okay">Okay</option>
                <option value="Bad">Bad</option>
                <option value="Terrible">Terrible</option>
              </select>
            </div>

            {/* Workout */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Workout</label>
              <input
                type="text"
                value={formData.workout as string || ''}
                onChange={e => handleChange('workout', e.target.value)}
                placeholder="e.g., Running, Weights, Yoga"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Latest Hype */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Latest Hype</label>
              <input
                type="text"
                value={formData.latest_hype || ''}
                onChange={e => handleChange('latest_hype', e.target.value)}
                placeholder="What's exciting?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Dream */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dream</label>
              <textarea
                value={formData.dream || ''}
                onChange={e => handleChange('dream', e.target.value)}
                placeholder="Any dreams last night?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {showConfirm ? (
            <div className="space-y-3">
              <p className="text-center text-gray-700 font-medium">
                Save changes to this entry?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
