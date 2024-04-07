import { Logo } from '@/components/ui/logo';
import { SideBar } from '../sidebar';
import React from 'react';

import { Heading } from '../heading';

export const DashboardLayout = ({ children }) => {
  
  const links = [
    {
      name: 'Economic Overview',
      href: '/',
    },
    {
      name: 'Inflation',
      href: '/inflation',
    },
    {
      name: 'Employment',
      href: '/employment',
    },
    {
      name: 'Housing',
      href: '/housing',
    },
    {
      name: 'Growth',
      href: '/growth',
    },
  ];

  return (
    <div className='flex flex-col'>
      <header className='bg-background p-4 h-20 w-full'> 
       <h1 className='text-secondary'>  </h1>
      </header>
      <header className='bg-primary fixed top-0 z-50 p-4 w-full shadow-md'> 
       <h1 className='text-secondary'> Trend Pulse </h1>
      </header>

      <div className='flex flex-row offset '>
        <SideBar links={links} /> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
