import { Logo } from '@/components/ui/logo';
import { SideBar } from '../ui/sidebar';
import React from 'react';
import { TrendPulseHeader } from './trendPulseHeader';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';


export const DashboardLayout = ({ children }) => {
  return (
    <div className='flex flex-col'>
    <TrendPulseHeader />
      <div className='mt-16 flex flex-row offset '>
        <SideBar/> 
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
