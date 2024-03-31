import React from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export const SideBar = ({props}) => {
  const links = props.links
  const activeLink = props.activeLink

  return (
    <div className="bg-slate-0 py-8 w-1/5 border">
      {
        links.map((link) => {
          const isActive = link.name === activeLink.name

          return (
            <div className="flex flex-row">
              <Button asChild variant= { isActive ? "active" : "outline"} className='border-b' >
              <Link href={link.href}> {link.name} </Link>
              </Button>
            </div>
          )
        })
      }
     
    </div>
  );
}