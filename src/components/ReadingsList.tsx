import React from 'react';
import { Trash2, MapPin, Pill, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Reading } from '../types';
import { categorizeBP } from '../utils/bloodPressure';
import { useTheme } from '../contexts/ThemeContext';

interface ReadingsListProps {
  readings: Reading[];
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const ReadingsList: React.FC<ReadingsListProps> = ({ 
  readings, 
  onDelete, 
  showActions = true 
}) => {
  const { isDark } = useTheme();

  if (readings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No readings available</p>
      </div>
    );
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const InfoItem = ({ icon: Icon, text }: { icon: React.ComponentType<any>, text: string }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="space-y-3">
      {readings.map((reading) => {
        const category = categorizeBP(reading.systolic, reading.diastolic);
        const { date, time } = formatDateTime(reading.timestamp);
        
        return (
          <div
            key={reading.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              isDark 
                ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {reading.systolic}/{reading.diastolic}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>mmHg</span>
                  </div>
                  
                  {reading.pulse && (
                    <InfoItem icon={Clock} text={`${reading.pulse} bpm`} />
                  )}
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    category.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    category.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    category.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {category.label}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{date} at {time}</span>
                  {reading.location && <InfoItem icon={MapPin} text={reading.location} />}
                </div>
                
                {(reading.medication || reading.symptoms || reading.notes) && (
                  <div className="mt-2 space-y-1">
                    {reading.medication && <InfoItem icon={Pill} text={reading.medication} />}
                    {reading.symptoms && <InfoItem icon={AlertCircle} text={reading.symptoms} />}
                    {reading.notes && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
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
                  className={`ml-4 p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
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

export default ReadingsList;