
import { TrendPulseHeader } from "@/components/layout/trendPulseHeader";
import React from "react";


import { Button } from "@/components/generic/button";
import { Card, CardContent, CardHeader } from "@/components/generic/card";

 const SignIn = () => {
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
      bg-transparent" 

      onClick={handleSignInClick}>
      Sign In
    </Button>
  );

  return (
  <div className="flex flex-col">
    <TrendPulseHeader buttons={[joinButton, signInButton]} />
    
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
          Sign In
          </h1>

       
        </div>

  

      </div>
    </div>
  </div>
  )
}

export default SignIn;
