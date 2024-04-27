import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shadcn/button';
import { useSession, getSession } from "next-auth/react"
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';



export const TrendPulseHeader = ({ children, buttons }) => {
  const { data: session, status } = useSession()

  const router = useRouter();
  // Check if the pathname contains '/app'
  const hasAppPath = router.pathname.includes('/app');

  const isUserSignedIn = session && status === "authenticated";

  const [domain, setDomain] = useState('');

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
>
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
        <Link href="/auth/signin">  Sign In</Link>
    </Button>
  );

  const goToAppButton = (
    <Button 
      className="mt-4 
      mb-4 
      mx-4
      w-50
       bg-orange-500 
       text-white
       rounded-md
       " 
>
      <Link href="/app/pulse">  Go To App</Link>
    </Button>
  );

  const signOutButton = (
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

      onClick={() => signOut( {callbackUrl: '/', redirect:true })}
     >
         Sign Out 
    </Button>
  );

  useEffect(() => {
    // Set the domain when the component mounts and only on the client side
    setDomain(window.location.origin);
  }, []);

  return (
    <div>
      <header className='bg-secondary 
      p-8 h-20 
      w-full'>
        <h1 className='text-secondary'> </h1>
      </header>

      <header className='
        hidden
        md:block
        bg-secondary
        fixed
        top-0
        z-50
        px-8
        py-4
        w-full
        shadow-md
        shadow-secondary
      '>
        <div className='flex justify-between'>
          {/* Use domain from state which will be updated after component mounts */}
          <Link href={domain} className='
          hover:cursor-pointer
          '>
            <h1 className='
            text-secondary-foreground
            '>Trend Pulse</h1>
          </Link>
          
          <div>

          {buttons && buttons.map((button, index) => (
              <React.Fragment key={index}>
                {button}
              </React.Fragment>
            ))}
          <React.Fragment>
                { !isUserSignedIn && joinButton}
              </React.Fragment>
              <React.Fragment>
                { !isUserSignedIn && signInButton}
              </React.Fragment>
              <React.Fragment>
                { !hasAppPath && isUserSignedIn && goToAppButton}
              </React.Fragment>
              <React.Fragment>
                { isUserSignedIn && signOutButton}
              </React.Fragment>
             

          </div>
        </div>
      </header>
    </div>
  );
}
