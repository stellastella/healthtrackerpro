import { supabase } from '../lib/supabase';
import { BlogPost, BlogCategory } from '../types/Blog';

export class BlogService {
  static async getPosts(options: { 
    limit?: number; 
    featured?: boolean; 
    published?: boolean;
    categorySlug?: string;
    tag?: string;
    search?: string;
  } = {}): Promise<BlogPost[]> {
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:category_id(id, name, slug, description, color, icon),
          author:author_id(id, email, user_metadata)
        `)
        .order('published_at', { ascending: false });

      // Apply filters
      if (options.published !== undefined) {
        query = query.eq('is_published', options.published);
      }

      if (options.featured !== undefined) {
        query = query.eq('is_featured', options.featured);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Category filter would need a join or separate query in a real implementation
      // Tag filter would need a join through blog_post_tags in a real implementation
      // Search would need to use text search capabilities

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }

      // Transform the data to match our BlogPost type
      return data.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: {
          name: post.author.user_metadata?.full_name || post.author.email.split('@')[0],
          title: post.author.user_metadata?.title || 'Content Author',
          avatar: post.author.user_metadata?.avatar_url
        },
        category: post.category as BlogCategory,
        tags: [], // Would need another query to get tags
        featuredImage: post.featured_image,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
        readTime: post.read_time,
        isPublished: post.is_published,
        isFeatured: post.is_featured,
        views: post.views,
        likes: post.likes,
        seoTitle: post.seo_title,
        seoDescription: post.seo_description
      }));
    } catch (error) {
      console.error('Error in getPosts:', error);
      throw error;
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:category_id(id, name, slug, description, color, icon),
          author:author_id(id, email, user_metadata)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Post not found
          return null;
        }
        console.error('Error fetching blog post:', error);
        throw error;
      }

      if (!data) return null;

      // Get tags for this post
      const { data: tagData, error: tagError } = await supabase
        .from('blog_post_tags')
        .select(`
          tag:tag_id(name)
        `)
        .eq('post_id', data.id);

      if (tagError) {
        console.error('Error fetching post tags:', tagError);
      }

      const tags = tagData ? tagData.map(t => t.tag.name) : [];

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ views: data.views + 1 })
        .eq('id', data.id);

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: {
          name: data.author.user_metadata?.full_name || data.author.email.split('@')[0],
          title: data.author.user_metadata?.title || 'Content Author',
          avatar: data.author.user_metadata?.avatar_url
        },
        category: data.category as BlogCategory,
        tags,
        featuredImage: data.featured_image,
        publishedAt: data.published_at,
        updatedAt: data.updated_at,
        readTime: data.read_time,
        isPublished: data.is_published,
        isFeatured: data.is_featured,
        views: data.views,
        likes: data.likes,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description
      };
    } catch (error) {
      console.error('Error in getPostBySlug:', error);
      throw error;
    }
  }

  static async createPost(userId: string, post: Omit<BlogPost, 'id' | 'views' | 'likes'>): Promise<BlogPost> {
    try {
      // Insert the post
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author_id: userId,
          category_id: post.category.id,
          featured_image: post.featuredImage,
          published_at: post.isPublished ? post.publishedAt : null,
          read_time: post.readTime,
          is_published: post.isPublished,
          is_featured: post.isFeatured,
          seo_title: post.seoTitle,
          seo_description: post.seoDescription
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        throw error;
      }

      // Handle tags
      if (post.tags.length > 0) {
        // First ensure all tags exist
        for (const tagName of post.tags) {
          const slug = tagName.toLowerCase().replace(/\s+/g, '-');
          
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('blog_tags')
            .select('id')
            .eq('name', tagName)
            .single();
            
          let tagId;
          
          if (!existingTag) {
            // Create tag if it doesn't exist
            const { data: newTag, error: tagError } = await supabase
              .from('blog_tags')
              .insert({ name: tagName, slug })
              .select()
              .single();
              
            if (tagError) {
              console.error('Error creating tag:', tagError);
              continue;
            }
            
            tagId = newTag.id;
          } else {
            tagId = existingTag.id;
          }
          
          // Associate tag with post
          await supabase
            .from('blog_post_tags')
            .insert({ post_id: data.id, tag_id: tagId });
        }
      }

      // Return the created post
      return {
        ...post,
        id: data.id,
        views: 0,
        likes: 0
      };
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }

  static async updatePost(userId: string, postId: string, updates: Partial<BlogPost>): Promise<void> {
    try {
      // Check if user is admin or the author
      const { data: userCheck, error: userError } = await supabase
        .from('blog_posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (userError) {
        console.error('Error checking post author:', userError);
        throw userError;
      }

      const isAdmin = await this.isUserAdmin(userId);
      const isAuthor = userCheck.author_id === userId;

      if (!isAdmin && !isAuthor) {
        throw new Error('Unauthorized: You do not have permission to update this post');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.category !== undefined) updateData.category_id = updates.category.id;
      if (updates.featuredImage !== undefined) updateData.featured_image = updates.featuredImage;
      if (updates.readTime !== undefined) updateData.read_time = updates.readTime;
      if (updates.isPublished !== undefined) {
        updateData.is_published = updates.isPublished;
        if (updates.isPublished && !userCheck.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
      if (updates.seoTitle !== undefined) updateData.seo_title = updates.seoTitle;
      if (updates.seoDescription !== undefined) updateData.seo_description = updates.seoDescription;
      
      updateData.updated_at = new Date().toISOString();

      // Update the post
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        console.error('Error updating blog post:', error);
        throw error;
      }

      // Handle tags if provided
      if (updates.tags !== undefined) {
        // First remove all existing tag associations
        await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', postId);
          
        // Then add the new tags
        for (const tagName of updates.tags) {
          const slug = tagName.toLowerCase().replace(/\s+/g, '-');
          
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('blog_tags')
            .select('id')
            .eq('name', tagName)
            .single();
            
          let tagId;
          
          if (!existingTag) {
            // Create tag if it doesn't exist
            const { data: newTag, error: tagError } = await supabase
              .from('blog_tags')
              .insert({ name: tagName, slug })
              .select()
              .single();
              
            if (tagError) {
              console.error('Error creating tag:', tagError);
              continue;
            }
            
            tagId = newTag.id;
          } else {
            tagId = existingTag.id;
          }
          
          // Associate tag with post
          await supabase
            .from('blog_post_tags')
            .insert({ post_id: postId, tag_id: tagId });
        }
      }
    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  }

  static async deletePost(userId: string, postId: string): Promise<void> {
    try {
      // Check if user is admin or the author
      const { data: userCheck, error: userError } = await supabase
        .from('blog_posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (userError) {
        console.error('Error checking post author:', userError);
        throw userError;
      }

      const isAdmin = await this.isUserAdmin(userId);
      const isAuthor = userCheck.author_id === userId;

      if (!isAdmin && !isAuthor) {
        throw new Error('Unauthorized: You do not have permission to delete this post');
      }

      // Delete the post (this will cascade to blog_post_tags due to foreign key constraints)
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deletePost:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching blog categories:', error);
        throw error;
      }

      return data as BlogCategory[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.is_admin || false;
    } catch (error) {
      console.error('Error in isUserAdmin:', error);
      return false;
    }
  }

  static async likePost(postId: string): Promise<void> {
    try {
      // Increment likes count
      const { error } = await supabase
        .from('blog_posts')
        .update({ likes: supabase.rpc('increment', { x: 1 }) })
        .eq('id', postId);
      
      if (error) {
        console.error('Error liking post:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in likePost:', error);
      throw error;
    }
  }
}