import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const ChocolateDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="chocolate"
      title="Chocolate Consumption"
      color="#78350f"
      description="Tracking chocolate consumption habits"
      isNumeric={false}
    />
  );
};

export default ChocolateDashboard;
