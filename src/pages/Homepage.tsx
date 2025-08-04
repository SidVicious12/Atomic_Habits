import React from 'react';
import WaterBottlesDashboard from '@/components/WaterBottlesDashboard';
import CoffeeDashboard from '@/components/CoffeeDashboard';
import BreakfastDashboard from '@/components/BreakfastDashboard';
import GreenTeaDashboard from '@/components/GreenTeaDashboard';
import PagesReadDashboard from '@/components/PagesReadDashboard';
import DabsDashboard from '@/components/DabsDashboard';
import WashFaceDashboard from '@/components/WashFaceDashboard';
import BrushTeethDashboard from '@/components/BrushTeethDashboard';
import MorningWalkDashboard from '@/components/MorningWalkDashboard';
import DrinkDashboard from '@/components/DrinkDashboard';
import PhoneInMorningDashboard from '@/components/PhoneInMorningDashboard';
import SmokeDashboard from '@/components/SmokeDashboard';
import NetflixInBedDashboard from '@/components/NetflixInBedDashboard';
import WeightDashboard from '@/components/WeightDashboard';
import RelaxDashboard from '@/components/RelaxDashboard';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Habit Dashboard</h1>
        <p className="text-gray-600">Track your atomic habits and build extraordinary results</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Morning Habits */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌅</span>
            Morning Habits
          </h2>
        </div>
        <MorningWalkDashboard />
        <CoffeeDashboard />
        <PhoneInMorningDashboard />

        {/* Intake Habits */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🍽️</span>
            Intake
          </h2>
        </div>
        <WaterBottlesDashboard />
        <BreakfastDashboard />
        <GreenTeaDashboard />
        <DrinkDashboard />
        <SmokeDashboard />
        <DabsDashboard />

        {/* Night Habits */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌙</span>
            Night Routines
          </h2>
        </div>
        <BrushTeethDashboard />
        <WashFaceDashboard />
        <NetflixInBedDashboard />

        {/* Wellness */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🧘</span>
            Wellness
          </h2>
        </div>
        <RelaxDashboard />
        <PagesReadDashboard />

        {/* Metrics */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Metrics
          </h2>
        </div>
        <WeightDashboard />
      </div>
    </div>
  );
};

export default Homepage;