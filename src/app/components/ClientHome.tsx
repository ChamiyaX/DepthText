"use client";

import dynamic from 'next/dynamic';

// Import your Home component dynamically with no SSR
const HomeComponent = dynamic(
  () => import('./Home'),
  { ssr: false }
);

export default function ClientHome() {
  return <HomeComponent />;
} 