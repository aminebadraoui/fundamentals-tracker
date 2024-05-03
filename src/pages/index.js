"use client"

import React, { useRef } from 'react'; // Import useRef
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import PricingTable from "@/components/ui/pricing-table";
import { PrimaryButton } from "@/components/ui/primary-button";

const Home = () => {
  const pricingRef = useRef(null);

  const scrollToPricing = () => {
    pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJoinClick = () => {
    console.log("Join Trend Pulse clicked!");
    scrollToPricing();
  };

  return (
    <div className="grid">
      <TrendPulseHeader />
      <div className="grid grid-cols-1 w-full mt-16"> {/* Corrected typo from w-fulls to w-full */}
        <div className="w-full flex flex-col items-center">
          <div className="px-8">
            <h1 className="text-6xl mb-8 mt-16 text-white text-center"> 
              Take Control Of Your Trading  
            </h1>
            <p className="text-primary-foreground text-4xl text-center">
              AI-Powered Market Intelligence
            </p>
          </div>
          <div className="w-96 m-4 flex justify-center"> {/* Ensuring button container has flex and justify-center */}
            <PrimaryButton onClick={handleJoinClick} variant="default">
              Join Trend Pulse
            </PrimaryButton>
          </div>
        </div>

        <div ref={pricingRef} id="pricing">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

export default Home;
