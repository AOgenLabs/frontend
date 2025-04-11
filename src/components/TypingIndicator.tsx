import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 rounded-bl-none">
        <div className="flex space-x-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"
              animate={{
                y: ["0%", "-50%", "0%"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: dot * 0.15, // Stagger the animations
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 