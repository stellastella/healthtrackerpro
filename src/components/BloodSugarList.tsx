import React from 'react';
import { Trash2, MapPin, Pill, Clock, MessageSquare, Utensils, AlertCircle } from 'lucide-react';
import { BloodSugarReading } from '../types/BloodSugar';
import { categorizeGlucose } from '../utils/bloodSugar';

interface BloodSugarListProps {
  readings: BloodSugarReading[];
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const BloodSugarList: React.FC<BloodSugarListProps> = ({ 
  readings, 
  onDelete, 
  showActions = true 
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getTestTypeLabel = (testType: string) => {
    const labels = {
      'fasting': 'Fasting',
      'pre-meal': 'Pre-meal',
      'post-meal': 'Post-meal',
      'random': 'Random',
      'bedtime': 'Bedtime'
    };
    return labels[testType as keyof typeof labels] || testType;
  };

  if (readings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No readings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {readings.map((reading) => {
        const category = categorizeGlucose(reading.glucose, reading.testType);
        const { date, time } = formatDate(reading.timestamp);
        
        return (
          <div
            key={reading.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      {reading.glucose}
                    </span>
                    <span className="text-sm text-gray-500">mg/dL</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{getTestTypeLabel(reading.testType)}</span>
                  </div>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    category.color === 'green' ? 'bg-green-100 text-green-800' :
                    category.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    category.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {category.label}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{date} at {time}</span>
                  
                  {reading.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="capitalize">{reading.location}</span>
                    </div>
                  )}
                </div>
                
                {(reading.mealInfo || reading.medication || reading.symptoms || reading.notes) && (
                  <div className="mt-2 space-y-1">
                    {reading.mealInfo && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Utensils className="h-3 w-3" />
                        <span>{reading.mealInfo}</span>
                      </div>
                    )}
                    {reading.medication && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Pill className="h-3 w-3" />
                        <span>{reading.medication}</span>
                      </div>
                    )}
                    {reading.symptoms && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{reading.symptoms}</span>
                      </div>
                    )}
                    {reading.notes && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{reading.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {showActions && (
                <button
                  onClick={() => onDelete(reading.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete reading"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BloodSugarList;