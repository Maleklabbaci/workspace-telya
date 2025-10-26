import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-2xl shadow-black/20 backdrop-blur-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;