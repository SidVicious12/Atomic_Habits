import React from 'react';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { supabase } from '../lib/supabase';

const DebugDashboard = () => {
  const { data: dailyLogs, isLoading, error } = useDailyLogs();
  const [authUser, setAuthUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Debug Dashboard</h2>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        {authLoading ? (
          <p>Checking authentication...</p>
        ) : authUser ? (
          <div className="text-green-600">
            <p>✅ Authenticated as: {authUser.email}</p>
            <p>User ID: {authUser.id}</p>
          </div>
        ) : (
          <div className="text-red-600">
            <p>❌ Not authenticated</p>
            <p>You need to log in to see your data</p>
          </div>
        )}
      </div>

      {/* Data Status */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Data Status</h3>
        {isLoading ? (
          <p>Loading data...</p>
        ) : error ? (
          <div className="text-red-600">
            <p>❌ Error loading data:</p>
            <pre className="text-sm mt-2 bg-red-50 p-2 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-green-600">
            <p>✅ Data loaded successfully</p>
            <p>Total daily logs: {dailyLogs?.length || 0}</p>
            {dailyLogs?.length > 0 && (
              <div className="mt-2">
                <p>Latest entry: {dailyLogs[dailyLogs.length - 1]?.log_date}</p>
                <p>Earliest entry: {dailyLogs[0]?.log_date}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sample Data */}
      {dailyLogs?.length > 0 && (
        <div className="mb-6 p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Sample Data (Latest 3 entries)</h3>
          <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(dailyLogs.slice(-3), null, 2)}
          </pre>
        </div>
      )}

      {/* Environment Check */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Environment Check</h3>
        <div className="text-sm">
          <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border rounded bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="space-y-2">
          {!authUser && (
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          )}
          {authUser && dailyLogs?.length === 0 && (
            <button 
              onClick={() => window.location.href = '/log'} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create First Daily Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugDashboard;