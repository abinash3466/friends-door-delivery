import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium enterprise-grade button with animations and variant stylings.
 */
const PremiumButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'teal', // teal, amber, outline, danger
  loading = false,
  disabled = false,
  className = '',
  icon,
}) => {
  const baseStyle =
    'relative flex items-center justify-center font-semibold rounded-xl px-6 py-3 transition-all duration-300 shadow-md select-none focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    teal: 'bg-brand-teal hover:bg-brand-teal-light text-white shadow-brand-teal/20 focus:ring-brand-teal-dark',
    amber: 'bg-brand-amber hover:bg-brand-amber-light text-slate-900 shadow-brand-amber/20 focus:ring-brand-amber-dark',
    outline:
      'border-2 border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 focus:ring-red-700',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${variants[variant]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};

export default PremiumButton;
