import React from 'react';
import { Filter, SortAsc, Heart, Droplets, Utensils, Dumbbell, Brain, Activity } from 'lucide-react';
import { BlogCategory, BlogFilters } from '../../types/Blog';
import { useTheme } from '../../contexts/ThemeContext';

interface CategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
  sortBy: BlogFilters['sortBy'];
  onSortChange: (sortBy: BlogFilters['sortBy']) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}) => {
  const { isDark } = useTheme();

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Heart,
      Droplets,
      Utensils,
      Dumbbell,
      Brain,
      Activity
    };
    const IconComponent = iconMap[iconName] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (color: string, isSelected: boolean) => {
    const colorMap: { [key: string]: string } = {
      red: isSelected 
        ? 'bg-red-600 text-white border-red-600' 
        : isDark 
          ? 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30' 
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      blue: isSelected 
        ? 'bg-blue-600 text-white border-blue-600' 
        : isDark 
          ? 'bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-900/30' 
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: isSelected 
        ? 'bg-green-600 text-white border-green-600' 
        : isDark 
          ? 'bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/30' 
          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: isSelected 
        ? 'bg-purple-600 text-white border-purple-600' 
        : isDark 
          ? 'bg-purple-900/20 text-purple-400 border-purple-800 hover:bg-purple-900/30' 
          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      indigo: isSelected 
        ? 'bg-indigo-600 text-white border-indigo-600' 
        : isDark 
          ? 'bg-indigo-900/20 text-indigo-400 border-indigo-800 hover:bg-indigo-900/30' 
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      orange: isSelected 
        ? 'bg-orange-600 text-white border-orange-600' 
        : isDark 
          ? 'bg-orange-900/20 text-orange-400 border-orange-800 hover:bg-orange-900/30' 
          : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Categories */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Browse by Category
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* All Categories */}
            <button
              onClick={() => onCategoryChange(undefined)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                !selectedCategory
                  ? isDark 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-blue-600 text-white border-blue-600'
                  : isDark 
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span className="font-medium">All Topics</span>
            </button>

            {/* Individual Categories */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  getCategoryColor(category.color, selectedCategory === category.slug)
                }`}
              >
                {getCategoryIcon(category.icon)}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="lg:w-64">
          <div className="flex items-center space-x-3 mb-4">
            <SortAsc className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sort By
            </h3>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as BlogFilters['sortBy'])}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <div className={`mt-6 p-4 rounded-xl border ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {(() => {
            const category = categories.find(c => c.slug === selectedCategory);
            if (!category) return null;
            
            return (
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(category.color, false)}`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;