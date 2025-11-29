import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const PhoneInMorningDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="did_i_use_my_phone_for_social_media_30_mins_after_waking_up?"
      title="Phone on Wake Analysis"
      color="#ff6b6b"
      description="Phone usage habits upon waking up"
      isNumeric={false}
    />
  );
};

export default PhoneInMorningDashboard;