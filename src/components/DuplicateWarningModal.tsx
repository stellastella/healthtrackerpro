import React from 'react';
import { X, AlertTriangle, Clock, Activity, CheckCircle } from 'lucide-react';
import { formatDuplicateDetails } from '../utils/duplicateDetection';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicateEntry: any;
  newEntry: any;
  type: 'bp' | 'bs';
  message: string;
  isExactDuplicate: boolean;
}

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  duplicateEntry,
  newEntry,
  type,
  message,
  isExactDuplicate
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    if (isExactDuplicate) {
      return '🚫 Exact Duplicate Detected';
    }
    return '⚠️ Similar Entry Found';
  };

  const getDescription = () => {
    if (isExactDuplicate) {
      return 'This entry appears to be an exact duplicate of an existing reading. Adding duplicate entries can affect your health analytics and trends.';
    }
    return 'A similar entry with the same core values but different additional information was found. This might be intentional (e.g., multiple readings at the same time) or accidental.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isExactDuplicate 
                ? 'bg-red-100 dark:bg-red-900' 
                : 'bg-orange-100 dark:bg-orange-900'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                isExactDuplicate 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className={`p-4 rounded-lg border-l-4 ${
            isExactDuplicate 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600' 
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600'
          }`}>
            <p className={`text-sm ${
              isExactDuplicate 
                ? 'text-red-800 dark:text-red-200' 
                : 'text-orange-800 dark:text-orange-200'
            }`}>
              <strong>{message}</strong>
            </p>
            <p className={`text-xs mt-2 ${
              isExactDuplicate 
                ? 'text-red-700 dark:text-red-300' 
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              {getDescription()}
            </p>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Existing Entry */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Existing Entry</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-mono">
                  {formatDuplicateDetails(duplicateEntry, type)}
                </pre>
              </div>
            </div>

            {/* New Entry */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">New Entry</h3>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap font-mono">
                  {formatDuplicateDetails(newEntry, type)}
                </pre>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              Recommendations
            </h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {isExactDuplicate ? (
                <>
                  <p>• <strong>Cancel:</strong> Don't add this duplicate entry to maintain data accuracy</p>
                  <p>• <strong>Review:</strong> Check if you meant to edit the existing entry instead</p>
                  <p>• <strong>Verify:</strong> Ensure this isn't an accidental re-submission</p>
                </>
              ) : (
                <>
                  <p>• <strong>Multiple readings:</strong> If you took multiple readings at the same time, this might be intentional</p>
                  <p>• <strong>Different conditions:</strong> If circumstances changed (medication, symptoms), adding both entries could be valuable</p>
                  <p>• <strong>Data accuracy:</strong> Consider if both entries provide unique health information</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium shadow-md ${
                isExactDuplicate
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isExactDuplicate ? 'Add Anyway' : 'Add Both Entries'}
            </button>
          </div>

          {/* Additional Warning for Exact Duplicates */}
          {isExactDuplicate && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Adding exact duplicates may affect the accuracy of your health analytics and trends
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;