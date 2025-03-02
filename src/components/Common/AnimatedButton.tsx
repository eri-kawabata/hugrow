import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  description?: string;
  color: string;
  onClick: () => void;
  isNew?: boolean;
  disabled?: boolean;
}

export function AnimatedButton({ 
  icon: Icon, 
  label, 
  description, 
  color, 
  onClick, 
  isNew,
  disabled 
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group bg-white rounded-2xl shadow-sm 
        hover:shadow-md transition-all p-6 text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
        >
          NEW!
        </motion.span>
      )}
      <div className={`inline-flex p-3 rounded-full ${color} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {label}
      </h2>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
    </motion.button>
  );
} 