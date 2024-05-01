import React, { useState } from 'react';
import { Card, CardContent } from "@/components/shadcn/card";
import { Switch } from "@/components/shadcn/switch";
import { PrimaryButton } from './primary-button';
import Link from 'next/link';

const PricingTable = () => {
    const [isYearly, setIsYearly] = useState(false);

    const monthlyPrice = 97;
    const yearlyPrice = 924;
    const monthlyEquivalent = (yearlyPrice / 12).toFixed(2);
    const savings = ((monthlyPrice - monthlyEquivalent) / monthlyPrice * 100).toFixed(0);

      // Define the links for both subscription types
      const monthlyLink = "https://buy.stripe.com/test_7sI3eqgL32Q2640aEE";
      const yearlyLink = "https://buy.stripe.com/test_00g2ambqJ62eeAwbIJ";

    const features = [
        'Best trading setups every day',
        'Forex Scanner',
        'Crypto Scanner',
        'International economic analysis',
        'Fundamental and technical analysis',
        'AI-powered sentiment analysis',
        `Scoring system based on real-time data`,
        `24/7 customer support`,
        "Free 7-day trial",
        "Cancel anytime"


    ];

    const Checkmark = () => (
        <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-xl mx-auto max-w-md mt-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
                <span className={`text-lg font-medium ${!isYearly ? 'text-orange-600' : 'text-gray-400'}`}>
                  Monthly</span>
                <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="mx-3"
                />
                <span className={`text-lg font-medium ${isYearly ? 'text-orange-600' : 'text-gray-400'}`}>Yearly</span>
            </div>
            <Card className="bg-white pt-8">
                <CardContent className="">
                  <div className='mb-4'>
                  <div className="text-4xl font-bold mb-2  ">
                        ${isYearly ? monthlyEquivalent : monthlyPrice}
                        <span className="text-lg text-gray-500">/month</span>
                    </div>
                    {isYearly && (
                        <div className="flex justify-left items-baseline space-x-2 ">
                            <span className="text-xl line-through text-gray-500">${monthlyPrice}</span>
                            <span className="text-sm italic text-gray-500">
            ${yearlyPrice} billed annually
        </span>
                            <span className="text-sm text-ef bg-green-200 text-green-700 px-2 py-1 rounded-full">
                                Save {savings}%
                            </span>
                        </div>
                           )}

                  </div>
                 
                 
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                        {features.map((feature, index) => (
                            <li key={index} className="flex ">
                                <Checkmark />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-center">
                    <Link href={ isYearly ? yearlyLink : monthlyLink} passHref>
                        <PrimaryButton> Start Free Trial </PrimaryButton>
                    </Link>
                      

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PricingTable;
