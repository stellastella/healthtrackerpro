import { Reading } from '../types/Reading';
import { BloodSugarReading } from '../types/BloodSugar';
import { categorizeBP } from './bloodPressure';
import { categorizeGlucose } from './bloodSugar';

export interface HealthAlert {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'trend' | 'pattern' | 'threshold' | 'timing' | 'lifestyle';
  category: 'blood_pressure' | 'blood_sugar' | 'general';
  timestamp: string;
  recommendations?: string[];
}

// Simplified alert creation
const createAlert = (
  id: string,
  title: string,
  message: string,
  priority: HealthAlert['priority'],
  type: HealthAlert['type'],
  category: HealthAlert['category'],
  recommendations: string[] = []
): HealthAlert => ({
  id,
  title,
  message,
  priority,
  type,
  category,
  timestamp: new Date().toISOString(),
  recommendations
});

// Get recent readings helper
const getRecentReadings = <T extends { timestamp: string }>(readings: T[], days = 7): T[] => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return readings.filter(r => new Date(r.timestamp) >= cutoff);
};

// Blood pressure alerts
const generateBPAlerts = (readings: Reading[]): HealthAlert[] => {
  if (readings.length < 2) return [];

  const alerts: HealthAlert[] = [];
  const recent = getRecentReadings(readings);
  
  // Get the latest reading
  const latestReading = readings[0];
  if (latestReading) {
    const category = categorizeBP(latestReading.systolic, latestReading.diastolic);
    
    // Critical alert for hypertensive crisis
    if (category.label === 'Hypertensive Crisis') {
      alerts.push(createAlert(
        `bp-crisis-${Date.now()}`,
        '🚨 Hypertensive Crisis Detected',
        `Your latest blood pressure reading (${latestReading.systolic}/${latestReading.diastolic} mmHg) indicates a hypertensive crisis. This is a medical emergency.`,
        'critical',
        'threshold',
        'blood_pressure',
        [
          'Seek immediate medical attention',
          'Rest in a calm, quiet environment',
          'Do not drive yourself to the hospital',
          'Take any emergency medication as prescribed by your doctor'
        ]
      ));
    }
    // High alert for Stage 2 hypertension
    else if (category.label === 'High BP Stage 2') {
      alerts.push(createAlert(
        `bp-stage2-${Date.now()}`,
        '⚠️ Stage 2 Hypertension Detected',
        `Your latest blood pressure reading (${latestReading.systolic}/${latestReading.diastolic} mmHg) indicates Stage 2 Hypertension. This requires prompt medical attention.`,
        'high',
        'threshold',
        'blood_pressure',
        [
          'Contact your healthcare provider within 1-2 days',
          'Take medications as prescribed',
          'Reduce sodium intake immediately',
          'Monitor your blood pressure closely'
        ]
      ));
    }
    // Medium alert for Stage 1 hypertension
    else if (category.label === 'High BP Stage 1') {
      alerts.push(createAlert(
        `bp-stage1-${Date.now()}`,
        '⚠️ Stage 1 Hypertension Detected',
        `Your latest blood pressure reading (${latestReading.systolic}/${latestReading.diastolic} mmHg) indicates Stage 1 Hypertension. This requires attention.`,
        'medium',
        'threshold',
        'blood_pressure',
        [
          'Schedule a check-up with your healthcare provider',
          'Consider the DASH diet to reduce blood pressure',
          'Limit alcohol consumption',
          'Increase physical activity'
        ]
      ));
    }
  }

  // Consecutive elevated mornings
  const morningReadings = recent.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 6 && hour <= 10;
  }).slice(0, 5);

  if (morningReadings.length >= 3) {
    const elevatedCount = morningReadings.filter(r => {
      const category = categorizeBP(r.systolic, r.diastolic);
      return category.color === 'orange' || category.color === 'red';
    }).length;

    if (elevatedCount >= 3) {
      alerts.push(createAlert(
        `bp-morning-${Date.now()}`,
        '🌅 Elevated Morning Blood Pressure',
        `Your blood pressure has been elevated for ${elevatedCount} consecutive mornings. This could indicate stress, dehydration, or medication timing issues.`,
        elevatedCount >= 4 ? 'high' : 'medium',
        'pattern',
        'blood_pressure',
        [
          'Check hydration levels - drink water upon waking',
          'Review sleep quality and stress levels',
          'Consider medication timing with your doctor',
          'Practice morning relaxation techniques'
        ]
      ));
    }
  }

  // Rapid increase trend
  if (recent.length >= 5) {
    const last5 = recent.slice(0, 5);
    const oldAvg = (last5[4].systolic + last5[3].systolic) / 2;
    const newAvg = (last5[1].systolic + last5[0].systolic) / 2;
    const increase = newAvg - oldAvg;

    if (increase >= 15) {
      alerts.push(createAlert(
        `bp-increase-${Date.now()}`,
        '📈 Rapid Blood Pressure Increase',
        `Your systolic pressure has increased by ${Math.round(increase)} mmHg in recent readings.`,
        increase >= 25 ? 'high' : 'medium',
        'trend',
        'blood_pressure',
        [
          'Monitor stress levels and recent changes',
          'Review new medications or supplements',
          'Check sodium intake',
          'Schedule a healthcare provider visit'
        ]
      ));
    }
  }
  
  // Nighttime elevated readings
  const nightReadings = recent.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 22 || hour <= 4;
  });
  
  if (nightReadings.length >= 2) {
    const elevatedNightReadings = nightReadings.filter(r => {
      const category = categorizeBP(r.systolic, r.diastolic);
      return category.color === 'orange' || category.color === 'red';
    });
    
    if (elevatedNightReadings.length >= 2) {
      alerts.push(createAlert(
        `bp-night-${Date.now()}`,
        '🌙 Elevated Nighttime Blood Pressure',
        `You have ${elevatedNightReadings.length} elevated blood pressure readings at night. Nighttime hypertension can indicate non-dipping pattern, which may increase cardiovascular risk.`,
        'medium',
        'timing',
        'blood_pressure',
        [
          'Discuss with your doctor about 24-hour ambulatory monitoring',
          'Avoid caffeine and alcohol in the evening',
          'Establish a regular sleep schedule',
          'Consider timing of blood pressure medications'
        ]
      ));
    }
  }
  
  // Medication effectiveness
  if (recent.length >= 5) {
    const medicatedReadings = recent.filter(r => r.medication);
    
    if (medicatedReadings.length >= 3) {
      const highReadingsWithMeds = medicatedReadings.filter(r => {
        const category = categorizeBP(r.systolic, r.diastolic);
        return category.color === 'orange' || category.color === 'red';
      });
      
      if (highReadingsWithMeds.length >= 3) {
        alerts.push(createAlert(
          `bp-medication-${Date.now()}`,
          '💊 Medication Effectiveness Alert',
          `You have ${highReadingsWithMeds.length} elevated readings despite taking medication. Your current treatment may need adjustment.`,
          'high',
          'pattern',
          'blood_pressure',
          [
            'Schedule an appointment with your doctor to review medication',
            'Ensure you\'re taking medication as prescribed',
            'Keep a detailed log of when you take medication and readings',
            'Don\'t change medication dosage without consulting your doctor'
          ]
        ));
      }
    }
  }
  
  // Lifestyle pattern detection
  if (recent.length >= 7) {
    // Check for symptoms patterns
    const symptomsReadings = recent.filter(r => r.symptoms);
    if (symptomsReadings.length >= 3) {
      const commonSymptoms = findCommonTerms(symptomsReadings.map(r => r.symptoms || ''));
      
      if (commonSymptoms.length > 0) {
        alerts.push(createAlert(
          `bp-symptoms-${Date.now()}`,
          '🔍 Recurring Symptoms Detected',
          `You've reported "${commonSymptoms.join(', ')}" multiple times with your blood pressure readings. These recurring symptoms may be related to your blood pressure.`,
          'medium',
          'pattern',
          'blood_pressure',
          [
            'Track when these symptoms occur in relation to your readings',
            'Discuss these recurring symptoms with your healthcare provider',
            'Note any triggers that seem to precede these symptoms',
            'Consider keeping a dedicated symptom journal'
          ]
        ));
      }
    }
  }

  return alerts;
};

