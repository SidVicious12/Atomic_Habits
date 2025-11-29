import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const WashFaceDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="wash_face_at_night"
      title="Wash Face at Night Analysis"
      color="#82ca9d"
      description="Tracking face washing habits"
      isNumeric={false}
    />
  );
};

export default WashFaceDashboard;
