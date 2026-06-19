import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * React 错误边界组件
 * 捕获子组件树中的渲染错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center p-8 bg-[#0d0521] text-foreground"
        >
          <div className="luxury-glass max-w-md w-full p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-serif italic mb-4 bg-gradient-to-r from-[#B8A8FF] to-[#F0CC8A] bg-clip-text text-transparent">
              出现了一些意外
            </h2>
            <p className="text-foreground/60 mb-6">
              {this.state.error?.message || '页面遇到了一个错误，请稍后再试。'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
