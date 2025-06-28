import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Reading } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TrendChartProps {
  readings: Reading[];
}

const TrendChart: React.FC<TrendChartProps> = ({ readings }) => {
  const { isDark } = useTheme();

  if (readings.length < 2) return null;

  // Simplified data preparation
  const chartData = readings
    .slice(0, 30)
    .reverse()
    .map(reading => ({
      date: new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse || null,
      timestamp: reading.timestamp
    }));

  const stats = {
    avgSystolic: Math.round(chartData.reduce((sum, r) => sum + r.systolic, 0) / chartData.length),
    avgDiastolic: Math.round(chartData.reduce((sum, r) => sum + r.diastolic, 0) / chartData.length),
    maxSystolic: Math.max(...chartData.map(r => r.systolic)),
    minSystolic: Math.min(...chartData.map(r => r.systolic))
  };

  const hasPulseData = chartData.some(d => d.pulse);

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Blood Pressure Trends
          </h2>
        </div>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Last {chartData.length} readings
        </span>
      </div>

      <div className="space-y-6">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
              <XAxis 
                dataKey="date" 
                stroke={isDark ? '#9ca3af' : '#666'} 
                fontSize={12}
              />
              <YAxis 
                stroke={isDark ? '#9ca3af' : '#666'} 
                fontSize={12}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : 'white', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [
                  `${value} ${name === 'pulse' ? 'bpm' : 'mmHg'}`,
                  name === 'systolic' ? 'Systolic' : name === 'diastolic' ? 'Diastolic' : 'Pulse'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#dc2626', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#2563eb', strokeWidth: 2 }}
              />
              {hasPulseData && (
                <Line 
                  type="monotone" 
                  dataKey="pulse" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-600 rounded"></div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Systolic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600 rounded"></div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Diastolic</span>
          </div>
          {hasPulseData && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-600 rounded border-dashed border border-green-600"></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pulse</span>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {[
            { label: 'Avg Systolic', value: stats.avgSystolic, color: 'text-red-600 dark:text-red-400' },
            { label: 'Avg Diastolic', value: stats.avgDiastolic, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Max Systolic', value: stats.maxSystolic, color: isDark ? 'text-white' : 'text-gray-900' },
            { label: 'Min Systolic', value: stats.minSystolic, color: isDark ? 'text-white' : 'text-gray-900' }
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-lg font-semibold ${color}`}>{value}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendChart;