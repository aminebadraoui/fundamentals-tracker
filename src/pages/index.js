"use client"

import React, { useRef } from 'react'; // Import useRef
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import PricingTable from "@/components/ui/pricing-table";
import { PrimaryButton } from "@/components/ui/primary-button";

 const Home = () => {
  const pricingRef = useRef(null);  // Create a ref object

  const scrollToPricing = () => {
    pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

   // Event handler for Join button
   const handleJoinClick = () => {
    console.log("Join Trend Pulse clicked!");
    
    scrollToPricing()
  };

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

       <PrimaryButton onClick={() => handleJoinClick()} variant="default"> Join Trend Pulse </PrimaryButton> </div>

      </div>

      {/* pricing section  */ }

      <div ref={pricingRef} id="pricing">
        <PricingTable/>

      </div>
      

    </div>
  </div>
  )
}

export default Home;
