import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const WaterBottlesDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="#_of_bottles_of_water_drank?"
      title="Water Bottles Analysis"
      color="#36a2eb"
      description="Daily water consumption tracking over time"
      isNumeric={true}
    />
  );
};

export default WaterBottlesDashboard;