import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
  to?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', to, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring shadow-none',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const MotionWrapper = (props: any) => (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full h-full">
          {props.children}
      </motion.div>
  );

  const buttonContent = (
    to ? (
      <Link to={to} className={combinedClasses} {...(props as unknown as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}>
        {children}
      </Link>
    ) : (
      <button className={combinedClasses} {...props}>
        {children}
      </button>
    )
  );

  return <MotionWrapper>{buttonContent}</MotionWrapper>;
};

export default Button;