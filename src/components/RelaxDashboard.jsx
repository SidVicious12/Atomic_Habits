import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const RelaxDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="relaxed_today"
      title="Relax Analysis"
      color="#22c55e"
      description="Tracking relaxation habits"
      isNumeric={false}
    />
  );
};

export default RelaxDashboard;
