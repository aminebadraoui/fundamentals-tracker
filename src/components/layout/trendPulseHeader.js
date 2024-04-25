import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const TrendPulseHeader = ({ children, buttons }) => {
  const [domain, setDomain] = useState('');

  useEffect(() => {
    // Set the domain when the component mounts and only on the client side
    setDomain(window.location.origin);
  }, []);

  return (
    <div>
      <header className='bg-secondary 
      p-8 h-20 
      w-full'>
        <h1 className='text-secondary'> </h1>
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
        shadow-secondary
      '>
        <div className='flex justify-between'>
          {/* Use domain from state which will be updated after component mounts */}
          <Link href={domain} className='
          hover:cursor-pointer
          '>
            <h1 className='
            text-secondary-foreground
            '>Trend Pulse</h1>
          </Link>
          
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
