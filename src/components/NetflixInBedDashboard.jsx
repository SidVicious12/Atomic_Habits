import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const NetflixInBedDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="did_i_watch_netflix_in_bed_last_night?"
      title="Netflix in Bed Analysis"
      color="#8b5cf6"
      description="Tracking Netflix viewing in bed habits"
      isNumeric={false}
    />
  );
};

export default NetflixInBedDashboard;