// Blood sugar alerts
const generateBSAlerts = (readings: BloodSugarReading[]): HealthAlert[] => {
  if (readings.length < 2) return [];

  const alerts: HealthAlert[] = [];
  const recent = getRecentReadings(readings);
  
  // Get the latest reading
  const latestReading = readings[0];
  if (latestReading) {
    const category = categorizeGlucose(latestReading.glucose, latestReading.testType);
    
    // Critical high alert
    if (latestReading.glucose > 300) {
      alerts.push(createAlert(
        `bs-critical-high-${Date.now()}`,
        '🚨 Critical High Blood Sugar',
        `Your latest blood sugar reading (${latestReading.glucose} mg/dL) is dangerously high. This requires immediate attention.`,
        'critical',
        'threshold',
        'blood_sugar',
        [
          'Contact your healthcare provider immediately',
          'Check for ketones if you have type 1 diabetes',
          'Stay hydrated with water',
          'Follow your sick day management plan if you have one'
        ]
      ));
    }
    // Critical low alert
    else if (latestReading.glucose < 70) {
      alerts.push(createAlert(
        `bs-critical-low-${Date.now()}`,
        '🚨 Low Blood Sugar Alert',
        `Your latest blood sugar reading (${latestReading.glucose} mg/dL) is below the safe threshold. This requires immediate action.`,
        'critical',
        'threshold',
        'blood_sugar',
        [
          'Consume 15-20g of fast-acting carbohydrates immediately',
          'Recheck blood sugar after 15 minutes',
          'If still low, repeat treatment',
          'Once normalized, eat a small snack if your next meal is more than an hour away'
        ]
      ));
    }
    // High alert for diabetes range
    else if (category.label === 'Diabetes' && latestReading.glucose >= 200) {
      alerts.push(createAlert(
        `bs-diabetes-range-${Date.now()}`,
        '⚠️ Diabetes Range Blood Sugar',
        `Your latest ${latestReading.testType} blood sugar reading (${latestReading.glucose} mg/dL) is in the diabetes range.`,
        'high',
        'threshold',
        'blood_sugar',
        [
          'Contact your healthcare provider to discuss this reading',
          'Review your meal plan and carbohydrate intake',
          'Ensure you\'re taking medications as prescribed',
          'Increase physical activity if appropriate and approved by your doctor'
        ]
      ));
    }
  }

  // Elevated fasting glucose
  const fastingReadings = recent.filter(r => r.testType === 'fasting').slice(0, 5);
  
  if (fastingReadings.length >= 3) {
    const highCount = fastingReadings.filter(r => r.glucose >= 100).length;
    
    if (highCount >= 3) {
      alerts.push(createAlert(
        `bs-fasting-${Date.now()}`,
        '🌅 Elevated Fasting Blood Sugar',
        `Your fasting blood sugar has been elevated (≥100 mg/dL) for ${highCount} recent tests.`,
        highCount >= 4 ? 'high' : 'medium',
        'pattern',
        'blood_sugar',
        [
          'Avoid eating 3-4 hours before bedtime',
          'Limit refined carbohydrates',
          'Increase physical activity after meals',
          'Schedule HbA1c test with healthcare provider'
        ]
      ));
    }
  }

  // Low blood sugar episodes
  const lowReadings = recent.filter(r => r.glucose < 70);
  
  if (lowReadings.length >= 2) {
    alerts.push(createAlert(
      `bs-low-${Date.now()}`,
      '⚠️ Low Blood Sugar Episodes',
      `You've had ${lowReadings.length} episodes of low blood sugar (<70 mg/dL) recently.`,
      lowReadings.length >= 3 ? 'high' : 'medium',
      'threshold',
      'blood_sugar',
      [
        'Always carry glucose tablets',
        'Eat regular meals and snacks',
        'Review medication timing with doctor',
        'Learn hypoglycemia symptoms'
      ]
    ));
  }
  
  // Post-meal spikes
  const postMealReadings = recent.filter(r => r.testType === 'post-meal');
  if (postMealReadings.length >= 3) {
    const highPostMealCount = postMealReadings.filter(r => r.glucose > 180).length;
    
    if (highPostMealCount >= 2) {
      alerts.push(createAlert(
        `bs-postmeal-${Date.now()}`,
        '🍽️ High Post-Meal Blood Sugar',
        `You have ${highPostMealCount} high post-meal blood sugar readings (>180 mg/dL). This suggests your meals may be affecting your glucose control.`,
        'medium',
        'pattern',
        'blood_sugar',
        [
          'Consider lower carbohydrate meal options',
          'Try taking a 15-minute walk after meals',
          'Eat protein and fat before carbohydrates in your meal',
          'Discuss meal-time medication adjustments with your doctor'
        ]
      ));
    }
  }
  
  // High variability detection
  if (recent.length >= 5) {
    const values = recent.map(r => r.glucose);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const variability = max - min;
    
    if (variability > 100) {
      alerts.push(createAlert(
        `bs-variability-${Date.now()}`,
        '📊 High Blood Sugar Variability',
        `Your blood sugar has varied by ${variability} mg/dL recently (from ${min} to ${max} mg/dL). High variability can increase health risks.`,
        variability > 150 ? 'high' : 'medium',
        'trend',
        'blood_sugar',
        [
          'Maintain consistent meal timing and composition',
          'Check for patterns related to specific foods or activities',
          'Ensure consistent medication timing',
          'Discuss continuous glucose monitoring with your doctor'
        ]
      ));
    }
  }
  
  // Meal pattern detection
  if (recent.length >= 5) {
    const mealInfoReadings = recent.filter(r => r.mealInfo);
    if (mealInfoReadings.length >= 3) {
      const commonFoods = findCommonTerms(mealInfoReadings.map(r => r.mealInfo || ''));
      
      if (commonFoods.length > 0) {
        // Find high readings with these foods
        const highReadingsWithCommonFoods = mealInfoReadings.filter(r => {
          return r.glucose > 180 && commonFoods.some(food => (r.mealInfo || '').toLowerCase().includes(food.toLowerCase()));
        });
        
        if (highReadingsWithCommonFoods.length >= 2) {
          alerts.push(createAlert(
            `bs-food-pattern-${Date.now()}`,
            '🍕 Food Impact Pattern Detected',
            `Meals containing "${commonFoods.join(', ')}" appear to be associated with higher blood sugar readings. Consider adjusting these food choices.`,
            'medium',
            'pattern',
            'blood_sugar',
            [
              'Consider reducing portion sizes of these foods',
              'Pair these foods with protein and healthy fats',
              'Try alternative lower-carb options',
              'Monitor blood sugar before and after eating these foods'
            ]
          ));
        }
      }
    }
  }

  return alerts;
};

