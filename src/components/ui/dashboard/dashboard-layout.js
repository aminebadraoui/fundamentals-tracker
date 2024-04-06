import { Logo } from '@/components/ui/logo';
import { SideBar } from '../sidebar';
import React from 'react';

import { Heading } from '../heading';

export const DashboardLayout = ({ children }) => {
  
  const links = [
    {
      name: 'Economic Pulse',
      href: '/',
      sublinks: [
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
      ],
    },
  ];

  return (
    <div className='flex flex-col'>
      <div className='bg-slate-50 h-20 p-4 flex items-center border'> {/* Assume bg-slate-50 is correct */}
        <Logo />
      </div>

      <div className='flex flex-row'>
        <SideBar links={links} /> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
