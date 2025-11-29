import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const SmokeDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="smoke"
      title="Smoke Analysis"
      color="#ef4444"
      description="Tracking smoking habits"
      isNumeric={false}
    />
  );
};

export default SmokeDashboard;
