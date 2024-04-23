import { Logo } from '@/components/ui/logo';
import { SideBar } from '../ui/sidebar';
import React from 'react';
import { TrendPulseHeader } from './trendPulseHeader';



export const DashboardLayout = ({ children }) => {
  return (
    <div className='flex flex-col'>
    <TrendPulseHeader />
      <div className='flex flex-row offset '>
        <SideBar/> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
