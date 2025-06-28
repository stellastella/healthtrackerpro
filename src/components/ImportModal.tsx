import React, { useState } from 'react';
import { X, Upload, FileText, AlertTriangle, CheckCircle, Download, Triangle as ExclamationTriangle } from 'lucide-react';
import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { findBulkDuplicates } from '../utils/duplicateDetection';
import { getStoredReadings, getStoredBloodSugarReadings } from '../utils/storage';

interface ImportModalProps {
  type: 'blood-pressure' | 'blood-sugar';
  onImport: (data: Reading[] | BloodSugarReading[]) => void;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ type, onImport, onClose }) => {
  const [csvData, setCsvData] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    duplicates: Array<{ newReading: any; duplicateEntry: any; message: string }>;
    uniqueReadings: any[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

  const downloadTemplate = () => {
    let template = '';
    let filename = '';
    
    if (type === 'blood-pressure') {
      template = `Date,Time,Systolic,Diastolic,Pulse,Location,Medication,Symptoms,Notes
2024-01-15,09:30,120,80,72,home,Lisinopril 10mg,None,Feeling good
2024-01-16,18:45,125,82,75,home,,Slight headache,After workout`;
      filename = 'bp-import-template.csv';
    } else {
      template = `Date,Time,Glucose,TestType,Location,Medication,MealInfo,Symptoms,Notes
2024-01-15,08:00,95,fasting,home,Metformin 500mg,,None,Morning reading
2024-01-15,14:30,140,post-meal,home,,Pasta lunch,None,2 hours after lunch`;
      filename = 'glucose-import-template.csv';
    }
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        if (type === 'blood-pressure') {
          const reading = parseBPRow(row, i + 1);
          data.push(reading);
        } else {
          const reading = parseGlucoseRow(row, i + 1);
          data.push(reading);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return { data, errors };
  };

  const parseBPRow = (row: any, rowNum: number): Reading => {
    const date = row.date || '';
    const time = row.time || '12:00';
    const systolic = parseInt(row.systolic);
    const diastolic = parseInt(row.diastolic);
    const pulse = row.pulse ? parseInt(row.pulse) : undefined;

    if (!date) throw new Error('Date is required');
    if (isNaN(systolic) || systolic < 50 || systolic > 300) {
      throw new Error('Invalid systolic pressure (50-300)');
    }
    if (isNaN(diastolic) || diastolic < 30 || diastolic > 200) {
      throw new Error('Invalid diastolic pressure (30-200)');
    }
    if (systolic <= diastolic) {
      throw new Error('Systolic must be higher than diastolic');
    }
    if (pulse && (isNaN(pulse) || pulse < 30 || pulse > 200)) {
      throw new Error('Invalid pulse rate (30-200)');
    }

    const timestamp = new Date(`${date}T${time}`);
    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid date/time format');
    }

    return {
      id: `import-${Date.now()}-${rowNum}`,
      systolic,
      diastolic,
      pulse,
      timestamp: timestamp.toISOString(),
      location: ['home', 'clinic', 'hospital', 'pharmacy'].includes(row.location) ? row.location : 'home',
      medication: row.medication || undefined,
      symptoms: row.symptoms || undefined,
      notes: row.notes || undefined
    };
  };

  const parseGlucoseRow = (row: any, rowNum: number): BloodSugarReading => {
    const date = row.date || '';
    const time = row.time || '12:00';
    const glucose = parseInt(row.glucose);
    const testType = row.testtype || row['test type'] || 'random';

    if (!date) throw new Error('Date is required');
    if (isNaN(glucose) || glucose < 20 || glucose > 600) {
      throw new Error('Invalid glucose level (20-600 mg/dL)');
    }
    if (!['fasting', 'random', 'post-meal', 'bedtime', 'pre-meal'].includes(testType)) {
      throw new Error('Invalid test type (fasting, random, post-meal, bedtime, pre-meal)');
    }

    const timestamp = new Date(`${date}T${time}`);
    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid date/time format');
    }

    return {
      id: `import-${Date.now()}-${rowNum}`,
      glucose,
      testType: testType as any,
      timestamp: timestamp.toISOString(),
      location: ['home', 'clinic', 'hospital', 'pharmacy'].includes(row.location) ? row.location : 'home',
      medication: row.medication || undefined,
      mealInfo: row.mealinfo || row['meal info'] || undefined,
      symptoms: row.symptoms || undefined,
      notes: row.notes || undefined
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      setCsvData(csv);
      processCSV(csv);
    };
    reader.readAsText(file);
  };

  const processCSV = (csv: string) => {
    setIsProcessing(true);
    setErrors([]);
    setPreviewData([]);
    setDuplicateInfo(null);

    try {
      const { data, errors } = parseCSV(csv);
      
      if (data.length > 0) {
        // Check for duplicates against existing data
        const existingReadings = type === 'blood-pressure' 
          ? getStoredReadings() 
          : getStoredBloodSugarReadings();
        
        const duplicateAnalysis = findBulkDuplicates(
          data, 
          existingReadings, 
          type === 'blood-pressure' ? 'bp' : 'bs',
          { timeWindowMinutes: 5, strictMode: false } // 5-minute window for imports
        );
        
        setDuplicateInfo(duplicateAnalysis);
        setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      }
      
      setErrors(errors);
    } catch (error) {
      setErrors([error.message]);
    }

    setIsProcessing(false);
  };

  const handleImport = () => {
    if (errors.length > 0) {
      alert('Please fix the errors before importing');
      return;
    }

    try {
      const { data } = parseCSV(csvData);
      
      if (duplicateInfo && duplicateInfo.duplicates.length > 0) {
        const confirmMessage = `Found ${duplicateInfo.duplicates.length} potential duplicate(s). Do you want to import only the unique ${duplicateInfo.uniqueReadings.length} reading(s) and skip duplicates?`;
        
        if (confirm(confirmMessage)) {
          onImport(duplicateInfo.uniqueReadings);
        } else {
          // User wants to import all data including duplicates
          onImport(data);
        }
      } else {
        onImport(data);
      }
      
      onClose();
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const importUniqueOnly = () => {
    if (duplicateInfo) {
      onImport(duplicateInfo.uniqueReadings);
      onClose();
    }
  };

  const importAll = () => {
    try {
      const { data } = parseCSV(csvData);
      onImport(data);
      onClose();
    } catch (error) {
      setErrors([error.message]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import {type === 'blood-pressure' ? 'Blood Pressure' : 'Blood Sugar'} Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">CSV Format Requirements</h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>Your CSV file should include the following columns:</p>
              {type === 'blood-pressure' ? (
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><strong>Date</strong> (YYYY-MM-DD format, e.g., 2024-01-15)</li>
                  <li><strong>Time</strong> (HH:MM format, e.g., 09:30)</li>
                  <li><strong>Systolic</strong> (number, 50-300)</li>
                  <li><strong>Diastolic</strong> (number, 30-200)</li>
                  <li><strong>Pulse</strong> (optional, number, 30-200)</li>
                  <li><strong>Location</strong> (optional: home, clinic, hospital, pharmacy)</li>
                  <li><strong>Medication</strong> (optional, text)</li>
                  <li><strong>Symptoms</strong> (optional, text)</li>
                  <li><strong>Notes</strong> (optional, text)</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><strong>Date</strong> (YYYY-MM-DD format, e.g., 2024-01-15)</li>
                  <li><strong>Time</strong> (HH:MM format, e.g., 08:00)</li>
                  <li><strong>Glucose</strong> (number, 20-600 mg/dL)</li>
                  <li><strong>TestType</strong> (fasting, random, post-meal, bedtime, pre-meal)</li>
                  <li><strong>Location</strong> (optional: home, clinic, hospital, pharmacy)</li>
                  <li><strong>Medication</strong> (optional, text)</li>
                  <li><strong>MealInfo</strong> (optional, text)</li>
                  <li><strong>Symptoms</strong> (optional, text)</li>
                  <li><strong>Notes</strong> (optional, text)</li>
                </ul>
              )}
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-3 flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileText className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload CSV file or drag and drop
                </span>
              </label>
            </div>
          </div>

          {/* Manual CSV Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or Paste CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value);
                if (e.target.value.trim()) {
                  processCSV(e.target.value);
                }
              }}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Paste your CSV data here..."
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h4 className="font-semibold text-red-900 dark:text-red-100">Errors Found</h4>
              </div>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicateInfo && duplicateInfo.duplicates.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                    Duplicates Detected ({duplicateInfo.duplicates.length})
                  </h4>
                </div>
                <button
                  onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                >
                  {showDuplicateDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                Found {duplicateInfo.duplicates.length} potential duplicate(s) and {duplicateInfo.uniqueReadings.length} unique reading(s).
                Duplicates are detected based on matching core values within a 5-minute time window.
              </p>
              
              {showDuplicateDetails && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {duplicateInfo.duplicates.map((dup, index) => (
                    <div key={index} className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                      <strong>Duplicate {index + 1}:</strong> {dup.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Preview (First 5 rows)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200 dark:border-green-800">
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Date</th>
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Time</th>
                      {type === 'blood-pressure' ? (
                        
                        <>
                          <th className="text-left py-2 text-green-800 dark:text-green-200">BP</th>
                          <th className="text-left py-2 text-green-800 dark:text-green-200">Pulse</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-2 text-green-800 dark:text-green-200">Glucose</th>
                          <th className="text-left py-2 text-green-800 dark:text-green-200">Type</th>
                        </>
                      )}
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-green-100 dark:border-green-900">
                        <td className="py-2 text-green-700 dark:text-green-300">
                          {new Date(row.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-green-700 dark:text-green-300">
                          {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        {type === 'blood-pressure' ? (
                          <>
                            <td className="py-2 text-green-700 dark:text-green-300">
                              {row.systolic}/{row.diastolic}
                            </td>
                            <td className="py-2 text-green-700 dark:text-green-300">
                              {row.pulse || '-'}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 text-green-700 dark:text-green-300">
                              {row.glucose} mg/dL
                            </td>
                            <td className="py-2 text-green-700 dark:text-green-300">
                              {row.testType}
                            </td>
                          </>
                        )}
                        <td className="py-2 text-green-700 dark:text-green-300 truncate max-w-32">
                          {row.notes || row.symptoms || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            
            {duplicateInfo && duplicateInfo.duplicates.length > 0 ? (
              <>
                <button
                  onClick={importUniqueOnly}
                  disabled={duplicateInfo.uniqueReadings.length === 0 || errors.length > 0 || isProcessing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                >
                  Import {duplicateInfo.uniqueReadings.length} Unique Only
                </button>
                <button
                  onClick={importAll}
                  disabled={previewData.length === 0 || errors.length > 0 || isProcessing}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                >
                  Import All ({previewData.length})
                </button>
              </>
            ) : (
              <button
                onClick={handleImport}
                disabled={previewData.length === 0 || errors.length > 0 || isProcessing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
              >
                {isProcessing ? 'Processing...' : `Import ${previewData.length} Records`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;