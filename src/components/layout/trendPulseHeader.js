import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {PrimaryButton} from '@/components/ui/primary-button'; // Make sure the path is correct
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export const TrendPulseHeader = ({ children, buttons }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasAppPath = router.pathname.includes('/app');
  const isUserSignedIn = session && status === "authenticated";
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  return (
    <div>
      <header className='bg-secondary p-8 h-20 w-full'>
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
          <Link href={domain}>
            <h1 className='text-secondary-foreground'>Trend Pulse</h1>
          </Link>

          <div className='flex space-x-4'>
            {!isUserSignedIn && (
              <Link href="/" passHref>
                  <PrimaryButton variant="default">
                    Join Trend Pulse
                  </PrimaryButton>
              </Link>
              
            )}

            {!isUserSignedIn && (
                <Link href="/auth/signin" passHref> 
                  <PrimaryButton variant="outlined">
                    Sign In
                  </PrimaryButton>
                </Link>
                 )}

            {!hasAppPath && isUserSignedIn && (
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
}
