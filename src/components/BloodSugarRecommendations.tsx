import React from 'react';
import { Droplets, Apple, Dumbbell, Moon, Heart, AlertTriangle, CheckCircle, Target, Utensils, Activity, Clock, Scale } from 'lucide-react';
import { BloodSugarReading } from '../types/BloodSugar';
import { categorizeGlucose, calculateHbA1c, getTimeInRange } from '../utils/bloodSugar';

interface BloodSugarRecommendationsProps {
  readings: BloodSugarReading[];
}

const BloodSugarRecommendations: React.FC<BloodSugarRecommendationsProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No recommendations available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Add some blood sugar readings to get personalized diabetes management and dietary recommendations</p>
        </div>
      </div>
    );
  }

  // Calculate average glucose and determine category
  const avgGlucose = Math.round(readings.reduce((sum, r) => sum + r.glucose, 0) / readings.length);
  const hba1c = calculateHbA1c(readings);
  const timeInRange = getTimeInRange(readings);
  const latestReading = readings[0];
  const latestCategory = categorizeGlucose(latestReading.glucose, latestReading.testType);
  
  // Determine management level
  const isDiabetic = hba1c >= 6.5 || avgGlucose >= 126;
  const isPreDiabetic = !isDiabetic && (hba1c >= 5.7 || avgGlucose >= 100);
  const isNormal = !isDiabetic && !isPreDiabetic;
  const needsUrgentCare = latestReading.glucose > 300 || latestReading.glucose < 70;

  // Diabetes Diet Recommendations
  const getDiabetesDietRecommendations = () => {
    const baseRecommendations = {
      carbohydrates: {
        icon: Utensils,
        title: "Smart Carbohydrate Choices",
        target: isDiabetic ? "45-60g per meal" : "Monitor portions",
        foods: [
          "Whole grains (brown rice, quinoa, oats)",
          "Non-starchy vegetables (broccoli, spinach, peppers)",
          "Legumes (beans, lentils, chickpeas)",
          "Fresh fruits (berries, apples, citrus)",
          "Sweet potatoes and winter squash"
        ],
        avoid: [
          "White bread, white rice, sugary cereals",
          "Regular soda and fruit juices",
          "Candy, cookies, and pastries",
          "Processed snack foods"
        ],
        tip: "Use the plate method: 1/2 non-starchy vegetables, 1/4 lean protein, 1/4 complex carbs"
      },
      protein: {
        icon: Heart,
        title: "Lean Protein Sources",
        target: "20-30g per meal",
        foods: [
          "Fish (salmon, tuna, sardines)",
          "Skinless poultry",
          "Lean cuts of beef and pork",
          "Eggs and egg whites",
          "Greek yogurt (plain, unsweetened)",
          "Tofu, tempeh, and plant proteins"
        ],
        avoid: [
          "Processed meats (bacon, sausage)",
          "Fried proteins",
          "High-fat cuts of meat"
        ],
        tip: "Include protein at every meal to help stabilize blood sugar levels"
      },
      fats: {
        icon: Droplets,
        title: "Healthy Fats",
        target: "20-35% of daily calories",
        foods: [
          "Avocados and olive oil",
          "Nuts and seeds (almonds, walnuts, chia)",
          "Fatty fish (salmon, mackerel)",
          "Olives and nut butters (unsweetened)"
        ],
        avoid: [
          "Trans fats and hydrogenated oils",
          "Excessive saturated fats",
          "Fried foods"
        ],
        tip: "Healthy fats help slow glucose absorption and improve satiety"
      },
      timing: {
        icon: Clock,
        title: "Meal Timing & Portions",
        target: "3 meals + 1-2 snacks daily",
        foods: [
          "Eat at consistent times daily",
          "Don't skip meals, especially breakfast",
          "Space meals 4-5 hours apart",
          "Include a bedtime snack if needed"
        ],
        avoid: [
          "Large, infrequent meals",
          "Eating late at night",
          "Skipping meals"
        ],
        tip: "Consistent meal timing helps maintain stable blood sugar levels"
      }
    };

    return baseRecommendations;
  };

  // Lifestyle Recommendations
  const getLifestyleRecommendations = () => {
    const recommendations = [];

    // Blood sugar monitoring (critical for diabetics)
    if (isDiabetic) {
      recommendations.push({
        icon: Target,
        title: "Blood Sugar Monitoring",
        priority: "Critical",
        target: "Check 2-4 times daily",
        actions: [
          "Test before meals and 2 hours after",
          "Keep a detailed log of readings",
          "Monitor during illness or stress",
          "Check before and after exercise",
          "Test if experiencing symptoms",
          "Share logs with healthcare provider"
        ]
      });
    }

    // Exercise recommendations
    recommendations.push({
      icon: Dumbbell,
      title: "Regular Physical Activity",
      priority: isDiabetic ? "Critical" : isPreDiabetic ? "High" : "Important",
      target: "150 minutes moderate exercise weekly",
      actions: [
        "30 minutes of brisk walking, 5 days a week",
        "Resistance training 2-3 times per week",
        "Check blood sugar before/after exercise",
        "Carry glucose tablets during workouts",
        "Stay hydrated during activity",
        "Start slowly and build up intensity"
      ]
    });

    // Weight management
    if (isDiabetic || isPreDiabetic) {
      recommendations.push({
        icon: Scale,
        title: "Weight Management",
        priority: isDiabetic ? "Critical" : "High",
        target: isPreDiabetic ? "5-10% weight loss" : "Maintain healthy BMI",
        actions: [
          "Track food intake and portions",
          "Use smaller plates and bowls",
          "Eat slowly and mindfully",
          "Stay hydrated with water",
          "Limit processed and high-calorie foods",
          "Work with a registered dietitian"
        ]
      });
    }

    // Stress management
    recommendations.push({
      icon: Moon,
      title: "Stress & Sleep Management",
      priority: "Important",
      target: "7-9 hours quality sleep nightly",
      actions: [
        "Practice stress-reduction techniques",
        "Maintain regular sleep schedule",
        "Limit caffeine, especially afternoon",
        "Create a relaxing bedtime routine",
        "Monitor blood sugar during stressful periods",
        "Consider meditation or yoga"
      ]
    });

    // Medication adherence (for diabetics)
    if (isDiabetic) {
      recommendations.push({
        icon: Activity,
        title: "Medication & Healthcare",
        priority: "Critical",
        target: "Follow prescribed regimen",
        actions: [
          "Take medications as prescribed",
          "Never skip or adjust doses without consulting doctor",
          "Regular A1C testing (every 3-6 months)",
          "Annual eye and foot exams",
          "Regular blood pressure and cholesterol checks",
          "Stay up to date with vaccinations"
        ]
      });
    }

    return recommendations;
  };

  const dietRecommendations = getDiabetesDietRecommendations();
  const lifestyleRecommendations = getLifestyleRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'Important': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusMessage = () => {
    if (needsUrgentCare) {
      return "Your recent blood sugar reading requires immediate attention. Please contact your healthcare provider.";
    }
    if (isDiabetic) {
      return "Your readings indicate diabetes. Following these recommendations closely can help you manage your condition effectively.";
    }
    if (isPreDiabetic) {
      return "Your blood sugar levels suggest pre-diabetes. These lifestyle changes can help prevent progression to type 2 diabetes.";
    }
    return "Your blood sugar levels are in the normal range. These recommendations will help you maintain healthy glucose levels.";
  };

  return (
    <div className="space-y-8">
      {/* Header with Current Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Sugar Management Plan</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Glucose</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{avgGlucose} mg/dL</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Est. HbA1c: {hba1c}%</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          needsUrgentCare ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
          isDiabetic ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
          isPreDiabetic ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
          'bg-green-50 dark:bg-green-900/20 border-green-400'
        }`}>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {getStatusMessage()}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{timeInRange.inRange}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Time in Range</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">(70-180 mg/dL)</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{hba1c}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Estimated HbA1c</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {hba1c < 5.7 ? 'Normal' : hba1c < 6.5 ? 'Pre-diabetes' : 'Diabetes'}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{readings.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Readings</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Diet Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Apple className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Diabetes-Friendly Diet Plan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Evidence-based nutrition for blood sugar control</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(dietRecommendations).map(([key, rec]) => (
            <div key={key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <rec.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{rec.target}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">✓ Choose These:</h5>
                  <div className="space-y-1">
                    {rec.foods.map((food, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {rec.avoid && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">✗ Limit These:</h5>
                    <div className="space-y-1">
                      {rec.avoid.map((food, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span>{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> {rec.tip}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Glycemic Index Guide */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Glycemic Index Guide
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-green-700 dark:text-green-400">Low GI (55 or less):</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-purple-800 dark:text-purple-200">
                <li>Most vegetables and fruits</li>
                <li>Whole grains and legumes</li>
                <li>Nuts and seeds</li>
              </ul>
            </div>
            <div>
              <strong className="text-yellow-700 dark:text-yellow-400">Medium GI (56-69):</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-purple-800 dark:text-purple-200">
                <li>Sweet potatoes</li>
                <li>Brown rice</li>
                <li>Whole wheat products</li>
              </ul>
            </div>
            <div>
              <strong className="text-red-700 dark:text-red-400">High GI (70+):</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-purple-800 dark:text-purple-200">
                <li>White bread and rice</li>
                <li>Sugary foods and drinks</li>
                <li>Processed cereals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Lifestyle Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive approach to blood sugar control</p>
          </div>
        </div>

        <div className="space-y-6">
          {lifestyleRecommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <rec.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.target}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-2">
                {rec.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Action Plan */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">Emergency Blood Sugar Management</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Low Blood Sugar (Hypoglycemia) - Below 70 mg/dL</h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p><strong>Symptoms:</strong> Shakiness, sweating, confusion, rapid heartbeat</p>
                  <p><strong>Immediate Action:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Consume 15g fast-acting carbs (glucose tablets, juice)</li>
                    <li>Wait 15 minutes, then recheck blood sugar</li>
                    <li>Repeat if still below 70 mg/dL</li>
                    <li>Eat a snack once levels normalize</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">High Blood Sugar (Hyperglycemia) - Above 300 mg/dL</h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p><strong>Symptoms:</strong> Excessive thirst, frequent urination, fatigue</p>
                  <p><strong>Immediate Action:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Check for ketones (if diabetic)</li>
                    <li>Drink water to stay hydrated</li>
                    <li>Contact healthcare provider immediately</li>
                    <li>Seek emergency care if ketones are present</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>When to Call 911:</strong> Severe symptoms, loss of consciousness, persistent vomiting, 
                or blood sugar below 50 mg/dL or above 400 mg/dL.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your 7-Day Blood Sugar Action Plan</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">This Week's Goals:</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Test blood sugar {isDiabetic ? '4 times daily' : 'before meals'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Follow the plate method for all meals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Walk for 30 minutes after dinner daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Track carbohydrate intake at each meal</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sample Daily Menu:</h4>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <div><strong>Breakfast:</strong> Greek yogurt with berries and nuts</div>
              <div><strong>Lunch:</strong> Grilled chicken salad with olive oil dressing</div>
              <div><strong>Snack:</strong> Apple slices with almond butter</div>
              <div><strong>Dinner:</strong> Baked salmon, quinoa, roasted vegetables</div>
              <div><strong>Evening:</strong> Small handful of nuts (if needed)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Consultation Notice */}
      {(isDiabetic || needsUrgentCare || hba1c >= 6.5) && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">Important Medical Notice</h3>
              <p className="text-orange-800 dark:text-orange-200 mb-3">
                {needsUrgentCare 
                  ? "Your recent blood sugar readings require immediate medical attention. Please contact your healthcare provider or seek emergency care."
                  : "Your blood sugar levels indicate diabetes or pre-diabetes. Regular medical monitoring is essential for proper management."
                }
              </p>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Regular monitoring should include:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>HbA1c testing every 3-6 months</li>
                  <li>Annual comprehensive eye exams</li>
                  <li>Regular foot examinations</li>
                  <li>Blood pressure and cholesterol monitoring</li>
                  <li>Kidney function tests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodSugarRecommendations;