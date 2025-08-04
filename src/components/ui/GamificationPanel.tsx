import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap } from 'lucide-react';

interface GamificationPanelProps {
  totalPoints: number;
  todayPoints: number;
  streak: number;
  completedHabits: number;
  totalHabits: number;
}

const badges = [
  { id: 'first_day', name: 'Getting Started', icon: '🎯', requirement: 1, description: 'Complete your first day' },
  { id: 'week_warrior', name: 'Week Warrior', icon: '🏆', requirement: 7, description: '7 day streak' },
  { id: 'habit_master', name: 'Habit Master', icon: '🎖️', requirement: 30, description: '30 day streak' },
  { id: 'perfectionist', name: 'Perfectionist', icon: '💎', requirement: 100, description: '100% completion day' },
  { id: 'water_champion', name: 'Hydration Hero', icon: '💧', requirement: 8, description: '8+ water bottles' },
  { id: 'reader', name: 'Bookworm', icon: '📚', requirement: 20, description: '20+ pages read' },
];

export const GamificationPanel: React.FC<GamificationPanelProps> = ({
  totalPoints,
  todayPoints,
  streak,
  completedHabits,
  totalHabits
}) => {
  const completionRate = Math.round((completedHabits / totalHabits) * 100);
  const earnedBadges = badges.filter(badge => {
    switch (badge.id) {
      case 'first_day': return completedHabits > 0;
      case 'week_warrior': return streak >= 7;
      case 'habit_master': return streak >= 30;
      case 'perfectionist': return completionRate === 100;
      default: return false;
    }
  });

  const level = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = 100 - (totalPoints % 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-300" size={24} />
          <h3 className="text-xl font-bold">Level {level}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-sm opacity-75">Total Points</div>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {level + 1}</span>
          <span>{pointsToNextLevel} points to go</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((totalPoints % 100) / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-300">+{todayPoints}</div>
          <div className="text-xs opacity-75">Points Today</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-300">{streak}</div>
          <div className="text-xs opacity-75">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-300">{completionRate}%</div>
          <div className="text-xs opacity-75">Completion</div>
        </div>
      </div>

      {/* Badges */}
      <div className="border-t border-white/20 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-yellow-300" size={16} />
          <span className="text-sm font-medium">Earned Badges ({earnedBadges.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {earnedBadges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/20 rounded-lg p-2 text-center min-w-[60px]"
              title={badge.description}
            >
              <div className="text-lg">{badge.icon}</div>
              <div className="text-xs opacity-75">{badge.name}</div>
            </motion.div>
          ))}
          
          {/* Next Badge to Earn */}
          {badges.find(badge => !earnedBadges.includes(badge)) && (
            <div className="bg-white/10 border border-white/20 border-dashed rounded-lg p-2 text-center min-w-[60px] opacity-50">
              <div className="text-lg">🔒</div>
              <div className="text-xs">Next Goal</div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-white/10 rounded-lg text-center"
        >
          <Zap className="inline mr-1" size={16} />
          <span className="text-sm">
            {streak >= 30 ? "You're unstoppable! 🚀" :
             streak >= 7 ? "You're on fire! Keep it up! 🔥" :
             streak >= 3 ? "Great momentum! 💪" :
             "You're building the habit! 🌱"}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};