import React, { useState } from 'react';
import { X, Heart, Clock, MapPin, Pill, Calendar, AlertCircle, MessageSquare } from 'lucide-react';
import { getCurrentLocalDateTime, formatLocalDateTime, isValidLocalDateTime, getUserTimezone } from '../utils/timezone';
import { checkForBPDuplicate } from '../utils/duplicateDetection';
import { getStoredReadings } from '../utils/storage';
import DuplicateWarningModal from './DuplicateWarningModal';
import VoiceRecorder from './VoiceRecorder';

interface ReadingFormProps {
  onSave: (reading: {
    systolic: number;
    diastolic: number;
    pulse?: number;
    notes?: string;
    medication?: string;
    location?: 'home' | 'clinic' | 'hospital' | 'pharmacy';
    symptoms?: string;
    timestamp?: string;
  }) => void;
  onCancel: () => void;
}

const ReadingForm: React.FC<ReadingFormProps> = ({ onSave, onCancel }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [medication, setMedication] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState<'home' | 'clinic' | 'hospital' | 'pharmacy'>('home');
  
  // Use proper timezone detection for accurate local time
  const { date: initialDate, time: initialTime } = getCurrentLocalDateTime();
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const userTimezone = getUserTimezone();

  // Voice input states
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  // Duplicate detection state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<any>(null);
  const [pendingReading, setPendingReading] = useState<any>(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const systolicNum = parseInt(systolic);
      const diastolicNum = parseInt(diastolic);
      
      if (systolicNum < 50 || systolicNum > 300 || diastolicNum < 30 || diastolicNum > 200) {
        alert('Please enter valid blood pressure values');
        setIsSubmitting(false);
        return;
      }
      
      if (systolicNum <= diastolicNum) {
        alert('Systolic pressure should be higher than diastolic pressure');
        setIsSubmitting(false);
        return;
      }

      // Validate date and time using timezone utility
      if (!isValidLocalDateTime(date, time)) {
        alert('Please enter a valid date and time (not in the future and not more than 5 years ago)');
        setIsSubmitting(false);
        return;
      }

      // Create timestamp in user's local timezone
      const selectedDateTime = new Date(`${date}T${time}`);

      const newReading = {
        systolic: systolicNum,
        diastolic: diastolicNum,
        pulse: pulse ? parseInt(pulse) : undefined,
        notes: notes.trim() || undefined,
        medication: medication.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
        location,
        timestamp: selectedDateTime.toISOString(),
      };

      // Check for duplicates
      const existingReadings = getStoredReadings();
      const duplicateCheck = checkForBPDuplicate(newReading, existingReadings);

      if (duplicateCheck.isDuplicate) {
        setDuplicateCheckResult(duplicateCheck);
        setPendingReading(newReading);
        setShowDuplicateModal(true);
        setIsSubmitting(false);
        return;
      }

      // No duplicate found, proceed with saving
      onSave(newReading);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving your reading. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmDuplicate = () => {
    if (pendingReading) {
      onSave(pendingReading);
    }
    setShowDuplicateModal(false);
    setDuplicateCheckResult(null);
    setPendingReading(null);
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateCheckResult(null);
    setPendingReading(null);
  };

  const setToNow = () => {
    const { date: currentDate, time: currentTime } = getCurrentLocalDateTime();
    setDate(currentDate);
    setTime(currentTime);
  };

  const handleVoiceTranscription = (field: string, text: string) => {
    switch (field) {
      case 'medication':
        setMedication(text);
        break;
      case 'symptoms':
        setSymptoms(text);
        break;
      case 'notes':
        setNotes(text);
        break;
    }
  };

  const isExactDuplicate = duplicateCheckResult?.message?.includes('Duplicate entry detected!');

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Blood Pressure Reading</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date and Time */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date & Time
                </h3>
                <button
                  type="button"
                  onClick={setToNow}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Set to now
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="space-y-1">
                  <div><strong>Selected:</strong> {formatLocalDateTime(date, time)}</div>
                  <div><strong>Your timezone:</strong> {userTimezone}</div>
                </div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Blood Pressure (mmHg)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Systolic
                  </label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="120"
                    min="50"
                    max="300"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top number</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diastolic
                  </label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="80"
                    min="30"
                    max="200"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bottom number</p>
                </div>
              </div>
            </div>

            {/* Pulse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Pulse Rate (bpm) - Optional
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="70"
                min="30"
                max="200"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Measurement Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="home">Home</option>
                <option value="clinic">Clinic</option>
                <option value="hospital">Hospital</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>

            {/* Medication with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Pill className="h-4 w-4 inline mr-1" />
                  Current Medication - Optional
                </label>
                <button
                  type="button"
                  onClick={() => setActiveVoiceField(activeVoiceField === 'medication' ? null : 'medication')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  🎤 Voice Input
                </button>
              </div>
              
              {activeVoiceField === 'medication' ? (
                <VoiceRecorder
                  onTranscription={(text) => handleVoiceTranscription('medication', text)}
                  placeholder="Say your current medications..."
                  label=""
                />
              ) : (
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Lisinopril 10mg"
                />
              )}
            </div>

            {/* Symptoms with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Symptoms - Optional
                </label>
                <button
                  type="button"
                  onClick={() => setActiveVoiceField(activeVoiceField === 'symptoms' ? null : 'symptoms')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  🎤 Voice Input
                </button>
              </div>
              
              {activeVoiceField === 'symptoms' ? (
                <VoiceRecorder
                  onTranscription={(text) => handleVoiceTranscription('symptoms', text)}
                  placeholder="Describe any symptoms you're experiencing..."
                  label=""
                />
              ) : (
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Headache, dizziness, chest pain"
                />
              )}
            </div>

            {/* Notes with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Notes - Optional
                </label>
                <button
                  type="button"
                  onClick={() => setActiveVoiceField(activeVoiceField === 'notes' ? null : 'notes')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  🎤 Voice Input
                </button>
              </div>
              
              {activeVoiceField === 'notes' ? (
                <VoiceRecorder
                  onTranscription={(text) => handleVoiceTranscription('notes', text)}
                  placeholder="Share any additional notes about your health today..."
                  label=""
                />
              ) : (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Do you have any changes in your lifestyle today you want to share?"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Reading'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      {showDuplicateModal && duplicateCheckResult && pendingReading && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={handleCancelDuplicate}
          onConfirm={handleConfirmDuplicate}
          duplicateEntry={duplicateCheckResult.duplicateEntry}
          newEntry={pendingReading}
          type="bp"
          message={duplicateCheckResult.message}
          isExactDuplicate={isExactDuplicate}
        />
      )}
    </>
  );
};

export default ReadingForm;