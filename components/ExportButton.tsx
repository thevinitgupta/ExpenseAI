'use client';

import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { downloadCSV, type Expense } from '@/lib/storage';
import { logError } from '@/lib/logger';

interface ExportButtonProps {
  expenses: Expense[];
}

export default function ExportButton({ expenses }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      downloadCSV(expenses);
      // Show success message
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      logError('Export failed for Expenses:', {error});
      alert('Failed to export expenses');
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const jsonStr = JSON.stringify(expenses, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsExporting(false);
      }, 1000); // TODO : Update this to be better instead of timeout
    } catch (error) {
      logError('Export failed:', {error});
      alert('Failed to export expenses');
      setIsExporting(false);
    }
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Your Data</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Export as CSV</div>
            <div className="text-xs text-green-100">Open in Excel/Sheets</div>
          </div>
          {!isExporting && <Download className="w-5 h-5 ml-auto" />}
          {isExporting && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-auto"></div>
          )}
        </button>

        {/* JSON Export */}
        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Table className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Export as JSON</div>
            <div className="text-xs text-blue-100">Developer format</div>
          </div>
          {!isExporting && <Download className="w-5 h-5 ml-auto" />}
          {isExporting && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-auto"></div>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Note:</strong> Your data is stored locally on this device. Export regularly to backup your expenses.
        </p>
      </div>

      {/* Future Backend Option */}
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">☁️</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">Cloud Backup (Coming Soon)</h4>
            <p className="text-sm text-gray-700 mb-2">
              Want to sync your expenses across devices? We're working on cloud backup feature!
            </p>
            <button 
              disabled
              className="text-xs px-3 py-1.5 bg-purple-200 text-purple-800 rounded-md cursor-not-allowed opacity-60"
            >
              Enable Cloud Sync (Future)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}