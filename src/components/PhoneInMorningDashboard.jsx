import React from 'react';
import LiveHabitDashboard from './LiveHabitDashboard';

const PhoneInMorningDashboard = () => {
  return (
    <LiveHabitDashboard
      habitKey="phone_on_wake"
      title="Phone on Wake Analysis"
      color="#ff6b6b"
      description="Phone usage habits upon waking up"
      isNumeric={false}
    />
  );
};

export default PhoneInMorningDashboard;