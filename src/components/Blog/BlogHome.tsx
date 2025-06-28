import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, TrendingUp, BookOpen, Heart, Activity, Droplets, Brain, Utensils, Dumbbell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { BlogPost, BlogCategory, BlogFilters } from '../../types/Blog';
import FeaturedPost from './FeaturedPost';
import BlogCard from './BlogCard';
import CategoryFilter from './CategoryFilter';

interface BlogHomeProps {
  onBackToHome: () => void;
  onSelectPost?: (post: BlogPost) => void;
}

const BlogHome: React.FC<BlogHomeProps> = ({ onBackToHome, onSelectPost }) => {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({ sortBy: 'newest' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - in production, this would come from your CMS or API
  useEffect(() => {
    const mockCategories: BlogCategory[] = [
      { id: '1', name: 'Blood Pressure', slug: 'blood-pressure', description: 'Managing hypertension and cardiovascular health', color: 'red', icon: 'Heart' },
      { id: '2', name: 'Diabetes', slug: 'diabetes', description: 'Blood sugar management and diabetes care', color: 'blue', icon: 'Droplets' },
      { id: '3', name: 'Nutrition', slug: 'nutrition', description: 'Healthy eating and dietary guidance', color: 'green', icon: 'Utensils' },
      { id: '4', name: 'Exercise', slug: 'exercise', description: 'Physical activity and fitness tips', color: 'purple', icon: 'Dumbbell' },
      { id: '5', name: 'Mental Health', slug: 'mental-health', description: 'Stress management and mental wellness', color: 'indigo', icon: 'Brain' },
      { id: '6', name: 'General Health', slug: 'general-health', description: 'Overall wellness and health tips', color: 'orange', icon: 'Activity' }
    ];

    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Understanding the DASH Diet: Your Complete Guide to Lowering Blood Pressure Naturally',
        slug: 'dash-diet-complete-guide',
        excerpt: 'Discover how the DASH diet can help you lower blood pressure naturally through evidence-based nutrition strategies. Learn meal planning tips, recipes, and success stories.',
        content: 'Full article content would go here...',
        author: {
          name: 'Dr. Sarah Johnson',
          title: 'Cardiologist & Nutrition Specialist',
          avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Board-certified cardiologist with 15 years of experience in preventive cardiology and nutrition medicine.'
        },
        category: mockCategories[0],
        tags: ['DASH Diet', 'Hypertension', 'Nutrition', 'Heart Health'],
        featuredImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        readTime: 8,
        isPublished: true,
        isFeatured: true,
        views: 2847,
        likes: 156,
        seoTitle: 'DASH Diet Guide: Lower Blood Pressure Naturally | HealthTracker Pro',
        seoDescription: 'Complete guide to the DASH diet for lowering blood pressure. Evidence-based nutrition strategies, meal plans, and expert tips.'
      },
      {
        id: '2',
        title: 'Morning Blood Sugar Spikes: Why They Happen and How to Prevent Them',
        slug: 'morning-blood-sugar-spikes-prevention',
        excerpt: 'Learn about the dawn phenomenon and practical strategies to manage morning blood sugar spikes. Expert tips for better glucose control.',
        content: 'Full article content would go here...',
        author: {
          name: 'Dr. Michael Chen',
          title: 'Endocrinologist',
          avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Endocrinologist specializing in diabetes management and metabolic disorders.'
        },
        category: mockCategories[1],
        tags: ['Dawn Phenomenon', 'Blood Sugar', 'Diabetes Management', 'Morning Routine'],
        featuredImage: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-12T09:30:00Z',
        updatedAt: '2024-01-12T09:30:00Z',
        readTime: 6,
        isPublished: true,
        isFeatured: false,
        views: 1923,
        likes: 89,
        seoTitle: 'Morning Blood Sugar Spikes: Causes & Prevention | HealthTracker Pro',
        seoDescription: 'Understand why morning blood sugar spikes occur and learn effective prevention strategies from diabetes experts.'
      },
      {
        id: '3',
        title: '10-Minute Stress-Relief Techniques That Actually Lower Blood Pressure',
        slug: 'stress-relief-techniques-lower-blood-pressure',
        excerpt: 'Quick, science-backed stress management techniques you can do anywhere to help lower blood pressure and improve heart health.',
        content: 'Full article content would go here...',
        author: {
          name: 'Dr. Emily Rodriguez',
          title: 'Clinical Psychologist & Wellness Expert',
          avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Clinical psychologist specializing in stress management and mind-body wellness approaches.'
        },
        category: mockCategories[4],
        tags: ['Stress Management', 'Blood Pressure', 'Meditation', 'Breathing Exercises'],
        featuredImage: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-10T14:15:00Z',
        updatedAt: '2024-01-10T14:15:00Z',
        readTime: 5,
        isPublished: true,
        isFeatured: true,
        views: 3156,
        likes: 234,
        seoTitle: '10-Minute Stress Relief for Lower Blood Pressure | HealthTracker Pro',
        seoDescription: 'Learn quick, effective stress-relief techniques that can help lower blood pressure in just 10 minutes.'
      },
      {
        id: '4',
        title: 'The Best Low-Impact Exercises for People with High Blood Pressure',
        slug: 'low-impact-exercises-high-blood-pressure',
        excerpt: 'Safe and effective exercise routines designed specifically for people managing hypertension. Build fitness while protecting your heart.',
        content: 'Full article content would go here...',
        author: {
          name: 'Lisa Thompson',
          title: 'Certified Exercise Physiologist',
          avatar: 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Exercise physiologist with expertise in cardiac rehabilitation and safe fitness for chronic conditions.'
        },
        category: mockCategories[3],
        tags: ['Exercise', 'Hypertension', 'Low Impact', 'Cardiac Health'],
        featuredImage: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-08T11:00:00Z',
        updatedAt: '2024-01-08T11:00:00Z',
        readTime: 7,
        isPublished: true,
        isFeatured: false,
        views: 1567,
        likes: 78,
        seoTitle: 'Safe Exercises for High Blood Pressure | HealthTracker Pro',
        seoDescription: 'Discover safe, low-impact exercises perfect for managing high blood pressure and improving cardiovascular health.'
      },
      {
        id: '5',
        title: 'Reading Food Labels: Hidden Sodium Sources That Spike Blood Pressure',
        slug: 'reading-food-labels-hidden-sodium',
        excerpt: 'Learn to identify hidden sodium sources in everyday foods and make heart-healthy choices at the grocery store.',
        content: 'Full article content would go here...',
        author: {
          name: 'Maria Santos',
          title: 'Registered Dietitian',
          avatar: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Registered dietitian specializing in cardiovascular nutrition and chronic disease management.'
        },
        category: mockCategories[2],
        tags: ['Nutrition', 'Sodium', 'Food Labels', 'Heart Health'],
        featuredImage: 'https://images.pexels.com/photos/4099235/pexels-photo-4099235.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-05T16:20:00Z',
        updatedAt: '2024-01-05T16:20:00Z',
        readTime: 4,
        isPublished: true,
        isFeatured: false,
        views: 892,
        likes: 45,
        seoTitle: 'Hidden Sodium in Foods: Reading Labels for Heart Health | HealthTracker Pro',
        seoDescription: 'Learn to identify hidden sodium sources in foods and make better choices for blood pressure management.'
      },
      {
        id: '6',
        title: 'Sleep and Blood Sugar: How Poor Sleep Affects Glucose Control',
        slug: 'sleep-blood-sugar-glucose-control',
        excerpt: 'Discover the critical connection between sleep quality and blood sugar control. Learn how to optimize your sleep for better diabetes management.',
        content: 'Full article content would go here...',
        author: {
          name: 'Dr. James Wilson',
          title: 'Sleep Medicine Specialist',
          avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          bio: 'Sleep medicine specialist with research focus on metabolic health and circadian rhythms.'
        },
        category: mockCategories[1],
        tags: ['Sleep', 'Blood Sugar', 'Diabetes', 'Circadian Rhythm'],
        featuredImage: 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        publishedAt: '2024-01-03T08:45:00Z',
        updatedAt: '2024-01-03T08:45:00Z',
        readTime: 6,
        isPublished: true,
        isFeatured: false,
        views: 1234,
        likes: 67,
        seoTitle: 'Sleep & Blood Sugar: How Sleep Affects Diabetes | HealthTracker Pro',
        seoDescription: 'Learn how sleep quality impacts blood sugar control and discover strategies for better glucose management through improved sleep.'
      }
    ];

    setCategories(mockCategories);
    setPosts(mockPosts);
    setLoading(false);
  }, []);

  const filteredPosts = posts.filter(post => {
    if (filters.category && post.category.slug !== filters.category) return false;
    if (filters.tag && !post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'popular':
        return b.views - a.views;
      case 'trending':
        return b.likes - a.likes;
      default: // newest
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const featuredPosts = posts.filter(post => post.isFeatured);
  const regularPosts = filteredPosts.filter(post => !post.isFeatured);

  const handlePostClick = (post: BlogPost) => {
    if (onSelectPost) {
      onSelectPost(post);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading health articles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm shadow-sm border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-900/50 hover:bg-blue-900/70' 
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                <BookOpen className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Health Education Hub
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expert insights for better health management
                </p>
              </div>
            </div>
            
            <button
              onClick={onBackToHome}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">← Back to App</span>
              <span className="sm:hidden">← Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Health, <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Simplified</span>
          </h2>
          <p className={`text-xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Evidence-based articles, expert insights, and practical tips to help you manage your health with confidence.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search health topics, conditions, or tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={filters.category}
          onCategoryChange={(category) => setFilters(prev => ({ ...prev, category }))}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
        />

        {/* Featured Posts */}
        {featuredPosts.length > 0 && !filters.category && !searchQuery && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <TrendingUp className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Featured Articles
              </h3>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <FeaturedPost 
                  key={post.id} 
                  post={post} 
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <BookOpen className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filters.category ? `${categories.find(c => c.slug === filters.category)?.name} Articles` : 'Latest Articles'}
              </h3>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <BookOpen className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <h4 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No articles found
              </h4>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Signup */}
        <section className={`mt-20 rounded-3xl p-8 md:p-12 text-center ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>
          <h3 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Health Tips
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest evidence-based health insights, tips, and expert advice delivered to your inbox weekly.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className={`flex-1 px-4 py-3 rounded-xl border-0 focus:ring-4 focus:ring-white/20 ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            />
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-blue-200 mt-4">
            HIPAA compliant. Unsubscribe anytime. No spam, ever.
          </p>
        </section>
      </main>
    </div>
  );
};

export default BlogHome;