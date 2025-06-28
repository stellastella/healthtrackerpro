import { GlucoseCategory } from '../types/BloodSugar';

export const getGlucoseCategories = (): GlucoseCategory[] => [
  {
    label: 'Normal',
    description: 'Your blood sugar levels are within the normal range. Keep up the good work!',
    color: 'green',
    ranges: {
      fasting: [70, 99],
      random: [70, 139],
      postMeal: [70, 139]
    }
  },
  {
    label: 'Pre-diabetes',
    description: 'Your blood sugar is elevated. Consider lifestyle changes and consult your doctor.',
    color: 'yellow',
    ranges: {
      fasting: [100, 125],
      random: [140, 199],
      postMeal: [140, 199]
    }
  },
  {
    label: 'Diabetes',
    description: 'Your blood sugar indicates diabetes. Please consult with your healthcare provider.',
    color: 'orange',
    ranges: {
      fasting: [126, 300],
      random: [200, 400],
      postMeal: [200, 400]
    }
  },
  {
    label: 'Critical',
    description: 'This is a critical level. Seek immediate medical attention!',
    color: 'red',
    ranges: {
      fasting: [300, 999],
      random: [400, 999],
      postMeal: [400, 999]
    }
  }
];

export const categorizeGlucose = (glucose: number, testType: string): GlucoseCategory => {
  const categories = getGlucoseCategories();
  
  // Determine which range to use based on test type
  const rangeType = testType === 'fasting' ? 'fasting' : 
                   testType === 'post-meal' ? 'postMeal' : 'random';
  
  for (const category of categories) {
    const [min, max] = category.ranges[rangeType];
    if (glucose >= min && glucose <= max) {
      return category;
    }
  }
  
  // If glucose is below normal range
  if (glucose < 70) {
    return {
      label: 'Low Blood Sugar',
      description: 'Your blood sugar is dangerously low. Consume glucose immediately and seek medical help if symptoms persist.',
      color: 'red',
      ranges: { fasting: [0, 69], random: [0, 69], postMeal: [0, 69] }
    };
  }
  
  return categories[categories.length - 1]; // Return critical if above all ranges
};

export const calculateHbA1c = (readings: { glucose: number }[]): number => {
  if (readings.length === 0) return 0;
  
  const avgGlucose = readings.reduce((sum, reading) => sum + reading.glucose, 0) / readings.length;
  // Formula: HbA1c = (average glucose + 46.7) / 28.7
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
};

export const getTimeInRange = (readings: { glucose: number; testType: string }[]): {
  inRange: number;
  belowRange: number;
  aboveRange: number;
} => {
  if (readings.length === 0) return { inRange: 0, belowRange: 0, aboveRange: 0 };
  
  let inRange = 0;
  let belowRange = 0;
  let aboveRange = 0;
  
  readings.forEach(reading => {
    if (reading.glucose < 70) {
      belowRange++;
    } else if (reading.glucose > 180) {
      aboveRange++;
    } else {
      inRange++;
    }
  });
  
  const total = readings.length;
  return {
    inRange: Math.round((inRange / total) * 100),
    belowRange: Math.round((belowRange / total) * 100),
    aboveRange: Math.round((aboveRange / total) * 100)
  };
};