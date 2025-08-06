import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const PagesReadDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="pages_read_count"
      title="Pages Read Analysis"
      color="#4ecdc4"
      description="Daily reading progress tracking"
      isNumeric={true}
    />
  );
};

export default PagesReadDashboard;