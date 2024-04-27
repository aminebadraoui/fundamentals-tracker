import React, { useState } from 'react';
import { Card, CardContent } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Switch } from "@/components/shadcn/switch";

const PricingTable = () => {
    const [isYearly, setIsYearly] = useState(false);

    const monthlyPrice = 97;
    const yearlyPrice = 924;
    const monthlyEquivalent = (yearlyPrice / 12).toFixed(2);
    const savings = ((monthlyPrice - monthlyEquivalent) / monthlyPrice * 100).toFixed(0);

    const features = [
        'All analytics features',
        'Up to 1,000,000 tracked visits',
        'Premium support',
        'Up to 10 team members',
    ];

    const Checkmark = () => (
        <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-xl mx-auto max-w-md mt-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
                <span className={`text-lg font-medium ${!isYearly ? 'text-orange-600' : 'text-gray-400'}`}>Monthly</span>
                <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="mx-3"
                />
                <span className={`text-lg font-medium ${isYearly ? 'text-orange-600' : 'text-gray-400'}`}>Yearly</span>
            </div>
            <Card className="bg-white">
                <CardContent className="text-left">
                    <div className="text-4xl font-bold mb-2">
                        ${isYearly ? monthlyEquivalent : monthlyPrice}
                        <span className="text-lg text-gray-500">/month</span>
                    </div>
                    {isYearly && (
                        <div className="flex justify-left items-left space-x-2 mb-2">
                            <span className="text-xl line-through text-gray-500">${monthlyPrice}</span>
                            <span className="text-sm text-ef bg-green-200 text-green-700 px-2 py-1 rounded-full">
                                Save {savings}%
                            </span>
                        </div>
                    )}
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <Checkmark />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Button className="bg-orange-500 text-white rounded-lg py-2 px-6 font-bold uppercase shadow-md hover:bg-blue-600 transition ease-in-out duration-300">
                        Get started
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PricingTable;
