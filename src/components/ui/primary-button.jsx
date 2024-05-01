import React from 'react';

// Add a new prop `variant` to determine the button style
export const PrimaryButton = ({ children, onClick, variant = 'default' }) => {
  // Determine button classes based on the variant
  const buttonClass = variant === 'outlined' ? 
    "w-full whitespace-nowrap  border-2 border-orange-500 text-orange-500 p-2 rounded hover:bg-orange-500 hover:text-white" : 
    "w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600";

  return (
    <button
      type="submit"
      className={buttonClass}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

