import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useUpsertDailyLog } from '@/hooks/useDailyLogs';
import type { DatabaseError } from '@/lib/database-error-handler';

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

const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold border-b pb-2 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
  </div>
);

const CheckboxField = ({ name, label, register, value }: { name: keyof DailyLogFormData, label: string, register: any, value?: string }) => {
  const id = value ? `${name}-${value}` : name;
  return (
    <div className="flex items-center gap-2">
      <input {...register(name)} type="checkbox" id={id} value={value} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
    </div>
  );
};

const NumberField = ({ name, label, register, min, max }: { name: keyof DailyLogFormData, label: string, register: any, min?: number, max?: number }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
        <input {...register(name)} type="number" id={name} min={min} max={max} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
    </div>
);

const workoutOptions = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];
const dayRatingOptions = ['Terrible', 'Bad', 'Okay', 'Good', 'Legendary'];

export default function DailyLogForm() {
  const navigate = useNavigate();
  const upsertMutation = useUpsertDailyLog();
  
  const { register, handleSubmit, formState: { errors } } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: {
      log_date: new Date().toISOString().split('T')[0],
      workout: [],
    },
  });

  const onSubmit: SubmitHandler<DailyLogFormData> = async (data) => {
    try {
      await upsertMutation.mutateAsync(data);
      
      // Navigate after brief delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8">Daily Log</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <FormSection title="General Info">
          <div>
            <label htmlFor="log_date" className="block text-sm font-medium mb-2">Date</label>
            <input {...register('log_date')} type="date" id="log_date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="time_awake" className="block text-sm font-medium mb-2">Time Awake</label>
            <input {...register('time_awake')} type="time" id="time_awake" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </FormSection>

        <FormSection title="Morning Routine">
          <CheckboxField register={register} name="coffee" label="Coffee" />
          <CheckboxField register={register} name="morning_walk" label="Morning Walk" />
        </FormSection>

        <FormSection title="Meals & Health">
          <CheckboxField register={register} name="breakfast" label="Breakfast" />
          <CheckboxField register={register} name="green_tea" label="Green Tea" />
          <CheckboxField register={register} name="alcohol" label="Drink (Alcohol)" />
          <CheckboxField register={register} name="smoke" label="Smoke" />
          <CheckboxField register={register} name="soda" label="Soda" />
          <CheckboxField register={register} name="chocolate" label="Chocolate" />
        </FormSection>

        <FormSection title="Intake">
            <NumberField register={register} name="dabs_count" label="of Dabs" min={0} max={6} />
            <NumberField register={register} name="water_bottles_count" label="of Bottles of Water Drank" min={1} max={10} />
            <NumberField register={register} name="pages_read_count" label="Number of Pages Read" min={0} />
        </FormSection>

        <FormSection title="Night Routine & Screen Habits">
            <CheckboxField register={register} name="brushed_teeth_night" label="Brush Teeth at Night" />
            <CheckboxField register={register} name="washed_face_night" label="Wash Face at Night" />
            <CheckboxField register={register} name="netflix_in_bed" label="Watched Netflix in bed?" />
            <CheckboxField register={register} name="phone_on_wake" label="Used phone for Social Media within 30 mins of waking up?" />
        </FormSection>

        <FormSection title="Fitness">
            <div className="col-span-full">
                <label className="block text-sm font-medium mb-2">Workout</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {workoutOptions.map(opt => <CheckboxField key={opt} register={register} name="workout" label={opt} value={opt} />)}
                    <CheckboxField register={register} name="workout" label="No Workout" value="No Workout" />
                </div>
            </div>
        </FormSection>

        <FormSection title="Wellness">
            <CheckboxField register={register} name="relaxed_today" label="Relaxed Today?" />
            <div>
                <label htmlFor="day_rating" className="block text-sm font-medium mb-2">How Was My Day?</label>
                <select {...register('day_rating')} id="day_rating" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select a rating</option>
                    {dayRatingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        </FormSection>

        <FormSection title="Metrics">
            <NumberField register={register} name="weight_lbs" label="Weight (lbs)" />
            <NumberField register={register} name="calories" label="Calories" />
            <div>
                <label htmlFor="bed_time" className="block text-sm font-medium mb-2">Bed Time</label>
                <input {...register('bed_time')} type="time" id="bed_time" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="col-span-full">
                <label htmlFor="dream" className="block text-sm font-medium mb-2">Dream I Had Last Night</label>
                <textarea {...register('dream')} id="dream" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div className="col-span-full">
                <label htmlFor="latest_hype" className="block text-sm font-medium mb-2">Latest Hype?</label>
                <textarea {...register('latest_hype')} id="latest_hype" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
        </FormSection>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="px-6 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            disabled={upsertMutation.isPending}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={upsertMutation.isPending} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {upsertMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Saving...
              </span>
            ) : (
              'Save Log'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
