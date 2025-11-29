import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const GreenTeaDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="green_tea"
      title="Green Tea Analysis"
      color="#2ca02c"
      description="Tracking green tea consumption habits"
      isNumeric={false}
    />
  );
};

export default GreenTeaDashboard;
