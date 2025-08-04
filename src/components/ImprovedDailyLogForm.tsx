import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MoreHorizontal } from 'lucide-react';
import { useUpsertDailyLog } from '@/hooks/useDailyLogs';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { QuickToggle } from './ui/QuickToggle';
import { StepperInput } from './ui/StepperInput';
import { QuickEntryMode } from './ui/QuickEntryMode';

const dailyLogSchema = z.object({
  log_date: z.string(),
  time_awake: z.string().optional(),
  coffee: z.boolean().optional(),
  morning_walk: z.boolean().optional(),
  breakfast: z.boolean().optional(),
  green_tea: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  smoke: z.boolean().optional(),
  soda: z.boolean().optional(),
  chocolate: z.boolean().optional(),
  dabs_count: z.coerce.number().min(0).max(6).optional(),
  water_bottles_count: z.coerce.number().min(0).max(10).optional(),
  pages_read_count: z.coerce.number().min(0).optional(),
  brushed_teeth_night: z.boolean().optional(),
  washed_face_night: z.boolean().optional(),
  netflix_in_bed: z.boolean().optional(),
  phone_on_wake: z.boolean().optional(),
  workout: z.array(z.string()).optional(),
  relaxed_today: z.boolean().optional(),
  day_rating: z.string().optional(),
  weight_lbs: z.coerce.number().optional(),
  calories: z.coerce.number().optional(),
  bed_time: z.string().optional(),
  dream: z.string().optional(),
  latest_hype: z.string().optional(),
});

export type DailyLogFormData = z.infer<typeof dailyLogSchema>;

const workoutOptions = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];
const dayRatingOptions = ['Terrible', 'Bad', 'Okay', 'Good', 'Legendary'];

