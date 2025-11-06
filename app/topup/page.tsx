'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Checkout from '../components/Checkout';
import ProtectedRoute from '../components/ProtectedRoute';

function TopupContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || 'default-game-id';

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      <Checkout gameId={gameId} />
    </div>
  );
}

export default function Topup() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-500">Loading...</div>
        </div>
      }>
        <TopupContent />
      </Suspense>
    </ProtectedRoute>
  );
}

