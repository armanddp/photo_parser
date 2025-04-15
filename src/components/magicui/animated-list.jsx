import React from 'react';
import { motion } from 'framer-motion';

const AnimatedList = ({ items, renderItem, className = '' }) => {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            ease: [0.25, 0.1, 0.25, 1.0]
          }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
};

export { AnimatedList };
