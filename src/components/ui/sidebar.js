import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/generic/button';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const Style = {
  sidebarWrapper: "bg-primary py-4 w-[200px] border-0 shadow-md shadow-secondary 100vh",
  buttonLink: " text-primary-foreground bg-primary hover:bg-secondary",
  sectionStyle: "font-bold bg-primary text-secondary-foreground hover:bg-primary",
  subLink: "ps-8"
}

import { majorForexPairs  } from '@/utils/event-names';

const forexLinksArray =  Object.keys(majorForexPairs).map((pair) => {
  return {
    type: "link",
    style: "sub",
    name: pair,
    href: `/scanner/${pair}`
  }
})

const forexLinks = {
  ...forexLinksArray
}


const links = [
  {
    type: "link",
    style: "main",
    name: 'The Pulse',
    href: '/pulse',
  },

  
  {
    type: "section",
    style: "main",
    name: 'Forex Scanner',
  },
  {
    type: "separator"
  },

  ...forexLinksArray,


  {
    type: "section",
    style: "main",
    name: 'International Economy',
    href: null, 
  },

  {
    type: "separator"
  },

  {
    type: "link",
    style: "sub",
    name: 'Inflation',
    href: '/inflation',
  },

  {
    type: "link",
    style: "sub",
    name: 'Employment',
    href: '/employment',
  },

  {
    type: "link",
    style: "sub",
    name: 'Housing',
    href: '/housing',
  },

  {
    type: "link",
    style: "sub",
    name: 'Growth',
    href: '/growth',
  },
];



export const SideBar = () => {
  return (
    <div className={Style.sidebarWrapper}>
      {links.map((link, index) => {
        if (link.type == "section" ){
          return (
              <Button className={ Style.sectionStyle }> { link.name } </Button>
          )
        } else if (link.type == "separator") {
          return (
            <Separator />
          )
        } else if (link.type == "link") {
          return (
              <Button asChild className={cn(Style.buttonLink, 
              link.href === usePathname()? 'bg-secondary': 'bg-primary',
              link.style == "sub" && Style.subLink)
              }>
                <Link 
                      href={link.href}> {link.name} </Link>
              </Button>
          );
          
        }

      })}
    </div>
  
  );
};
