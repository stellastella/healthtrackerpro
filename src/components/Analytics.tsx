import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Reading } from '../types/Reading';
import { categorizeBP } from '../utils/bloodPressure';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsProps {
  readings: Reading[];
}

const Analytics: React.FC<AnalyticsProps> = ({ readings }) => {
  const { isDark } = useTheme();

  if (readings.length === 0) {
    return (
      <div className={`rounded-2xl shadow-sm border p-8 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="text-center">
          <BarChart3 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No data for analytics</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add some readings to see detailed analytics</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const last30Days = readings.slice(0, 30).reverse();
  const chartData = last30Days.map((reading, index) => ({
    date: new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    pulse: reading.pulse || 0,
    category: categorizeBP(reading.systolic, reading.diastolic).label
  }));

  // Category distribution
  const categoryDistribution = readings.reduce((acc, reading) => {
    const category = categorizeBP(reading.systolic, reading.diastolic);
    acc[category.label] = (acc[category.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value,
    color: name === 'Normal' ? '#10b981' :
           name === 'Elevated' ? '#f59e0b' :
           name.includes('Stage 1') ? '#f97316' :
           '#ef4444'
  }));

  // Time-based analysis
  const timeAnalysis = readings.reduce((acc, reading) => {
    const hour = new Date(reading.timestamp).getHours();
    const timeOfDay = hour < 6 ? 'Night' :
                     hour < 12 ? 'Morning' :
                     hour < 18 ? 'Afternoon' : 'Evening';
    
    if (!acc[timeOfDay]) {
      acc[timeOfDay] = { count: 0, systolic: 0, diastolic: 0 };
    }
    acc[timeOfDay].count++;
    acc[timeOfDay].systolic += reading.systolic;
    acc[timeOfDay].diastolic += reading.diastolic;
    return acc;
  }, {} as Record<string, { count: number; systolic: number; diastolic: number }>);

  const timeData = Object.entries(timeAnalysis).map(([time, data]) => ({
    time,
    avgSystolic: Math.round(data.systolic / data.count),
    avgDiastolic: Math.round(data.diastolic / data.count),
    count: data.count
  }));

  // Calculate statistics
  const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  
  const systolicValues = readings.map(r => r.systolic);
  const diastolicValues = readings.map(r => r.diastolic);
  
  const maxSystolic = Math.max(...systolicValues);
  const minSystolic = Math.min(...systolicValues);
  const maxDiastolic = Math.max(...diastolicValues);
  const minDiastolic = Math.min(...diastolicValues);

  // Trend analysis - Fixed to handle edge cases
  const recentReadings = readings.slice(0, 7);
  const olderReadings = readings.slice(7, 14);
  
  let sysTrend = 0;
  let diaTrend = 0;
  
  if (recentReadings.length > 0 && olderReadings.length > 0) {
    const recentAvgSys = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
    const olderAvgSys = olderReadings.reduce((sum, r) => sum + r.systolic, 0) / olderReadings.length;
    sysTrend = recentAvgSys - olderAvgSys;

    const recentAvgDia = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length;
    const olderAvgDia = olderReadings.reduce((sum, r) => sum + r.diastolic, 0) / olderReadings.length;
    diaTrend = recentAvgDia - olderAvgDia;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average BP</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgSystolic}/{avgDiastolic}</p>
            </div>
            <Activity className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Systolic Trend</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {readings.length >= 14 ? Math.abs(sysTrend).toFixed(1) : '--'}
                </p>
                {readings.length >= 14 && (
                  sysTrend > 0 ? (
                    <TrendingUp className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                  ) : sysTrend < 0 ? (
                    <TrendingDown className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <Activity className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Readings</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{readings.length}</p>
            </div>
            <Calendar className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Level</p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {categorizeBP(avgSystolic, avgDiastolic).label}
              </p>
            </div>
            {categorizeBP(avgSystolic, avgDiastolic).color === 'green' ? (
              <CheckCircle className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            ) : (
              <AlertTriangle className={`h-8 w-8 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Blood Pressure Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#666'} fontSize={12} />
              <YAxis stroke={isDark ? '#9ca3af' : '#666'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : 'white', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                name="Systolic"
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                name="Diastolic"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>BP Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : 'white', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{entry.name}</span>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {entry.value} ({Math.round((entry.value / readings.length) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div className={`rounded-2xl shadow-sm border p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Time of Day Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
            <XAxis dataKey="time" stroke={isDark ? '#9ca3af' : '#666'} fontSize={12} />
            <YAxis stroke={isDark ? '#9ca3af' : '#666'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#1f2937' : 'white', 
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f9fafb' : '#111827'
              }}
            />
            <Bar dataKey="avgSystolic" fill="#dc2626" name="Avg Systolic" />
            <Bar dataKey="avgDiastolic" fill="#2563eb" name="Avg Diastolic" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Systolic Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Average:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgSystolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Highest:</span>
              <span className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{maxSystolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Lowest:</span>
              <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{minSystolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Range:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{maxSystolic - minSystolic} mmHg</span>
            </div>
            {readings.length >= 14 && (
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>7-day trend:</span>
                <span className={`font-semibold ${
                  sysTrend > 0 ? (isDark ? 'text-red-400' : 'text-red-600') :
                  sysTrend < 0 ? (isDark ? 'text-green-400' : 'text-green-600') :
                  (isDark ? 'text-gray-300' : 'text-gray-600')
                }`}>
                  {sysTrend > 0 ? '+' : ''}{sysTrend.toFixed(1)} mmHg
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Diastolic Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Average:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avgDiastolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Highest:</span>
              <span className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{maxDiastolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Lowest:</span>
              <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{minDiastolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Range:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{maxDiastolic - minDiastolic} mmHg</span>
            </div>
            {readings.length >= 14 && (
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>7-day trend:</span>
                <span className={`font-semibold ${
                  diaTrend > 0 ? (isDark ? 'text-red-400' : 'text-red-600') :
                  diaTrend < 0 ? (isDark ? 'text-green-400' : 'text-green-600') :
                  (isDark ? 'text-gray-300' : 'text-gray-600')
                }`}>
                  {diaTrend > 0 ? '+' : ''}{diaTrend.toFixed(1)} mmHg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trend Analysis Note */}
      {readings.length < 14 && (
        <div className={`rounded-lg border p-4 ${
          isDark 
            ? 'bg-blue-900/20 border-blue-800' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              <strong>Note:</strong> Trend analysis requires at least 14 readings (7 recent + 7 older) to calculate meaningful trends. 
              You currently have {readings.length} reading{readings.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;