// General health alerts based on combined data
const generateGeneralAlerts = (bpReadings: Reading[], bsReadings: BloodSugarReading[]): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  
  // Only generate if we have enough data
  if (bpReadings.length < 3 && bsReadings.length < 3) return alerts;
  
  const recentBP = getRecentReadings(bpReadings);
  const recentBS = getRecentReadings(bsReadings);
  
  // Detect correlation between high blood pressure and high blood sugar
  if (recentBP.length >= 3 && recentBS.length >= 3) {
    const highBPReadings = recentBP.filter(r => {
      const category = categorizeBP(r.systolic, r.diastolic);
      return category.color === 'orange' || category.color === 'red';
    });
    
    const highBSReadings = recentBS.filter(r => r.glucose > 180);
    
    // Check if both conditions are elevated
    if (highBPReadings.length >= 2 && highBSReadings.length >= 2) {
      alerts.push(createAlert(
        `general-bp-bs-${Date.now()}`,
        '🔄 Correlated BP and Blood Sugar Elevation',
        'You have multiple elevated readings for both blood pressure and blood sugar. These conditions often influence each other.',
        'high',
        'pattern',
        'general',
        [
          'Focus on lifestyle changes that benefit both conditions',
          'Increase physical activity (with doctor approval)',
          'Follow a low-sodium, low-glycemic diet',
          'Ensure adequate hydration',
          'Discuss medication interactions with your healthcare provider'
        ]
      ));
    }
  }
  
  // Detect potential medication timing issues
  const medicatedBPReadings = recentBP.filter(r => r.medication);
  const medicatedBSReadings = recentBS.filter(r => r.medication);
  
  if (medicatedBPReadings.length >= 2 && medicatedBSReadings.length >= 2) {
    // Check for patterns in timing
    const bpTimingIssue = detectTimingPatterns(medicatedBPReadings);
    const bsTimingIssue = detectTimingPatterns(medicatedBSReadings);
    
    if (bpTimingIssue || bsTimingIssue) {
      alerts.push(createAlert(
        `general-medication-timing-${Date.now()}`,
        '⏰ Medication Timing Optimization',
        'Your readings suggest potential benefits from adjusting your medication timing for better 24-hour control.',
        'medium',
        'timing',
        'general',
        [
          'Track the exact times you take medications',
          'Note the relationship between medication times and readings',
          'Discuss chronotherapy (timing-based medication) with your doctor',
          'Maintain consistent daily medication schedule'
        ]
      ));
    }
  }
  
  // Lifestyle pattern detection across both metrics
  const allReadingsWithNotes = [...recentBP.filter(r => r.notes), ...recentBS.map(r => ({ ...r, notes: r.notes || r.mealInfo })).filter(r => r.notes)];
  
  if (allReadingsWithNotes.length >= 4) {
    const exerciseTerms = ['exercise', 'walk', 'gym', 'workout', 'run', 'jog', 'swim', 'bike', 'cycling'];
    const stressTerms = ['stress', 'anxious', 'anxiety', 'worried', 'tense', 'nervous', 'upset'];
    const sleepTerms = ['sleep', 'tired', 'insomnia', 'rest', 'fatigue', 'exhausted'];
    
    const exerciseMentions = countTermMentions(allReadingsWithNotes.map(r => r.notes || ''), exerciseTerms);
    const stressMentions = countTermMentions(allReadingsWithNotes.map(r => r.notes || ''), stressTerms);
    const sleepMentions = countTermMentions(allReadingsWithNotes.map(r => r.notes || ''), sleepTerms);
    
    // Generate lifestyle alerts based on patterns
    if (exerciseMentions >= 3) {
      alerts.push(createAlert(
        `general-exercise-${Date.now()}`,
        '🏃 Exercise Impact Detected',
        'Your notes mention exercise multiple times. Physical activity appears to be influencing your health metrics.',
        'low',
        'lifestyle',
        'general',
        [
          'Continue tracking readings before and after exercise',
          'Aim for consistent, moderate activity rather than occasional intense workouts',
          'Stay hydrated before, during, and after exercise',
          'Consider timing exercise to optimize health benefits'
        ]
      ));
    }
    
    if (stressMentions >= 3) {
      alerts.push(createAlert(
        `general-stress-${Date.now()}`,
        '😓 Stress Impact Detected',
        'Your notes mention stress or anxiety multiple times. Psychological factors appear to be influencing your health metrics.',
        'medium',
        'lifestyle',
        'general',
        [
          'Incorporate stress management techniques like deep breathing or meditation',
          'Consider mindfulness practices or yoga',
          'Ensure adequate sleep and relaxation time',
          'Discuss stress management strategies with your healthcare provider'
        ]
      ));
    }
    
    if (sleepMentions >= 3) {
      alerts.push(createAlert(
        `general-sleep-${Date.now()}`,
        '😴 Sleep Impact Detected',
        'Your notes mention sleep issues multiple times. Sleep quality appears to be influencing your health metrics.',
        'medium',
        'lifestyle',
        'general',
        [
          'Maintain a consistent sleep schedule',
          'Create a relaxing bedtime routine',
          'Limit screen time before bed',
          'Avoid caffeine and large meals before bedtime',
          'Consider discussing sleep issues with your healthcare provider'
        ]
      ));
    }
  }
  
  return alerts;
};

