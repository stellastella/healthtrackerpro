import React from 'react';
import { Calendar, Clock, Eye, Heart, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  const { isDark } = useTheme();

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Heart: Heart,
      // Add other icons as needed
    };
    const IconComponent = iconMap[iconName] || Heart;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article 
      className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
          : 'bg-white border border-gray-100 hover:border-gray-200 shadow-sm'
      }`}
      onClick={onClick}
    >
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium text-white`}
              style={{ backgroundColor: `var(--color-${post.category.color}-600)` }}
            >
              {getCategoryIcon(post.category.icon)}
              <span>{post.category.name}</span>
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {post.excerpt}
        </p>

        {/* Author & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div>
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {post.author.name}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {post.author.title}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{post.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{post.likes}</span>
            </div>
          </div>
        </div>

        {/* Read More */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 rounded-md text-xs ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              <span>Read more</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;