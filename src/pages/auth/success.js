// https://buy.stripe.com/eVaeWOaOW3uA7bG4gg Monthly link
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/shadcn/card';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';

const SuccessAuth = () => {
  const [email, setEmail] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    // Trigger sending the magic link email
    signIn('email', { email });
  };

  return (
   

    <div>
       <TrendPulseHeader />

       <div className='grid 
       grid-cols-1 
       h-dvh 
       place-items-center'>
       <Card className={`
    w-96
    h-96
    `}>

      <p> Welcome To Trend Pulse. You can login <a href='/auth/signin'> here </a>! </p>

    </Card>

       </div>

   

    </div>
  );
};

export default SuccessAuth;