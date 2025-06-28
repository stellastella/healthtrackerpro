import { supabase } from '../lib/supabase';
import { Reading } from '../types/Reading';
import { Database } from '../lib/supabase';

type BloodPressureRow = Database['public']['Tables']['blood_pressure_readings']['Row'];
type BloodPressureInsert = Database['public']['Tables']['blood_pressure_readings']['Insert'];

export class BloodPressureService {
  static async getReadings(userId: string): Promise<Reading[]> {
    try {
      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching blood pressure readings:', error);
        throw error;
      }

      return data.map(this.mapRowToReading);
    } catch (error) {
      console.error('Error in getReadings:', error);
      throw error;
    }
  }

  static async createReading(userId: string, reading: Omit<Reading, 'id'>): Promise<Reading> {
    try {
      const insertData: BloodPressureInsert = {
        user_id: userId,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        pulse: reading.pulse || null,
        location: reading.location || 'home',
        medication: reading.medication || null,
        symptoms: reading.symptoms || null,
        notes: reading.notes || null,
        recorded_at: reading.timestamp,
      };

      // Log the data being sent to Supabase
      console.log('Creating blood pressure reading with data:', insertData);

      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating blood pressure reading:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      console.log('Successfully created blood pressure reading:', data);
      return this.mapRowToReading(data);
    } catch (error) {
      console.error('Error in createReading:', error);
      throw error;
    }
  }

  static async updateReading(userId: string, id: string, updates: Partial<Reading>): Promise<Reading> {
    try {
      const updateData: Partial<BloodPressureInsert> = {};
      
      if (updates.systolic !== undefined) updateData.systolic = updates.systolic;
      if (updates.diastolic !== undefined) updateData.diastolic = updates.diastolic;
      if (updates.pulse !== undefined) updateData.pulse = updates.pulse || null;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.medication !== undefined) updateData.medication = updates.medication || null;
      if (updates.symptoms !== undefined) updateData.symptoms = updates.symptoms || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.timestamp !== undefined) updateData.recorded_at = updates.timestamp;

      const { data, error } = await supabase
        .from('blood_pressure_readings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating blood pressure reading:', error);
        throw error;
      }

      return this.mapRowToReading(data);
    } catch (error) {
      console.error('Error in updateReading:', error);
      throw error;
    }
  }

  static async deleteReading(userId: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blood_pressure_readings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting blood pressure reading:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteReading:', error);
      throw error;
    }
  }

  static async bulkCreateReadings(userId: string, readings: Omit<Reading, 'id'>[]): Promise<Reading[]> {
    try {
      // Process in smaller batches to avoid request size limits
      const BATCH_SIZE = 50;
      const results: Reading[] = [];
      
      for (let i = 0; i < readings.length; i += BATCH_SIZE) {
        const batch = readings.slice(i, i + BATCH_SIZE);
        
        const insertData: BloodPressureInsert[] = batch.map(reading => ({
          user_id: userId,
          systolic: reading.systolic,
          diastolic: reading.diastolic,
          pulse: reading.pulse || null,
          location: reading.location || 'home',
          medication: reading.medication || null,
          symptoms: reading.symptoms || null,
          notes: reading.notes || null,
          recorded_at: reading.timestamp,
        }));

        console.log(`Creating batch ${i/BATCH_SIZE + 1} of blood pressure readings (${batch.length} items)`);
        
        const { data, error } = await supabase
          .from('blood_pressure_readings')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Error bulk creating blood pressure readings:', error);
          throw error;
        }

        if (data) {
          console.log(`Successfully created ${data.length} blood pressure readings`);
          results.push(...data.map(this.mapRowToReading));
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulkCreateReadings:', error);
      throw error;
    }
  }

  private static mapRowToReading(row: BloodPressureRow): Reading {
    return {
      id: row.id,
      systolic: row.systolic,
      diastolic: row.diastolic,
      pulse: row.pulse || undefined,
      location: row.location as 'home' | 'clinic' | 'hospital' | 'pharmacy',
      medication: row.medication || undefined,
      symptoms: row.symptoms || undefined,
      notes: row.notes || undefined,
      timestamp: row.recorded_at,
    };
  }
}