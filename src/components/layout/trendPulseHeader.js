import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export const TrendPulseHeader = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUserSignedIn = session && status === "authenticated";

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
      <header className='bg-secondary p-8 h-20 w-full'>
        <h1 className='text-secondary'> </h1>
      </header>

      <header className='hidden md:block bg-secondary fixed top-0 z-50 px-8 py-4 w-full shadow-md shadow-secondary'>
        <div className='flex justify-between'>
          <Link href="/" passHref>
            <h1 className='text-secondary-foreground'>Trend Pulse</h1>
          </Link>

          <div className='flex space-x-4'>
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

            {isUserSignedIn && (
              <Link href="/app/pulse" passHref>
                <PrimaryButton variant="default">
                  Go To App
                </PrimaryButton>
              </Link>
            )}

            {isUserSignedIn && (
              <PrimaryButton variant="outlined" onClick={() => signOut({ callbackUrl: '/', redirect: true })}>
                Sign Out
              </PrimaryButton>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
