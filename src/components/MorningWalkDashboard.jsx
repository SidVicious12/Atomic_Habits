import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const MorningWalkDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="morning_walk"
      title="Morning Walk Analysis"
      color="#9966ff"
      description="Tracking the consistency of morning walks"
      isNumeric={false}
    />
  );
};

export default MorningWalkDashboard;