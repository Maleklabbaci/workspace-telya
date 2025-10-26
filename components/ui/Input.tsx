import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-bold text-foreground mb-1.5">{label}</label>}
      <input
        id={id}
        className="w-full p-3 border border-border bg-input rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-colors placeholder:text-muted-foreground/70"
        {...props}
      />
    </div>
  );
};

export default Input;