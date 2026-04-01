import React from 'react';
import clsx from 'clsx';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => (
  <div
    className={clsx(
      'inline-block rounded-full border-transparent border-t-emerald-500 animate-spin',
      sizeMap[size],
      className
    )}
    role="status"
    aria-label="Loading"
  />
);
