import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllDailyLogs } from '../lib/daily-logs';
import { MetricChart } from '../components/MetricChart';
import { DataTable } from '../components/DataTable';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';


// Mapping from URL category name to the metrics and their display titles/colors
const categoryMetricMap = {
  Morning: [
    { key: 'time_awake', title: 'Time Awake', color: '#82ca9d' },
    { key: 'phone_in_bed', title: 'Used Phone in Bed', color: '#ffc658' },
    { key: 'breakfast', title: 'Ate Breakfast', color: '#ff7300' },
    { key: 'coffee_cups', title: 'Coffee Cups', color: '#8884d8' },
  ],
  Intake: [
    { key: 'water_bottles_count', title: 'Water Bottles', color: '#8884d8' },
    { key: 'soda_cans', title: 'Soda Cans', color: '#ff7300' },
    { key: 'alcohol_drinks', title: 'Alcoholic Drinks', color: '#ffc658' },
    { key: 'dabs_count', title: 'Dabs', color: '#82ca9d' },
    { key: 'smoke_vape', title: 'Smoked/Vaped', color: '#d0ed57' },
  ],
  Night: [
    { key: 'bed_time', title: 'Bed Time', color: '#8884d8' },
    { key: 'netflix_in_bed', title: 'Watched Netflix in Bed', color: '#ff7300' },
    { key: 'brushed_teeth', title: 'Brushed Teeth', color: '#82ca9d' },
    { key: 'washed_face', title: 'Washed Face', color: '#ffc658' },
  ],
  Fitness: [
    { key: 'morning_walk', title: 'Morning Walk', color: '#8884d8' },
    { key: 'calories', title: 'Calories Burned', color: '#82ca9d' },
  ],
  Wellness: [
    { key: 'day_rating', title: 'Day Rating (1-10)', color: '#8884d8' },
    { key: 'pages_read_count', title: 'Pages Read', color: '#82ca9d' },
  ],
  Metrics: [
    { key: 'weight_lbs', title: 'Weight (lbs)', color: '#8884d8' },
  ],
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllDailyLogs();
      console.log(`Fetched ${data?.length || 0} daily log entries`);
      setLogs(data || []);
    } catch (err) {
      setError('Failed to fetch daily logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    

    // Set up real-time subscription to daily_logs table
    const subscription = supabase
      .channel('daily_logs_changes')
      .on('postgres_changes', {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'daily_logs'
      }, (payload) => {
        console.log('Daily logs table changed:', payload);
        // Refresh the data when changes occur
        fetchLogs();
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const metricsToShow = categoryMetricMap[categoryName] || [];

  // Define columns for the data table, always including the date
  const tableColumns = [
    { key: 'log_date', title: 'Date' },
    ...metricsToShow,
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{categoryName}</h2>
          <p className="text-sm text-muted-foreground">
            Displaying historical data for the {categoryName} category. ({logs.length} entries)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricsToShow.length > 0 ? (
          metricsToShow.map(metric => (
            <MetricChart 
              key={metric.key} 
              data={logs} 
              metricKey={metric.key} 
              title={metric.title} 
              lineColor={metric.color}
            />
          ))
        ) : (
          <p>No metrics defined for this category.</p>
        )}
      </div>

      {/* Render the sortable data table */}
      {logs.length > 0 && (
        <DataTable data={logs} columns={tableColumns} />
      )}
    </>
  );
};

export default CategoryPage;
