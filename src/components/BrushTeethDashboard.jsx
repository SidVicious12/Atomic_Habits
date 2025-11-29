import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const BrushTeethDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="brush_teeth_at_night"
      title="Brush Teeth at Night Analysis"
      color="#8884d8"
      description="Tracking teeth brushing habits"
      isNumeric={false}
    />
  );
};

export default BrushTeethDashboard;
