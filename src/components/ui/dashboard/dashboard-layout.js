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
      name: 'Growth',
      href: '/growth',
    },
  ];

  return (
    <div className='flex flex-col'>
      <div className='bg-primary h-20 p-4 flex items-center border-b-2'> {/* Assume bg-slate-50 is correct */}
       <h1 className='text-secondary'> Trend Pulse </h1>
      </div>
      <div className='flex flex-row '>
        <SideBar links={links} /> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
