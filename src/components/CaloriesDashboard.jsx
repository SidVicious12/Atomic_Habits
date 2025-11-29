import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const CaloriesDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="#_of_calories"
      title="Calories Burned"
      color="#f59e0b"
      description="Tracking calories burned during activities"
      isNumeric={true}
    />
  );
};

export default CaloriesDashboard;
