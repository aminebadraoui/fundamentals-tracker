import { Logo } from '@/components/ui/logo';
import { SideBar } from '../ui/sidebar';
import React from 'react';



export const DashboardLayout = ({ children }) => {
  return (
    <div className='flex flex-col'>
      <header className='bg-background p-8 h-20 w-full'> 
       <h1 className='text-secondary'>  </h1>
      </header>
      <header className='bg-primary fixed top-0 z-50 px-8 py-4 w-full shadow-md shadow-secondary'> 
       <h1 className='text-secondary-foreground'> Trend Pulse </h1>
      </header>

      <div className='flex flex-row offset '>
        <SideBar/> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
