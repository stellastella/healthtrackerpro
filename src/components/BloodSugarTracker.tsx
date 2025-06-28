import React, { useState, useEffect } from 'react';
import { Droplets, Plus, TrendingUp, Calendar, Download, Activity, Share2, BarChart3, Home, Moon, Sun, Upload, Target, Trash2, Settings } from 'lucide-react';
import BloodSugarForm from './BloodSugarForm';
import BloodSugarList from './BloodSugarList';
import BloodSugarStatistics from './BloodSugarStatistics';
import BloodSugarTrendChart from './BloodSugarTrendChart';
import BloodSugarAnalytics from './BloodSugarAnalytics';
import BloodSugarRecommendations from './BloodSugarRecommendations';
import HealthAlertsPanel from './HealthAlertsPanel';
import ImportModal from './ImportModal';
import ShareModal from './ShareModal';
import DataManagementModal from './DataManagementModal';
import BulkDeleteModal from './BulkDeleteModal';
import BoltBadge from './BoltBadge';
import { BloodSugarReading } from '../types/BloodSugar';
import { Reading } from '../types/Reading';
import { getStoredBloodSugarReadings, saveBloodSugarReadings, getStoredReadings } from '../utils/storage';
import { categorizeGlucose } from '../utils/bloodSugar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCloudSync } from '../hooks/useCloudSync';

interface BloodSugarTrackerProps {
  onBackToHome: () => void;
}

