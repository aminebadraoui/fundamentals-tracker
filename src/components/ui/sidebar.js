import React from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export const SideBar = ({links}) => {
  return (
    <div className="bg-slate-0 py-8 w-1/5 border">
      {
        links.map((link) => {
          return (
            <div className="flex flex-row">
              <Button asChild variant="outline" className='border-b' >
              <Link href={link.href}> {link.name} </Link>
              </Button>
            </div>
          )
        })
      }
     
    </div>
  );
}