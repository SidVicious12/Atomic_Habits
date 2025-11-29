import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const DrinkDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="alcohol"
      title="Drink (Alcohol) Analysis"
      color="#3b82f6"
      description="Tracking alcohol consumption habits"
      isNumeric={false}
    />
  );
};

export default DrinkDashboard;
