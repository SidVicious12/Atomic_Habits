import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const BreakfastDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="breakfast"
      title="Breakfast Analysis"
      color="#ff9500"
      description="Daily breakfast consumption patterns"
      isNumeric={false}
    />
  );
};

export default BreakfastDashboard;