import React, { useState } from 'react';
import { X, Shield, AlertTriangle, CheckCircle, FileText, Users, Lock, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (consents: ConsentPreferences) => void;
  isFirstTime?: boolean;
}

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  dataExport: boolean;
  anonymousUsage: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  isFirstTime = true 
}) => {
  const { isDark } = useTheme();
  const [consents, setConsents] = useState<ConsentPreferences>({
    essential: true, // Always required
    analytics: true,
    dataExport: true,
    anonymousUsage: false,
    timestamp: new Date().toISOString()
  });
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [hasReadPrivacyPolicy, setHasReadPrivacyPolicy] = useState(false);

  if (!isOpen) return null;

  const consentCategories = [
    {
      id: 'essential',
      title: 'Essential Health Data Processing',
      description: 'Required for core app functionality including blood pressure and blood sugar tracking, data storage, and basic health insights.',
      required: true,
      legalBasis: 'Consent (GDPR Art. 6(1)(a) & 9(2)(a))',
      dataTypes: [
        'Blood pressure measurements',
        'Blood sugar readings', 
        'Medication information',
        'Symptoms and health notes',
        'Measurement timestamps and locations'
      ],
      retention: 'Until account deletion',
      icon: Shield
    },
    {
      id: 'analytics',
      title: 'Health Analytics & Personalized Insights',
      description: 'Generate personalized health insights, trend analysis, and proactive health alerts based on your data patterns.',
      required: false,
      legalBasis: 'Consent (GDPR Art. 6(1)(a))',
      dataTypes: [
        'Health data analysis patterns',
        'Trend calculations',
        'Risk assessments',
        'Personalized recommendations'
      ],
      retention: 'Until consent withdrawn',
      icon: CheckCircle
    },
    {
      id: 'dataExport',
      title: 'Data Export & Healthcare Provider Sharing',
      description: 'Allow export of your health data in standard formats for sharing with healthcare providers or personal backup.',
      required: false,
      legalBasis: 'Consent (GDPR Art. 6(1)(a))',
      dataTypes: [
        'Formatted health reports',
        'CSV/JSON data exports',
        'Shareable health summaries'
      ],
      retention: 'Export logs: 30 days',
      icon: FileText
    },
    {
      id: 'anonymousUsage',
      title: 'Anonymous Usage Analytics',
      description: 'Help improve the app through anonymous, aggregated usage statistics. No personal or health data is included.',
      required: false,
      legalBasis: 'Legitimate Interest (GDPR Art. 6(1)(f))',
      dataTypes: [
        'App usage patterns (anonymized)',
        'Feature usage statistics',
        'Performance metrics',
        'Error reports (no personal data)'
      ],
      retention: '24 months',
      icon: Users
    }
  ];

  const handleConsentChange = (categoryId: string, value: boolean) => {
    if (categoryId === 'essential') return; // Cannot change essential consent
    
    setConsents(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleAccept = () => {
    if (!hasReadPrivacyPolicy) {
      alert('Please confirm that you have read and understood the Privacy Policy');
      return;
    }

    const finalConsents = {
      ...consents,
      timestamp: new Date().toISOString(),
      ipAddress: 'xxx.xxx.xxx.xxx', // Would be actual IP in production
      userAgent: navigator.userAgent
    };

    onAccept(finalConsents);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Shield className={`h-5 w-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {isFirstTime ? 'Privacy Consent' : 'Update Consent Preferences'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                HIPAA & GDPR Compliant Data Processing Consent
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isFirstTime && (
            <div className={`rounded-lg border p-4 mb-6 ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <Shield className={`h-5 w-5 mt-0.5 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-blue-100' : 'text-blue-900'
                  }`}>
                    Your Privacy is Our Priority
                  </h3>
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    HealthTracker Pro is fully compliant with HIPAA and GDPR regulations. 
                    Your health data is encrypted, secure, and never shared without your explicit consent. 
                    You can modify these preferences at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {consentCategories.map((category) => (
              <div key={category.id} className={`border rounded-lg p-4 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isDark ? 'bg-blue-900' : 'bg-blue-100'
                    }`}>
                      <category.icon className={`h-5 w-5 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {category.title}
                        </h4>
                        {category.required && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isDark 
                              ? 'bg-red-900 text-red-200' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Required
                          </span>
                        )}
                        <button
                          onClick={() => setShowDetails(showDetails === category.id ? null : category.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDark 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          Details
                        </button>
                      </div>
                      <p className={`text-sm mb-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {category.description}
                      </p>
                      
                      {showDetails === category.id && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="space-y-3">
                            <div>
                              <h5 className={`text-sm font-medium ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Legal Basis:
                              </h5>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {category.legalBasis}
                              </p>
                            </div>
                            <div>
                              <h5 className={`text-sm font-medium ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Data Types:
                              </h5>
                              <ul className={`text-xs space-y-1 ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {category.dataTypes.map((type, index) => (
                                  <li key={index}>• {type}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className={`text-sm font-medium ${
                                isDark ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Retention Period:
                              </h5>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {category.retention}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consents[category.id as keyof ConsentPreferences] as boolean}
                        onChange={(e) => handleConsentChange(category.id, e.target.checked)}
                        disabled={category.required}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer transition-colors ${
                        consents[category.id as keyof ConsentPreferences] 
                          ? 'bg-blue-600' 
                          : isDark ? 'bg-gray-600' : 'bg-gray-200'
                      } ${category.required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                          consents[category.id as keyof ConsentPreferences] ? 'translate-x-full' : ''
                        }`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Policy Acknowledgment */}
          <div className={`mt-6 p-4 rounded-lg border ${
            isDark 
              ? 'bg-purple-900/20 border-purple-800' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy-policy"
                checked={hasReadPrivacyPolicy}
                onChange={(e) => setHasReadPrivacyPolicy(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="privacy-policy" className={`text-sm ${
                isDark ? 'text-purple-200' : 'text-purple-800'
              }`}>
                I have read and understood the{' '}
                <button className="underline font-medium hover:no-underline">
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button className="underline font-medium hover:no-underline">
                  Terms of Service
                </button>
                . I understand that I can withdraw my consent at any time and that this will result in 
                deletion of my health data.
              </label>
            </div>
          </div>

          {/* Consent Record Information */}
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h5 className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Consent Record Information
            </h5>
            <div className={`text-xs space-y-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Method:</strong> Electronic consent via web application</p>
              <p><strong>Version:</strong> Privacy Policy v2.1, Terms of Service v1.3</p>
              <p><strong>Withdrawal:</strong> Available at any time through Privacy Settings</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your consent choices are recorded securely and can be modified at any time
            </div>
            <div className="flex space-x-3">
              {!isFirstTime && (
                <button
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={!hasReadPrivacyPolicy}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  hasReadPrivacyPolicy
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isFirstTime ? 'Accept & Continue' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;