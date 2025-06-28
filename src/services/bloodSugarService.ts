import { supabase } from '../lib/supabase';
import { BloodSugarReading } from '../types/BloodSugar';
import { Database } from '../lib/supabase';

type BloodSugarRow = Database['public']['Tables']['blood_sugar_readings']['Row'];
type BloodSugarInsert = Database['public']['Tables']['blood_sugar_readings']['Insert'];

export class BloodSugarService {
  static async getReadings(userId: string): Promise<BloodSugarReading[]> {
    try {
      const { data, error } = await supabase
        .from('blood_sugar_readings')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching blood sugar readings:', error);
        throw error;
      }

      return data.map(this.mapRowToReading);
    } catch (error) {
      console.error('Error in getReadings:', error);
      throw error;
    }
  }

  static async createReading(userId: string, reading: Omit<BloodSugarReading, 'id'>): Promise<BloodSugarReading> {
    try {
      const insertData: BloodSugarInsert = {
        user_id: userId,
        glucose: reading.glucose,
        test_type: reading.testType,
        location: reading.location || 'home',
        medication: reading.medication || null,
        meal_info: reading.mealInfo || null,
        symptoms: reading.symptoms || null,
        notes: reading.notes || null,
        recorded_at: reading.timestamp,
      };

      // Log the data being sent to Supabase
      console.log('Creating blood sugar reading with data:', insertData);

      const { data, error } = await supabase
        .from('blood_sugar_readings')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating blood sugar reading:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      console.log('Successfully created blood sugar reading:', data);
      return this.mapRowToReading(data);
    } catch (error) {
      console.error('Error in createReading:', error);
      throw error;
    }
  }

  static async updateReading(userId: string, id: string, updates: Partial<BloodSugarReading>): Promise<BloodSugarReading> {
    try {
      const updateData: Partial<BloodSugarInsert> = {};
      
      if (updates.glucose !== undefined) updateData.glucose = updates.glucose;
      if (updates.testType !== undefined) updateData.test_type = updates.testType;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.medication !== undefined) updateData.medication = updates.medication || null;
      if (updates.mealInfo !== undefined) updateData.meal_info = updates.mealInfo || null;
      if (updates.symptoms !== undefined) updateData.symptoms = updates.symptoms || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.timestamp !== undefined) updateData.recorded_at = updates.timestamp;

      const { data, error } = await supabase
        .from('blood_sugar_readings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating blood sugar reading:', error);
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
        .from('blood_sugar_readings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting blood sugar reading:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteReading:', error);
      throw error;
    }
  }

  static async bulkCreateReadings(userId: string, readings: Omit<BloodSugarReading, 'id'>[]): Promise<BloodSugarReading[]> {
    try {
      // Process in smaller batches to avoid request size limits
      const BATCH_SIZE = 50;
      const results: BloodSugarReading[] = [];
      
      for (let i = 0; i < readings.length; i += BATCH_SIZE) {
        const batch = readings.slice(i, i + BATCH_SIZE);
        
        const insertData: BloodSugarInsert[] = batch.map(reading => ({
          user_id: userId,
          glucose: reading.glucose,
          test_type: reading.testType,
          location: reading.location || 'home',
          medication: reading.medication || null,
          meal_info: reading.mealInfo || null,
          symptoms: reading.symptoms || null,
          notes: reading.notes || null,
          recorded_at: reading.timestamp,
        }));

        console.log(`Creating batch ${i/BATCH_SIZE + 1} of blood sugar readings (${batch.length} items)`);
        
        const { data, error } = await supabase
          .from('blood_sugar_readings')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Error bulk creating blood sugar readings:', error);
          throw error;
        }

        if (data) {
          console.log(`Successfully created ${data.length} blood sugar readings`);
          results.push(...data.map(this.mapRowToReading));
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulkCreateReadings:', error);
      throw error;
    }
  }

  private static mapRowToReading(row: BloodSugarRow): BloodSugarReading {
    return {
      id: row.id,
      glucose: row.glucose,
      testType: row.test_type as 'fasting' | 'random' | 'post-meal' | 'bedtime' | 'pre-meal',
      location: row.location as 'home' | 'clinic' | 'hospital' | 'pharmacy',
      medication: row.medication || undefined,
      mealInfo: row.meal_info || undefined,
      symptoms: row.symptoms || undefined,
      notes: row.notes || undefined,
      timestamp: row.recorded_at,
    };
  }
}