"use client"
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import React from "react";
import Screenshot from "../../public/screenshot.png"
import Image from 'next/image'
import { Button } from "@/components/generic/button";
import { Card } from "@/components/generic/card";

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
       text-secondary-foreground
       rounded-md
       " 

      onClick={handleJoinClick}>
      Join Trend Pulse
    </Button>
  );

  // Define the Sign In button with opposite style
  const signInButton = (
    <Button 
      className="mt-4 
      mb-4 
      mx-4 
      w-50 
      border
     border-orange-500
      rounded-md
    text-orange-500 
      bg-transparent" 

      onClick={handleSignInClick}>
      Sign In
    </Button>
  );


  return (
  <div className="flex flex-col">
    <TrendPulseHeader buttons={[joinButton, signInButton]}>
      

    </TrendPulseHeader>

    <div className="
    grid
    grid-cols-1
    w-full
    "> 
      <div className="
      w-full
      flex
      flex-col
      bg-white
      items-center
      ">

        <div className="
        px-8
        ">
          <h1 className="
          text-6xl
          mb-4
          mt-8
          text-primary
          text-center
          "> 
          Take Control Of Your trading  
          </h1>

          <p className="
          text-primary-foreground
          text-4xl
          text-center
          "
          >  
            Find your edge with a unique solution combining fundamentals, technicals and AI.
          </p>
        </div>

       { joinButton}

        {/* <div className="
          border
          border-secondary
          shadow-sm
          shadow-secondary
          mt-8
         
          w-full
          ">
           <Image 
              src={Screenshot}
              alt="screenshot"
              
        />
          </div> */}
      </div>

      <div  className="
      bg-primary
      text-center
      p-8
      "
      >
        <p className="
        text-primary-foreground
        text-3xl
        "
        > To escape the matrix you need to first undertand it</p>
      </div>

      <div className="
      w-full
      bg-white 
      p-8
      h-full
      ">
        <h1
        className="
        text-primary
        "
        > Know Exactly What To Trade  </h1>
      </div>

      <div className="
      w-full
      bg-primary 
      p-8
      h-full
      ">
        <h1
        className="
        text-white
        text-right
        "
        > Multi-Angle Analysis </h1>
      </div>

      <div className="
      w-full
      bg-white 
      p-8
      h-full
      ">
        <h1
        className="
        text-primary
        "
        > Know Exactly What To Trade  </h1>
      </div>

      <div className="
      w-full
      bg-primary 
      p-8
      h-full
      ">
        <h1
        className="
        text-white
        text-right
        "
        > Global View</h1>
      </div>

      <div className="
      w-full
      bg-white
      h-full
      ">
        <h1 className=" 
        text-primary
        text-center
        "
        > FAQ  </h1>
      </div>
      <div className="
      w-full
      bg-cyan-500
      h-full
      ">
        <h1> Pricing  </h1>
      </div>

    </div>
  </div>
  )
}

export default Home;
