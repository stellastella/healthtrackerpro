import React, { useState, useEffect } from 'react';
import { X, Save, Image, Tag, Calendar, Clock, Eye, Heart, BookOpen, User } from 'lucide-react';
import { BlogPost, BlogCategory } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [readTime, setReadTime] = useState(5);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setCategories(data);
          // Set default category if none is selected
          if (!categoryId && data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [categoryId]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setFeaturedImage(post.featuredImage || '');
      setCategoryId(post.category.id);
      setTags(post.tags);
      setIsPublished(post.isPublished);
      setIsFeatured(post.isFeatured);
      setReadTime(post.readTime);
    } else {
      // Default values for new post
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setFeaturedImage('');
      // Category is set in the useEffect above
      setTags([]);
      setIsPublished(true);
      setIsFeatured(false);
      setReadTime(5);
    }
  }, [post]);

  useEffect(() => {
    // Auto-generate slug from title
    if (title && !post) {
      setSlug(title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      );
    }

    // Estimate read time based on content length
    const wordCount = content.split(/\s+/).length;
    const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
    setReadTime(calculatedReadTime);
  }, [title, content, post]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title || !excerpt || !content || !categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    if (!selectedCategory) {
      alert('Please select a valid category');
      return;
    }

    setSaving(true);

    try {
      // Prepare the post data
      const newPost: BlogPost = {
        id: post?.id || crypto.randomUUID(),
        title,
        slug,
        excerpt,
        content,
        author: post?.author || {
          name: 'Admin User',
          title: 'Health Content Manager',
          avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        category: selectedCategory,
        tags,
        featuredImage,
        publishedAt: post?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readTime,
        isPublished,
        isFeatured,
        views: post?.views || 0,
        likes: post?.likes || 0,
        seoTitle: title,
        seoDescription: excerpt
      };

      // Save to Supabase
      if (post?.id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: title,
            slug: slug,
            excerpt: excerpt,
            content: content,
            category_id: categoryId,
            featured_image: featuredImage,
            read_time: readTime,
            is_published: isPublished,
            is_featured: isFeatured,
            seo_title: title,
            seo_description: excerpt,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        if (error) throw error;
        
        // Update tags
        // First delete existing tags
        await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', post.id);
          
        // Then add new tags
        for (const tag of tags) {
          // Check if tag exists
          let tagId;
          const { data: existingTag } = await supabase
            .from('blog_tags')
            .select('id')
            .eq('name', tag)
            .single();
            
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('blog_tags')
              .insert({
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-')
              })
              .select()
              .single();
              
            if (tagError) throw tagError;
            tagId = newTag.id;
          }
          
          // Add tag to post
          await supabase
            .from('blog_post_tags')
            .insert({
              post_id: post.id,
              tag_id: tagId
            });
        }
      } else {
        // Create new post
        const { data: insertedPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: title,
            slug: slug,
            excerpt: excerpt,
            content: content,
            author_id: (await supabase.auth.getUser()).data.user?.id,
            category_id: categoryId,
            featured_image: featuredImage,
            published_at: isPublished ? new Date().toISOString() : null,
            read_time: readTime,
            is_published: isPublished,
            is_featured: isFeatured,
            seo_title: title,
            seo_description: excerpt
          })
          .select()
          .single();

        if (error) throw error;
        
        // Add tags
        for (const tag of tags) {
          // Check if tag exists
          let tagId;
          const { data: existingTag } = await supabase
            .from('blog_tags')
            .select('id')
            .eq('name', tag)
            .single();
            
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('blog_tags')
              .insert({
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-')
              })
              .select()
              .single();
              
            if (tagError) throw tagError;
            tagId = newTag.id;
          }
          
          // Add tag to post
          await supabase
            .from('blog_post_tags')
            .insert({
              post_id: insertedPost.id,
              tag_id: tagId
            });
        }
        
        // Update the post ID in our newPost object
        newPost.id = insertedPost.id;
      }

      await onSave(newPost);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-sm border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <BookOpen className={`h-5 w-5 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={saving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className={`rounded-lg border p-6 ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-4">
              {categoryId && (
                <span 
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white`}
                  style={{ backgroundColor: `var(--color-${categories.find(c => c.id === categoryId)?.color || 'gray'}-600)` }}
                >
                  {categories.find(c => c.id === categoryId)?.name || 'Category'}
                </span>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{readTime} min read</span>
              </div>
            </div>

            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title || 'Post Title'}
            </h1>

            {featuredImage && (
              <div className="mb-6">
                <img 
                  src={featuredImage} 
                  alt={title} 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {excerpt || 'Post excerpt will appear here...'}
            </div>

            <div 
              className={`prose max-w-none ${
                isDark 
                  ? 'prose-invert prose-headings:text-white prose-p:text-gray-300' 
                  : 'prose-headings:text-gray-900 prose-p:text-gray-700'
              }`}
              dangerouslySetInnerHTML={{ __html: content || '<p>Post content will appear here...</p>' }}
            />

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Admin User
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Health Content Manager
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post?.views || 0} views
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post?.likes || 0} likes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="enter-post-slug"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Excerpt *
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Brief summary of the post"
              rows={3}
              required
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Featured Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Image className="h-5 w-5" />
              </button>
            </div>
            {featuredImage && (
              <div className="mt-2">
                <img 
                  src={featuredImage} 
                  alt="Featured" 
                  className="h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Category *
            </label>
            {loadingCategories ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading categories...</span>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Tags
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag className="h-5 w-5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="<p>Write your post content here. HTML is supported.</p>"
              rows={12}
              required
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              HTML formatting is supported. Use &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;, etc.
            </p>
          </div>

          {/* Publishing Options */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Publishing Options
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className={`text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Publish immediately
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className={`text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Feature this post
                </label>
              </div>
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Estimated read time: {readTime} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;