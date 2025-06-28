export interface Reading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  notes?: string;
  medication?: string;
  location?: 'home' | 'clinic' | 'hospital' | 'pharmacy';
  symptoms?: string;
}

export interface BPCategory {
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  range: {
    systolic: [number, number];
    diastolic: [number, number];
  };
}