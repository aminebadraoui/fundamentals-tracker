"use client"
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import React from "react";
import Screenshot from "../../public/screenshot.png"
import Image from 'next/image'
import { Button } from "@/components/generic/button";
import { Card, CardContent, CardHeader } from "@/components/generic/card";
import Link from "next/link";

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
    bg-transparent
    hover:cursor-pointer
    "
   >
      <Link href="/app/pulse">  Go To App </Link>
  </Button>
);

  return (
  <div className="flex flex-col">
    <TrendPulseHeader >
      

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
     
      items-center
      ">

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
          Take Control Of Your trading  
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

       { joinButton}

      </div>

  
 {/* pricing section  */ }
      <div className="
      flex-col
      w-full
      h-full
      p-8
      justify-center
      align-center
      border
      border-white
      ">
        <h1 className="
        text-white
        text-center"
        > Pricing  </h1>

        <div className=" flex justify-center">
          <div className="
          flex-col
          align-center
          ">
            <div className ="grid grid-cols-1 content-center"  >
              <Card className="m-4
              bg-gray-100
              ">
                <CardHeader>
                  <div>
                    <p> tab</p>
                    <p> price</p>
                  </div>
            
                </CardHeader>

                <CardContent>
                  features
                </CardContent>
                { joinButton}
              </Card>
          
            </div>
          </div>
        </div>


       
      </div>
    

      

    </div>
  </div>
  )
}

export default Home;
