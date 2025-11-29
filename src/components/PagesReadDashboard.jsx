import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const PagesReadDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="number_of_pages_read"
      title="Pages Read Analysis"
      color="#4ecdc4"
      description="Daily reading progress tracking"
      isNumeric={true}
    />
  );
};

export default PagesReadDashboard;