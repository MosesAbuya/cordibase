"use client";
import dynamic from 'next/dynamic';

const PaymentOnboardingClient = dynamic(() => import('./client'), { ssr: false });

export default function PaymentOnboarding() {
  return <PaymentOnboardingClient />;
}
