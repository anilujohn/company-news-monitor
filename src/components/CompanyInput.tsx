// src/components/CompanyInput.tsx
import { Plus, Trash2, RefreshCw } from 'lucide-react';

interface CompanyInputProps {
  companies: string[];
  setCompanies: (companies: string[]) => void;
  onFetch: (forceRefresh: boolean) => void;
  loading: boolean;
}

export const CompanyInput = ({ companies, setCompanies, onFetch, loading }: CompanyInputProps) => {
  const handleAddCompany = () => {
    setCompanies([...companies, '']);
  };

  const handleRemoveCompany = (index: number) => {
    const newCompanies = companies.filter((_, i) => i !== index);
    setCompanies(newCompanies);
  };

  const handleCompanyChange = (index: number, value: string) => {
    const newCompanies = [...companies];
    newCompanies[index] = value;
    setCompanies(newCompanies);
  };

  return (
    <div className="space-y-4">
      {companies.map((company, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter company name (e.g., Apple Inc)"
            value={company}
            onChange={(e) => handleCompanyChange(index, e.target.value)}
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {companies.length > 1 && (
            <button
              onClick={() => handleRemoveCompany(index)}
              className="p-2 text-red-500 hover:text-red-700 rounded-md"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
      
      <div className="flex justify-between pt-4">
        <button
          onClick={handleAddCompany}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
        
        <div className="space-x-2">
          <button
            onClick={() => onFetch(false)}
            disabled={loading || companies.every(c => !c.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Fetch News'}
          </button>
          
          <button
            onClick={() => onFetch(true)}
            disabled={loading || companies.every(c => !c.trim())}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  );
};