const BloodSugarTracker: React.FC<BloodSugarTrackerProps> = ({ onBackToHome }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { syncing, lastSyncTime, createBSReading, deleteBSReading } = useCloudSync();
  const [readings, setReadings] = useState<BloodSugarReading[]>([]);
  const [bpReadings, setBpReadings] = useState<Reading[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'trends' | 'analytics' | 'recommendations'>('overview');

  useEffect(() => {
    const stored = getStoredBloodSugarReadings();
    const storedBP = getStoredReadings();
    setReadings(stored);
    setBpReadings(storedBP);
  }, []);

  const addReading = async (reading: Omit<BloodSugarReading, 'id'> & { timestamp?: string }) => {
    try {
      const readingData = {
        ...reading,
        timestamp: reading.timestamp || new Date().toISOString(),
      };
      
      const newReading = await createBSReading(readingData);
      
      const updatedReadings = [newReading, ...readings];
      // Sort by timestamp descending (newest first)
      updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setReadings(updatedReadings);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding reading:', error);
      
      // Check if it's a duplicate error
      if (error.message && (error.message.includes('Duplicate') || error.message.includes('Similar'))) {
        alert(error.message);
      } else {
        alert('Failed to save reading. Please try again.');
      }
    }
  };

  const deleteReading = async (id: string) => {
    try {
      await deleteBSReading(id);
      const updatedReadings = readings.filter(r => r.id !== id);
      setReadings(updatedReadings);
    } catch (error) {
      console.error('Error deleting reading:', error);
      alert('Failed to delete reading. Please try again.');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      // Delete each reading
      for (const id of ids) {
        await deleteBSReading(id);
      }
      
      // Update local state
      const updatedReadings = readings.filter(r => !ids.includes(r.id));
      setReadings(updatedReadings);
      
      alert(`Successfully deleted ${ids.length} reading${ids.length > 1 ? 's' : ''}.`);
    } catch (error) {
      console.error('Error bulk deleting readings:', error);
      alert('Failed to delete some readings. Please try again.');
    }
  };

  const handleImport = (importedData: BloodSugarReading[]) => {
    const updatedReadings = [...importedData, ...readings];
    // Sort by timestamp descending (newest first)
    updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setReadings(updatedReadings);
    saveBloodSugarReadings(updatedReadings);
    setShowImportModal(false);
  };

  const handleDataCleared = () => {
    // Refresh data after clearing
    const stored = getStoredBloodSugarReadings();
    setReadings(stored);
    
    // Show success message
    alert('Data has been successfully deleted.');
  };

  const exportData = () => {
    setShowShareModal(true);
  };

  const latestReading = readings[0];
  const category = latestReading ? categorizeGlucose(latestReading.glucose, latestReading.testType) : null;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
          : 'bg-white shadow-sm border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToHome}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-900/50 hover:bg-blue-900/70' 
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                <Droplets className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Blood Sugar Monitor
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Advanced glucose tracking & diabetes management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Bolt.new Badge */}
              <BoltBadge />
              
              {/* Cloud Sync Status */}
              {user && (
                <div className="flex items-center space-x-2">
                  {syncing ? (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm hidden sm:inline">Syncing</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <span className="text-sm hidden sm:inline">
                        {lastSyncTime ? `Synced ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Cloud Connected'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={onBackToHome}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">← Back to Home</span>
                <span className="sm:hidden">← Home</span>
              </button>

              {/* Data Management Button */}
              <button
                onClick={() => setShowDataManagement(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Manage Data"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Data</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                disabled={readings.length === 0}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <button
                onClick={exportData}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                disabled={readings.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
                  isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Reading</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`flex space-x-1 p-1 rounded-lg w-fit ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'history', label: 'History', icon: Calendar },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'recommendations', label: 'Recommendations', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? isDark 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Health Alerts Panel */}
            <HealthAlertsPanel 
              bpReadings={bpReadings} 
              bsReadings={readings}
            />

            {/* Current Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Latest Reading Card */}
              <div className="lg:col-span-2">
                <div className={`rounded-2xl shadow-sm border p-6 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Latest Reading
                    </h2>
                    {latestReading && (
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(latestReading.timestamp).toLocaleDateString()} at{' '}
                        {new Date(latestReading.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                  
                  {latestReading ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {latestReading.glucose}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Glucose</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>mg/dL</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                            {latestReading.testType.replace('-', ' ')}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Test Type</div>
                        </div>
                      </div>
                      
                      {category && (
                        <div className="text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            category.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            category.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            category.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {category.label}
                          </span>
                          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.description}
                          </p>
                        </div>
                      )}
                      
                      {(latestReading.mealInfo || latestReading.symptoms || latestReading.notes) && (
                        <div className={`rounded-lg p-3 space-y-2 ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          {latestReading.mealInfo && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">Meal:</span> {latestReading.mealInfo}
                            </p>
                          )}
                          {latestReading.symptoms && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">Symptoms:</span> {latestReading.symptoms}
                            </p>
                          )}
                          {latestReading.notes && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">Notes:</span> {latestReading.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Droplets className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No readings yet</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className={`mt-2 font-medium ${
                          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        Add your first reading
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <BloodSugarStatistics readings={readings} />
              </div>
            </div>

            {/* Recent Readings */}
            {readings.length > 0 && (
              <div className={`rounded-2xl shadow-sm border p-6 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Recent Readings
                  </h2>
                  {readings.length > 5 && (
                    <button
                      onClick={() => setShowBulkDelete(true)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                        isDark 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Bulk Delete</span>
                    </button>
                  )}
                </div>
                <BloodSugarList 
                  readings={readings.slice(0, 5)} 
                  onDelete={deleteReading}
                  showActions={false}
                />
                {readings.length > 5 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`font-medium ${
                        isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      View all {readings.length} readings →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`rounded-2xl shadow-sm border p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reading History
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {readings.length} total readings
                </span>
                {readings.length > 0 && (
                  <button
                    onClick={() => setShowBulkDelete(true)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Bulk Delete</span>
                  </button>
                )}
              </div>
            </div>
            
            {readings.length > 0 ? (
              <BloodSugarList readings={readings} onDelete={deleteReading} />
            ) : (
              <div className="text-center py-12">
                <Calendar className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No readings recorded yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className={`font-medium ${
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Add your first reading
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <BloodSugarTrendChart readings={readings} />
            
            {readings.length < 2 && (
              <div className={`rounded-2xl shadow-sm border p-8 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="text-center">
                  <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Need more data for trends</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Add at least 2 readings to see trend analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <BloodSugarAnalytics readings={readings} />
        )}

        {activeTab === 'recommendations' && (
          <BloodSugarRecommendations readings={readings} />
        )}
      </main>

      {/* Reading Form Modal */}
      {showForm && (
        <BloodSugarForm
          onSave={addReading}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          type="blood-sugar"
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          readings={readings}
          onClose={() => setShowShareModal(false)}
          type="bs"
        />
      )}

      {/* Data Management Modal */}
      {showDataManagement && (
        <DataManagementModal
          isOpen={showDataManagement}
          onClose={() => setShowDataManagement(false)}
          bpReadings={bpReadings}
          bsReadings={readings}
          onDataCleared={handleDataCleared}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <BulkDeleteModal
          isOpen={showBulkDelete}
          onClose={() => setShowBulkDelete(false)}
          readings={readings}
          type="bs"
          onDelete={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default BloodSugarTracker;