import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BloodPressureService } from '../services/bloodPressureService';
import { BloodSugarService } from '../services/bloodSugarService';
import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { getStoredReadings, saveReadings, getStoredBloodSugarReadings, saveBloodSugarReadings } from '../utils/storage';
import { checkForBPDuplicate, checkForBSDuplicate } from '../utils/duplicateDetection';

export const useCloudSync = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncQueue, setSyncQueue] = useState<{type: string, action: string, data: any}[]>([]);
  
  // Use refs to prevent excessive re-renders and manage sync state
  const isSyncingRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncAttemptRef = useRef<number>(0);
  
  // Minimum time between automatic syncs (5 minutes)
  const MIN_SYNC_INTERVAL = 5 * 60 * 1000;

  // Unified sync logic with debouncing and batching
  const syncData = useCallback(async (direction: 'up' | 'down' | 'both' = 'both', isUserTriggered = false) => {
    // Prevent multiple syncs at the same time
    if (!user || isSyncingRef.current) return;
    
    // For automatic syncs, enforce minimum interval
    if (!isUserTriggered) {
      const now = Date.now();
      if (now - lastSyncAttemptRef.current < MIN_SYNC_INTERVAL) {
        return;
      }
    }
    
    // Update sync attempt timestamp
    lastSyncAttemptRef.current = Date.now();
    
    // Mark sync as in progress
    isSyncingRef.current = true;
    setSyncing(true);
    
    try {
      if (direction === 'down' || direction === 'both') {
        // Sync cloud data to local with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const [cloudBP, cloudBS] = await Promise.all([
            BloodPressureService.getReadings(user.id),
            BloodSugarService.getReadings(user.id)
          ]);
          
          clearTimeout(timeoutId);

          // Only save if we got valid data
          if (Array.isArray(cloudBP) && cloudBP.length > 0) {
            saveReadings(cloudBP);
          }
          
          if (Array.isArray(cloudBS) && cloudBS.length > 0) {
            saveBloodSugarReadings(cloudBS);
          }
        } catch (error) {
          console.error('Error fetching cloud data:', error);
          // Continue with local data if cloud fetch fails
        }
      }

      if (direction === 'up' || direction === 'both') {
        try {
          // Process sync queue if any
          if (syncQueue.length > 0) {
            // Process in batches
            const bpCreates = syncQueue
              .filter(item => item.type === 'bp' && item.action === 'create')
              .map(item => item.data);
              
            const bsCreates = syncQueue
              .filter(item => item.type === 'bs' && item.action === 'create')
              .map(item => item.data);
              
            const bpDeletes = syncQueue
              .filter(item => item.type === 'bp' && item.action === 'delete')
              .map(item => item.data);
              
            const bsDeletes = syncQueue
              .filter(item => item.type === 'bs' && item.action === 'delete')
              .map(item => item.data);
            
            // Process batches with timeouts
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            try {
              // Process batches in parallel
              await Promise.all([
                // Only run if there's data to process
                bpCreates.length > 0 ? BloodPressureService.bulkCreateReadings(user.id, bpCreates) : Promise.resolve([]),
                bsCreates.length > 0 ? BloodSugarService.bulkCreateReadings(user.id, bsCreates) : Promise.resolve([]),
                
                // Process deletes in parallel batches
                Promise.all(bpDeletes.map(id => BloodPressureService.deleteReading(user.id, id))),
                Promise.all(bsDeletes.map(id => BloodSugarService.deleteReading(user.id, id)))
              ]);
              
              // Clear queue after processing
              setSyncQueue([]);
            } catch (error) {
              console.error('Error processing sync operations:', error);
              // Keep the queue for retry
            } finally {
              clearTimeout(timeoutId);
            }
          }
        } catch (error) {
          console.error('Error processing sync queue:', error);
        }
      }

      // Update sync time
      const syncTime = new Date();
      setLastSyncTime(syncTime);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
      
      // Allow a small delay before allowing another sync
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 2000);
    }
  }, [user, syncQueue]);

  // Process sync queue periodically with exponential backoff
  useEffect(() => {
    if (!user || syncQueue.length === 0 || isSyncingRef.current) return;
    
    // Use exponential backoff based on queue size
    const delay = Math.min(2000 + (syncQueue.length * 100), 10000);
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      syncData('up', false);
    }, delay);
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncQueue, user, syncData]);

  // Simplified CRUD operations with direct cloud sync
  const createBPReading = useCallback(async (reading: Omit<Reading, 'id'>) => {
    try {
      const existingReadings = getStoredReadings();
      const duplicateCheck = checkForBPDuplicate(reading, existingReadings, { timeWindowMinutes: 5 });
      
      if (duplicateCheck.isDuplicate) {
        throw new Error(duplicateCheck.message);
      }

      // Generate a unique ID for the reading
      const newId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create the new reading object
      const newReading: Reading = { 
        ...reading, 
        id: newId
      };
      
      // Save to local storage first for immediate feedback
      const localReadings = getStoredReadings();
      const updatedReadings = [newReading, ...localReadings.filter(r => r.id !== newId)];
      saveReadings(updatedReadings);
      
      // If user is logged in, create in cloud directly
      if (user) {
        try {
          // Direct cloud save for immediate persistence
          const cloudReading = await BloodPressureService.createReading(user.id, reading);
          
          // Update local storage with cloud ID
          const updatedWithCloudId = updatedReadings.map(r => 
            r.id === newId ? { ...r, id: cloudReading.id } : r
          );
          saveReadings(updatedWithCloudId);
          
          // Return the cloud reading with proper ID
          return cloudReading;
        } catch (error) {
          console.error('Error saving to cloud, queuing for sync:', error);
          // Fall back to queue if direct save fails
          setSyncQueue(prev => [...prev, {
            type: 'bp',
            action: 'create',
            data: reading
          }]);
          return newReading;
        }
      } else {
        // Not logged in, just return the local reading
        return newReading;
      }
    } catch (error) {
      console.error('Error in createBPReading:', error);
      throw error;
    }
  }, [user]);

  const createBSReading = useCallback(async (reading: Omit<BloodSugarReading, 'id'>) => {
    try {
      const existingReadings = getStoredBloodSugarReadings();
      const duplicateCheck = checkForBSDuplicate(reading, existingReadings, { timeWindowMinutes: 5 });
      
      if (duplicateCheck.isDuplicate) {
        throw new Error(duplicateCheck.message);
      }

      // Generate a unique ID for the reading
      const newId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create the new reading object
      const newReading: BloodSugarReading = { 
        ...reading, 
        id: newId
      };
      
      // Save to local storage first for immediate feedback
      const localReadings = getStoredBloodSugarReadings();
      const updatedReadings = [newReading, ...localReadings.filter(r => r.id !== newId)];
      saveBloodSugarReadings(updatedReadings);
      
      // If user is logged in, create in cloud directly
      if (user) {
        try {
          // Direct cloud save for immediate persistence
          const cloudReading = await BloodSugarService.createReading(user.id, reading);
          
          // Update local storage with cloud ID
          const updatedWithCloudId = updatedReadings.map(r => 
            r.id === newId ? { ...r, id: cloudReading.id } : r
          );
          saveBloodSugarReadings(updatedWithCloudId);
          
          // Return the cloud reading with proper ID
          return cloudReading;
        } catch (error) {
          console.error('Error saving to cloud, queuing for sync:', error);
          // Fall back to queue if direct save fails
          setSyncQueue(prev => [...prev, {
            type: 'bs',
            action: 'create',
            data: reading
          }]);
          return newReading;
        }
      } else {
        // Not logged in, just return the local reading
        return newReading;
      }
    } catch (error) {
      console.error('Error in createBSReading:', error);
      throw error;
    }
  }, [user]);

  const deleteBPReading = useCallback(async (id: string) => {
    try {
      // Delete locally first
      const localReadings = getStoredReadings();
      saveReadings(localReadings.filter(r => r.id !== id));
      
      // If user is logged in and it's not a local-only ID, delete from cloud
      if (user && !id.startsWith('local-')) {
        try {
          // Direct cloud delete for immediate persistence
          await BloodPressureService.deleteReading(user.id, id);
        } catch (error) {
          console.error('Error deleting from cloud, queuing for sync:', error);
          // Fall back to queue if direct delete fails
          setSyncQueue(prev => [...prev, {
            type: 'bp',
            action: 'delete',
            data: id
          }]);
        }
      }
    } catch (error) {
      console.error('Error in deleteBPReading:', error);
      throw error;
    }
  }, [user]);

  const deleteBSReading = useCallback(async (id: string) => {
    try {
      // Delete locally first
      const localReadings = getStoredBloodSugarReadings();
      saveBloodSugarReadings(localReadings.filter(r => r.id !== id));
      
      // If user is logged in and it's not a local-only ID, delete from cloud
      if (user && !id.startsWith('local-')) {
        try {
          // Direct cloud delete for immediate persistence
          await BloodSugarService.deleteReading(user.id, id);
        } catch (error) {
          console.error('Error deleting from cloud, queuing for sync:', error);
          // Fall back to queue if direct delete fails
          setSyncQueue(prev => [...prev, {
            type: 'bs',
            action: 'delete',
            data: id
          }]);
        }
      }
    } catch (error) {
      console.error('Error in deleteBSReading:', error);
      throw error;
    }
  }, [user]);

  // Auto-sync when user signs in - with debounce and rate limiting
  useEffect(() => {
    if (user && !isSyncingRef.current) {
      // Initial sync when user signs in
      const timer = setTimeout(() => {
        syncData('both', true).catch(error => {
          console.error('Initial sync error:', error);
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, syncData]);

  return {
    syncing,
    lastSyncTime,
    syncLocalDataToCloud: () => syncData('up', true),
    syncCloudDataToLocal: () => syncData('down', true),
    createBPReading,
    createBSReading,
    deleteBPReading,
    deleteBSReading,
  };
};