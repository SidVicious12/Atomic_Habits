import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/command-center.jpg)',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Atomic
            </span>
            <br />
            <span className="text-white">Habits</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Take control of your future. Build habits that compound into extraordinary results.
          </p>

          {/* Mission Statement */}
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Like a command center for space exploration, this is your mission control for personal transformation.
            Every small change you make today creates ripples across your entire life trajectory.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/habits"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Launch Mission Control
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 border-2 border-gray-300 text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              View Dashboard
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-gray-300">Monitor your habits with precision and insight</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-white mb-2">Build Streaks</h3>
              <p className="text-gray-300">Create momentum with consistent daily actions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-white mb-2">Transform Life</h3>
              <p className="text-gray-300">Compound small changes into big results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;