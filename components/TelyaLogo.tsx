import React from 'react';

const TelyaLogo = ({ className }: { className?: string }) => {
  // The user-provided logo was broken. Replaced with a simple, reliable text-based logo.
  return (
    <h1 className={`font-extrabold tracking-wider ${className}`}>
      Telya
    </h1>
  );
};

export default TelyaLogo;