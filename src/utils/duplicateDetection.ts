import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateEntry?: any;
  message?: string;
}

interface DuplicateOptions {
  timeWindowMinutes?: number;
  strictMode?: boolean;
}

// Unified duplicate detection logic
const checkDuplicate = (
  newItem: any,
  existingItems: any[],
  coreMatch: (existing: any, newItem: any) => boolean,
  messageBuilder: (existing: any) => string,
  options: DuplicateOptions = {}
): DuplicateCheckResult => {
  const { timeWindowMinutes = 1 } = options;
  const timeWindow = timeWindowMinutes * 60000;
  const newTime = new Date(newItem.timestamp).getTime();

  for (const existing of existingItems) {
    const timeDiff = Math.abs(new Date(existing.timestamp).getTime() - newTime);
    
    if (timeDiff <= timeWindow && coreMatch(existing, newItem)) {
      return {
        isDuplicate: true,
        duplicateEntry: existing,
        message: `Duplicate entry detected! ${messageBuilder(existing)}`
      };
    }
  }

  return { isDuplicate: false };
};

export const checkForBPDuplicate = (
  newReading: Omit<Reading, 'id'>,
  existingReadings: Reading[],
  options?: DuplicateOptions
): DuplicateCheckResult => {
  return checkDuplicate(
    newReading,
    existingReadings,
    (existing, newItem) => 
      existing.systolic === newItem.systolic &&
      existing.diastolic === newItem.diastolic &&
      (existing.pulse || 0) === (newItem.pulse || 0),
    (existing) => 
      `A reading with ${existing.systolic}/${existing.diastolic} mmHg at ${new Date(existing.timestamp).toLocaleString()} already exists.`,
    options
  );
};

export const checkForBSDuplicate = (
  newReading: Omit<BloodSugarReading, 'id'>,
  existingReadings: BloodSugarReading[],
  options?: DuplicateOptions
): DuplicateCheckResult => {
  return checkDuplicate(
    newReading,
    existingReadings,
    (existing, newItem) => 
      existing.glucose === newItem.glucose && existing.testType === newItem.testType,
    (existing) => 
      `A ${existing.testType} reading with ${existing.glucose} mg/dL at ${new Date(existing.timestamp).toLocaleString()} already exists.`,
    options
  );
};

// Bulk duplicate detection
export const findBulkDuplicates = (
  newReadings: any[],
  existingReadings: any[],
  type: 'bp' | 'bs',
  options?: DuplicateOptions
) => {
  const checkFunction = type === 'bp' ? checkForBPDuplicate : checkForBSDuplicate;
  const duplicates: any[] = [];
  const uniqueReadings: any[] = [];

  for (const reading of newReadings) {
    const check = checkFunction(reading, existingReadings, options);
    if (check.isDuplicate) {
      duplicates.push({ newReading: reading, duplicateEntry: check.duplicateEntry, message: check.message });
    } else {
      uniqueReadings.push(reading);
    }
  }

  return { duplicates, uniqueReadings };
};

// Simplified formatting
export const formatDuplicateDetails = (entry: any, type: 'bp' | 'bs'): string => {
  const time = new Date(entry.timestamp).toLocaleString();
  
  if (type === 'bp') {
    return `📊 BP: ${entry.systolic}/${entry.diastolic} mmHg\n🕐 Time: ${time}${
      entry.pulse ? `\n💓 Pulse: ${entry.pulse} bpm` : ''
    }${entry.medication ? `\n💊 Medication: ${entry.medication}` : ''}`;
  }
  
  return `🩸 Glucose: ${entry.glucose} mg/dL\n🧪 Type: ${entry.testType}\n🕐 Time: ${time}${
    entry.medication ? `\n💊 Medication: ${entry.medication}` : ''
  }`;
};