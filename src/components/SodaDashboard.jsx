import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const SodaDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="soda"
      title="Soda Consumption"
      color="#fb923c"
      description="Tracking soda drinking habits"
      isNumeric={false}
    />
  );
};

export default SodaDashboard;
