import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Plus, TrendingUp, Calendar, Download, Activity, Share2, BarChart3, FileText, Target, Moon, Sun, Upload, LogOut, Cloud, CloudOff, Trash2, Settings } from 'lucide-react';
import HomePage from './components/HomePage';
import ReadingForm from './components/ReadingForm';
import ReadingsList from './components/ReadingsList';
import Statistics from './components/Statistics';
import TrendChart from './components/TrendChart';
import Analytics from './components/Analytics';
import Recommendations from './components/Recommendations';
import ShareModal from './components/ShareModal';
import ImportModal from './components/ImportModal';
import AuthModal from './components/AuthModal';
import DataManagementModal from './components/DataManagementModal';
import BulkDeleteModal from './components/BulkDeleteModal';
import HealthAlertsPanel from './components/HealthAlertsPanel';
import ConsentModal, { ConsentPreferences } from './components/ConsentModal';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import BoltBadge from './components/BoltBadge';
import { Reading, BPCategory } from './types/Reading';
import { BloodSugarReading } from './types/BloodSugar';
import { getStoredReadings, saveReadings, getStoredBloodSugarReadings } from './utils/storage';
import { categorizeBP } from './utils/bloodPressure';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { useCloudSync } from './hooks/useCloudSync';

// Lazy load components that aren't needed immediately
const BloodSugarTracker = lazy(() => import('./components/BloodSugarTracker'));
const BlogHome = lazy(() => import('./components/Blog/BlogHome'));
const BlogPost = lazy(() => import('./components/Blog/BlogPost'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const PrivacyComplianceModal = lazy(() => import('./components/PrivacyComplianceModal'));

// Loading component for Suspense fallback
const LoadingFallback = ({ isDark }: { isDark: boolean }) => (
  <div className={`min-h-screen flex items-center justify-center ${
    isDark ? 'bg-gray-900' : 'bg-white'
  }`}>
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { syncing, lastSyncTime, syncCloudDataToLocal, createBPReading, deleteBPReading } = useCloudSync();
  
  const [currentView, setCurrentView] = useState<'home' | 'blood-pressure' | 'blood-sugar' | 'blog' | 'admin'>('home');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostType | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [bloodSugarReadings, setBloodSugarReadings] = useState<BloodSugarReading[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState<'bp' | 'bs'>('bp');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'trends' | 'analytics' | 'recommendations'>('overview');
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences | null>(null);
  const [adminAccessRequested, setAdminAccessRequested] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load initial data with minimal blocking
  useEffect(() => {
    // Use a separate flag to track initial data loading
    if (!initialDataLoaded) {
      try {
        // Load data from localStorage (fast operation)
        const stored = getStoredReadings();
        const storedBS = getStoredBloodSugarReadings();
        setReadings(stored);
        setBloodSugarReadings(storedBS);
        
        // Check for existing consent
        // const storedConsent = localStorage.getItem('userConsent');
        // if (storedConsent) {
        //   try {
        //     setConsentPreferences(JSON.parse(storedConsent));
        //   } catch (e) {
        //     console.error('Error parsing stored consent:', e);
        //     setShowConsentModal(true);
        //   }
        // } else {
        //   // Show consent modal for first-time users
        //   setShowConsentModal(true);
        // }
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setInitialDataLoaded(true);
      }
    }
    
    // Mark app as ready after a short delay to ensure UI is responsive
    const readyTimer = setTimeout(() => {
      setAppReady(true);
    }, 100);
    
    return () => clearTimeout(readyTimer);
  }, [initialDataLoaded]);

  // Sync data when user signs in - with debounce and only after app is ready
  useEffect(() => {
    if (user && !syncing && appReady && initialDataLoaded) {
      const timer = setTimeout(() => {
        syncCloudDataToLocal().then(() => {
          const stored = getStoredReadings();
          const storedBS = getStoredBloodSugarReadings();
          setReadings(stored);
          setBloodSugarReadings(storedBS);
        }).catch(err => {
          console.error('Error syncing data:', err);
        });
      }, 1000); // Delay sync to prevent immediate load
      
      return () => clearTimeout(timer);
    }
  }, [user, syncing, appReady, initialDataLoaded, syncCloudDataToLocal]);

  // Check if user is admin and redirect to admin dashboard if needed
  useEffect(() => {
    if (user && isAdmin && !adminAccessRequested) {
      setCurrentView('admin');
    }
  }, [user, isAdmin, adminAccessRequested]);

  // Check URL for admin route
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      if (isAdmin) {
        setCurrentView('admin');
      } else {
        // Redirect non-authenticated users to home and show auth modal
        setCurrentView('home');
        setAdminAccessRequested(true);
        setShowAuthModal(true);
      }
    }
  }, [isAdmin]);

  const handleSelectTracker = (type: 'blood-pressure' | 'blood-sugar') => {
    setCurrentView(type);
  };

  const handleSelectBlog = () => {
    setCurrentView('blog');
    setSelectedBlogPost(null);
  };

  const handleSelectBlogPost = (post: BlogPostType) => {
    setSelectedBlogPost(post);
  };

  const handleBackFromBlog = () => {
    if (selectedBlogPost) {
      setSelectedBlogPost(null);
    } else {
      setCurrentView('home');
    }
  };

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      // Show auth modal for non-authenticated users
      setAdminAccessRequested(true);
      setShowAuthModal(true);
    }
  };

  const handleBackFromAdmin = () => {
    setCurrentView('home');
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setAdminAccessRequested(false);
  };

  const addReading = async (reading: Omit<Reading, 'id'> & { timestamp?: string }) => {
    try {
      const readingData = {
        ...reading,
        timestamp: reading.timestamp || new Date().toISOString(),
      };
      
      const newReading = await createBPReading(readingData);
      
      const updatedReadings = [newReading, ...readings];
      // Sort by timestamp descending (newest first)
      updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setReadings(updatedReadings);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding reading:', error);
      alert(t('errors.failedToSave'));
    }
  };

  const deleteReading = async (id: string) => {
    try {
      await deleteBPReading(id);
      const updatedReadings = readings.filter(r => r.id !== id);
      setReadings(updatedReadings);
    } catch (error) {
      console.error('Error deleting reading:', error);
      alert(t('errors.failedToDelete'));
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      // Delete each reading
      for (const id of ids) {
        await deleteBPReading(id);
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

  const handleDataCleared = () => {
    // Refresh data after clearing
    const stored = getStoredReadings();
    const storedBS = getStoredBloodSugarReadings();
    setReadings(stored);
    setBloodSugarReadings(storedBS);
    
    // Show success message
    alert('Data has been successfully deleted.');
  };

  const handleImport = (importedData: Reading[]) => {
    const updatedReadings = [...importedData, ...readings];
    // Sort by timestamp descending (newest first)
    updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setReadings(updatedReadings);
    saveReadings(updatedReadings);
    setShowImportModal(false);
  };

  const exportData = () => {
    setShowShareModal(true);
  };

  const openBulkDelete = (type: 'bp' | 'bs') => {
    setBulkDeleteType(type);
    setShowBulkDelete(true);
  };

  const handleConsentAccept = (consents: ConsentPreferences) => {
    setConsentPreferences(consents);
    localStorage.setItem('userConsent', JSON.stringify(consents));
    setShowConsentModal(false);
    
    // Log consent for audit purposes
    console.log('User consent recorded:', consents);
  };

  // Show loading screen while auth is initializing
  if (authLoading || !appReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('common.loading')} {t('app.name')}...
          </p>
        </div>
      </div>
    );
  }

  // Show consent modal for first-time users
  if (showConsentModal) {
    return (
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => {}} // Cannot close without accepting for first-time users
        onAccept={handleConsentAccept}
        isFirstTime={!consentPreferences}
      />
    );
  }

  // Show admin dashboard - only if user is authenticated and is admin
  if (currentView === 'admin') {
    if (!isAdmin) {
      // Redirect non-admin users back to home
      setCurrentView('home');
      return (
        <HomePage 
          onSelectTracker={handleSelectTracker} 
          onSelectBlog={handleSelectBlog}
          onSelectAdmin={handleOpenAdmin}
          isAdmin={isAdmin}
          showAuthModal={() => setShowAuthModal(true)}
          user={user}
        />
      );
    }
    return (
      <Suspense fallback={<LoadingFallback isDark={isDark} />}>
        <AdminDashboard onBack={handleBackFromAdmin} />
      </Suspense>
    );
  }

  // Show home page
  if (currentView === 'home') {
    return (
      <>
        <HomePage 
          onSelectTracker={handleSelectTracker} 
          onSelectBlog={handleSelectBlog}
          onSelectAdmin={handleOpenAdmin}
          isAdmin={isAdmin}
          showAuthModal={() => setShowAuthModal(true)}
          user={user}
        />
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={handleAuthModalClose}
            adminAccessRequested={adminAccessRequested}
          />
        )}
        
        {/* Fixed position Bolt Badge */}
        <BoltBadge position="fixed" />
      </>
    );
  }

  // Show blog
  if (currentView === 'blog') {
    return (
      <Suspense fallback={<LoadingFallback isDark={isDark} />}>
        {selectedBlogPost ? (
          <BlogPost 
            post={selectedBlogPost} 
            onBack={handleBackFromBlog}
          />
        ) : (
          <BlogHome 
            onBackToHome={handleBackFromBlog}
            onSelectPost={handleSelectBlogPost}
          />
        )}
        
        {/* Fixed position Bolt Badge */}
        <BoltBadge position="fixed" />
      </Suspense>
    );
  }

  // Show blood sugar tracker
  if (currentView === 'blood-sugar') {
    return (
      <Suspense fallback={<LoadingFallback isDark={isDark} />}>
        <BloodSugarTracker onBackToHome={() => setCurrentView('home')} />
        
        {/* Fixed position Bolt Badge */}
        <BoltBadge position="fixed" />
      </Suspense>
    );
  }

  // Show blood pressure tracker (existing functionality)
  const latestReading = readings[0];
  const category = latestReading ? categorizeBP(latestReading.systolic, latestReading.diastolic) : null;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      
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
                onClick={() => setCurrentView('home')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-red-900/50 hover:bg-red-900/70' 
                    : 'bg-red-100 hover:bg-red-200'
                }`}
              >
                <Heart className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('bloodPressure.title')}
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('app.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Bolt.new Badge */}
              <BoltBadge />
              
              {/* Cloud Sync Status */}
              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {syncing ? (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm hidden sm:inline">{t('cloud.syncing')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <Cloud className="h-4 w-4" />
                        <span className="text-sm hidden sm:inline">
                          {lastSyncTime ? `${t('cloud.synced')} ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : t('cloud.cloudConnected')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <CloudOff className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">{t('cloud.localOnly')}</span>
                  </div>
                )}
              </div>

              {/* Admin Button - Only visible to admin users */}
              {isAdmin && (
                <button
                  onClick={handleOpenAdmin}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Admin Dashboard"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              
              {/* Theme Toggle Button */}
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
                onClick={() => setCurrentView('home')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">{t('navigation.backToHome')}</span>
                <span className="sm:hidden">← {t('navigation.home')}</span>
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
                <span className="hidden sm:inline">{t('common.import')}</span>
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
                <span className="hidden sm:inline">{t('common.share')}</span>
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
                <span className="hidden sm:inline">{t('common.export')}</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
                  isDark 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>{t('bloodPressure.addReading')}</span>
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
            { id: 'overview', label: t('navigation.overview'), icon: Activity },
            { id: 'history', label: t('navigation.history'), icon: Calendar },
            { id: 'trends', label: t('navigation.trends'), icon: TrendingUp },
            { id: 'analytics', label: t('navigation.analytics'), icon: BarChart3 },
            { id: 'recommendations', label: t('navigation.recommendations'), icon: Target }
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
              bpReadings={readings} 
              bsReadings={bloodSugarReadings}
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
                      {t('bloodPressure.latestReading')}
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
                            {latestReading.systolic}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('bloodPressure.systolic')}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {t('bloodPressure.mmHg')}
                          </div>
                        </div>
                        <div className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>/</div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {latestReading.diastolic}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('bloodPressure.diastolic')}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {t('bloodPressure.mmHg')}
                          </div>
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
                            {t(`bloodPressure.categories.${category.label.toLowerCase().replace(/\s+/g, '')}`)}
                          </span>
                          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.description}
                          </p>
                        </div>
                      )}
                      
                      {(latestReading.symptoms || latestReading.notes) && (
                        <div className={`rounded-lg p-3 space-y-2 ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          {latestReading.symptoms && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">{t('common.symptoms')}:</span> {latestReading.symptoms}
                            </p>
                          )}
                          {latestReading.notes && (
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">{t('common.notes')}:</span> {latestReading.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('common.noData')}
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className={`mt-2 font-medium ${
                          isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
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
                <Statistics readings={readings} />
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
                      onClick={() => openBulkDelete('bp')}
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
                <ReadingsList 
                  readings={readings.slice(0, 5)} 
                  onDelete={deleteReading}
                  showActions={false}
                />
                {readings.length > 5 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`font-medium ${
                        isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
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
                    onClick={() => openBulkDelete('bp')}
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
              <ReadingsList readings={readings} onDelete={deleteReading} />
            ) : (
              <div className="text-center py-12">
                <Calendar className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No readings recorded yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className={`font-medium ${
                    isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
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
            <TrendChart readings={readings} />
            
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
          <Analytics readings={readings} />
        )}

        {activeTab === 'recommendations' && (
          <Recommendations readings={readings} />
        )}
      </main>

      {/* Reading Form Modal */}
      {showForm && (
        <ReadingForm
          onSave={addReading}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          readings={readings}
          onClose={() => setShowShareModal(false)}
          type="bp"
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          type="blood-pressure"
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          adminAccessRequested={adminAccessRequested}
        />
      )}

      {/* Data Management Modal */}
      {showDataManagement && (
        <DataManagementModal
          isOpen={showDataManagement}
          onClose={() => setShowDataManagement(false)}
          bpReadings={readings}
          bsReadings={bloodSugarReadings}
          onDataCleared={handleDataCleared}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <BulkDeleteModal
          isOpen={showBulkDelete}
          onClose={() => setShowBulkDelete(false)}
          readings={bulkDeleteType === 'bp' ? readings : bloodSugarReadings}
          type={bulkDeleteType}
          onDelete={handleBulkDelete}
        />
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <ConsentModal
          isOpen={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          onAccept={handleConsentAccept}
          isFirstTime={!consentPreferences}
        />
      )}
      
      {/* Fixed position Bolt Badge */}
      <BoltBadge position="fixed" />
    </div>
  );
}

// Type definition for BlogPost
interface BlogPostType {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
  };
  tags: string[];
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
}

export default App;