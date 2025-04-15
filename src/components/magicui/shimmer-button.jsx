import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ShimmerButton = ({
  children,
  className,
  shimmerClassName = 'shimmer',
  shimmerSpeed = 1.5,
  shimmerSize = 0.2,
  shimmerColor = 'rgba(255, 255, 255, 0.2)',
  as: Component = 'button',
  ...props
}) => {
  // Motion animation props
  const motionProps = {
    whileHover: {
      scale: 1.03,
      transition: { duration: 0.2 }
    },
    whileTap: {
      scale: 0.97,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-md bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
        'text-white font-medium px-4 py-2 transition-all shadow-md hover:shadow-lg inline-block',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...motionProps}
    >
      {Component === 'button' ? (
        <button 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          type="button"
          {...props}
        />
      ) : (
        <Component className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" {...props} />
      )}
      
      <span className="relative z-10">{children}</span>
      
      <motion.span
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent',
          'opacity-30',
          shimmerClassName
        )}
        style={{
          backgroundSize: '200% 100%',
          backgroundPosition: '-100% 0',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-100% 0']
        }}
        transition={{
          duration: shimmerSpeed,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </motion.div>
  );
};

export { ShimmerButton };
