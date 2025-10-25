import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <select
        id={id}
        className="w-full p-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition appearance-none"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;