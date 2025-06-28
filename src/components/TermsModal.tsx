import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { isDark } = useTheme();
  
  if (!isOpen) return null;

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
              <FileText className={`h-5 w-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Terms & Conditions
            </h2>
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

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className={`prose max-w-none ${
            isDark 
              ? 'prose-invert prose-headings:text-white prose-p:text-gray-300' 
              : 'prose-headings:text-gray-900 prose-p:text-gray-700'
          }`}>
            <h3>1. Introduction</h3>
            <p>
              Welcome to HealthTracker Pro. These Terms and Conditions govern your use of our application and services. 
              By accessing or using HealthTracker Pro, you agree to be bound by these Terms. If you disagree with any part 
              of the terms, you may not access the service.
            </p>
            
            <h3>2. Definitions</h3>
            <p>
              <strong>"Application"</strong> refers to HealthTracker Pro.<br />
              <strong>"User"</strong> refers to the individual accessing or using the Application.<br />
              <strong>"Health Data"</strong> refers to any personal health information entered into the Application.
            </p>
            
            <h3>3. Use of the Application</h3>
            <p>
              HealthTracker Pro provides tools for tracking blood pressure, blood sugar, and other health metrics. 
              The Application is intended for personal health tracking and informational purposes only.
            </p>
            <p>
              <strong>3.1 Medical Disclaimer:</strong> HealthTracker Pro is not a substitute for professional medical advice, 
              diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any 
              questions you may have regarding a medical condition.
            </p>
            <p>
              <strong>3.2 User Responsibilities:</strong> Users are responsible for the accuracy of the data they enter. 
              The Application does not verify the accuracy of user-entered data.
            </p>
            
            <h3>4. Privacy and Data Protection</h3>
            <p>
              We take your privacy seriously. Our Privacy Policy, which is incorporated into these Terms by reference, 
              explains how we collect, use, and protect your information.
            </p>
            <p>
              <strong>4.1 HIPAA Compliance:</strong> HealthTracker Pro is designed to be compliant with the Health Insurance 
              Portability and Accountability Act (HIPAA) for users in the United States.
            </p>
            <p>
              <strong>4.2 GDPR Compliance:</strong> For users in the European Union, we comply with the General Data 
              Protection Regulation (GDPR).
            </p>
            
            <h3>5. User Accounts</h3>
            <p>
              <strong>5.1 Registration:</strong> To use certain features of the Application, you may need to create an account. 
              You agree to provide accurate information and to keep it updated.
            </p>
            <p>
              <strong>5.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
              credentials and for all activities that occur under your account.
            </p>
            
            <h3>6. Intellectual Property</h3>
            <p>
              The Application and its original content, features, and functionality are owned by HealthTracker Pro and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            
            <h3>7. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, HealthTracker Pro shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
              or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul>
              <li>Your use or inability to use the Application</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any errors or omissions in the Application's content</li>
              <li>Any interruption or cessation of transmission to or from the Application</li>
            </ul>
            
            <h3>8. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by 
              updating the date at the top of these Terms and by maintaining a current version of the Terms on the Application.
            </p>
            
            <h3>9. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
              HealthTracker Pro is established, without regard to its conflict of law provisions.
            </p>
            
            <h3>10. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at legal@healthtrackerpro.com.
            </p>
            
            <p className="text-sm mt-8">
              Last updated: June 25, 2025
            </p>
          </div>
        </div>

        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              By using HealthTracker Pro, you agree to these Terms & Conditions
            </div>
            <div className="flex space-x-3">
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
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>I Accept</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;