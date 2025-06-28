import React from 'react';
import { X, Cookie, Shield, Clock, Globe, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const CookiePolicyModal: React.FC<CookiePolicyModalProps> = ({ isOpen, onClose, onAccept }) => {
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
              <Cookie className={`h-5 w-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Cookie Policy
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
            <h3>What Are Cookies</h3>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to the website owners. 
              Cookies enhance your browsing experience by:
            </p>
            <ul>
              <li>Remembering your preferences and settings</li>
              <li>Ensuring the security of your session</li>
              <li>Helping us understand how you use our website</li>
              <li>Improving our services based on this information</li>
            </ul>
            
            <h3>How HealthTracker Pro Uses Cookies</h3>
            <p>
              HealthTracker Pro uses cookies for several purposes, all designed to improve your experience and protect your data:
            </p>
            
            <h4>Essential Cookies</h4>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, 
              network management, and account access. You cannot opt out of these cookies as the website cannot function properly without them.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Cookie Name</th>
                  <th className="border p-2 text-left">Purpose</th>
                  <th className="border p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">session</td>
                  <td className="border p-2">Maintains your authenticated session</td>
                  <td className="border p-2">Session</td>
                </tr>
                <tr>
                  <td className="border p-2">XSRF-TOKEN</td>
                  <td className="border p-2">Helps prevent cross-site request forgery attacks</td>
                  <td className="border p-2">Session</td>
                </tr>
                <tr>
                  <td className="border p-2">healthtracker-language</td>
                  <td className="border p-2">Stores your language preference</td>
                  <td className="border p-2">1 year</td>
                </tr>
                <tr>
                  <td className="border p-2">theme</td>
                  <td className="border p-2">Stores your theme preference (light/dark)</td>
                  <td className="border p-2">1 year</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Functional Cookies</h4>
            <p>
              These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers 
              whose services we have added to our pages. If you disable these cookies, some or all of these services may not function properly.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Cookie Name</th>
                  <th className="border p-2 text-left">Purpose</th>
                  <th className="border p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">userConsent</td>
                  <td className="border p-2">Stores your consent preferences</td>
                  <td className="border p-2">1 year</td>
                </tr>
                <tr>
                  <td className="border p-2">dismissedHealthAlerts</td>
                  <td className="border p-2">Remembers which health alerts you've dismissed</td>
                  <td className="border p-2">30 days</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Analytics Cookies (Optional)</h4>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. 
              They help us improve our website and services.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Cookie Name</th>
                  <th className="border p-2 text-left">Purpose</th>
                  <th className="border p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">_ga</td>
                  <td className="border p-2">Used to distinguish users for analytics</td>
                  <td className="border p-2">2 years</td>
                </tr>
                <tr>
                  <td className="border p-2">_gid</td>
                  <td className="border p-2">Used to distinguish users for analytics</td>
                  <td className="border p-2">24 hours</td>
                </tr>
                <tr>
                  <td className="border p-2">_gat</td>
                  <td className="border p-2">Used to throttle request rate</td>
                  <td className="border p-2">1 minute</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Local Storage</h3>
            <p>
              In addition to cookies, we use browser local storage to store your health data when you're not signed in. 
              This data remains on your device and is not transmitted to our servers unless you create an account and sign in. 
              Local storage data includes:
            </p>
            <ul>
              <li>Blood pressure readings</li>
              <li>Blood sugar measurements</li>
              <li>User preferences</li>
              <li>Application state</li>
            </ul>
            
            <h3>Managing Cookies</h3>
            <p>
              Most web browsers allow you to manage your cookie preferences. You can:
            </p>
            <ul>
              <li>Delete cookies from your device</li>
              <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
              <li>Set your browser to notify you when you receive a cookie</li>
            </ul>
            <p>
              Please note that if you choose to block all cookies (including essential cookies) you may not be able to access all or parts of our site, 
              or you may experience reduced functionality when accessing certain services.
            </p>
            
            <h3>Cookie Policy Changes</h3>
            <p>
              We may update our cookie policy from time to time. Any changes will be posted on this page with an updated revision date. 
              We encourage you to periodically review this page to stay informed about how we are using cookies.
            </p>
            
            <h3>Contact Us</h3>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p>
              Email: privacy@healthtracker.com<br />
              Phone: +1 (555) 123-4567
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
              By using HealthTracker Pro, you agree to our use of cookies as described above
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
                  <span>Accept All Cookies</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyModal;