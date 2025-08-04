import React from "react";
import { Link } from "react-router-dom";

const IntroPage: React.FC = () => {
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
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Welcome Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              Welcome to
            </h1>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Atomic Habits
              </span>
            </h2>
          </div>

          {/* Mission Statement */}
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Your personal mission control for building extraordinary habits.
            Small changes, remarkable results.
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              to="/login"
              className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Begin Your Journey
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-16 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-white mb-1">Launch</h3>
              <p className="text-gray-300">Start your transformation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-white mb-1">Track</h3>
              <p className="text-gray-300">Monitor your progress</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-1">Build</h3>
              <p className="text-gray-300">Create powerful streaks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-white mb-1">Achieve</h3>
              <p className="text-gray-300">Reach your goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
