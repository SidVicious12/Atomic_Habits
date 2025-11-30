import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronLeft,
  Sun,
  Coffee,
  Utensils,
  Building2,
  Clock,
  Tv,
  Smartphone,
  Cigarette,
  Droplets,
  Calendar,
  BookOpen,
  Moon,
  Leaf,
  Wine,
  Dumbbell,
  Sparkles,
  Scale,
  Flame,
  Zap,
  Heart,
  BedDouble,
  FootprintsIcon,
  Candy,
  GlassWater,
  Home,
  History
} from 'lucide-react';
import logo from '../assets/logo.png';

// All habits with their icons and keys
const allHabits = [
  // Auto-generated (not displayed in sidebar, just for reference)
  { name: 'Year', key: 'year', icon: Calendar, auto: true },
  { name: 'Date', key: 'date', icon: Calendar, auto: true },
  { name: 'Day', key: 'day', icon: Calendar, auto: true },
  
  // Morning
  { name: 'Time Awake', key: 'time_awake', icon: Sun, section: 'Morning' },
  { name: 'Morning Walk', key: 'morning_walk', icon: FootprintsIcon, section: 'Morning' },
  { name: 'Coffee', key: 'coffee', icon: Coffee, section: 'Morning' },
  { name: 'Breakfast', key: 'breakfast', icon: Utensils, section: 'Morning' },
  { name: 'Phone (30m after wake)', key: 'phone_on_wake', icon: Smartphone, section: 'Morning' },
  
  // Work
  { name: 'Time at Work', key: 'time_at_work', icon: Building2, section: 'Work' },
  { name: 'Time Left Work', key: 'time_left_work', icon: Clock, section: 'Work' },
  
  // Intake
  { name: '# of Water Bottles', key: 'water_bottles_count', icon: Droplets, section: 'Intake' },
  { name: 'Green Tea', key: 'green_tea', icon: Leaf, section: 'Intake' },
  { name: 'Drink (Alcohol)', key: 'alcohol', icon: Wine, section: 'Intake' },
  { name: 'Soda', key: 'soda', icon: GlassWater, section: 'Intake' },
  { name: 'Chocolate', key: 'chocolate', icon: Candy, section: 'Intake' },
  { name: 'Smoke', key: 'smoke', icon: Cigarette, section: 'Intake' },
  { name: '# of Dabs', key: 'dabs_count', icon: Flame, section: 'Intake' },
  
  // Night
  { name: 'Netflix in Bed?', key: 'netflix_in_bed', icon: Tv, section: 'Night' },
  { name: 'Brush Teeth at Night', key: 'brushed_teeth_night', icon: Sparkles, section: 'Night' },
  { name: 'Wash Face at Night', key: 'washed_face_night', icon: Moon, section: 'Night' },
  { name: 'Bed Time', key: 'bed_time', icon: BedDouble, section: 'Night' },
  { name: 'Dream I Had', key: 'dream', icon: Moon, section: 'Night' },
  
  // Fitness
  { name: 'Workout', key: 'workout', icon: Dumbbell, section: 'Fitness' },
  { name: '# of Calories', key: 'calories', icon: Flame, section: 'Fitness' },
  { name: 'Weight (lbs)', key: 'weight_lbs', icon: Scale, section: 'Fitness' },
  
  // Wellness
  { name: '# Pages Read', key: 'pages_read_count', icon: BookOpen, section: 'Wellness' },
  { name: 'Relax?', key: 'relaxed_today', icon: Heart, section: 'Wellness' },
  { name: 'How was my Day?', key: 'day_rating', icon: Zap, section: 'Wellness' },
  { name: 'Latest Hype?', key: 'latest_hype', icon: Sparkles, section: 'Wellness' },
];

interface SidebarProps {
  categories?: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Get all habits (excluding auto-generated ones)
  const habits = allHabits.filter(h => !h.auto);

  return (
    <div className="relative">
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-200 shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } w-72 shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logo} alt="HabitLoop" className="w-8 h-8 object-contain" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white tracking-wide">
                HabitLoop
              </h1>
            )}
          </Link>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ChevronLeft 
              size={20} 
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Quick Nav Links */}
        <div className="p-3 space-y-1">
          <Link
            to="/today"
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname === '/today'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            {!isCollapsed && <span className="font-medium">Today</span>}
          </Link>
          <Link
            to="/"
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home size={20} />
            {!isCollapsed && <span className="font-medium">Home</span>}
          </Link>
          <Link
            to="/history"
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname === '/history'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <History size={20} />
            {!isCollapsed && <span className="font-medium">History</span>}
          </Link>
        </div>

        {/* Habits List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 border-t border-slate-700">
          {!isCollapsed && (
            <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              All Habits
            </p>
          )}
          
          {habits.map((habit) => {
            const Icon = habit.icon;
            const isActive = activeItem === habit.key;
            const habitPath = `/habit/${habit.key}`;
            
            return (
              <Link
                key={habit.key}
                to={habitPath}
                onClick={() => setActiveItem(habit.key)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive || location.pathname === habitPath
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors duration-200 flex-shrink-0 ${
                    isActive || location.pathname === habitPath
                      ? 'text-white' 
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">
                    {habit.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Auto Date Info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Today's Date</p>
              <p className="text-sm font-semibold text-white">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
