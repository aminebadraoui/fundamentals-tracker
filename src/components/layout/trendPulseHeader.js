import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export const TrendPulseHeader = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUserSignedIn = session && status === "authenticated";
  const isAppRoute = router.pathname.includes('/app'); 

  const handleJoinClick = async () => {
    // Route to home and then scroll to pricing
    await router.push('/#pricing');
    // Optional: if #pricing does not work, you may need to handle scrolling manually here
    // This is just a placeholder to demonstrate the idea
    window.requestAnimationFrame(() => {
      const element = document.getElementById('pricing');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div>
     <header className='hidden md:block bg-secondary fixed top-0 z-50 px-4 py-4 w-full shadow-md shadow-secondary'>
  <div className='flex justify-between items-center h-full'> {/* Added h-full to ensure full height usage */}
    <Link href="/" passHref>
      <h1 className='text-3xl font-bold text-secondary-foreground cursor-pointer'>Trend Pulse</h1>
    </Link>

    <div className='flex space-x-4 items-center'> {/* Ensuring items-center is applied */}
      {!isUserSignedIn && (
        <PrimaryButton onClick={handleJoinClick} variant="default">
          Join Trend Pulse
        </PrimaryButton>
      )}

      {!isUserSignedIn && (
        <Link href="/auth/signin" passHref>
          <PrimaryButton variant="outlined">
            Sign In
          </PrimaryButton>
        </Link>
      )}

      {isUserSignedIn && !isAppRoute  && (
        <Link href="/app/pulse" passHref>
          <PrimaryButton variant="default" style={{ minHeight: 'auto', lineHeight: 'inherit' }}>
            Go To App
          </PrimaryButton>
        </Link>
      )}

      {isUserSignedIn && (
        <PrimaryButton variant="outlined" style={{ minHeight: 'auto', lineHeight: 'inherit' }} onClick={() => signOut({ callbackUrl: '/', redirect: true })}>
          Sign Out
        </PrimaryButton>
      )}
    </div>
  </div>
</header>

    </div>
  );
};
