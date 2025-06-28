import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock, Calendar, Target, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { BloodSugarReading } from '../types/BloodSugar';
import { categorizeGlucose, calculateHbA1c, getTimeInRange } from '../utils/bloodSugar';

interface BloodSugarAnalyticsProps {
  readings: BloodSugarReading[];
}

const BloodSugarAnalytics: React.FC<BloodSugarAnalyticsProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No data for analytics</p>
          <p className="text-sm text-gray-400">Add some blood sugar readings to see detailed analytics</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const last30Days = readings.slice(0, 30).reverse();
  const chartData = last30Days.map((reading, index) => ({
    date: new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    glucose: reading.glucose,
    testType: reading.testType,
    category: categorizeGlucose(reading.glucose, reading.testType).label
  }));

  // Test type distribution
  const testTypeDistribution = readings.reduce((acc, reading) => {
    acc[reading.testType] = (acc[reading.testType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const testTypePieData = Object.entries(testTypeDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
    value,
    color: name === 'fasting' ? '#dc2626' :
           name === 'pre-meal' ? '#2563eb' :
           name === 'post-meal' ? '#16a34a' :
           name === 'random' ? '#7c3aed' : '#ea580c'
  }));

  // Time-based analysis
  const timeAnalysis = readings.reduce((acc, reading) => {
    const hour = new Date(reading.timestamp).getHours();
    const timeOfDay = hour < 6 ? 'Night' :
                     hour < 12 ? 'Morning' :
                     hour < 18 ? 'Afternoon' : 'Evening';
    
    if (!acc[timeOfDay]) {
      acc[timeOfDay] = { count: 0, glucose: 0 };
    }
    acc[timeOfDay].count++;
    acc[timeOfDay].glucose += reading.glucose;
    return acc;
  }, {} as Record<string, { count: number; glucose: number }>);

  const timeData = Object.entries(timeAnalysis).map(([time, data]) => ({
    time,
    avgGlucose: Math.round(data.glucose / data.count),
    count: data.count
  }));

  // Calculate statistics
  const avgGlucose = Math.round(readings.reduce((sum, r) => sum + r.glucose, 0) / readings.length);
  const hba1c = calculateHbA1c(readings);
  const timeInRange = getTimeInRange(readings);
  
  const glucoseValues = readings.map(r => r.glucose);
  const maxGlucose = Math.max(...glucoseValues);
  const minGlucose = Math.min(...glucoseValues);

  // Trend analysis
  const recentReadings = readings.slice(0, 7);
  const olderReadings = readings.slice(7, 14);
  
  const recentAvg = recentReadings.reduce((sum, r) => sum + r.glucose, 0) / recentReadings.length;
  const olderAvg = olderReadings.reduce((sum, r) => sum + r.glucose, 0) / olderReadings.length;
  const trend = recentAvg - olderAvg;

  // Fasting vs non-fasting analysis
  const fastingReadings = readings.filter(r => r.testType === 'fasting');
  const nonFastingReadings = readings.filter(r => r.testType !== 'fasting');
  const avgFasting = fastingReadings.length > 0 ? Math.round(fastingReadings.reduce((sum, r) => sum + r.glucose, 0) / fastingReadings.length) : 0;
  const avgNonFasting = nonFastingReadings.length > 0 ? Math.round(nonFastingReadings.reduce((sum, r) => sum + r.glucose, 0) / nonFastingReadings.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Glucose</p>
              <p className="text-2xl font-bold text-gray-900">{avgGlucose} mg/dL</p>
            </div>
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estimated HbA1c</p>
              <p className="text-2xl font-bold text-gray-900">{hba1c}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Time in Range</p>
              <p className="text-2xl font-bold text-gray-900">{timeInRange.inRange}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Glucose Trend</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{Math.abs(trend).toFixed(1)}</p>
                {trend > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <Activity className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Glucose Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="2 2" />
              <ReferenceLine y={180} stroke="#dc2626" strokeDasharray="2 2" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                name="Glucose (mg/dL)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Type Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={testTypePieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {testTypePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {testTypePieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {entry.value} ({Math.round((entry.value / readings.length) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time of Day Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="avgGlucose" fill="#2563eb" name="Avg Glucose (mg/dL)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Glucose Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-semibold">{avgGlucose} mg/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest:</span>
              <span className="font-semibold text-red-600">{maxGlucose} mg/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lowest:</span>
              <span className="font-semibold text-green-600">{minGlucose} mg/dL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Range:</span>
              <span className="font-semibold">{maxGlucose - minGlucose} mg/dL</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time in Range</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">In Range (70-180):</span>
              <span className="font-semibold text-green-600">{timeInRange.inRange}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Below Range (&lt;70):</span>
              <span className="font-semibold text-red-600">{timeInRange.belowRange}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Above Range (&gt;180):</span>
              <span className="font-semibold text-orange-600">{timeInRange.aboveRange}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Readings:</span>
              <span className="font-semibold">{readings.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fasting vs Non-Fasting</h3>
          <div className="space-y-3">
            {avgFasting > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Fasting:</span>
                <span className="font-semibold">{avgFasting} mg/dL</span>
              </div>
            )}
            {avgNonFasting > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Non-Fasting:</span>
                <span className="font-semibold">{avgNonFasting} mg/dL</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Fasting Tests:</span>
              <span className="font-semibold">{fastingReadings.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Non-Fasting Tests:</span>
              <span className="font-semibold">{nonFastingReadings.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HbA1c Information */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">HbA1c Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{hba1c}%</div>
            <div className="text-sm text-gray-600">Your Estimated HbA1c</div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Normal:</span>
              <span className="font-medium">&lt; 5.7%</span>
            </div>
            <div className="flex justify-between">
              <span>Pre-diabetes:</span>
              <span className="font-medium">5.7% - 6.4%</span>
            </div>
            <div className="flex justify-between">
              <span>Diabetes:</span>
              <span className="font-medium">≥ 6.5%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <p className="mb-2">
              <strong>Note:</strong> This is an estimate based on your average glucose readings.
            </p>
            <p>
              For accurate HbA1c results, consult your healthcare provider for a laboratory test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodSugarAnalytics;