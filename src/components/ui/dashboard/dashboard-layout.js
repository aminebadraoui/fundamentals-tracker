import { Logo } from '@/components/ui/logo'
import { SideBar } from '../sidebar'
import React from 'react'


export const DashboardLayout = ({ children }) => {

  const links = [
    {
      name: 'DXY Monitor',
      href: '/',
      icon: 'home',
    },
    {
      name: 'About',
      href: '/',
      icon: 'about',
    },
    {
      name: 'Contact',
      href: '/',
      icon: 'contact',
    },  
  ]
  return (

    <div className='flex flex-col'> 
      <div className='bg-slate-0 h-20 p-8 flex items-center border'>
        <Logo className =""/> 
      </div>

      <div className='flex flex-row'>
        
          <SideBar links={ links }></SideBar>
        
        <div className="p-8 w-full" >
          {children}
          </div>
      </div>
     
    </div> 
      
  

    
    

 
  )
}