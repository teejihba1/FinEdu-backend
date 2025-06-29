import React from "react";
import { motion } from "framer-motion";
import {
  HiOutlineExclamationTriangle,
  HiOutlineRefresh,
  HiOutlineHome,
} from "react-icons/hi2";
import { useLanguage } from "../../context/LanguageContext";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useLanguage();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <HiOutlineExclamationTriangle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Don't worry, we're working to
            fix it!
          </p>
        </motion.div>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6 text-left bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <summary className="cursor-pointer text-red-800 font-medium mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-700 overflow-auto">
              {error.message}
              {error.stack && (
                <>
                  {"\n\n"}
                  {error.stack}
                </>
              )}
            </pre>
          </motion.details>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={resetErrorBoundary || handleReload}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleGoHome}
            className="btn btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <HiOutlineHome className="w-5 h-5" />
            <span>Go Home</span>
          </button>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-gray-500 mt-6"
        >
          If the problem persists, please contact our support team.
        </motion.p>
      </motion.div>
    </div>
  );
};

// Enhanced error boundary with retry logic
export class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback = ErrorFallback } = this.props;

      return (
        <Fallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.handleRetry}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

// Simple error fallback for smaller components
export const SimpleErrorFallback = ({ error, retry, message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <HiOutlineExclamationTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
    <p className="text-red-800 font-medium mb-2">
      {message || "Failed to load content"}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
      >
        <HiOutlineRefresh className="w-4 h-4 mr-1" />
        Retry
      </button>
    )}
  </div>
);

// Network error fallback
export const NetworkErrorFallback = ({ retry }) => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">📡</span>
    </div>
    <h3 className="text-lg font-semibold text-orange-800 mb-2">
      Connection Problem
    </h3>
    <p className="text-orange-700 mb-4">
      Please check your internet connection and try again.
    </p>
    {retry && (
      <button onClick={retry} className="btn btn-primary">
        <HiOutlineRefresh className="w-4 h-4 mr-2" />
        Retry
      </button>
    )}
  </div>
);

// 404 Not Found fallback
export const NotFoundFallback = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  showHomeButton = true,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {showHomeButton && (
          <button
            onClick={() => (window.location.href = "/")}
            className="btn btn-primary"
          >
            <HiOutlineHome className="w-5 h-5 mr-2" />
            Go Home
          </button>
        )}
      </motion.div>
    </div>
  </div>
);

export default ErrorFallback;
