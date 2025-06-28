// Consolidated type definitions
export interface Reading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  notes?: string;
  medication?: string;
  location?: 'home' | 'clinic' | 'hospital' | 'pharmacy';
  symptoms?: string;
}

export interface BloodSugarReading {
  id: string;
  glucose: number;
  timestamp: string;
  testType: 'fasting' | 'random' | 'post-meal' | 'bedtime' | 'pre-meal';
  notes?: string;
  medication?: string;
  mealInfo?: string;
  location?: 'home' | 'clinic' | 'hospital' | 'pharmacy';
  symptoms?: string;
}

export interface HealthCategory {
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

export interface BPCategory extends HealthCategory {
  range: {
    systolic: [number, number];
    diastolic: [number, number];
  };
}

export interface GlucoseCategory extends HealthCategory {
  ranges: {
    fasting: [number, number];
    random: [number, number];
    postMeal: [number, number];
  };
}

// Blog types
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
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
  };
  tags: string[];
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
}