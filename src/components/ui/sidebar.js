import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/shadcn/accordion';

const Style = {
  sidebarWrapper: "bg-primary hidden md:block py-4 w-[200px] border-0 shadow-md shadow-secondary min-h-screen",
  linkStyle: "text-primary-foreground bg-primary cursor-pointer block w-full text-left px-4 py-4 font-medium text-sm",
  activeLink: "font-bold text-orange-500 bg-secondary cursor-pointer block w-full text-left px-4 py-4  text-sm",
  sectionHeader: "font-bold bg-primary text-sm border-b border-secondary-foreground text-secondary-foreground hover:bg-secondary cursor-pointer py-8 pl-4 w-full text-left",
  subLink: "pl-4 py-4"
};

const links = [
  { name: 'The Pulse', href: '/app/pulse', type: 'link' },
  {
    name: 'Forex Scanner',
    type: 'section',
    links: [
      { name: 'EURUSD', href: '/app/scanner/EURUSD' },
      { name: 'GBPUSD', href: '/app/scanner/GBPUSD' },
      { name: 'AUDUSD', href: '/app/scanner/AUDUSD' },
      { name: 'NZDUSD', href: '/app/scanner/NZDUSD' },
      { name: 'USDCHF', href: '/app/scanner/USDCHF' },
      { name: 'USDJPY', href: '/app/scanner/USDJPY' },
      { name: 'USDCAD', href: '/app/scanner/USDCAD' },
    ]
  },
  {
    name: 'Crypto Scanner',
    type: 'section',
    links: [
      { name: 'BITCOIN', href: '/app/scanner/BITCOIN' },
    ]
  },
  {
    name: 'Precious Metals Scanner',
    type: 'section',
    links: [
      { name: 'GOLD', href: '/app/scanner/GOLD' },
      { name: 'SILVER', href: '/app/scanner/SILVER' },
    ]
  },
  {
    name: 'Commodity Scanner',
    type: 'section',
    links: [
      { name: 'OIL', href: '/app/scanner/OIL' },
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
  },
  {
    name: 'Sentiment',
    type: 'section',
    links: [
      { name: 'COT Positioning', href: '/app/sentiment/institutional' },
    ]
  },
];


export const SideBar = () => {
  const router = useRouter();
  const [openSection, setOpenSection] = useState(null);

  // This function checks if the current route is part of the section to decide if it should be open
  useEffect(() => {
    const path = router.asPath;
    console.log(path)
    const sectionIndex = links.findIndex(item => 
      item.type === 'section' && item.links.some(subItem => path.includes(subItem.href))
    );
    if (sectionIndex !== -1) {
      setOpenSection(sectionIndex);
    }
  }, [router.pathname]);

  const isLinkActive = (href) => {
    return router.asPath === href;
  };

  return (
    <div className={Style.sidebarWrapper}>
      <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection}>
        {links.map((item, index) => (
          item.type === 'section' ? (
            <AccordionItem key={index} value={index}>
              <AccordionTrigger onClick={() => setOpenSection(index)} className={Style.sectionHeader}>
                {item.name}
              </AccordionTrigger>
              <AccordionContent>
                {item.links.map(subItem => (
                  <Link key={subItem.name} href={subItem.href} passHref>
                    <div className={` ${ isLinkActive(subItem.href) ? Style.activeLink : Style.linkStyle }`}>
                      {subItem.name}
                    </div>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <Link key={item.name} href={item.href} passHref>
              <div className={`${ isLinkActive(item.href) ? Style.activeLink : Style.sectionHeader }`}>
                {item.name}
              </div>
            </Link>
          )
        ))}
      </Accordion>
    </div>
  );
};
