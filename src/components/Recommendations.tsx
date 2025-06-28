import React from 'react';
import { Heart, Apple, Dumbbell, Moon, Droplets, AlertTriangle, CheckCircle, Target, Utensils, Activity } from 'lucide-react';
import { Reading } from '../types/Reading';
import { categorizeBP } from '../utils/bloodPressure';

interface RecommendationsProps {
  readings: Reading[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No recommendations available</p>
          <p className="text-sm text-gray-400">Add some readings to get personalized DASH diet and lifestyle recommendations</p>
        </div>
      </div>
    );
  }

  // Calculate average BP and determine category
  const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  const category = categorizeBP(avgSystolic, avgDiastolic);
  const latestReading = readings[0];
  const latestCategory = categorizeBP(latestReading.systolic, latestReading.diastolic);

  // Determine urgency level
  const isHigh = category.color === 'red' || category.color === 'orange';
  const isElevated = category.color === 'yellow';
  const isNormal = category.color === 'green';

  // DASH Diet Recommendations
  const getDashRecommendations = () => {
    const baseRecommendations = {
      vegetables: {
        icon: Apple,
        title: "Vegetables & Fruits",
        servings: "8-10 servings daily",
        foods: [
          "Leafy greens (spinach, kale, arugula)",
          "Berries (blueberries, strawberries, raspberries)",
          "Citrus fruits (oranges, grapefruits)",
          "Bananas (rich in potassium)",
          "Broccoli, carrots, bell peppers",
          "Sweet potatoes, tomatoes"
        ],
        tip: "Fill half your plate with colorful vegetables and fruits at each meal"
      },
      grains: {
        icon: Utensils,
        title: "Whole Grains",
        servings: "6-8 servings daily",
        foods: [
          "Brown rice, quinoa, oats",
          "Whole wheat bread and pasta",
          "Barley, bulgur wheat",
          "Whole grain cereals (low sodium)"
        ],
        tip: "Choose whole grains over refined grains for better fiber and nutrients"
      },
      protein: {
        icon: Heart,
        title: "Lean Proteins",
        servings: "6 oz or less daily",
        foods: [
          "Fish (salmon, mackerel, sardines)",
          "Skinless poultry",
          "Lean cuts of meat",
          "Beans, lentils, chickpeas",
          "Nuts and seeds (unsalted)",
          "Tofu and tempeh"
        ],
        tip: "Focus on fish and plant-based proteins 2-3 times per week"
      },
      dairy: {
        icon: Droplets,
        title: "Low-Fat Dairy",
        servings: "2-3 servings daily",
        foods: [
          "Low-fat or fat-free milk",
          "Greek yogurt (plain, low sodium)",
          "Low-fat cheese",
          "Cottage cheese (low sodium)"
        ],
        tip: "Choose unsweetened, low-sodium dairy options"
      }
    };

    return baseRecommendations;
  };

  // Lifestyle Recommendations
  const getLifestyleRecommendations = () => {
    const recommendations = [];

    // Sodium reduction (critical for all)
    recommendations.push({
      icon: AlertTriangle,
      title: "Reduce Sodium Intake",
      priority: isHigh ? "Critical" : isElevated ? "High" : "Important",
      target: isHigh ? "Less than 1,500mg daily" : "Less than 2,300mg daily",
      actions: [
        "Read nutrition labels carefully",
        "Cook at home more often",
        "Use herbs and spices instead of salt",
        "Avoid processed and packaged foods",
        "Choose fresh or frozen vegetables over canned",
        "Rinse canned beans and vegetables"
      ]
    });

    // Exercise recommendations
    recommendations.push({
      icon: Dumbbell,
      title: "Regular Physical Activity",
      priority: isHigh ? "Critical" : "High",
      target: "150 minutes moderate exercise weekly",
      actions: [
        "30 minutes of brisk walking, 5 days a week",
        "Swimming, cycling, or dancing",
        "Strength training 2 days per week",
        "Take stairs instead of elevators",
        "Park farther away and walk",
        "Start slowly and gradually increase intensity"
      ]
    });

    // Weight management
    if (isHigh || isElevated) {
      recommendations.push({
        icon: Target,
        title: "Maintain Healthy Weight",
        priority: isHigh ? "Critical" : "High",
        target: "BMI 18.5-24.9",
        actions: [
          "Portion control using smaller plates",
          "Eat slowly and mindfully",
          "Track your food intake",
          "Stay hydrated with water",
          "Limit sugary drinks and alcohol",
          "Consult a nutritionist if needed"
        ]
      });
    }

    // Stress management
    recommendations.push({
      icon: Moon,
      title: "Stress Management & Sleep",
      priority: "Important",
      target: "7-9 hours quality sleep nightly",
      actions: [
        "Practice deep breathing exercises",
        "Try meditation or yoga",
        "Maintain regular sleep schedule",
        "Limit screen time before bed",
        "Create a relaxing bedtime routine",
        "Consider stress counseling if needed"
      ]
    });

    // Alcohol and smoking
    if (isHigh || isElevated) {
      recommendations.push({
        icon: Activity,
        title: "Limit Alcohol & Avoid Smoking",
        priority: isHigh ? "Critical" : "High",
        target: "No smoking, limit alcohol",
        actions: [
          "Quit smoking completely",
          "Limit alcohol: 1 drink/day (women), 2 drinks/day (men)",
          "Seek support for quitting smoking",
          "Replace alcohol with sparkling water",
          "Avoid secondhand smoke",
          "Consider nicotine replacement therapy"
        ]
      });
    }

    return recommendations;
  };

  const dashRecommendations = getDashRecommendations();
  const lifestyleRecommendations = getLifestyleRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Important': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Current Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">Based on your average BP</div>
            <div className="text-lg font-semibold text-gray-900">{avgSystolic}/{avgDiastolic} mmHg</div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.color === 'green' ? 'bg-green-100 text-green-800' :
              category.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              category.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {category.label}
            </span>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          isHigh ? 'bg-red-50 border-red-400' :
          isElevated ? 'bg-yellow-50 border-yellow-400' :
          'bg-green-50 border-green-400'
        }`}>
          <p className="text-sm text-gray-700">
            {isHigh && "Your blood pressure indicates a need for immediate lifestyle changes and medical consultation. Follow these DASH diet recommendations closely."}
            {isElevated && "Your blood pressure is elevated. These DASH diet and lifestyle changes can help bring it back to normal range."}
            {isNormal && "Great job! Your blood pressure is in the normal range. These recommendations will help you maintain your healthy levels."}
          </p>
        </div>
      </div>

      {/* DASH Diet Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Apple className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">DASH Diet Plan</h3>
            <p className="text-sm text-gray-600">Dietary Approaches to Stop Hypertension</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(dashRecommendations).map(([key, rec]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <rec.icon className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-blue-600 font-medium">{rec.servings}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {rec.foods.map((food, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> {rec.tip}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Foods to Limit */}
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Foods to Limit or Avoid
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-red-800">
            <div>
              <strong>High Sodium Foods:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Processed meats (bacon, sausage, deli meats)</li>
                <li>Canned soups and broths</li>
                <li>Fast food and restaurant meals</li>
                <li>Pickled foods and olives</li>
              </ul>
            </div>
            <div>
              <strong>Other Foods to Limit:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Sugary drinks and desserts</li>
                <li>Red meat and full-fat dairy</li>
                <li>Fried and processed foods</li>
                <li>Alcohol (limit to moderate amounts)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Lifestyle Modifications</h3>
            <p className="text-sm text-gray-600">Evidence-based strategies to lower blood pressure</p>
          </div>
        </div>

        <div className="space-y-6">
          {lifestyleRecommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <rec.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.target}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-2">
                {rec.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your 7-Day Action Plan</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">This Week's Goals:</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Track sodium intake daily (aim for {isHigh ? '<1,500mg' : '<2,300mg'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Add 30 minutes of walking 5 days this week</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Include 2 servings of fish this week</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Practice 10 minutes of deep breathing daily</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sample Daily Menu:</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Breakfast:</strong> Oatmeal with berries and low-fat milk</div>
              <div><strong>Lunch:</strong> Grilled chicken salad with mixed greens</div>
              <div><strong>Snack:</strong> Apple with unsalted almonds</div>
              <div><strong>Dinner:</strong> Baked salmon, quinoa, steamed broccoli</div>
              <div><strong>Hydration:</strong> 8 glasses of water throughout the day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Consultation Notice */}
      {(isHigh || latestCategory.color === 'red') && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Important Medical Notice</h3>
              <p className="text-red-800 mb-3">
                Your blood pressure readings indicate a need for medical attention. While these lifestyle changes are beneficial, 
                please consult with your healthcare provider for proper evaluation and treatment.
              </p>
              <div className="text-sm text-red-700">
                <strong>Consider scheduling an appointment if you experience:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Severe headaches or dizziness</li>
                  <li>Chest pain or shortness of breath</li>
                  <li>Vision problems</li>
                  <li>Persistent high readings despite lifestyle changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;