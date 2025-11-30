import { Navigate } from 'react-router-dom';

// Redirect /log to /today - unified habit entry experience
const DailyLogPage: React.FC = () => {
  return <Navigate to="/today" replace />;
};

export default DailyLogPage;
