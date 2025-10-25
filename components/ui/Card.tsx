import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;