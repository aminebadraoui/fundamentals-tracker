import React from 'react';
import { Card } from '@/components/shadcn/card';
import { IconContext } from 'react-icons';

const IconTitleMessageCard = ({ Icon, title, message, children }) => {
  return (
    <div className='flex justify-center items-start pt-20'>
      <Card className=' min-w-96 w-auto bg-card rounded-lg shadow-lg flex flex-col items-center p-8'>
      <Icon className="text-6xl text-white mb-4" /> 
        <h1 className="text-2xl font-semibold text-white mb-4">{title}</h1>
        <p className='text-white mb-4 text-center'>{message}</p>
        {children}
      </Card>
    </div>
  );
};

export default IconTitleMessageCard;
