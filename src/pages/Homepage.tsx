import React, { useState, useEffect } from 'react';
import { getLatestDailyLog } from '../lib/daily-logs';
import type { DailyLogFormData } from '../components/DailyLogForm';
import { DailyLogSummary } from '../components/ui/DailyLogSummary';

const Homepage: React.FC = () => {
  const [latestLog, setLatestLog] = useState<DailyLogFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestLog = async () => {
      try {
        setLoading(true);
        const data = await getLatestDailyLog();
        setLatestLog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestLog();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading latest log...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-background dark:bg-background min-h-screen w-full">
      <h2 className="text-3xl font-bold text-center my-10 text-foreground">Latest Daily Log</h2>
      {latestLog ? (
        <DailyLogSummary log={latestLog} />
      ) : (
        <p className="text-center text-gray-500">No daily log found.</p>
      )}
    </div>
  );
};

export default Homepage;