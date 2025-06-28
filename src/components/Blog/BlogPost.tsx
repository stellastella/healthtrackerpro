import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, BookOpen, User, Tag } from 'lucide-react';
import { BlogPost as BlogPostType } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';
import CommentSection from './CommentSection';
import RelatedPosts from './RelatedPosts';

interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onBack }) => {
  const { isDark } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById('article-content');
      if (article) {
        const scrollTop = window.scrollY;
        const docHeight = article.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        setReadingProgress(Math.min(100, Math.max(0, scrollPercent * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedReadTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className={`sticky top-1 shadow-sm border-b transition-colors duration-200 z-40 ${
        isDark 
          ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm border-gray-100'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={onBack}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  liked
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : isDark 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <article className="space-y-8">
          {/* Category Badge */}
          <div className="flex items-center space-x-2">
            <span 
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium text-white`}
              style={{ backgroundColor: `var(--color-${post.category.color}-600)` }}
            >
              <span>{post.category.name}</span>
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(post.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className={`text-xl leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {post.author.name}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {post.author.title}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedReadTime} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative overflow-hidden rounded-2xl aspect-[16/9]">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            id="article-content"
            className={`prose prose-lg max-w-none ${
              isDark 
                ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400' 
                : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600'
            }`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mr-4">
              <Tag className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tags:
              </span>
            </div>
            {post.tags.map((tag) => (
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

          {/* Author Bio */}
          {post.author.bio && (
            <div className={`rounded-2xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-start space-x-4">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    About {post.author.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Related Posts */}
        <RelatedPosts currentPost={post} />

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </main>
    </div>
  );
};

export default BlogPost;