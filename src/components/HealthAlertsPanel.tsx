import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, TrendingUp, TrendingDown, Clock, Calendar, X, CheckCircle, Eye, EyeOff, User, Heart, Droplets, Activity, Utensils, Brain, Moon } from 'lucide-react';
import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { useTheme } from '../contexts/ThemeContext';
import { HealthAlert, generateHealthAlerts } from '../utils/healthAlerts';
import { useAuth } from '../contexts/AuthContext';

interface HealthAlertsPanelProps {
  bpReadings: Reading[];
  bsReadings: BloodSugarReading[];
  className?: string;
}

const HealthAlertsPanel: React.FC<HealthAlertsPanelProps> = ({ 
  bpReadings, 
  bsReadings, 
  className = "" 
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    const generatedAlerts = generateHealthAlerts(bpReadings, bsReadings);
    setAlerts(generatedAlerts);
  }, [bpReadings, bsReadings]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    // Store dismissed alerts in localStorage
    const dismissed = Array.from(dismissedAlerts);
    dismissed.push(alertId);
    localStorage.setItem('dismissedHealthAlerts', JSON.stringify(dismissed));
  };

  const restoreAlert = (alertId: string) => {
    setDismissedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(alertId);
      // Update localStorage
      const dismissed = Array.from(newSet);
      localStorage.setItem('dismissedHealthAlerts', JSON.stringify(dismissed));
      return newSet;
    });
  };

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedHealthAlerts');
    if (stored) {
      try {
        const dismissed = JSON.parse(stored);
        setDismissedAlerts(new Set(dismissed));
      } catch (error) {
        console.error('Error loading dismissed alerts:', error);
      }
    }
  }, []);

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const dismissedAlertsList = alerts.filter(alert => dismissedAlerts.has(alert.id));

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColors = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    switch (priority) {
      case 'critical':
        return isDark 
          ? 'bg-red-900/20 border-red-800 text-red-200' 
          : 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return isDark 
          ? 'bg-orange-900/20 border-orange-800 text-orange-200' 
          : 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return isDark 
          ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return isDark 
          ? 'bg-blue-900/20 border-blue-800 text-blue-200' 
          : 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'pattern':
        return <Calendar className="h-4 w-4" />;
      case 'threshold':
        return <AlertTriangle className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'lifestyle':
        return <Activity className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blood_pressure':
        return <Heart className="h-4 w-4" />;
      case 'blood_sugar':
        return <Droplets className="h-4 w-4" />;
      case 'general':
        return <Activity className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Get personalized greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.email?.split('@')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  if (alerts.length === 0) {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${className} ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-green-900' : 'bg-green-100'
          }`}>
            <CheckCircle className={`h-5 w-5 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Health Alerts
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Personalized insights based on your data
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${
            isDark ? 'text-green-400' : 'text-green-500'
          }`} />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {getTimeBasedGreeting()}! No health alerts at this time.
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Keep tracking your readings for personalized insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-sm border ${className} ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              activeAlerts.length > 0
                ? isDark ? 'bg-orange-900' : 'bg-orange-100'
                : isDark ? 'bg-green-900' : 'bg-green-100'
            }`}>
              {activeAlerts.length > 0 ? (
                <AlertTriangle className={`h-5 w-5 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              ) : (
                <CheckCircle className={`h-5 w-5 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {getTimeBasedGreeting()}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
                {dismissedAlertsList.length > 0 && `, ${dismissedAlertsList.length} dismissed`}
              </p>
            </div>
          </div>

          {dismissedAlertsList.length > 0 && (
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {showDismissed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showDismissed ? 'Hide' : 'Show'} Dismissed</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Active Alerts */}
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${getPriorityColors(alert.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(alert.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <div className="flex items-center space-x-1 text-xs opacity-75">
                        {getTypeIcon(alert.type)}
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed">{alert.message}</p>
                    
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Recommendations:</h5>
                        <ul className="text-sm space-y-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="flex items-center space-x-2 text-xs opacity-75">
                        {getCategoryIcon(alert.category)}
                        <span className="capitalize">{alert.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.priority === 'critical' ? 'bg-red-500 text-white' :
                          alert.priority === 'high' ? 'bg-orange-500 text-white' :
                          alert.priority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors"
                  title="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Dismissed Alerts */}
          {showDismissed && dismissedAlertsList.length > 0 && (
            <div className="space-y-4">
              <div className={`border-t pt-4 ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Dismissed Alerts
                </h4>
                {dismissedAlertsList.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 opacity-60 ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5 opacity-50">
                          {getPriorityIcon(alert.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold mb-1 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {alert.title}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => restoreAlert(alert.id)}
                        className={`flex-shrink-0 ml-3 px-2 py-1 rounded text-xs transition-colors ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title="Restore alert"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAlerts.length === 0 && !showDismissed && (
            <div className="text-center py-8">
              <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${
                isDark ? 'text-green-400' : 'text-green-500'
              }`} />
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                All alerts have been addressed
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Great job staying on top of your health!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthAlertsPanel;