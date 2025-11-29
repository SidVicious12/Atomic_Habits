import React from 'react';
import { QuickDailyEntry } from '@/components/QuickDailyEntry';
import { useNavigate } from 'react-router-dom';

const DailyLogPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <QuickDailyEntry onSuccess={() => navigate('/')} />
  );
};

export default DailyLogPage;
