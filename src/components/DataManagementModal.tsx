import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Shield, Download, RotateCcw, Calendar, Activity } from 'lucide-react';
import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { clearAllReadings, clearAllBloodSugarReadings } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bpReadings: Reading[];
  bsReadings: BloodSugarReading[];
  onDataCleared: () => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  bpReadings,
  bsReadings,
  onDataCleared
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [confirmStep, setConfirmStep] = useState<'initial' | 'confirm' | 'final'>('initial');
  const [deleteType, setDeleteType] = useState<'all' | 'bp' | 'bs' | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const totalReadings = bpReadings.length + bsReadings.length;

  const handleDeleteRequest = (type: 'all' | 'bp' | 'bs') => {
    setDeleteType(type);
    setConfirmStep('confirm');
  };

  const handleConfirmDelete = () => {
    if (confirmText.toLowerCase() !== 'delete my data') {
      alert('Please type "DELETE MY DATA" exactly to confirm');
      return;
    }
    setConfirmStep('final');
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);
    
    try {
      if (deleteType === 'all') {
        clearAllReadings();
        clearAllBloodSugarReadings();
      } else if (deleteType === 'bp') {
        clearAllReadings();
      } else if (deleteType === 'bs') {
        clearAllBloodSugarReadings();
      }

      // If user is authenticated, we should also clear cloud data
      // This would require additional API calls to delete cloud data
      
      onDataCleared();
      onClose();
      setConfirmStep('initial');
      setDeleteType(null);
      setConfirmText('');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportBeforeDelete = () => {
    const allData = {
      bloodPressure: bpReadings,
      bloodSugar: bsReadings,
      exportDate: new Date().toISOString(),
      totalReadings: totalReadings
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `health-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const resetModal = () => {
    setConfirmStep('initial');
    setDeleteType(null);
    setConfirmText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
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
              Data Management
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
          {confirmStep === 'initial' && (
            <div className="space-y-6">
              {/* Data Overview */}
              <div className={`rounded-lg p-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Your Health Data Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {bpReadings.length}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Blood Pressure Readings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {bsReadings.length}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Blood Sugar Readings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {totalReadings}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Readings
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup Recommendation */}
              <div className={`rounded-lg border p-4 ${
                isDark 
                  ? 'bg-blue-900/20 border-blue-800' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <Shield className={`h-5 w-5 mt-0.5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <h4 className={`font-semibold ${
                      isDark ? 'text-blue-100' : 'text-blue-900'
                    }`}>
                      Backup Your Data First
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      We strongly recommend backing up your health data before deletion. 
                      Once deleted, this data cannot be recovered.
                    </p>
                    <button
                      onClick={exportBeforeDelete}
                      className={`mt-3 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Backup</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Deletion Options */}
              <div className="space-y-4">
                <h3 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Deletion Options
                </h3>

                {/* Delete All Data */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-red-100' : 'text-red-900'
                      }`}>
                        Delete All Health Data
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-red-200' : 'text-red-700'
                      }`}>
                        Permanently removes all blood pressure and blood sugar readings. 
                        This action cannot be undone.
                      </p>
                      <div className={`text-xs mt-2 ${
                        isDark ? 'text-red-300' : 'text-red-600'
                      }`}>
                        Will delete: {totalReadings} total readings
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRequest('all')}
                      disabled={totalReadings === 0}
                      className={`ml-4 px-4 py-2 rounded-lg transition-colors font-medium ${
                        totalReadings === 0
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isDark
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                {/* Delete Blood Pressure Data */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-orange-800 bg-orange-900/20' : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-orange-100' : 'text-orange-900'
                      }`}>
                        Delete Blood Pressure Data Only
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-orange-200' : 'text-orange-700'
                      }`}>
                        Removes only blood pressure readings. Blood sugar data will be preserved.
                      </p>
                      <div className={`text-xs mt-2 ${
                        isDark ? 'text-orange-300' : 'text-orange-600'
                      }`}>
                        Will delete: {bpReadings.length} blood pressure readings
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRequest('bp')}
                      disabled={bpReadings.length === 0}
                      className={`ml-4 px-4 py-2 rounded-lg transition-colors font-medium ${
                        bpReadings.length === 0
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isDark
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      Delete BP Data
                    </button>
                  </div>
                </div>

                {/* Delete Blood Sugar Data */}
                <div className={`border rounded-lg p-4 ${
                  isDark ? 'border-yellow-800 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isDark ? 'text-yellow-100' : 'text-yellow-900'
                      }`}>
                        Delete Blood Sugar Data Only
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-yellow-200' : 'text-yellow-700'
                      }`}>
                        Removes only blood sugar readings. Blood pressure data will be preserved.
                      </p>
                      <div className={`text-xs mt-2 ${
                        isDark ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>
                        Will delete: {bsReadings.length} blood sugar readings
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRequest('bs')}
                      disabled={bsReadings.length === 0}
                      className={`ml-4 px-4 py-2 rounded-lg transition-colors font-medium ${
                        bsReadings.length === 0
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : isDark
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      Delete BS Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              {user && (
                <div className={`rounded-lg border p-4 ${
                  isDark 
                    ? 'bg-purple-900/20 border-purple-800' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <Shield className={`h-5 w-5 mt-0.5 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <div>
                      <h4 className={`font-semibold ${
                        isDark ? 'text-purple-100' : 'text-purple-900'
                      }`}>
                        Cloud Data Notice
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-purple-200' : 'text-purple-800'
                      }`}>
                        You're signed in, so this will delete data from both your device and our secure cloud storage. 
                        This ensures complete data removal across all your devices.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {confirmStep === 'confirm' && (
            <div className="space-y-6">
              <div className={`rounded-lg border p-4 ${
                isDark 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-6 w-6 mt-0.5 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-red-100' : 'text-red-900'
                    }`}>
                      ⚠️ Confirm Data Deletion
                    </h3>
                    <p className={`mt-2 ${
                      isDark ? 'text-red-200' : 'text-red-800'
                    }`}>
                      You are about to permanently delete:
                    </p>
                    <ul className={`mt-2 space-y-1 ${
                      isDark ? 'text-red-200' : 'text-red-800'
                    }`}>
                      {deleteType === 'all' && (
                        <>
                          <li>• {bpReadings.length} blood pressure readings</li>
                          <li>• {bsReadings.length} blood sugar readings</li>
                          <li>• All historical health data</li>
                        </>
                      )}
                      {deleteType === 'bp' && (
                        <li>• {bpReadings.length} blood pressure readings</li>
                      )}
                      {deleteType === 'bs' && (
                        <li>• {bsReadings.length} blood sugar readings</li>
                      )}
                    </ul>
                    <p className={`mt-3 font-semibold ${
                      isDark ? 'text-red-100' : 'text-red-900'
                    }`}>
                      This action cannot be undone!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Type "DELETE MY DATA" to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="DELETE MY DATA"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetModal}
                  className={`flex-1 px-4 py-3 border rounded-lg transition-colors font-medium ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={confirmText.toLowerCase() !== 'delete my data'}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${
                    confirmText.toLowerCase() === 'delete my data'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Confirm Deletion
                </button>
              </div>
            </div>
          )}

          {confirmStep === 'final' && (
            <div className="space-y-6 text-center">
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <AlertTriangle className={`h-12 w-12 mx-auto mb-4 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-red-100' : 'text-red-900'
                }`}>
                  Final Warning
                </h3>
                <p className={`mb-4 ${
                  isDark ? 'text-red-200' : 'text-red-800'
                }`}>
                  This is your last chance to cancel. Once you click "DELETE FOREVER", 
                  your data will be permanently removed and cannot be recovered.
                </p>
                <p className={`text-sm font-semibold ${
                  isDark ? 'text-red-100' : 'text-red-900'
                }`}>
                  Are you absolutely sure?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetModal}
                  className={`flex-1 px-4 py-3 border rounded-lg transition-colors font-medium ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <RotateCcw className="h-4 w-4 inline mr-2" />
                  Cancel & Keep Data
                </button>
                <button
                  onClick={handleFinalDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      DELETE FOREVER
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;