'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { HiMenu, HiUser } from 'react-icons/hi';
import { HiCheck, HiX } from 'react-icons/hi';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'failed'>('success');
  const [paymentDetails, setPaymentDetails] = useState({
    orderId: 'ORD123456',
    paymentTime: '2025/10/28 14:24:54',
    gameName: 'Mobile Legends',
    userId: '12345',
    zoneId: '6789',
    pack: 'Weekly Pass',
  });

  useEffect(() => {
    // Get status from URL query parameter or default to success
    const statusParam = searchParams.get('status');
    if (statusParam === 'failed') {
      setStatus('failed');
    } else {
      setStatus('success');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Header */}
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center justify-between">
        <Link href="/home" className="text-white touch-manipulation">
          <HiMenu className="text-2xl" />
        </Link>
        <Link href="/home" className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </Link>
        <Link href="/profile" className="text-white touch-manipulation">
          <HiUser className="text-2xl" />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Success/Failed Icon */}
        <div className="w-32 h-32 rounded-full bg-[#2F6BFD] flex items-center justify-center shadow-lg mb-6">
          {status === 'success' ? (
            <HiCheck className="text-white text-6xl" />
          ) : (
            <HiX className="text-white text-6xl" />
          )}
        </div>

        {/* Status Title */}
        <h1 className="text-black font-bold text-3xl mb-8">
          {status === 'success' ? 'Payment Successful' : 'Payment Failed'}
        </h1>

        {/* Payment Details Card */}
        <div className="w-full max-w-md bg-[#2F6BFD] rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">Order ID</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.orderId}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">Payment Time</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.paymentTime}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">Game Name</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.gameName}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">User ID</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.userId}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">Zone ID</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.zoneId}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm">Pack</span>
              <p className="text-white font-semibold text-base text-right">
                {paymentDetails.pack}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex gap-4">
          {status === 'success' ? (
            <>
              <Link
                href="/topup"
                className="flex-1 bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation text-center"
              >
                Top Up Again
              </Link>
              <Link
                href="/home"
                className="flex-1 bg-white border-2 border-[#2F6BFD] text-[#2F6BFD] py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-gray-50 hover:bg-gray-50 transition-colors touch-manipulation text-center"
              >
                Back To Home
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/topup"
                className="flex-1 bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation text-center"
              >
                Try Again
              </Link>
              <Link
                href="/social"
                className="flex-1 bg-white border-2 border-[#2F6BFD] text-[#2F6BFD] py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-gray-50 hover:bg-gray-50 transition-colors touch-manipulation text-center"
              >
                Contact Us
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatus() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}

