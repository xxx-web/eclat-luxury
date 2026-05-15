/**
 * 加载指示器组件
 * 用于 API 请求和数据加载状态
 */

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const borderMap = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4'
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* 旋转指示器 */}
      <div className={`${sizeMap[size]} ${borderMap[size]} border-primary border-t-transparent rounded-full animate-spin`} />
      
      {/* 加载文本 */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-foreground/60 tracking-[0.1em] uppercase"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * 骨架屏加载组件
 * 用于内容加载时的占位符
 */
export function SkeletonLoader({ 
  lines = 3,
  avatar = false 
}: { 
  lines?: number; 
  avatar?: boolean 
}) {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {avatar && (
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gray-700 h-12 w-12" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
}
