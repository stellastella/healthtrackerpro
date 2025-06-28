import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';

// Unified storage utility with generic type support
class StorageUtil<T> {
  constructor(private key: string) {}

  get(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving data from storage for key ${this.key}:`, error);
      return [];
    }
  }

  save(items: T[]): void {
    try {
      // Sort items by timestamp if they have one
      const sortedItems = [...items].sort((a: any, b: any) => {
        if (a.timestamp && b.timestamp) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
      });
      
      localStorage.setItem(this.key, JSON.stringify(sortedItems));
    } catch (error) {
      console.error(`Storage error for ${this.key}:`, error);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error clearing storage for key ${this.key}:`, error);
    }
  }
}

// Singleton instances
const bpStorage = new StorageUtil<Reading>('blood-pressure-readings');
const bsStorage = new StorageUtil<BloodSugarReading>('blood-sugar-readings');

// Simplified API
export const getStoredReadings = () => bpStorage.get();

export const saveReadings = (readings: Reading[]) => bpStorage.save(readings);
export const clearAllReadings = () => bpStorage.clear();

export const getStoredBloodSugarReadings = () => bsStorage.get();

export const saveBloodSugarReadings = (readings: BloodSugarReading[]) => bsStorage.save(readings);
export const clearAllBloodSugarReadings = () => bsStorage.clear();