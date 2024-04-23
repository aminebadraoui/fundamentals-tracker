"use client"
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import React from "react";
import Screenshot from "../../public/screenshot.png"
import Image from 'next/image'
import { Button } from "@/components/generic/button";

 const Home = () => {
  return (
  <div className="flex flex-col">
    <TrendPulseHeader></TrendPulseHeader>

    <div className="
    grid
    grid-cols-1
    w-full
    "> 
      <div className="
      w-full
      flex
      flex-col
      bg-secondary
      items-center
      ">

        <div className="
        px-8
        ">
          <h1 className="
          text-6xl
          mb-4
          mt-8
          text-secondary-foreground
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

        <Button className="mt-4 w-50 bg-orange-500 text-secondary-foreground"> Get Started </Button>

        <div className="
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
          </div>
       
    

      </div>

      <div className="
      w-full
      bg-orange-500
      h-full
      ">
        <h1> Features  </h1>
        <p> Best trading setups </p>
        <p> An in-depth analysis </p>
        <p> A 360 view </p>
      </div>

      <div className="
      w-full
      bg-orange-500
      h-full
      ">
        <h1> Why I created this? </h1>
        <p> Talk about story </p>
      </div>

      <div className="
      w-full
      bg-orange-500
      h-full
      ">
        <h1> Trading is HARD</h1>
      </div>


      <div className="
      w-full
      bg-cyan-500
      h-full
      ">
        <h1> Pricing  </h1>
      </div>
      <div className="
      w-full
      bg-purple-500
      h-full
      ">
        <h1> FAQ  </h1>
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
