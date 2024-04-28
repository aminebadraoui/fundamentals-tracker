import React from 'react';
import Link from 'next/link'
import { Button } from '@/components/shadcn/button';

export const PrimaryButton = ({link, title}) => {
  return (

   
      <Link href={link}>
         <Button 
    className="mt-4 
    mb-4 
    mx-4
    w-50
     bg-orange-500 
     text-white
     rounded-md
     " 
     >
        
         {title}
             
  </Button>
         
          </Link>


  )}