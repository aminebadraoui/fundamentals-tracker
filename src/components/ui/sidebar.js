import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/shadcn/accordion';
import { useState } from 'react';


const Style = {
  sidebarWrapper: "bg-primary hidden md:block py-4 w-[200px] border-0 shadow-md shadow-secondary min-h-screen",
  linkStyle: "text-primary-foreground bg-primary cursor-pointer block w-full text-left px-4 py-4 font-medium text-sm", // Adjust font size, weight here
  activeLink: "bg-secondary text-orange-500",
  sectionHeader: "font-bold bg-primary text-sm border-b border-secondary-foreground text-secondary-foreground hover:bg-secondary cursor-pointer py-8 pl-4  w-full text-left",
  subLink: "pl-4 py-4"
};

const links = [
  { name: 'The Pulse', href: '/app/pulse', type: 'link' },
  {
    name: 'Forex Scanner',
    type: 'section',
    links: [
      { name: 'EURUSD', href: '/app/forex-scanner/EURUSD' },
      { name: 'GBPUSD', href: '/app/forex-scanner/GBPUSD' },
      { name: 'AUDUSD', href: '/app/forex-scanner/AUDUSD' },
      { name: 'NZDUSD', href: '/app/forex-scanner/NZDUSD' },
      { name: 'USDCHF', href: '/app/forex-scanner/USDCHF' },
      { name: 'USDJPY', href: '/app/forex-scanner/USDJPY' },
      { name: 'USDCAD', href: '/app/forex-scanner/USDCAD' },
    ]
  },
  {
    name: 'Crypto Scanner',
    type: 'section',
    links: [
      { name: 'BITCOIN', href: '/app/crypto-scanner/BITCOIN' },
    ]
  },
  {
    name: 'International Economy',
    type: 'section',
    links: [
      { name: 'Economic Overview', href: '/app/economic-overview' },
      { name: 'Inflation', href: '/app/inflation' },
      { name: 'Employment', href: '/app/employment' },
      { name: 'Housing', href: '/app/housing' },
      { name: 'Growth', href: '/app/growth' },
    ]
  }
];

export const SideBar = () => {
  const router = useRouter();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    console.log(`Toggling section ${index}`);
    setOpenSection(openSection === index ? null : index);
  };

  const isLinkActive = (href) => router.pathname === href;

  return (
    <div className={Style.sidebarWrapper}>
      <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection}>
        {links.map((item, index) => (
          item.type === 'section' ? (
            <AccordionItem key={index} value={index}>
              <AccordionTrigger onClick={() => toggleSection(index)} className={Style.sectionHeader}>
                {item.name}
              </AccordionTrigger>
              <AccordionContent>
                {item.links.map(subItem => (
                  <Link key={subItem.name} href={subItem.href} passHref>
                    <div className={`${Style.linkStyle} ${isLinkActive(subItem.href) ? Style.activeLink : ''} `}>
                      {subItem.name}
                    </div>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <Link key={item.name} href={item.href} passHref className=''>
              <div className={`${Style.sectionHeader} ${isLinkActive(item.href) ? Style.activeLink : ''}`}>
                {item.name}
              </div>
            </Link>
          )
        ))}
      </Accordion>
    </div>
  );
};
