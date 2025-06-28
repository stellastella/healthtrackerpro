import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BloodSugarReading } from '../types/BloodSugar';

interface BloodSugarTrendChartProps {
  readings: BloodSugarReading[];
}

const BloodSugarTrendChart: React.FC<BloodSugarTrendChartProps> = ({ readings }) => {
  if (readings.length < 2) {
    return null;
  }

  // Get last 30 readings for chart
  const chartData = readings.slice(0, 30).reverse().map(reading => ({
    date: new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    glucose: reading.glucose,
    testType: reading.testType,
    timestamp: reading.timestamp
  }));

  const getTestTypeColor = (testType: string) => {
    const colors = {
      'fasting': '#dc2626',
      'pre-meal': '#2563eb',
      'post-meal': '#16a34a',
      'random': '#7c3aed',
      'bedtime': '#ea580c'
    };
    return colors[testType as keyof typeof colors] || '#6b7280';
  };

  // Group data by test type for multiple lines
  const testTypes = [...new Set(chartData.map(d => d.testType))];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Blood Sugar Trends</h2>
        </div>
        <span className="text-sm text-gray-500">Last {chartData.length} readings</span>
      </div>

      <div className="space-y-6">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tick={{ fontSize: 12 }}
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              
              {/* Reference lines for normal ranges */}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" label="Low" />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="2 2" label="High Normal" />
              <ReferenceLine y={180} stroke="#dc2626" strokeDasharray="2 2" label="High" />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name, props) => [
                  `${value} mg/dL`,
                  `${props.payload.testType.charAt(0).toUpperCase() + props.payload.testType.slice(1)} Test`
                ]}
              />
              
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={getTestTypeColor(payload.testType)}
                      stroke={getTestTypeColor(payload.testType)}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                name="glucose"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {testTypes.map(testType => (
            <div key={testType} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getTestTypeColor(testType) }}
              ></div>
              <span className="text-sm text-gray-600 capitalize">
                {testType.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Reference Ranges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {Math.round(chartData.reduce((sum, r) => sum + r.glucose, 0) / chartData.length)}
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {Math.max(...chartData.map(r => r.glucose))}
            </div>
            <div className="text-sm text-gray-600">Highest</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Math.min(...chartData.map(r => r.glucose))}
            </div>
            <div className="text-sm text-gray-600">Lowest</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.max(...chartData.map(r => r.glucose)) - Math.min(...chartData.map(r => r.glucose))}
            </div>
            <div className="text-sm text-gray-600">Range</div>
          </div>
        </div>

        {/* Normal Ranges Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Reference Ranges (mg/dL)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Normal:</span>
              <div className="text-gray-600">Fasting: 70-99</div>
              <div className="text-gray-600">Random: 70-139</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Pre-diabetes:</span>
              <div className="text-gray-600">Fasting: 100-125</div>
              <div className="text-gray-600">Random: 140-199</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Diabetes:</span>
              <div className="text-gray-600">Fasting: ≥126</div>
              <div className="text-gray-600">Random: ≥200</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodSugarTrendChart;