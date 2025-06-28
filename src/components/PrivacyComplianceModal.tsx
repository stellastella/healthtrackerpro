import React, { useState } from 'react';
import { X, Shield, Lock, Eye, Download, Trash2, AlertTriangle, CheckCircle, Globe, FileText, Users, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface PrivacyComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyComplianceModal: React.FC<PrivacyComplianceModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'rights' | 'data' | 'consent' | 'security'>('overview');

  if (!isOpen) return null;

  const complianceFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All health data is encrypted both in transit and at rest using AES-256 encryption',
      status: 'active'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant Infrastructure',
      description: 'Our cloud infrastructure meets HIPAA security and privacy requirements',
      status: 'active'
    },
    {
      icon: Eye,
      title: 'Data Minimization',
      description: 'We only collect and process data necessary for health tracking functionality',
      status: 'active'
    },
    {
      icon: Users,
      title: 'Access Controls',
      description: 'Strict role-based access controls ensure only authorized personnel can access systems',
      status: 'active'
    },
    {
      icon: Clock,
      title: 'Audit Logging',
      description: 'All data access and modifications are logged for security and compliance',
      status: 'active'
    },
    {
      icon: Globe,
      title: 'Cross-Border Data Protection',
      description: 'GDPR-compliant data transfers with appropriate safeguards',
      status: 'active'
    }
  ];

  const userRights = [
    {
      title: 'Right to Access',
      description: 'You can request a copy of all personal data we hold about you',
      action: 'Request Data Export',
      icon: Download
    },
    {
      title: 'Right to Rectification',
      description: 'You can correct any inaccurate or incomplete personal data',
      action: 'Update Profile',
      icon: FileText
    },
    {
      title: 'Right to Erasure',
      description: 'You can request deletion of your personal data ("Right to be Forgotten")',
      action: 'Delete Account',
      icon: Trash2
    },
    {
      title: 'Right to Data Portability',
      description: 'You can receive your data in a structured, machine-readable format',
      action: 'Export Data',
      icon: Download
    },
    {
      title: 'Right to Object',
      description: 'You can object to processing of your personal data for certain purposes',
      action: 'Manage Consent',
      icon: Shield
    },
    {
      title: 'Right to Restrict Processing',
      description: 'You can request limitation of processing under certain circumstances',
      action: 'Contact Support',
      icon: AlertTriangle
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
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
                Privacy & Compliance Center
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                HIPAA & GDPR Compliant Health Data Management
              </p>
            </div>
          </div>
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
        </div>

        {/* Navigation Tabs */}
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex space-x-1 p-1 mx-6">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'rights', label: 'Your Rights', icon: Users },
              { id: 'data', label: 'Data Management', icon: FileText },
              { id: 'consent', label: 'Consent', icon: CheckCircle },
              { id: 'security', label: 'Security', icon: Lock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? isDark 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-900'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Compliance Status */}
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className={`h-6 w-6 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-green-100' : 'text-green-900'
                  }`}>
                    ✅ Fully Compliant
                  </h3>
                </div>
                <p className={`${isDark ? 'text-green-200' : 'text-green-800'}`}>
                  HealthTracker Pro is fully compliant with HIPAA (Health Insurance Portability and Accountability Act) 
                  and GDPR (General Data Protection Regulation) requirements for health data protection and privacy.
                </p>
              </div>

              {/* HIPAA Compliance Details */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  HIPAA Compliance Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Administrative Safeguards
                    </h4>
                    <ul className={`list-disc list-inside space-y-1 text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>Security Management Process: Risk analysis and management procedures</li>
                      <li>Security Personnel: Designated Privacy and Security Officers</li>
                      <li>Information Access Management: Role-based access controls</li>
                      <li>Workforce Training: Regular HIPAA compliance training for all staff</li>
                      <li>Evaluation: Periodic assessment of security measures</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Physical Safeguards
                    </h4>
                    <ul className={`list-disc list-inside space-y-1 text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>Facility Access Controls: Restricted access to data centers</li>
                      <li>Workstation Security: Secure workstation locations and usage policies</li>
                      <li>Device and Media Controls: Procedures for electronic media disposal</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Technical Safeguards
                    </h4>
                    <ul className={`list-disc list-inside space-y-1 text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>Access Control: Unique user identification and authentication</li>
                      <li>Audit Controls: Hardware, software, and procedural mechanisms to record and examine activity</li>
                      <li>Integrity Controls: Mechanisms to ensure PHI is not improperly altered or destroyed</li>
                      <li>Transmission Security: Technical measures to guard against unauthorized access during transmission</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Breach Notification
                    </h4>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      In accordance with the HIPAA Breach Notification Rule, we maintain procedures to:
                    </p>
                    <ul className={`list-disc list-inside space-y-1 text-sm mt-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>Identify and respond to suspected or known security incidents</li>
                      <li>Mitigate harmful effects of security incidents</li>
                      <li>Document security incidents and their outcomes</li>
                      <li>Notify affected individuals within 60 days of discovery</li>
                      <li>Notify the Secretary of HHS and prominent media outlets for breaches affecting 500+ individuals</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Compliance Features Grid */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Privacy & Security Features
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {complianceFeatures.map((feature, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isDark ? 'bg-blue-900' : 'bg-blue-100'
                        }`}>
                          <feature.icon className={`h-5 w-5 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {feature.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isDark 
                                ? 'bg-green-900 text-green-200' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              Active
                            </span>
                          </div>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Certifications & Standards
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      HIPAA
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Health Insurance Portability and Accountability Act
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      GDPR
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      General Data Protection Regulation
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      SOC 2
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Service Organization Control 2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Your Data Protection Rights
                </h3>
                <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Under GDPR and HIPAA, you have several rights regarding your personal health data. 
                  You can exercise these rights at any time by using the actions below or contacting our support team.
                </p>
              </div>

              <div className="space-y-4">
                {userRights.map((right, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          isDark ? 'bg-blue-900' : 'bg-blue-100'
                        }`}>
                          <right.icon className={`h-5 w-5 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {right.title}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {right.description}
                          </p>
                        </div>
                      </div>
                      <button className={`ml-4 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        {right.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-purple-900/20 border-purple-800' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  isDark ? 'text-purple-100' : 'text-purple-900'
                }`}>
                  Data Protection Officer Contact
                </h4>
                <div className={`space-y-2 text-sm ${
                  isDark ? 'text-purple-200' : 'text-purple-800'
                }`}>
                  <p><strong>Email:</strong> privacy@healthtracker.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Privacy Street, Data City, DC 12345</p>
                  <p><strong>Response Time:</strong> Within 30 days for GDPR requests, 60 days for HIPAA requests</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Data Collection & Processing
                </h3>
              </div>

              {/* Data Categories */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Types of Data We Collect
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className={`font-medium mb-2 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Health Data (PHI/Special Category)
                    </h5>
                    <ul className={`text-sm space-y-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>• Blood pressure measurements</li>
                      <li>• Blood sugar readings</li>
                      <li>• Medication information</li>
                      <li>• Symptoms and health notes</li>
                      <li>• Measurement timestamps and locations</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className={`font-medium mb-2 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Account Data
                    </h5>
                    <ul className={`text-sm space-y-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <li>• Email address (for authentication)</li>
                      <li>• Account preferences</li>
                      <li>• Language settings</li>
                      <li>• Login timestamps</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Legal Basis */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Legal Basis for Processing
                </h4>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                  }`}>
                    <h5 className={`font-medium ${
                      isDark ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      Consent (GDPR Article 6(1)(a) & 9(2)(a))
                    </h5>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      You have explicitly consented to the processing of your health data for health monitoring purposes.
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-green-900/20' : 'bg-green-50'
                  }`}>
                    <h5 className={`font-medium ${
                      isDark ? 'text-green-200' : 'text-green-900'
                    }`}>
                      Legitimate Interest (GDPR Article 6(1)(f))
                    </h5>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-green-300' : 'text-green-800'
                    }`}>
                      Processing necessary for providing health tracking services and improving user experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Retention */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Data Retention Policy
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Health Data</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Retained until account deletion
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Account Data</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      30 days after account deletion
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Audit Logs</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      7 years (compliance requirement)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Backup Data</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      90 days maximum
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Consent Management
                </h3>
                <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage your consent preferences for different types of data processing. 
                  You can withdraw consent at any time, though this may affect app functionality.
                </p>
              </div>

              {/* Consent Status */}
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className={`h-6 w-6 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h4 className={`font-semibold ${
                    isDark ? 'text-green-100' : 'text-green-900'
                  }`}>
                    Current Consent Status
                  </h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      <strong>Consent Given:</strong> {user ? new Date().toLocaleDateString() : 'Not signed in'}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      <strong>Method:</strong> Electronic consent via application
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      <strong>Scope:</strong> Health data processing for personal tracking
                    </div>
                    <div className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      <strong>Status:</strong> Active and valid
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent Categories */}
              <div className="space-y-4">
                <h4 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Consent Categories
                </h4>
                
                {[
                  {
                    title: 'Essential Health Data Processing',
                    description: 'Required for core app functionality (blood pressure, blood sugar tracking)',
                    required: true,
                    enabled: true
                  },
                  {
                    title: 'Health Analytics & Insights',
                    description: 'Generate personalized health insights and recommendations',
                    required: false,
                    enabled: true
                  },
                  {
                    title: 'Data Export & Sharing',
                    description: 'Allow export of your health data for sharing with healthcare providers',
                    required: false,
                    enabled: true
                  },
                  {
                    title: 'Anonymous Usage Analytics',
                    description: 'Help improve the app through anonymous usage statistics',
                    required: false,
                    enabled: false
                  }
                ].map((consent, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {consent.title}
                          </h5>
                          {consent.required && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isDark 
                                ? 'bg-red-900 text-red-200' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Required
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {consent.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.enabled}
                            disabled={consent.required}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full peer transition-colors ${
                            consent.enabled 
                              ? 'bg-blue-600' 
                              : isDark ? 'bg-gray-600' : 'bg-gray-200'
                          } ${consent.required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                              consent.enabled ? 'translate-x-full' : ''
                            }`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Withdraw Consent */}
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-orange-900/20 border-orange-800' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  isDark ? 'text-orange-100' : 'text-orange-900'
                }`}>
                  Withdraw Consent
                </h4>
                <p className={`text-sm mb-4 ${
                  isDark ? 'text-orange-200' : 'text-orange-800'
                }`}>
                  You can withdraw your consent at any time. This will result in deletion of your health data 
                  and deactivation of your account. This action cannot be undone.
                </p>
                <button className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  isDark 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}>
                  Withdraw All Consent
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Security Measures
                </h3>
              </div>

              {/* Technical Safeguards */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Technical Safeguards
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        AES-256 encryption at rest
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        TLS 1.3 encryption in transit
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Multi-factor authentication
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Regular security audits
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Intrusion detection systems
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Automated backup systems
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Vulnerability scanning
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Incident response procedures
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Safeguards */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Administrative Safeguards
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Security Officer
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Designated security officer responsible for HIPAA compliance and security policies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Staff Training
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Regular HIPAA and GDPR training for all personnel with access to health data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Policies & Procedures
                      </h5>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Comprehensive data protection policies and incident response procedures
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Safeguards */}
              <div className={`rounded-lg border p-6 ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <h4 className={`font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Physical Safeguards
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      SOC 2 Type II certified data centers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      24/7 physical security monitoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Biometric access controls
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Environmental controls and monitoring
                    </span>
                  </div>
                </div>
              </div>

              {/* Breach Notification */}
              <div className={`rounded-lg border p-6 ${
                isDark 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  isDark ? 'text-red-100' : 'text-red-900'
                }`}>
                  Breach Notification Procedures
                </h4>
                <div className={`space-y-2 text-sm ${
                  isDark ? 'text-red-200' : 'text-red-800'
                }`}>
                  <p><strong>Detection:</strong> Automated monitoring systems detect potential breaches within minutes</p>
                  <p><strong>Assessment:</strong> Security team assesses impact within 1 hour of detection</p>
                  <p><strong>Notification:</strong> Users notified within 72 hours (GDPR) or 60 days (HIPAA) as required</p>
                  <p><strong>Remediation:</strong> Immediate containment and remediation measures implemented</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Last updated: {new Date().toLocaleDateString()} | Privacy Policy v2.1
            </div>
            <div className="flex space-x-3">
              <button className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}>
                Download Privacy Policy
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyComplianceModal;