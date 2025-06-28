import React, { useState } from 'react';
import { X, Trash2, Calendar, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { useTheme } from '../contexts/ThemeContext';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: (Reading | BloodSugarReading)[];
  type: 'bp' | 'bs';
  onDelete: (ids: string[]) => void;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  readings,
  type,
  onDelete
}) => {
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

  if (!isOpen) return null;

  const getFilteredReadings = () => {
    if (dateFilter === 'all') return readings;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (dateFilter) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return readings.filter(reading => new Date(reading.timestamp) >= cutoff);
  };

  const filteredReadings = getFilteredReadings();

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredReadings.map(r => r.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} selected reading${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      onDelete(Array.from(selectedIds));
      onClose();
      setSelectedIds(new Set());
    }
  };

  const formatReading = (reading: Reading | BloodSugarReading) => {
    const date = new Date(reading.timestamp).toLocaleDateString();
    const time = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'bp') {
      const bpReading = reading as Reading;
      return `${bpReading.systolic}/${bpReading.diastolic} mmHg`;
    } else {
      const bsReading = reading as BloodSugarReading;
      return `${bsReading.glucose} mg/dL (${bsReading.testType})`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-red-900' : 'bg-red-100'
            }`}>
              <Trash2 className={`h-5 w-5 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Bulk Delete {type === 'bp' ? 'Blood Pressure' : 'Blood Sugar'} Readings
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className={`h-4 w-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {filteredReadings.length} readings
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={selectAll}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Select None
              </button>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedIds.size > 0 && (
            <div className={`rounded-lg border p-4 mb-4 ${
              isDark 
                ? 'bg-orange-900/20 border-orange-800' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                  <span className={`font-medium ${
                    isDark ? 'text-orange-100' : 'text-orange-900'
                  }`}>
                    {selectedIds.size} reading{selectedIds.size > 1 ? 's' : ''} selected for deletion
                  </span>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Readings List */}
          <div className={`border rounded-lg max-h-96 overflow-y-auto ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          }`}>
            {filteredReadings.length === 0 ? (
              <div className="p-8 text-center">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No readings found for the selected time period.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredReadings.map((reading) => (
                  <div
                    key={reading.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedIds.has(reading.id) 
                        ? isDark ? 'bg-blue-900/20' : 'bg-blue-50' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleSelection(reading.id)}
                        className={`flex-shrink-0 ${
                          selectedIds.has(reading.id)
                            ? isDark ? 'text-blue-400' : 'text-blue-600'
                            : isDark ? 'text-gray-400' : 'text-gray-400'
                        }`}
                      >
                        {selectedIds.has(reading.id) ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatReading(reading)}
                            </div>
                            <div className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {new Date(reading.timestamp).toLocaleDateString()} at{' '}
                              {new Date(reading.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          
                          {(reading.notes || reading.symptoms) && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              Has notes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {selectedIds.size} of {filteredReadings.length} readings selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={selectedIds.size === 0}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  selectedIds.size > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                Delete {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;