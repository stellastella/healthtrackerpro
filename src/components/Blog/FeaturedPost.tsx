import React from 'react';
import { Calendar, Clock, Eye, Heart, ArrowRight, TrendingUp } from 'lucide-react';
import { BlogPost } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';

interface FeaturedPostProps {
  post: BlogPost;
  onClick?: () => void;
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, onClick }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article 
      className={`group cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg'
      }`}
      onClick={onClick}
    >
      {/* Featured Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Featured Badge */}
        <div className="absolute top-6 left-6">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <TrendingUp className="h-4 w-4" />
            <span>Featured</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-6 right-6">
          <span 
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium text-white backdrop-blur-sm`}
            style={{ backgroundColor: `rgba(var(--color-${post.category.color}-600-rgb), 0.9)` }}
          >
            <span>{post.category.name}</span>
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="space-y-4">
            {/* Meta Information */}
            <div className="flex items-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{post.likes}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white leading-tight group-hover:text-yellow-300 transition-colors duration-300">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-white/90 text-lg leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>

            {/* Author & Read More */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-3">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                )}
                <div>
                  <div className="text-white font-semibold">
                    {post.author.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {post.author.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold group-hover:bg-white/20 transition-all duration-300">
                <span>Read Article</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default FeaturedPost;