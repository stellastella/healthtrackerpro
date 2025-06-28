import React from 'react';
import { Activity, Shield, TrendingUp, Heart, Cookie } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import BoltBadge from './BoltBadge';

interface FooterProps {
  showTermsModal: () => void;
  showPrivacyModal: () => void;
  showCookieModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ showTermsModal, showPrivacyModal, showCookieModal }) => {
  const { isDark } = useTheme();
  
  return (
    <footer className={`${isDark ? 'bg-gray-900' : 'bg-gray-900'} text-white py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">HealthTracker Pro</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Your privacy-first health monitoring companion
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="h-4 w-4" />
              <span>HIPAA & GDPR Compliant</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Blood Pressure Monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-blue-400" />
                <span>Blood Sugar Tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>Health Analytics</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span>Secure Data Storage</span>
              </li>
            </ul>
          </div>
          
          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Health Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>
           */}
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={showPrivacyModal}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={showTermsModal}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={showCookieModal}
                  className="hover:text-white transition-colors text-left"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={showPrivacyModal}
                  className="hover:text-white transition-colors text-left"
                >
                  HIPAA Compliance
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} HealthTracker Pro. All rights reserved.</p>
          <p className="mt-2">
            HealthTracker Pro is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions 
            you may have regarding a medical condition.
          </p>
          
          {/* Built with Bolt Badge */}
          <div className="mt-6 flex justify-center">
            <BoltBadge />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;