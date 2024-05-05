import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import IconTitleMessageCard from '@/components/ui/IconTitleMessageCard';
import { TrendPulseHeader } from '@/components/layout/trendPulseHeader';

const SignIn = () => {
  const [email, setEmail] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await signIn('email', { email, redirect: false });
    if (result?.ok) {
      window.location.href = '/auth/verify';
    } else {
      console.error('Failed to send magic link email', result?.error);
    }
  };

  return (
    <div className="text-white min-h-screen">
      <TrendPulseHeader />
      <div className='mt-16'>
        <IconTitleMessageCard 
          Icon={FaPaperPlane}
          title="Sign In"
          message=""
        >
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 mb-4 rounded text-black"
              required
            />
            <button type="submit" className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600">
              Send Magic Link
            </button>
          </form>
        </IconTitleMessageCard>

      </div>
     
    </div>
  );
};

export default SignIn;
