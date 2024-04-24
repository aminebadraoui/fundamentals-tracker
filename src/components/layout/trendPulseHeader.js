import React from 'react';

export const TrendPulseHeader = ({ children, buttons }) => {
  return (
    <div>
      <header className='bg-secondary p-8 h-20 w-full'>
        {/* You may want to use this header or remove it if not necessary */}
        <h1 className='text-secondary'> </h1>
      </header>

      <header className='
        md:block
        bg-secondary
        fixed
        top-0
        z-50
        px-8
        py-4
        w-full
        shadow-md
        shadow-secondary
      '>
        <div className='flex justify-between'>
          <h1 className='text-secondary-foreground'>Trend Pulse</h1>
          <div>
            {buttons && buttons.map((button, index) => (
              <React.Fragment key={index}>
                {button}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
