import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-bold text-foreground mb-1.5">{label}</label>}
      <textarea
        id={id}
        className="w-full p-3 border border-border bg-input rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-colors placeholder:text-muted-foreground/70"
        rows={4}
        {...props}
      />
    </div>
  );
};

export default Textarea;