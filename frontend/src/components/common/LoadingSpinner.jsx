import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  fullScreen = false,
  text = null,
  overlay = false,
}) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    primary: "border-primary-600",
    white: "border-white",
    gray: "border-gray-600",
    success: "border-success-600",
    warning: "border-warning-600",
    danger: "border-danger-600",
  };

  const spinnerClass = `${sizeClasses[size]} border-2 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full`;

  const loadingText = text || t("common.loading");

  const spinner = (
    <motion.div
      className={spinnerClass}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {spinner}
      {loadingText && (
        <motion.p
          className="text-sm text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loadingText}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          {/* App logo/icon */}
          <motion.div
            className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            💰
          </motion.div>
          {content}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
        {content}
      </div>
    );
  }

  return content;
};

// Loading skeleton components for better UX
export const SkeletonCard = ({ className = "" }) => (
  <div className={`card p-4 ${className}`}>
    <div className="animate-pulse">
      <div className="skeleton-title mb-3" />
      <div className="skeleton-text mb-2" />
      <div className="skeleton-text mb-2" />
      <div className="skeleton-text w-2/3" />
    </div>
  </div>
);

export const SkeletonAvatar = ({ size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return <div className={`${sizes[size]} skeleton rounded-full`} />;
};

export const SkeletonList = ({ items = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 card">
        <SkeletonAvatar />
        <div className="flex-1">
          <div className="skeleton-title mb-2" />
          <div className="skeleton-text w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className = "" }) => (
  <div className={`card p-4 ${className}`}>
    <div className="animate-pulse">
      <div className="skeleton-title mb-4" />
      <div className="h-48 skeleton mb-3" />
      <div className="flex justify-between">
        <div className="skeleton-text w-16" />
        <div className="skeleton-text w-16" />
        <div className="skeleton-text w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonStats = ({ className = "" }) => (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="card p-4">
        <div className="animate-pulse text-center">
          <div className="skeleton w-8 h-8 mx-auto mb-2 rounded" />
          <div className="skeleton-text mb-1" />
          <div className="skeleton-text w-2/3 mx-auto" />
        </div>
      </div>
    ))}
  </div>
);

// Loading states for different screen sections
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="card p-6">
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="xl" />
        <div className="flex-1">
          <div className="skeleton-title mb-2" />
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton-text w-1/2" />
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
    <SkeletonStats />

    {/* Content skeleton */}
    <div className="grid md:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export const LessonListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="card p-4">
        <div className="flex items-start space-x-4">
          <div className="skeleton w-20 h-16 rounded" />
          <div className="flex-1">
            <div className="skeleton-title mb-2" />
            <div className="skeleton-text mb-2" />
            <div className="skeleton-text w-3/4 mb-3" />
            <div className="flex items-center space-x-4">
              <div className="skeleton w-16 h-6 rounded-full" />
              <div className="skeleton w-20 h-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
