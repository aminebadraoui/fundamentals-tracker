import React from 'react';

export const PrimaryButton = ({ children, onClick, variant = 'default' }) => {
  const buttonClass = variant === 'outlined' ?
    "inline-flex items-center justify-center whitespace-nowrap border-2 border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-500 hover:text-white" :
    "inline-flex items-center justify-center whitespace-nowrap border-2  bg-orange-500 border-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600";

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
