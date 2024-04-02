import { Logo } from '@/components/ui/logo'
import { SideBar } from '../sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Heading } from '../heading'


export const DashboardLayout = ({ children }) => {

  const links = [
    {
      name: 'Economic Pulse',
      href: '/',
      icon: 'home',
    },
    {
      name: 'Comparison Charts',
      href: '/comparison-charts',
      icon: 'comparison',
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: 'contact',
    },  
  ]

  const activeLink = links.find( (link) => {
    if (link.href === usePathname()) {
      return link
    }
  })

  return (

    <div className='flex flex-col'> 
      <div className='bg-slate-0 h-20 p-8 flex items-center border'>
        <Logo className =""/> 
      </div>

      <div className='flex flex-row'>
        
          <SideBar props={ {links, activeLink} }></SideBar>
        
        <div className="p-8 w-full" >
          <Heading>
           {activeLink.name}
          </Heading>
          {children}
          </div>
      </div>
     
    </div> 
      
  

    
    

 
  )
}