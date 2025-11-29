import React from 'react';
import { motion } from 'framer-motion';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Daily Habit Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Small daily improvements lead to stunning results. Track your habits, understand your patterns, and build the life you want.
          </p>
        </motion.div>

        {/* Habit Flow Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-white text-xl font-semibold text-center">
                🎯 My Daily Habit Loop
              </h2>
            </div>
            <div className="p-4 md:p-8">
              <img
                src="/habit-tracker-flow.png"
                alt="Daily Habit Tracker Flow - showing all habits tracked including Time Awake, Coffee, Breakfast, Work, Water intake, Reading, Skincare, Exercise, and more"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  // If image doesn't exist yet, show placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="bg-gray-100 rounded-lg p-12 text-center">
                      <p class="text-gray-500 text-lg mb-4">📸 Add your habit flow image</p>
                      <p class="text-gray-400 text-sm">Save your image as:<br/><code class="bg-gray-200 px-2 py-1 rounded">public/habit-tracker-flow.png</code></p>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 text-center max-w-3xl mx-auto"
        >
          <blockquote className="text-xl md:text-2xl text-gray-600 italic">
            "You do not rise to the level of your goals. You fall to the level of your systems."
          </blockquote>
          <p className="mt-4 text-gray-500 font-medium">— James Clear, Atomic Habits</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Homepage;