// src/components/NewsTable.tsx
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface NewsItem {
  date: string;
  company: string;
  summary: string;
  sentiment: string;
  links: string[];
  cached?: boolean;
}

interface NewsTableProps {
  newsData: NewsItem[];
}

export const NewsTable = ({ newsData }: NewsTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 font-medium';
      case 'negative':
        return 'text-red-600 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    });
  };

  const sortedData = [...newsData].sort((a: any, b: any) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              { key: 'date', label: 'Date' },
              { key: 'company', label: 'Company' },
              { key: 'summary', label: 'Summary' },
              { key: 'sentiment', label: 'Sentiment' }
            ].map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sources
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((news, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {new Date(news.date).toLocaleDateString()}
                {news.cached && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                    Cached
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {news.company}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="max-w-2xl">{news.summary}</div>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSentimentColor(news.sentiment)}`}>
                {news.sentiment}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  {news.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 block"
                    >
                      Source {i + 1}
                    </a>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};