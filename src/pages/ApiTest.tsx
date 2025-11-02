import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { testGeminiConnection } from '../services/testGemini';

const ApiTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const testResult = await testGeminiConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const envVars = {
    'VITE_GOOGLE_API_KEY': import.meta.env.VITE_GOOGLE_API_KEY,
    'VITE_GOOGLE_MAPS_API_KEY': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            API Integration Test
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Environment Variables Status
            </h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm text-gray-700">{key}</span>
                  <div className="flex items-center space-x-2">
                    {value ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Configured ({value.substring(0, 10)}...)
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-red-600">Not configured</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Google Gemini API Test
            </h2>
            <button
              onClick={runTest}
              disabled={testing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <span>Test Gemini API Connection</span>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`p-6 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.success ? 'Test Passed!' : 'Test Failed'}
                  </h3>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-4 rounded border overflow-x-auto">
                    {result.message}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Setup Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Ensure your Google API key is set in the .env file</li>
                  <li>Enable the Generative Language API in Google Cloud Console</li>
                  <li>Restart the development server after changing .env</li>
                  <li>Check browser console (F12) for detailed error messages</li>
                  <li>Verify your API key has no restrictions blocking the API</li>
                </ol>
                <div className="mt-4 space-y-1 text-xs text-blue-700">
                  <p>
                    <strong>Google Cloud Console:</strong>{' '}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      https://console.cloud.google.com
                    </a>
                  </p>
                  <p>
                    <strong>Enable API:</strong> APIs & Services → Library → "Generative Language API" → Enable
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Open browser console (F12) to see detailed diagnostic logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
