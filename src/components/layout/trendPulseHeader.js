import React from 'react';

export const TrendPulseHeader = () => {
  return (
    <div className='flex flex-col'>
       <header className=' bg-secondary p-8 h-20 w-full'> 
        <h1 className='text-secondary'>  </h1>
      </header>

      <header className='
      hidden 
      md:block
      bg-secondary 
      fixed 
      top-0 
      z-50 
      px-8 
      py-4 
      w-full 
      shadow-md 
      shadow-secondary'> 
        <h1 className='text-secondary-foreground'> Trend Pulse </h1>
    </header>

    </div>
   
  );
}