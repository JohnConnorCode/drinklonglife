'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface ProductsToolbarProps {
  totalCount: number;
}

export function ProductsToolbar({ totalCount }: ProductsToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/export/products');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the CSV content
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export products. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-6 flex gap-4 items-center">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </>
        )}
      </button>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        {totalCount} product{totalCount !== 1 ? 's' : ''} ready for export
      </div>
    </div>
  );
}
