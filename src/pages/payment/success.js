import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa'; // Import an icon that indicates success
import IconTitleMessageCard from '@/components/ui/IconTitleMessageCard';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';
import { useRouter } from 'next/router';

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          clearInterval(timer);
          router.push('/auth/signin'); // Redirect to the sign-in page after countdown
          return 0;
        }
        return currentCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="text-white min-h-screen">
      <TrendPulseHeader />
      <IconTitleMessageCard
        Icon={FaCheckCircle}
        title="Welcome To The Trend Pulse Family !"
        message={
          <>
            You will be redirected to the sign-in page in <span className="text-orange-500">{countdown}</span>  seconds.<br /><br />

            <a href="/auth/signin" className="text-orange-500 hover:text-orange-600">Click here</a> if you are not redirected.
          </>
        }
      />
    </div>
  );
};

export default PaymentSuccess;
