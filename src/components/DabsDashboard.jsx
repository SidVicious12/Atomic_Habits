import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const DabsDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="#_of_dabs"
      title="# of Dabs Analysis"
      color="#f97316"
      description="Tracking dabs consumption"
      isNumeric={true}
    />
  );
};

export default DabsDashboard;
