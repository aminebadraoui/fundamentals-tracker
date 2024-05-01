import React from 'react';
import { FaEnvelopeOpenText } from 'react-icons/fa';
import IconTitleMessageCard from '@/components/ui/IconTitleMessageCard';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';

const Verify = () => {
  return (
    <div className="text-white min-h-screen">
      <TrendPulseHeader />
      <IconTitleMessageCard 
        Icon={FaEnvelopeOpenText}
        title="Just One More Step!"
        message={<>
          We've sent a magic link to your email.<br />
          Click it to complete your sign up and dive right in.
        </>}
      />
    </div>
  );
};

export default Verify;
