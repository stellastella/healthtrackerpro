import { BPCategory } from '../types/Reading';

export const getBPCategories = (): BPCategory[] => [
  {
    label: 'Normal',
    description: 'Your blood pressure is in the normal range. Keep up the good work!',
    color: 'green',
    range: {
      systolic: [0, 120],
      diastolic: [0, 80]
    }
  },
  {
    label: 'Elevated',
    description: 'Your systolic pressure is elevated. Consider lifestyle changes.',
    color: 'yellow',
    range: {
      systolic: [120, 129],
      diastolic: [0, 80]
    }
  },
  {
    label: 'High BP Stage 1',
    description: 'You have stage 1 high blood pressure. Consult your doctor.',
    color: 'orange',
    range: {
      systolic: [130, 139],
      diastolic: [80, 89]
    }
  },
  {
    label: 'High BP Stage 2',
    description: 'You have stage 2 high blood pressure. See your doctor promptly.',
    color: 'red',
    range: {
      systolic: [140, 179],
      diastolic: [90, 119]
    }
  },
  {
    label: 'Hypertensive Crisis',
    description: 'This is a medical emergency. Seek immediate medical attention!',
    color: 'red',
    range: {
      systolic: [180, 999],
      diastolic: [120, 999]
    }
  }
];

export const categorizeBP = (systolic: number, diastolic: number): BPCategory => {
  const categories = getBPCategories();
  
  // Special case for hypertensive crisis
  if (systolic >= 180 || diastolic >= 120) {
    return categories[4]; // Hypertensive Crisis
  }
  
  // Check each category in order
  for (let i = 0; i < categories.length - 1; i++) {
    const category = categories[i];
    
    if (systolic <= category.range.systolic[1] && diastolic <= category.range.diastolic[1]) {
      return category;
    }
  }
  
  // If systolic is in a higher category than diastolic, use the higher category
  if (systolic >= 140 || diastolic >= 90) {
    return categories[3]; // High BP Stage 2
  }
  
  if (systolic >= 130 || diastolic >= 80) {
    return categories[2]; // High BP Stage 1
  }
  
  if (systolic >= 120 && diastolic < 80) {
    return categories[1]; // Elevated
  }
  
  return categories[0]; // Normal
};