// src/components/CompanyNewsMonitor.tsx
import { useState, useCallback } from 'react';
import { CompanyInput } from './CompanyInput';
import { NewsTable } from './NewsTable';
import { LoadingSpinner } from './LoadingSpinner';

// Define interfaces
interface NewsItem {
  date: string;
  company: string;
  summary: string;
  sentiment: string;
  links: string[];
  cached?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: NewsItem[];
  message: string;
  error?: string;
}

export const CompanyNewsMonitor = () => {
  // State management
  const [companies, setCompanies] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Function to handle news fetching
  const handleFetchNews = useCallback(async (forceRefresh: boolean) => {
    // Reset states
    setLoading(true);
    setError(null);
    setNewsData([]);
    setProgress('');
    
    try {
      console.log('Starting fetch request...');
      
      // Filter out empty company names
      const validCompanies = companies.filter(company => company.trim() !== '');
      
      if (validCompanies.length === 0) {
        throw new Error('Please enter at least one company name');
      }

      console.log('Sending request with data:', {
        companies: validCompanies,
        force_refresh: forceRefresh
      });

      // Make the API request
      const response = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          companies: validCompanies,
          force_refresh: forceRefresh 
        }),
      });

      console.log('Response received:', response.status);
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // Parse response
      const result: ApiResponse = await response.json();
      console.log('Received data:', result);

      // Validate response format
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response format from server');
      }

      // Update state with news data
      const sortedData = [...result.data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNewsData(sortedData);
      
      // Show message if no news found
      if (result.data.length === 0) {
        setError('No news found for the specified companies');
      }

    } catch (err) {
      console.error('Error details:', err);
      
      // Handle different types of errors
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while fetching news');
      } else {
        setError('An unexpected error occurred');
      }
      
      // Clear any partial data on error
      setNewsData([]);
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [companies]);

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Company News Monitor</h2>
        <CompanyInput 
          companies={companies}
          setCompanies={setCompanies}
          onFetch={handleFetchNews}
          loading={loading}
        />
      </div>

      {/* Progress indicator */}
      {progress && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-blue-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{progress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {loading && <LoadingSpinner />}

      {/* News results */}
      {newsData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            News Results {loading && '(Loading more...)'}
          </h2>
          <NewsTable newsData={newsData} />
        </div>
      )}

      {/* No results message */}
      {!loading && !error && newsData.length === 0 && companies[0].trim() !== '' && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
          <p className="text-sm text-gray-700">
            No news found. Try searching for a different company or time period.
          </p>
        </div>
      )}
    </div>
  );
};