// Helper function to detect timing patterns in readings
const detectTimingPatterns = (readings: Reading[] | BloodSugarReading[]): boolean => {
  if (readings.length < 3) return false;
  
  // Group by time of day
  const morningReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 6 && hour < 12;
  });
  
  const afternoonReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 12 && hour < 18;
  });
  
  const eveningReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 18 && hour < 24;
  });
  
  // Check if one time period has consistently worse readings
  if (readings[0].hasOwnProperty('systolic')) {
    // Blood pressure readings
    const bpReadings = readings as Reading[];
    
    const morningAvgSys = morningReadings.length > 0 
      ? morningReadings.reduce((sum, r: any) => sum + r.systolic, 0) / morningReadings.length 
      : 0;
      
    const afternoonAvgSys = afternoonReadings.length > 0 
      ? afternoonReadings.reduce((sum, r: any) => sum + r.systolic, 0) / afternoonReadings.length 
      : 0;
      
    const eveningAvgSys = eveningReadings.length > 0 
      ? eveningReadings.reduce((sum, r: any) => sum + r.systolic, 0) / eveningReadings.length 
      : 0;
    
    // Check for significant differences
    const maxDiff = Math.max(
      Math.abs(morningAvgSys - afternoonAvgSys),
      Math.abs(morningAvgSys - eveningAvgSys),
      Math.abs(afternoonAvgSys - eveningAvgSys)
    );
    
    return maxDiff > 15; // Significant difference in systolic BP
  } else {
    // Blood sugar readings
    const bsReadings = readings as BloodSugarReading[];
    
    const morningAvgGlucose = morningReadings.length > 0 
      ? morningReadings.reduce((sum, r: any) => sum + r.glucose, 0) / morningReadings.length 
      : 0;
      
    const afternoonAvgGlucose = afternoonReadings.length > 0 
      ? afternoonReadings.reduce((sum, r: any) => sum + r.glucose, 0) / afternoonReadings.length 
      : 0;
      
    const eveningAvgGlucose = eveningReadings.length > 0 
      ? eveningReadings.reduce((sum, r: any) => sum + r.glucose, 0) / eveningReadings.length 
      : 0;
    
    // Check for significant differences
    const maxDiff = Math.max(
      Math.abs(morningAvgGlucose - afternoonAvgGlucose),
      Math.abs(morningAvgGlucose - eveningAvgGlucose),
      Math.abs(afternoonAvgGlucose - eveningAvgGlucose)
    );
    
    return maxDiff > 40; // Significant difference in glucose
  }
};

