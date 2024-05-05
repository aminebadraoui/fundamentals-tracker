// https://buy.stripe.com/eVaeWOaOW3uA7bG4gg Monthly link
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/shadcn/card';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';
import { FaCheck } from 'react-icons/fa';
import IconTitleMessageCard from '@/components/ui/IconTitleMessageCard';

const SuccessAuth = () => {
  const [email, setEmail] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    // Trigger sending the magic link email
    signIn('email', { email });
  };

  return (
   

    <div className="text-white min-h-screen">
    <TrendPulseHeader />
    
    <div className='mt-16'>
    <IconTitleMessageCard 
      Icon={FaCheck}
      title="Welcome To Trend Pulse!"
      message={<>
        You can login <a className='text-orange-500 cursor-pointer' href='/auth/signin'> here </a>
      </>}
    />
    </div>
    </div>
  );
};

export default SuccessAuth;

