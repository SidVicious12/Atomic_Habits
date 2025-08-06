import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const CoffeeDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="coffee"
      title="Coffee Analysis"
      color="#8b4513"
      description="Date range analysis of coffee habit"
      isNumeric={false}
    />
  );
};

export default CoffeeDashboard;
