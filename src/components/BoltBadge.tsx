import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface BoltBadgeProps {
  className?: string;
  position?: 'inline' | 'fixed';
}

const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  className = '',
  position = 'inline'
}) => {
  const { isDark } = useTheme();
  
  // Use different badge images based on theme
  const badgeUrl = isDark 
    ? "/white_circle_360x360.png" // Path to image in public folder for dark mode
    : "/black_circle_360x360.png"; // Path to image in public folder for light mode
  
  if (position === 'fixed') {
    return (
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`fixed top-20 right-4 z-50 transition-transform hover:scale-105 ${className}`}
      >
        <img 
          src={badgeUrl} 
          alt="Built with Bolt" 
          className="h-16 w-auto shadow-lg rounded-full"
        />
      </a>
    );
  }
  
  return (
    <a 
      href="https://bolt.new" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`transition-transform hover:scale-105 ${className}`}
    >
      <img 
        src={badgeUrl} 
        alt="Built with Bolt" 
        className="h-10 w-auto"
      />
    </a>
  );
};

export default BoltBadge;