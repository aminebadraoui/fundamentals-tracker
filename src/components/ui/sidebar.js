import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/shadcn/button';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const Style = {
  sidebarWrapper: "bg-primary hidden md:block py-4 w-[200px] border-0 shadow-md shadow-secondary min-h-dvh max-h-500 ",
  buttonLink: " text-primary-foreground bg-primary hover:bg-secondary",
  sectionStyle: "font-bold bg-primary text-secondary-foreground hover:bg-primary",
  mainLink: "font-bold",
  subLink: "ps-12"
}

import { majorForexPairs, cryptoAssets  } from '@/utils/event-names';

const forexLinksArray =  Object.keys(majorForexPairs).map((pair) => {
  return {
    type: "link",
    style: "sub",
    name: pair,
    href: `/app/forex-scanner/${pair}`
  }
})

const cryptoLinksArray =  Object.keys(cryptoAssets).map((asset) => {
  return {
    type: "link",
    style: "sub",
    name: asset,
    href: `/app/crypto-scanner/${asset}`
  }
})

const forexLinks = {
  ...forexLinksArray
}

const cryptoLinks = {
  ...cryptoLinksArray
}


const links = [
  {
    type: "link",
    style: "main",
    name: 'The Pulse',
    href: '/app/pulse',
  },

  {
    type: "separator"
  },

  {
    type: "section",
    style: "main",
    name: 'Forex Scanner',
  },
 

  ...forexLinksArray,

  {
    type: "separator"
  },

  {
    type: "section",
    style: "main",
    name: 'Crypto Scanner',
  },
 

  ...cryptoLinksArray,

  {
    type: "separator"
  },

  {
    type: "section",
    style: "main",
    name: 'International Economy',
    href: null, 
  },

  {
    type: "link",
    style: "sub",
    name: 'Economic Overview',
    href: '/app/economic-overview',
  },

  {
    type: "link",
    style: "sub",
    name: 'Inflation',
    href: '/app/inflation',
  },

  {
    type: "link",
    style: "sub",
    name: 'Employment',
    href: '/app/employment',
  },

  {
    type: "link",
    style: "sub",
    name: 'Housing',
    href: '/app/housing',
  },

  {
    type: "link",
    style: "sub",
    name: 'Growth',
    href: '/app/growth',
  },
];



export const SideBar = () => {
  return (
    <div key={"sidebar_wrapper"} className={Style.sidebarWrapper}>
      {links.map((link, index) => {
        if (link.type == "section" ){
          return (
              <Button key={link.name} className={ Style.sectionStyle }> { link.name } </Button>
          )
        } else if (link.type == "separator") {
          return (
            <Separator key={`separator${index}`} />
          )
        } else if (link.type == "link") {
          return (
              <Button key={`${link.name}_button`}asChild className={cn(Style.buttonLink, 
              link.href === usePathname()? 'bg-secondary': 'bg-primary',
              link.style == "main" && Style.mainLink,
              link.style == "sub" && Style.subLink)
              }>
                <Link key={`${link.name}_link`}
                      href={link.href}> {link.name} </Link>
              </Button>
          );
          
        }

      })}
    </div>
  
  );
};
