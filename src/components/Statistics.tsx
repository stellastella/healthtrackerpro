import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { Reading } from '../types';
import { categorizeBP } from '../utils/bloodPressure';
import { useTheme } from '../contexts/ThemeContext';

interface StatisticsProps {
  readings: Reading[];
}

const Statistics: React.FC<StatisticsProps> = ({ readings }) => {
  const { isDark } = useTheme();

  if (readings.length === 0) {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Statistics
        </h3>
        <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available
        </p>
      </div>
    );
  }

  // Simplified calculations
  const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  
  const [latest, previous] = readings;
  const hasTrend = previous !== undefined;
  
  const systolicTrend = hasTrend ? Math.sign(latest.systolic - previous.systolic) : 0;
  const diastolicTrend = hasTrend ? Math.sign(latest.diastolic - previous.diastolic) : 0;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return isDark ? 'text-red-400' : 'text-red-600';
    if (trend < 0) return isDark ? 'text-green-400' : 'text-green-600';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyCount = readings.filter(r => new Date(r.timestamp) >= weekAgo).length;

  const category = categorizeBP(avgSystolic, avgDiastolic);

  return (
    <div className="space-y-4">
      {/* Average BP */}
      <div className={`rounded-2xl shadow-sm border p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Average BP
        </h3>
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {avgSystolic}/{avgDiastolic}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>mmHg</div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              category.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              category.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {category.label}
            </span>
          </div>
        </div>
      </div>

      {/* Trends */}
      {hasTrend && (
        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Trend
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Systolic</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(systolicTrend)}
                <span className={`text-sm font-medium ${getTrendColor(systolicTrend)}`}>
                  {systolicTrend !== 0 && (systolicTrend > 0 ? '+' : '')}{latest.systolic - previous.systolic}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Diastolic</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(diastolicTrend)}
                <span className={`text-sm font-medium ${getTrendColor(diastolicTrend)}`}>
                  {diastolicTrend !== 0 && (diastolicTrend > 0 ? '+' : '')}{latest.diastolic - previous.diastolic}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className={`rounded-2xl shadow-sm border p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Readings</span>
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{readings.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Week</span>
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{weeklyCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;