import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/shadcn/card';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';

const SignUp = () => {
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

    <form className={
      `flex flex-col`
    } onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Send Magic Link</button>
    </form>

    </Card>

       </div>

   

    </div>
  );
};

export default SignUp;