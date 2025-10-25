import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <textarea
        id={id}
        className="w-full p-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition"
        rows={4}
        {...props}
      />
    </div>
  );
};

export default Textarea;