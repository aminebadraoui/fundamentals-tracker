import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const Style = {
  sidebar: "bg-primary py-8 w-1/5 border-0 shadow-md shadow-foreground",
  buttonLink: "border-0 bg-transparent text-primary-foreground",
}

export const SideBar = ({ links, activeLink }) => {
  return (
    <div className={Style.sidebar}>
      {links.map((link, index) => {
        const isActive = link.href === usePathname();

        return (
          <div key={index} className="flex flex-col bg-transparent ">
            <Button asChild variant={isActive ? 'active' : 'outline'} className={Style.buttonLink}>
              {/* Update: Remove the <a> tag */}
              <Link className={link.href === usePathname()? "underline" : "no-underline"} href={link.href}>{link.name}</Link>
            </Button>
            {link.sublinks && link.sublinks.map((sublink, subIndex) => (
              <Button key={subIndex} asChild variant="outline">
                {/* Update: Remove the <a> tag */}
                <Link className={sublink.href === usePathname() ? "underline" : "no-underline"} href={sublink.href}>{sublink.name}</Link>
              </Button>
            ))}
          </div>
        );
      })}
    </div>
  );
};
