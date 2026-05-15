/**
 * 错误提示组件
 * 统一显示错误信息并提供重试选项
 */

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  fullScreen = false 
}: ErrorMessageProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="luxury-glass p-8 max-w-md mx-auto text-center"
    >
      {/* 错误图标 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center"
      >
        <AlertCircle size={32} className="text-red-400" />
      </motion.div>

      {/* 错误标题 */}
      <h3 className="font-heading italic text-xl text-foreground mb-3">
        {title}
      </h3>

      {/* 错误消息 */}
      <p className="text-sm text-foreground/60 mb-6">
        {message}
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="luxury-glass px-6 py-3 rounded-full text-sm tracking-[0.1em] uppercase text-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          {retryText}
        </motion.button>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * 网络错误组件
 * 专门用于网络请求失败的场景
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Network Error"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      retryText="Retry"
    />
  );
}

/**
 * 404 错误组件
 */
export function NotFoundError({ 
  resource = 'Page' 
}: { 
  resource?: string 
}) {
  return (
    <ErrorMessage
      title="Not Found"
      message={`The ${resource.toLowerCase()} you are looking for does not exist.`}
    />
  );
}
