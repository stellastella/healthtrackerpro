import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Plus, Edit, Trash2, Eye, Calendar, TrendingUp, Activity, Globe, Clock, Heart, LogOut, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { BlogPost } from '../../types/Blog';
import BlogEditor from './BlogEditor';
import VisitAnalytics from './VisitAnalytics';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analytics' | 'editor'>('overview');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitStats, setVisitStats] = useState({
    totalVisits: 15847,
    todayVisits: 234,
    weeklyGrowth: 12.5,
    monthlyGrowth: 28.3,
    averageSessionTime: '4:32',
    bounceRate: 32.1
  });

  // Fetch blog posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            category:category_id(id, name, slug, description, color, icon)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data to match our BlogPost type
          const transformedPosts: BlogPost[] = await Promise.all(data.map(async (post) => {
            // Get author info
            const { data: userData } = await supabase.auth.getUser();
            const authorId = post.author_id;
            const currentUser = userData?.user;
            
            // Get tags for this post
            const { data: tagData } = await supabase
              .from('blog_post_tags')
              .select(`
                tag:tag_id(id, name)
              `)
              .eq('post_id', post.id);
              
            const tags = tagData ? tagData.map(t => t.tag.name) : [];
            
            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              author: {
                name: currentUser?.user_metadata?.full_name || 'Admin User',
                title: 'Health Content Manager',
                avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
              },
              category: post.category,
              tags: tags,
              featuredImage: post.featured_image,
              publishedAt: post.published_at || post.created_at,
              updatedAt: post.updated_at,
              readTime: post.read_time,
              isPublished: post.is_published,
              isFeatured: post.is_featured,
              views: post.views,
              likes: post.likes,
              seoTitle: post.seo_title,
              seoDescription: post.seo_description
            };
          }));
          
          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    setSelectedPost(null);
    setActiveTab('editor');
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setActiveTab('editor');
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);
        
        if (error) throw error;
        
        // Update local state
        setPosts(posts.filter(p => p.id !== postId));
        
        // Show success message
        alert('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSavePost = async (post: BlogPost) => {
    try {
      setLoading(true);
      
      if (selectedPost) {
        // Update existing post - this is handled in the BlogEditor component
        // Just update local state here
        setPosts(posts.map(p => p.id === post.id ? post : p));
      } else {
        // Create new post - this is handled in the BlogEditor component
        // Just update local state here
        setPosts([post, ...posts]);
      }
      
      // Show success message
      alert(`Post ${selectedPost ? 'updated' : 'created'} successfully`);
      
      // Return to posts list
      setActiveTab('posts');
      setSelectedPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onBack(); // Return to home page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    post.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const publishedPosts = posts.filter(p => p.isPublished).length;
  const featuredPosts = posts.filter(p => p.isFeatured).length;

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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDark 
                  ? 'bg-purple-900/50' 
                  : 'bg-purple-100'
              }`}>
                <Users className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage content and monitor application usage
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* User info */}
              {user && (
                <div className="hidden md:block text-right">
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user.email}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Admin
                  </div>
                </div>
              )}
              
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
              
              <button
                onClick={onBack}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>← Back to App</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`flex space-x-1 p-1 rounded-lg w-fit ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'posts', label: 'Blog Posts', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? isDark 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'bg-white text-gray-900 shadow-sm'
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`rounded-xl shadow-sm border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Posts</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{posts.length}</p>
                  </div>
                  <FileText className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{publishedPosts} published, {featuredPosts} featured</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Avg. {Math.round(totalViews / (posts.length || 1)).toLocaleString()} per post</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Likes</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalLikes.toLocaleString()}</p>
                  </div>
                  <Heart className={`h-8 w-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Avg. {Math.round(totalLikes / (posts.length || 1)).toLocaleString()} per post</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>App Visits</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitStats.totalVisits.toLocaleString()}</p>
                  </div>
                  <Users className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>{visitStats.todayVisits} today ({visitStats.weeklyGrowth > 0 ? '+' : ''}{visitStats.weeklyGrowth}% weekly)</span>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className={`rounded-2xl shadow-sm border p-6 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Blog Posts
                </h2>
                <button
                  onClick={handleCreatePost}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No blog posts yet</p>
                  <button
                    onClick={handleCreatePost}
                    className={`font-medium ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Create your first post
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className={`min-w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-4">Title</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Published</th>
                        <th className="text-left py-3 px-4">Views</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 5).map((post) => (
                        <tr key={post.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              {post.featuredImage && (
                                <img 
                                  src={post.featuredImage} 
                                  alt={post.title} 
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  by {post.author.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white`}
                              style={{ backgroundColor: `var(--color-${post.category.color}-600)` }}
                            >
                              {post.category.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatDate(post.publishedAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark 
                                    ? 'hover:bg-gray-700 text-blue-400' 
                                    : 'hover:bg-gray-100 text-blue-600'
                                }`}
                                title="Edit post"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark 
                                    ? 'hover:bg-gray-700 text-red-400' 
                                    : 'hover:bg-gray-100 text-red-600'
                                }`}
                                title="Delete post"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {posts.length > 5 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`font-medium ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    View all {posts.length} posts →
                  </button>
                </div>
              )}
            </div>

            {/* App Usage Stats */}
            <div className={`rounded-2xl shadow-sm border p-6 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  App Usage Overview
                </h2>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>View Details</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Visitor Metrics
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Today:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitStats.todayVisits} visits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Weekly Growth:</span>
                      <span className={`font-semibold ${
                        visitStats.weeklyGrowth > 0 
                          ? 'text-green-500' 
                          : visitStats.weeklyGrowth < 0 
                            ? 'text-red-500' 
                            : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {visitStats.weeklyGrowth > 0 ? '+' : ''}{visitStats.weeklyGrowth}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Monthly Growth:</span>
                      <span className={`font-semibold ${
                        visitStats.monthlyGrowth > 0 
                          ? 'text-green-500' 
                          : visitStats.monthlyGrowth < 0 
                            ? 'text-red-500' 
                            : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {visitStats.monthlyGrowth > 0 ? '+' : ''}{visitStats.monthlyGrowth}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Engagement
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg. Session:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitStats.averageSessionTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Bounce Rate:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitStats.bounceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Returning Users:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>68.4%</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Top Features
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Blood Pressure:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Blood Sugar:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Blog:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>23%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className={`rounded-2xl shadow-sm border p-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Manage Blog Posts
                </h2>
                <span className={`ml-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <button
                  onClick={handleCreatePost}
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery ? 'No posts match your search' : 'No blog posts yet'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreatePost}
                    className={`font-medium ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Create your first post
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Author</th>
                      <th className="text-left py-3 px-4">Published</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {post.featuredImage && (
                              <img 
                                src={post.featuredImage} 
                                alt={post.title} 
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div className="max-w-xs">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                                {post.title}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                {post.excerpt.substring(0, 60)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white`}
                            style={{ backgroundColor: `var(--color-${post.category.color}-600)` }}
                          >
                            {post.category.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {post.author.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatDate(post.publishedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              post.isPublished 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {post.isPublished ? 'Published' : 'Draft'}
                            </span>
                            {post.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPost(post)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark 
                                  ? 'hover:bg-gray-700 text-blue-400' 
                                  : 'hover:bg-gray-100 text-blue-600'
                              }`}
                              title="Edit post"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark 
                                  ? 'hover:bg-gray-700 text-red-400' 
                                  : 'hover:bg-gray-100 text-red-600'
                              }`}
                              title="Delete post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <VisitAnalytics />
        )}

        {activeTab === 'editor' && (
          <BlogEditor 
            post={selectedPost} 
            onSave={handleSavePost} 
            onCancel={() => setActiveTab('posts')} 
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;