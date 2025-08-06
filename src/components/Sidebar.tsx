import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiStar, HiFire, HiSun, HiMoon, HiLightningBolt, HiPlus, HiHome, HiGlobeAlt, HiChartBar } from 'react-icons/hi';

const iconMap = {
  // New category mappings
  'Morning': HiSun,
  'Intake': HiGlobeAlt,
  'Night': HiMoon,
  'Fitness': HiLightningBolt,
  'Wellness': HiStar,
  'Metrics': HiChartBar,
  // Legacy mappings (keep for backward compatibility)
  'Key Habits': HiStar,
  'Addictive Habits': HiFire,
  'Morning Habits': HiSun,
  'Nighttime Habits': HiMoon,
  'Workout Habits': HiLightningBolt,
  'New Habits': HiPlus,
};

interface SidebarProps {
  categories: string[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-56 bg-gray-100 border-r border-gray-200 p-4 flex flex-col gap-2">
      <Link
        to="/"
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <HiHome className="h-5 w-5" />
        Home
      </Link>
      <hr className="my-2 border-gray-300" />
      {categories.map((cat) => {
        const Icon = iconMap[cat] || HiStar;
        const categoryPath = `/category/${encodeURIComponent(cat)}`;
        const isActive = location.pathname === categoryPath;
        return (
          <Link
            key={cat}
            to={categoryPath}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="h-5 w-5" />
            {cat}
          </Link>
        );
      })}
    </aside>
  );
}