// Helper function to find common terms in a list of strings
const findCommonTerms = (strings: string[]): string[] => {
  if (strings.length < 2) return [];
  
  // Extract words from all strings
  const allWords = strings.flatMap(str => 
    str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3) // Only consider words longer than 3 chars
  );
  
  // Count occurrences
  const wordCounts: Record<string, number> = {};
  allWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Find words that appear in multiple strings
  const commonWords = Object.entries(wordCounts)
    .filter(([_, count]) => count >= 2)
    .map(([word]) => word)
    // Filter out common stop words
    .filter(word => !['this', 'that', 'with', 'from', 'have', 'after', 'before', 'because', 'could', 'would', 'should', 'their', 'other', 'there', 'about'].includes(word));
  
  return commonWords.slice(0, 3); // Return top 3 common words
};

// Helper function to count mentions of terms
const countTermMentions = (strings: string[], terms: string[]): number => {
  let count = 0;
  
  strings.forEach(str => {
    const lowerStr = str.toLowerCase();
    if (terms.some(term => lowerStr.includes(term.toLowerCase()))) {
      count++;
    }
  });
  
  return count;
};

// Main alert generator
export const generateHealthAlerts = (
  bpReadings: Reading[], 
  bsReadings: BloodSugarReading[]
): HealthAlert[] => {
  const alerts = [
    ...generateBPAlerts(bpReadings),
    ...generateBSAlerts(bsReadings),
    ...generateGeneralAlerts(bpReadings, bsReadings)
  ];

  // Sort by priority and recency
  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};