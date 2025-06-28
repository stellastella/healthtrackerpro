import React, { useState } from 'react';
import { Calendar, BarChart3, TrendingUp, Users, Globe, Clock, Smartphone, Laptop, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const VisitAnalytics: React.FC = () => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for analytics
  const visitData = {
    week: [
      { day: 'Mon', visits: 234, users: 187, sessions: 256 },
      { day: 'Tue', visits: 245, users: 201, sessions: 278 },
      { day: 'Wed', visits: 267, users: 215, sessions: 290 },
      { day: 'Thu', visits: 278, users: 229, sessions: 301 },
      { day: 'Fri', visits: 289, users: 241, sessions: 312 },
      { day: 'Sat', visits: 247, users: 203, sessions: 267 },
      { day: 'Sun', visits: 228, users: 192, sessions: 245 }
    ],
    month: [
      { day: 'Week 1', visits: 1567, users: 1245, sessions: 1689 },
      { day: 'Week 2', visits: 1678, users: 1356, sessions: 1789 },
      { day: 'Week 3', visits: 1789, users: 1467, sessions: 1890 },
      { day: 'Week 4', visits: 1890, users: 1578, sessions: 2001 }
    ],
    year: [
      { day: 'Jan', visits: 5678, users: 4567, sessions: 6123 },
      { day: 'Feb', visits: 6123, users: 5012, sessions: 6789 },
      { day: 'Mar', visits: 6789, users: 5678, sessions: 7234 },
      { day: 'Apr', visits: 7234, users: 6123, sessions: 7890 },
      { day: 'May', visits: 7890, users: 6789, sessions: 8345 },
      { day: 'Jun', visits: 8345, users: 7234, sessions: 8901 },
      { day: 'Jul', visits: 8901, users: 7890, sessions: 9456 },
      { day: 'Aug', visits: 9456, users: 8345, sessions: 10012 },
      { day: 'Sep', visits: 10012, users: 8901, sessions: 10567 },
      { day: 'Oct', visits: 10567, users: 9456, sessions: 11123 },
      { day: 'Nov', visits: 11123, users: 10012, sessions: 11678 },
      { day: 'Dec', visits: 11678, users: 10567, sessions: 12234 }
    ]
  };

  const deviceData = [
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 30 },
    { name: 'Tablet', value: 5 }
  ];

  const featureUsageData = [
    { name: 'Blood Pressure', value: 42 },
    { name: 'Blood Sugar', value: 35 },
    { name: 'Blog', value: 15 },
    { name: 'Analytics', value: 8 }
  ];

  const trafficSourceData = [
    { name: 'Direct', value: 40 },
    { name: 'Search', value: 30 },
    { name: 'Social', value: 20 },
    { name: 'Referral', value: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Visit Analytics
        </h2>
        <div className="flex space-x-2">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === value
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics Chart */}
      <div className={`rounded-lg p-4 mb-6 ${
        isDark ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Visits Over Time
          </h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visitData[timeRange]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
              <XAxis 
                dataKey="day" 
                stroke={isDark ? '#9ca3af' : '#666'} 
              />
              <YAxis stroke={isDark ? '#9ca3af' : '#666'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : 'white', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Visits"
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Unique Users"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Device Distribution */}
        <div className={`rounded-lg p-4 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Device Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : 'white', 
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-2">
            <div className="flex items-center space-x-2">
              <Smartphone className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobile</span>
            </div>
            <div className="flex items-center space-x-2">
              <Laptop className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Desktop</span>
            </div>
            <div className="flex items-center space-x-2">
              <Monitor className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tablet</span>
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className={`rounded-lg p-4 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Feature Usage
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureUsageData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis type="number" stroke={isDark ? '#9ca3af' : '#666'} />
                <YAxis dataKey="name" type="category" stroke={isDark ? '#9ca3af' : '#666'} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Usage']}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : 'white', 
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className={`rounded-lg p-4 ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <Globe className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Traffic Sources
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : 'white', 
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Metrics */}
      <div className={`rounded-lg p-6 ${
        isDark ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <Users className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Engagement Metrics
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Session Time</span>
              <Clock className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              4:32
            </div>
            <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +12% vs last month
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bounce Rate</span>
              <TrendingUp className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              32.1%
            </div>
            <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              -5.3% vs last month
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New Users</span>
              <Users className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              1,245
            </div>
            <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +18.7% vs last month
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Retention Rate</span>
              <Calendar className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              68.4%
            </div>
            <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              +3.2% vs last month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitAnalytics;