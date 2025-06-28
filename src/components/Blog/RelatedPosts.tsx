import React from 'react';
import { ArrowRight, Clock, Eye } from 'lucide-react';
import { BlogPost } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';

interface RelatedPostsProps {
  currentPost: BlogPost;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentPost }) => {
  const { isDark } = useTheme();

  // Mock related posts - in production, this would be fetched based on category/tags
  const relatedPosts: BlogPost[] = [
    {
      id: '2',
      title: 'Morning Blood Sugar Spikes: Why They Happen and How to Prevent Them',
      slug: 'morning-blood-sugar-spikes-prevention',
      excerpt: 'Learn about the dawn phenomenon and practical strategies to manage morning blood sugar spikes.',
      content: '',
      author: {
        name: 'Dr. Michael Chen',
        title: 'Endocrinologist',
        avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      category: {
        id: '2',
        name: 'Diabetes',
        slug: 'diabetes',
        description: 'Blood sugar management and diabetes care',
        color: 'blue',
        icon: 'Droplets'
      },
      tags: ['Dawn Phenomenon', 'Blood Sugar', 'Diabetes Management'],
      featuredImage: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      publishedAt: '2024-01-12T09:30:00Z',
      updatedAt: '2024-01-12T09:30:00Z',
      readTime: 6,
      isPublished: true,
      isFeatured: false,
      views: 1923,
      likes: 89,
      seoTitle: 'Morning Blood Sugar Spikes: Causes & Prevention',
      seoDescription: 'Understand why morning blood sugar spikes occur and learn effective prevention strategies.'
    },
    {
      id: '3',
      title: '10-Minute Stress-Relief Techniques That Actually Lower Blood Pressure',
      slug: 'stress-relief-techniques-lower-blood-pressure',
      excerpt: 'Quick, science-backed stress management techniques you can do anywhere to help lower blood pressure.',
      content: '',
      author: {
        name: 'Dr. Emily Rodriguez',
        title: 'Clinical Psychologist & Wellness Expert',
        avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      category: {
        id: '5',
        name: 'Mental Health',
        slug: 'mental-health',
        description: 'Stress management and mental wellness',
        color: 'indigo',
        icon: 'Brain'
      },
      tags: ['Stress Management', 'Blood Pressure', 'Meditation'],
      featuredImage: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      publishedAt: '2024-01-10T14:15:00Z',
      updatedAt: '2024-01-10T14:15:00Z',
      readTime: 5,
      isPublished: true,
      isFeatured: true,
      views: 3156,
      likes: 234,
      seoTitle: '10-Minute Stress Relief for Lower Blood Pressure',
      seoDescription: 'Learn quick, effective stress-relief techniques that can help lower blood pressure in just 10 minutes.'
    },
    {
      id: '4',
      title: 'The Best Low-Impact Exercises for People with High Blood Pressure',
      slug: 'low-impact-exercises-high-blood-pressure',
      excerpt: 'Safe and effective exercise routines designed specifically for people managing hypertension.',
      content: '',
      author: {
        name: 'Lisa Thompson',
        title: 'Certified Exercise Physiologist',
        avatar: 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      category: {
        id: '4',
        name: 'Exercise',
        slug: 'exercise',
        description: 'Physical activity and fitness tips',
        color: 'purple',
        icon: 'Dumbbell'
      },
      tags: ['Exercise', 'Hypertension', 'Low Impact'],
      featuredImage: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      publishedAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-08T11:00:00Z',
      readTime: 7,
      isPublished: true,
      isFeatured: false,
      views: 1567,
      likes: 78,
      seoTitle: 'Safe Exercises for High Blood Pressure',
      seoDescription: 'Discover safe, low-impact exercises perfect for managing high blood pressure.'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Related Articles
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <article 
            key={post.id}
            className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative overflow-hidden aspect-[16/10]">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white`}
                    style={{ backgroundColor: `var(--color-${post.category.color}-600)` }}
                  >
                    {post.category.name}
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {/* Meta Information */}
              <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(post.publishedAt)}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.views.toLocaleString()}</span>
                </div>
              </div>

              {/* Title */}
              <h4 className={`text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {post.title}
              </h4>

              {/* Excerpt */}
              <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {post.excerpt}
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {post.author.name}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  <span>Read</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;