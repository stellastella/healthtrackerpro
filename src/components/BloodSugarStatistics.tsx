import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Target, AlertTriangle } from 'lucide-react';
import { BloodSugarReading } from '../types/BloodSugar';
import { categorizeGlucose, calculateHbA1c, getTimeInRange } from '../utils/bloodSugar';

interface BloodSugarStatisticsProps {
  readings: BloodSugarReading[];
}

const BloodSugarStatistics: React.FC<BloodSugarStatisticsProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <p className="text-gray-500 text-center py-4">No data available</p>
      </div>
    );
  }

  const calculateAverage = (values: number[]) => {
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const glucoseValues = readings.map(r => r.glucose);
  const avgGlucose = calculateAverage(glucoseValues);
  
  const latest = readings[0];
  const previous = readings[1];
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  if (previous) {
    if (latest.glucose > previous.glucose) trend = 'up';
    else if (latest.glucose < previous.glucose) trend = 'down';
  }

  const hba1c = calculateHbA1c(readings);
  const timeInRange = getTimeInRange(readings);

  const categoryDistribution = readings.reduce((acc, reading) => {
    const category = categorizeGlucose(reading.glucose, reading.testType);
    acc[category.label] = (acc[category.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonCategory = Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)[0];

  const last7Days = readings.filter(reading => {
    const readingDate = new Date(reading.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return readingDate >= weekAgo;
  });

  const fastingReadings = readings.filter(r => r.testType === 'fasting');
  const avgFasting = fastingReadings.length > 0 ? calculateAverage(fastingReadings.map(r => r.glucose)) : null;

  return (
    <div className="space-y-4">
      {/* Average Glucose */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Glucose</h3>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {avgGlucose} mg/dL
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              categorizeGlucose(avgGlucose, 'random').color === 'green' ? 'bg-green-100 text-green-800' :
              categorizeGlucose(avgGlucose, 'random').color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              categorizeGlucose(avgGlucose, 'random').color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {categorizeGlucose(avgGlucose, 'random').label}
            </span>
          </div>
        </div>
      </div>

      {/* HbA1c Estimate */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated HbA1c</h3>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {hba1c}%
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {hba1c < 5.7 ? 'Normal' : 
             hba1c < 6.5 ? 'Pre-diabetes' : 'Diabetes'}
          </div>
          <div className="text-xs text-gray-500">
            Based on average glucose
          </div>
        </div>
      </div>

      {/* Time in Range */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time in Range</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">In Range (70-180)</span>
            </div>
            <span className="font-semibold text-green-600">{timeInRange.inRange}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Below Range (&lt;70)</span>
            </div>
            <span className="font-semibold text-red-600">{timeInRange.belowRange}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Above Range (&gt;180)</span>
            </div>
            <span className="font-semibold text-orange-600">{timeInRange.aboveRange}%</span>
          </div>
        </div>
      </div>

      {/* Recent Trend */}
      {previous && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trend</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Latest vs Previous</span>
            <div className="flex items-center space-x-2">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trend === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-red-600' :
                trend === 'down' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {latest.glucose - previous.glucose > 0 ? '+' : ''}{latest.glucose - previous.glucose} mg/dL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Readings</span>
            </div>
            <span className="font-semibold text-gray-900">{readings.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <span className="font-semibold text-gray-900">{last7Days.length}</span>
          </div>
          
          {avgFasting && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Avg Fasting</span>
              </div>
              <span className="font-semibold text-gray-900">{avgFasting} mg/dL</span>
            </div>
          )}
          
          {mostCommonCategory && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Most Common</span>
              <span className="text-sm font-medium text-gray-900">
                {mostCommonCategory[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodSugarStatistics;