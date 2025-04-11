import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-gray-950">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50"
        animate={{
          background: [
            "linear-gradient(to bottom right, rgba(239, 246, 255, 0.3), rgba(243, 232, 255, 0.3), rgba(253, 242, 248, 0.3))",
            "linear-gradient(to bottom right, rgba(253, 242, 248, 0.3), rgba(239, 246, 255, 0.3), rgba(243, 232, 255, 0.3))",
            "linear-gradient(to bottom right, rgba(243, 232, 255, 0.3), rgba(253, 242, 248, 0.3), rgba(239, 246, 255, 0.3))",
            "linear-gradient(to bottom right, rgba(239, 246, 255, 0.3), rgba(243, 232, 255, 0.3), rgba(253, 242, 248, 0.3))",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Responsive moving gradient blob */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-700/20 filter blur-3xl opacity-70"
        animate={{
          x: mousePosition.x - 250, // Center the blob on mouse position
          y: mousePosition.y - 250,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
          mass: 2,
        }}
      />
      
      {/* Additional floating blobs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-400/10 dark:bg-pink-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full filter blur-3xl" />
      
      {/* SVG pattern overlay */}
      <div className="absolute inset-0 bg-opacity-50 mix-blend-overlay">
        <svg
          width="100%"
          height="100%"
          className="opacity-[0.03] dark:opacity-[0.02]"
        >
          <defs>
            <pattern
              id="smallGrid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#smallGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground; 