export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  category: BlogCategory;
  tags: string[];
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  readTime: number; // in minutes
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  publishedAt: string;
  isApproved: boolean;
  parentId?: string; // for nested comments
  replies?: BlogComment[];
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
}