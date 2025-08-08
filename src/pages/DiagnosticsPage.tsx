import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAllDailyLogs } from '../lib/daily-logs';
import { useToast } from '../components/ui/toast';
import DebugDashboard from '../components/DebugDashboard';

interface DatabaseInfo {
  totalRecords: number;
  dateRange: { start: string; end: string } | null;
  sampleRecords: any[];
  fieldCounts: Record<string, number>;
  recentRecords: any[];
}

export default function DiagnosticsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setConnectionStatus('error');
        error('Authentication Error', 'No user found. Please log in.');
        return;
      }

      // Test basic connection
      const { data, error: dbError } = await supabase
        .from('daily_logs')
        .select('count', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (dbError) {
        setConnectionStatus('error');
        error('Database Error', `Connection failed: ${dbError.message}`);
        return;
      }

      setConnectionStatus('connected');
      success('Connected!', 'Successfully connected to Supabase database.');
    } catch (err) {
      setConnectionStatus('error');
      error('Connection Error', `Failed to connect: ${err}`);
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        error('Authentication Error', 'Please log in to run diagnostics.');
        return;
      }

      // Get all logs using our existing function
      const allLogs = await getAllDailyLogs();
      
      // Get raw data directly from Supabase for comparison
      const { data: rawData, error: rawError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });

      if (rawError) {
        error('Database Error', `Failed to fetch raw data: ${rawError.message}`);
        return;
      }

      // Analyze the data
      const info: DatabaseInfo = {
        totalRecords: rawData?.length || 0,
        dateRange: null,
        sampleRecords: rawData?.slice(0, 3) || [],
        fieldCounts: {},
        recentRecords: rawData?.slice(0, 10) || [],
      };

      // Calculate date range
      if (rawData && rawData.length > 0) {
        const dates = rawData.map(r => r.log_date).filter(Boolean).sort();
        if (dates.length > 0) {
          info.dateRange = {
            start: dates[0],
            end: dates[dates.length - 1]
          };
        }
      }

      // Count non-null fields
      if (rawData) {
        const fields = ['coffee', 'morning_walk', 'breakfast', 'phone_on_wake', 'water_bottles_count', 
                       'soda', 'alcohol', 'dabs_count', 'smoke', 'netflix_in_bed', 'brushed_teeth_night', 
                       'washed_face_night', 'workout', 'calories', 'day_rating', 'pages_read_count', 'weight_lbs'];
        
        fields.forEach(field => {
          info.fieldCounts[field] = rawData.filter(record => 
            record[field] !== null && record[field] !== undefined && record[field] !== ''
          ).length;
        });
      }

      setDbInfo(info);
      success('Diagnostics Complete!', `Found ${info.totalRecords} records in database.`);

    } catch (err) {
      error('Diagnostics Failed', `Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testDataSync = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a test record
      const testRecord = {
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        coffee: true,
        morning_walk: false,
        breakfast: true,
        phone_on_wake: false,
      };

      const { data, error: insertError } = await supabase
        .from('daily_logs')
        .upsert(testRecord, { onConflict: 'user_id, log_date' })
        .select();

      if (insertError) {
        error('Sync Test Failed', `Insert error: ${insertError.message}`);
        return;
      }

      // Try to read it back
      const { data: readData, error: readError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', testRecord.log_date)
        .single();

      if (readError) {
        error('Sync Test Failed', `Read error: ${readError.message}`);
        return;
      }

      success('Sync Test Passed!', 'Successfully wrote and read test data from Supabase.');
      
      // Refresh diagnostics
      runDiagnostics();

    } catch (err) {
      error('Sync Test Failed', `Error: ${err}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Database Diagnostics</h1>
          <p className="text-gray-600 mt-2">Verify Supabase connection and data sync.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>

      {/* Debug Dashboard */}
      <div className="mb-8">
        <DebugDashboard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-2 mb-4">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Checking connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Connected to Supabase</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Connection Failed</span>
              </>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={checkConnection}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Test Connection
            </button>
            <button
              onClick={testDataSync}
              disabled={connectionStatus !== 'connected'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test Data Sync
            </button>
          </div>
        </div>

        {/* Diagnostics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Database Analysis</h2>
          <button
            onClick={runDiagnostics}
            disabled={loading || connectionStatus !== 'connected'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 mb-4"
          >
            {loading ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>

          {dbInfo && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Records:</span>
                <span className="font-medium">{dbInfo.totalRecords}</span>
              </div>
              {dbInfo.dateRange && (
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-medium">{dbInfo.dateRange.start} to {dbInfo.dateRange.end}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {dbInfo && (
        <div className="mt-6 space-y-6">
          {/* Field Counts */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Field Data Counts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(dbInfo.fieldCounts).map(([field, count]) => (
                <div key={field} className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">{field}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Records */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Records (Last 10)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Coffee</th>
                    <th className="text-left p-2">Walk</th>
                    <th className="text-left p-2">Breakfast</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Water</th>
                  </tr>
                </thead>
                <tbody>
                  {dbInfo.recentRecords.map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{record.log_date}</td>
                      <td className="p-2">{record.coffee ? '✅' : '❌'}</td>
                      <td className="p-2">{record.morning_walk ? '✅' : '❌'}</td>
                      <td className="p-2">{record.breakfast ? '✅' : '❌'}</td>
                      <td className="p-2">{record.phone_on_wake ? '✅' : '❌'}</td>
                      <td className="p-2">{record.water_bottles_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Raw Data */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sample Raw Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(dbInfo.sampleRecords.slice(0, 2), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}