import { Logo } from '@/components/ui/logo'
import React from 'react'


export const DashboardLayout = ({ children }) => {
  return (

    <div className='flex flex-col'> 
      <div className='bg-indigo-500 h-20 p-8 flex items-center'>
        <Logo className =""/> 
      </div>

      

      <div className='flex flex-row'>
        <div className='bg-red-500 p-8 w-1/5'> 
          <p>  sidebar</p>
        </div>

        <div className="p-8 w-full" >{children}</div>
      </div>
     
    </div> 
      
  

    
    

 
  )
}