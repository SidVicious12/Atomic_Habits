import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importHistoricalData, parseCSV, createSampleData, type ImportResult } from '../lib/data-importer';
import { importCSVToSupabase } from '../lib/csv-importer';
import { useToast } from '../components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query';

export default function ImportPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileContent, setFileContent] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async (data: any[]) => {
    if (data.length === 0) {
      error('No data to import', 'Please upload a file or generate sample data first.');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importHistoricalData(data);
      setImportResult(result);
      
      // Invalidate all daily log queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
      
      if (result.errors === 0) {
        success('Import completed!', `Successfully imported ${result.success} records. Data should appear in charts now.`);
      } else {
        error('Import completed with errors', `${result.success} successful, ${result.errors} failed.`);
      }
    } catch (err) {
      error('Import failed', `Error: ${err}`);
    } finally {
      setImporting(false);
    }
  };

  const handleJSONImport = () => {
    try {
      const data = JSON.parse(fileContent);
      const dataArray = Array.isArray(data) ? data : [data];
      handleImport(dataArray);
    } catch (err) {
      error('Invalid JSON', 'Please check your JSON format.');
    }
  };

  const handleCSVImport = async () => {
    if (!fileContent) {
      error('No file content', 'Please upload a CSV file first.');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      console.log('🚀 Starting CSV import with new importer...');
      const result = await importCSVToSupabase(fileContent);
      
      // Invalidate all daily log queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
      
      // Convert to the format expected by the UI
      const importResult: ImportResult = {
        success: result.imported,
        errors: result.errors.length,
        details: [
          `📊 Total rows processed: ${result.summary.totalRowsProcessed || 0}`,
          `✅ Valid rows found: ${result.summary.validRowsFound || 0}`,
          `💾 Records imported: ${result.imported}`,
          result.summary.dateRange ? `📅 Date range: ${result.summary.dateRange.earliest} to ${result.summary.dateRange.latest}` : '',
          ...result.errors.map(err => `❌ ${err}`)
        ].filter(Boolean)
      };
      
      setImportResult(importResult);
      
      if (result.success) {
        success(
          'CSV Import Successful! 🎉', 
          `Imported ${result.imported} records from your CSV file. Charts should now display your historical data!`
        );
      } else {
        error('CSV Import Failed', result.errors.join(', '));
      }
    } catch (err) {
      console.error('CSV import error:', err);
      error('CSV Import Failed', `Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleSampleImport = () => {
    const sampleData = createSampleData();
    handleImport(sampleData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Import Historical Data</h1>
          <p className="text-gray-600 mt-2">Import your existing habit data into Supabase.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Data File</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                  Select JSON or CSV file
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {fileContent && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-1">✅ File loaded successfully!</p>
                    <p className="text-xs text-green-600">
                      Size: {(fileContent.length / 1024).toFixed(1)}KB | 
                      Lines: {fileContent.split('\n').length}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">🎯 Your Daily's CSV Format</h3>
                      <p className="text-xs text-blue-600 mb-3">
                        Detected format with Date, Coffee, Breakfast, Netflix, Phone usage, etc.
                        This will automatically map to your database fields.
                      </p>
                      <button
                        onClick={handleCSVImport}
                        disabled={importing}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {importing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Importing CSV...
                          </>
                        ) : (
                          <>
                            📊 Import Your Daily's CSV
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Alternative Formats</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handleJSONImport}
                          disabled={importing}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                          Try as JSON
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const data = parseCSV(fileContent);
                              handleImport(data);
                            } catch (err) {
                              error('Invalid CSV', 'Please check your CSV format.');
                            }
                          }}
                          disabled={importing}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                          Try Generic CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample Data Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Generate Sample Data</h2>
            <p className="text-gray-600 mb-4">
              Create 7 days of sample habit data for testing.
            </p>
            <button
              onClick={handleSampleImport}
              disabled={importing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Generate & Import Sample Data'}
            </button>
          </div>
        </div>

        {/* Instructions and Results */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Data Format</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">JSON Format:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`[
  {
    "log_date": "2024-08-02",
    "coffee": true,
    "morning_walk": false,
    "breakfast": true,
    "water_bottles_count": 5,
    "pages_read_count": 10
  }
]`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Your CSV Format (Daily's Sheet):</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`Year,Date,Day,Coffee,Breakfast,# of Dabs,# of Bottles of Water Drank?
2016,11/14/2016,Monday,Yes,No,0,0
2016,11/15/2016,Tuesday,Yes,No,0,0`}
                </pre>
                <p className="text-xs text-gray-600 mt-1">
                  ✅ Automatically converts Yes/No → true/false, dates, and maps all your fields
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Standard CSV Format:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`log_date,coffee,morning_walk,breakfast
2024-08-02,true,false,true
2024-08-01,false,true,true`}
                </pre>
              </div>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Import Results</h2>
              <div className="space-y-2">
                <p className="text-green-600">✅ Successful: {importResult.success}</p>
                <p className="text-red-600">❌ Errors: {importResult.errors}</p>
                
                {importResult.details.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Details:</h3>
                    <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
                      {importResult.details.map((detail, index) => (
                        <p key={index} className="text-xs mb-1">{detail}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supported Fields */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Supported Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-orange-600 mb-2">☀️ Morning</h3>
            <ul className="space-y-1">
              <li>time_awake</li>
              <li>coffee</li>
              <li>morning_walk</li>
              <li>breakfast</li>
              <li>phone_on_wake</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-600 mb-2">🌐 Intake</h3>
            <ul className="space-y-1">
              <li>water_bottles_count</li>
              <li>soda</li>
              <li>alcohol</li>
              <li>dabs_count</li>
              <li>smoke</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-purple-600 mb-2">🌙 Night</h3>
            <ul className="space-y-1">
              <li>bed_time</li>
              <li>netflix_in_bed</li>
              <li>brushed_teeth_night</li>
              <li>washed_face_night</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-600 mb-2">⚡ Fitness & Wellness</h3>
            <ul className="space-y-1">
              <li>workout</li>
              <li>calories</li>
              <li>day_rating</li>
              <li>pages_read_count</li>
              <li>weight_lbs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}