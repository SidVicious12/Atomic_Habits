"use client";

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DataTableProps {
  data: any[];
  columns: { key: string; title: string; }[];
}

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
} | null;

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'log_date', direction: 'descending' });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="inline-block ml-1 h-4 w-4" />;
    }
    return <ArrowDown className="inline-block ml-1 h-4 w-4" />;
  };

  const formatCell = (item: any, columnKey: string) => {
    const value = item[columnKey];
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (columnKey === 'log_date') {
      try {
        return format(parseISO(value), 'MMM d, yyyy');
      } catch (e) {
        return value;
      }
    }
    return value;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort(col.key)}
                >
                  {col.title}
                  {getSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index}>
                {columns.map(col => (
                   <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatCell(item, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
