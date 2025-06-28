export interface BloodSugarReading {
  id: string;
  glucose: number; // mg/dL
  timestamp: string;
  testType: 'fasting' | 'random' | 'post-meal' | 'bedtime' | 'pre-meal';
  notes?: string;
  medication?: string;
  mealInfo?: string;
  location?: 'home' | 'clinic' | 'hospital' | 'pharmacy';
  symptoms?: string;
}

export interface GlucoseCategory {
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  ranges: {
    fasting: [number, number];
    random: [number, number];
    postMeal: [number, number];
  };
}