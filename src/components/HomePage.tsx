import React, { useState } from 'react';
import { Heart, Droplets, TrendingUp, Shield, Users, Award, ArrowRight, Activity, BarChart3, Calendar, BookOpen, Sun, Moon, Settings, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import PrivacyComplianceModal from './PrivacyComplianceModal';
import TermsModal from './TermsModal';
import CookiePolicyModal from './CookiePolicyModal';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import BoltBadge from './BoltBadge';

interface HomePageProps {
  onSelectTracker: (type: 'blood-pressure' | 'blood-sugar') => void;
  onSelectBlog: () => void;
  onSelectAdmin: () => void;
  isAdmin: boolean;
  showAuthModal: () => void;
  user: any;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onSelectTracker, 
  onSelectBlog, 
  onSelectAdmin,
  isAdmin,
  showAuthModal,
  user
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  
  const features = [
    {
      icon: Activity,
      title: 'Smart Analytics',
      description: 'Advanced insights and trend analysis for better health decisions'
    },
    {
      icon: BarChart3,
      title: 'Visual Reports',
      description: 'Beautiful charts and graphs to track your progress over time'
    },
    {
      icon: Calendar,
      title: 'Historical Data',
      description: 'Log past readings and maintain comprehensive health records'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data stays on your device, completely private'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Diabetes Patient',
      quote: 'This app has transformed how I manage my health. The insights are incredible!'
    },
    {
      name: 'Dr. James Wilson',
      role: 'Cardiologist',
      quote: 'I recommend this to all my patients. The data visualization is outstanding.'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Health Enthusiast',
      quote: 'Finally, a health tracker that\'s both powerful and easy to use.'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${
        isDark 
          ? 'bg-gray-800/80 backdrop-blur-sm border-b border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100'
      } sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDark 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
                }`}>
                  HealthTracker Pro
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your comprehensive health monitoring companion
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Bolt.new Badge */}
              {/* <BoltBadge /> */}

              
              {/* Language Selector */}
              <LanguageSelector showLabel={true} />
              
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <Shield className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>100% Private</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <Users className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Trusted by 10k+ users</span>
              </div>
              
              {/* Admin Button - Only visible to admin users */}
              {isAdmin && (
                <button
                  onClick={onSelectAdmin}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Admin Dashboard"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              
              {/* Blog Button */}
              <button
                onClick={onSelectBlog}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Health Education Blog"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Health Tips</span>
              </button>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-right">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.email}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Cloud Enabled
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={showAuthModal}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className={`flex items-center space-x-4 ${
                isDark 
                  ? 'bg-gray-800/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-700/20' 
                  : 'bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20'
              }`}>
                <Award className="h-5 w-5 text-yellow-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  #1 Health Tracking App
                </span>
              </div>
            </div>
            
            <h1 className={`text-5xl md:text-6xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-6 leading-tight`}>
              Take Control of Your
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent block">
                Health Journey
              </span>
            </h1>
            
            <p className={`text-xl ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } mb-12 max-w-3xl mx-auto leading-relaxed`}>
              Monitor your vital health metrics with precision. Get personalized insights, 
              track trends, and make informed decisions about your wellbeing.
            </p>

            {/* Tracker Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Blood Pressure Tracker */}
              <div 
                onClick={() => onSelectTracker('blood-pressure')}
                className={`group relative rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white shadow-xl border border-gray-100'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  isDark 
                    ? 'from-red-900/20 to-pink-900/20' 
                    : 'from-red-50 to-pink-50'
                } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>Blood Pressure Monitor</h3>
                  <p className={`${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  } mb-6 leading-relaxed`}>
                    Track your blood pressure readings, monitor trends, and get insights 
                    into your cardiovascular health with advanced analytics.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Systolic & Diastolic tracking</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Heart rate monitoring</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Risk category analysis</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg">
                    <span>Start Tracking BP</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* Blood Sugar Tracker */}
              <div 
                onClick={() => onSelectTracker('blood-sugar')}
                className={`group relative rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white shadow-xl border border-gray-100'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  isDark 
                    ? 'from-blue-900/20 to-indigo-900/20' 
                    : 'from-blue-50 to-indigo-50'
                } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Droplets className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-4`}>Blood Sugar Monitor</h3>
                  <p className={`${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  } mb-6 leading-relaxed`}>
                    Monitor your glucose levels, track patterns, and manage diabetes 
                    with comprehensive logging and analysis tools.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Glucose level tracking</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Meal & medication logging</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>HbA1c estimation</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg">
                    <span>Start Tracking Sugar</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${
        isDark 
          ? 'bg-gray-800/50 backdrop-blur-sm' 
          : 'bg-white/50 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-4`}>
              Why Choose HealthTracker Pro?
            </h2>
            <p className={`text-xl ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } max-w-3xl mx-auto`}>
              Built with cutting-edge technology and designed by healthcare professionals 
              to give you the most accurate and actionable health insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-blue-900/30 group-hover:to-indigo-900/30' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
                  }`}>
                    <feature.icon className={`h-8 w-8 ${
                      isDark 
                        ? 'text-gray-300 group-hover:text-blue-400' 
                        : 'text-gray-600 group-hover:text-blue-600'
                    } transition-colors duration-300`} />
                  </div>
                </div>
                <h3 className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-3`}>{feature.title}</h3>
                <p className={`${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                } leading-relaxed`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-4`}>
              Trusted by Healthcare Professionals
            </h2>
            <p className={`text-xl ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              See what our users and medical experts are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-white border border-gray-100'
              }`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{testimonial.name}</h4>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{testimonial.role}</p>
                  </div>
                </div>
                <p className={`italic leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of users who have taken control of their health journey. 
            Start tracking today and see the difference comprehensive monitoring can make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onSelectTracker('blood-pressure')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <Heart className="h-5 w-5" />
              <span>Track Blood Pressure</span>
            </button>
            <button 
              onClick={() => onSelectTracker('blood-sugar')}
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors duration-300 flex items-center justify-center space-x-2 border-2 border-white/20"
            >
              <Droplets className="h-5 w-5" />
              <span>Track Blood Sugar</span>
            </button>
            <button 
              onClick={onSelectBlog}
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-400 transition-colors duration-300 flex items-center justify-center space-x-2 border-2 border-white/20"
            >
              <BookOpen className="h-5 w-5" />
              <span>Read Health Articles</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        showTermsModal={() => setShowTermsModal(true)}
        showPrivacyModal={() => setShowPrivacyModal(true)}
        showCookieModal={() => setShowCookieModal(true)}
      />

      {/* Privacy Compliance Modal */}
      {showPrivacyModal && (
        <PrivacyComplianceModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
      )}

      {/* Cookie Policy Modal */}
      {showCookieModal && (
        <CookiePolicyModal
          isOpen={showCookieModal}
          onClose={() => setShowCookieModal(false)}
        />
      )}
    </div>
  );
};

export default HomePage;