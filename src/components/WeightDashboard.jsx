import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const WeightDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="weight_lbs"
      title="Weight Analysis"
      color="#2ecc71"
      description="Monthly average weight tracking"
      isNumeric={true}
    />
  );
};

export default WeightDashboard;
