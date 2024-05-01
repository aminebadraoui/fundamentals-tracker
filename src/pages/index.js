"use client"
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import React from "react";
import Screenshot from "../../public/screenshot.png"
import Image from 'next/image'
import { Button } from "@/components/shadcn/button";

import Link from "next/link";
import PricingTable from "@/components/ui/pricing-table";
import { PrimaryButton } from "@/components/ui/primary-button";

 const Home = () => {
   // Event handler for Join button
   const handleJoinClick = () => {
    console.log("Join Trend Pulse clicked!");
    // Additional actions can be added here
  };

  // Event handler for Sign In button
  const handleSignInClick = () => {
    console.log("Sign In clicked!");
    // Additional actions can be added here
  };

 
 // Define the Join button
 const joinButton = (
  <Button 
    className="mt-4 
    mb-4 
    mx-4
    w-50
     bg-orange-500 
     text-white
     rounded-md
     " >
      <Link href={`https://buy.stripe.com/test_7sI3eqgL32Q2640aEE`}> Join Trend Pulse </Link>
    
  </Button>
);


  return (
  <div className="grid">
    <TrendPulseHeader >
    </TrendPulseHeader>
    <div className="
    grid
    grid-cols-1
    w-fulls
    "> 
      <div className="
      w-full
      flex
      flex-col
     
      items-center
      ">

{/* hero section  */ }
        <div className="
        px-8
        ">
          <h1 className="
          text-6xl
          mb-8
          mt-16
          text-white
          text-center
          "> 
          Take Control Of Your Trading  
          </h1>

          <p className="
          text-primary-foreground
          text-4xl
          text-center
          "
          >  
            AI-Powered Market Intelligence
          </p>
        </div>

        <div className="w-96 m-4">

       <PrimaryButton variant="default"> Join Trend Pulse </PrimaryButton> </div>

      </div>

      {/* pricing section  */ }
      <PricingTable />

    </div>
  </div>
  )
}

export default Home;