export default function ImprovedDailyLogForm() {
  const navigate = useNavigate();
  const upsertMutation = useUpsertDailyLog();
  const [isQuickMode, setIsQuickMode] = useState(true);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: {
      log_date: new Date().toISOString().split('T')[0],
      workout: [],
      water_bottles_count: 4, // Smart default
      pages_read_count: 10,   // Smart default
    },
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<DailyLogFormData> = async (data) => {
    try {
      await upsertMutation.mutateAsync(data);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setValue(field as keyof DailyLogFormData, value);
  };

  const handleQuickComplete = () => {
    handleSubmit(onSubmit)();
  };

  if (isQuickMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setIsQuickMode(true)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  isQuickMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Zap size={16} />
                Quick Entry
              </button>
              <button
                type="button"
                onClick={() => setIsQuickMode(false)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  !isQuickMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MoreHorizontal size={16} />
                Full Form
              </button>
            </div>
          </div>

          <QuickEntryMode
            formData={watchedValues}
            onFieldChange={handleFieldChange}
            onComplete={handleQuickComplete}
            isLoading={upsertMutation.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Habit Log</h1>
              <p className="text-gray-600 mt-1">Track your atomic habits and build extraordinary results</p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsQuickMode(true)}
                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-all text-sm ${
                  isQuickMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Zap size={14} />
                Quick
              </button>
              <button
                type="button"
                onClick={() => setIsQuickMode(false)}
                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-all text-sm ${
                  !isQuickMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MoreHorizontal size={14} />
                Full
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Info */}
            <CollapsibleSection 
              title="General Info" 
              icon="📅" 
              priority="high"
              defaultExpanded={true}
            >
              <div>
                <label htmlFor="log_date" className="block text-sm font-medium mb-2">Date</label>
                <input {...register('log_date')} type="date" id="log_date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="time_awake" className="block text-sm font-medium mb-2">Time Awake</label>
                <input {...register('time_awake')} type="time" id="time_awake" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </CollapsibleSection>

            {/* Morning Routine */}
            <CollapsibleSection 
              title="Morning Routine" 
              icon="🌅" 
              streak={5}
              completionRate={85}
              priority="high"
            >
              <QuickToggle
                name="coffee"
                label="☕ Morning Coffee"
                checked={watchedValues.coffee || false}
                onChange={(checked) => setValue('coffee', checked)}
                streak={3}
              />
              <QuickToggle
                name="morning_walk"
                label="🚶 Morning Walk"
                checked={watchedValues.morning_walk || false}
                onChange={(checked) => setValue('morning_walk', checked)}
                streak={7}
              />
            </CollapsibleSection>

            {/* Meals & Health */}
            <CollapsibleSection 
              title="Meals & Health" 
              icon="🍽️" 
              completionRate={70}
              priority="medium"
            >
              <QuickToggle
                name="breakfast"
                label="🥐 Breakfast"
                checked={watchedValues.breakfast || false}
                onChange={(checked) => setValue('breakfast', checked)}
              />
              <QuickToggle
                name="green_tea"
                label="🍵 Green Tea"
                checked={watchedValues.green_tea || false}
                onChange={(checked) => setValue('green_tea', checked)}
              />
              <QuickToggle
                name="alcohol"
                label="🍷 Alcohol"
                checked={watchedValues.alcohol || false}
                onChange={(checked) => setValue('alcohol', checked)}
              />
              <QuickToggle
                name="smoke"
                label="🚬 Smoke"
                checked={watchedValues.smoke || false}
                onChange={(checked) => setValue('smoke', checked)}
              />
              <QuickToggle
                name="soda"
                label="🥤 Soda"
                checked={watchedValues.soda || false}
                onChange={(checked) => setValue('soda', checked)}
              />
              <QuickToggle
                name="chocolate"
                label="🍫 Chocolate"
                checked={watchedValues.chocolate || false}
                onChange={(checked) => setValue('chocolate', checked)}
              />
            </CollapsibleSection>

            {/* Intake */}
            <CollapsibleSection 
              title="Intake Tracking" 
              icon="📊" 
              priority="high"
            >
              <StepperInput
                name="dabs_count"
                label="🌿 Dabs"
                value={watchedValues.dabs_count || 0}
                onChange={(value) => setValue('dabs_count', value)}
                min={0}
                max={6}
                unit="dabs"
              />
              <StepperInput
                name="water_bottles_count"
                label="💧 Water Bottles"
                value={watchedValues.water_bottles_count || 0}
                onChange={(value) => setValue('water_bottles_count', value)}
                min={0}
                max={10}
                unit="bottles"
              />
              <StepperInput
                name="pages_read_count"
                label="📖 Pages Read"
                value={watchedValues.pages_read_count || 0}
                onChange={(value) => setValue('pages_read_count', value)}
                min={0}
                max={100}
                unit="pages"
              />
            </CollapsibleSection>

            {/* Night Routine */}
            <CollapsibleSection 
              title="Night Routine & Screen Habits" 
              icon="🌙" 
              priority="medium"
            >
              <QuickToggle
                name="brushed_teeth_night"
                label="🦷 Brushed Teeth"
                checked={watchedValues.brushed_teeth_night || false}
                onChange={(checked) => setValue('brushed_teeth_night', checked)}
              />
              <QuickToggle
                name="washed_face_night"
                label="🧴 Washed Face"
                checked={watchedValues.washed_face_night || false}
                onChange={(checked) => setValue('washed_face_night', checked)}
              />
              <QuickToggle
                name="netflix_in_bed"
                label="📺 Netflix in Bed"
                checked={watchedValues.netflix_in_bed || false}
                onChange={(checked) => setValue('netflix_in_bed', checked)}
              />
              <QuickToggle
                name="phone_on_wake"
                label="📱 Phone Within 30min"
                checked={watchedValues.phone_on_wake || false}
                onChange={(checked) => setValue('phone_on_wake', checked)}
              />
            </CollapsibleSection>

            {/* Fitness */}
            <CollapsibleSection 
              title="Fitness" 
              icon="💪" 
              priority="medium"
            >
              <div className="col-span-full">
                <label className="block text-sm font-medium mb-3">Workout</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {workoutOptions.map(opt => (
                    <QuickToggle
                      key={opt}
                      name={`workout-${opt}`}
                      label={opt}
                      checked={watchedValues.workout?.includes(opt) || false}
                      onChange={(checked) => {
                        const currentWorkout = watchedValues.workout || [];
                        if (checked) {
                          setValue('workout', [...currentWorkout, opt]);
                        } else {
                          setValue('workout', currentWorkout.filter(w => w !== opt));
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* Wellness */}
            <CollapsibleSection 
              title="Wellness" 
              icon="🧘" 
              priority="medium"
            >
              <QuickToggle
                name="relaxed_today"
                label="😌 Relaxed Today"
                checked={watchedValues.relaxed_today || false}
                onChange={(checked) => setValue('relaxed_today', checked)}
              />
              <div>
                <label htmlFor="day_rating" className="block text-sm font-medium mb-2">How Was My Day?</label>
                <select {...register('day_rating')} id="day_rating" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select a rating</option>
                  {dayRatingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </CollapsibleSection>

            {/* Metrics */}
            <CollapsibleSection 
              title="Metrics & Reflection" 
              icon="📈" 
              priority="low"
              defaultExpanded={false}
            >
              <StepperInput
                name="weight_lbs"
                label="⚖️ Weight"
                value={watchedValues.weight_lbs || 0}
                onChange={(value) => setValue('weight_lbs', value)}
                min={100}
                max={300}
                unit="lbs"
              />
              <StepperInput
                name="calories"
                label="🔥 Calories"
                value={watchedValues.calories || 0}
                onChange={(value) => setValue('calories', value)}
                min={1000}
                max={4000}
                step={50}
                unit="cal"
              />
              <div>
                <label htmlFor="bed_time" className="block text-sm font-medium mb-2">🛏️ Bed Time</label>
                <input {...register('bed_time')} type="time" id="bed_time" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="col-span-full">
                <label htmlFor="dream" className="block text-sm font-medium mb-2">💭 Dream I Had Last Night</label>
                <textarea {...register('dream')} id="dream" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
              <div className="col-span-full">
                <label htmlFor="latest_hype" className="block text-sm font-medium mb-2">🎉 Latest Hype?</label>
                <textarea {...register('latest_hype')} id="latest_hype" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
            </CollapsibleSection>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <motion.button 
                type="button" 
                onClick={() => navigate('/')} 
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                disabled={upsertMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                type="submit" 
                disabled={upsertMutation.isPending} 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {upsertMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </span>
                ) : (
                  'Save Complete Log'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}