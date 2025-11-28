'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiMenu, HiUser } from 'react-icons/hi';
import { HiCheck, HiX, HiClock, HiBan } from 'react-icons/hi';
import { transactionAPI } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'cancelled'>('pending');
  const [paymentDetails, setPaymentDetails] = useState({
    orderId: '',
    paymentTime: '',
    gameName: '',
    userId: '',
    zoneId: '',
    pack: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clientTxnId = searchParams.get('client_txn_id');
    const txnId = searchParams.get('txn_id');
    const statusParam = searchParams.get('status');

    // Use whichever transaction ID is available
    const transactionId = clientTxnId || txnId;

    if (transactionId) {
      fetchTransactionStatus(clientTxnId || '', txnId || '');
    } else if (statusParam) {
      // If status is provided directly in URL, use it
      const validStatus = ['pending', 'success', 'failed', 'cancelled'].includes(statusParam) 
        ? statusParam as 'pending' | 'success' | 'failed' | 'cancelled'
        : 'pending';
      setStatus(validStatus);
      setIsLoading(false);
    } else {
      setStatus('pending');
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchTransactionStatus = async (clientTxnId: string, txnId: string) => {
    try {
      setIsLoading(true);
      // Use whichever ID is available - pass empty string as undefined if not available
      const response = await transactionAPI.getTransactionStatus(
        clientTxnId || undefined,
        txnId || undefined
      );
      const data = await response.json();

      if (response.ok && data.success) {
        const tx = data.transaction || data.data;
        // Map status to our valid status types
        const txStatus = tx.status || 'pending';
        const validStatus = ['pending', 'success', 'failed', 'cancelled'].includes(txStatus)
          ? txStatus as 'pending' | 'success' | 'failed' | 'cancelled'
          : 'pending';
        setStatus(validStatus);
        setPaymentDetails({
          orderId: tx.orderId || clientTxnId || txnId || 'N/A',
          paymentTime: tx.createdAt || tx.paymentTime || new Date().toISOString(),
          gameName: tx.gameName || tx.paymentNote || 'Game',
          userId: tx.userId || tx.customerNumber || 'N/A',
          zoneId: tx.zoneId || tx.server || 'N/A',
          pack: tx.pack || tx.paymentNote || 'Pack',
        });
      } else {
        setStatus('failed');
        toast.error(data.message || 'Failed to fetch transaction status.');
      }
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      setStatus('failed');
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/,/g, '');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Header */}
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-white touch-manipulation">
          <HiMenu className="text-2xl" />
        </Link>
        <Link href="/" className="flex items-center justify-center">
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
        {isLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#2F6BFD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Checking payment status...</p>
          </div>
        ) : (
          <>
            {/* Status Icon */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg mb-6 ${
              status === 'success' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' :
              status === 'cancelled' ? 'bg-gray-500' :
              'bg-yellow-500'
            }`}>
              {status === 'success' ? (
                <HiCheck className="text-white text-6xl" />
              ) : status === 'failed' ? (
                <HiX className="text-white text-6xl" />
              ) : status === 'cancelled' ? (
                <HiBan className="text-white text-6xl" />
              ) : (
                <HiClock className="text-white text-6xl" />
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-black font-bold text-3xl mb-8">
              {status === 'success' ? 'Payment Successful' :
               status === 'failed' ? 'Payment Failed' :
               status === 'cancelled' ? 'Payment Cancelled' :
               'Payment Pending'}
            </h1>
          </>
        )}

        {/* Payment Details Card */}
        {!isLoading && (
          <div className="w-full max-w-md bg-[#2F6BFD] rounded-2xl shadow-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Order ID</span>
                <p className="text-white font-semibold text-base text-right">
                  {paymentDetails.orderId || 'N/A'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Payment Time</span>
                <p className="text-white font-semibold text-base text-right">
                  {formatDate(paymentDetails.paymentTime)}
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
        )}

        {/* Action Buttons */}
        {!isLoading && (
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
                href="/"
                className="flex-1 bg-white border-2 border-[#2F6BFD] text-[#2F6BFD] py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-gray-50 hover:bg-gray-50 transition-colors touch-manipulation text-center"
              >
                Back To Home
              </Link>
            </>
          ) : status === 'pending' ? (
            <>
              <Link
                href="/"
                className="flex-1 bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation text-center"
              >
                Back To Home
              </Link>
              <Link
                href="/history"
                className="flex-1 bg-white border-2 border-[#2F6BFD] text-[#2F6BFD] py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-gray-50 hover:bg-gray-50 transition-colors touch-manipulation text-center"
              >
                Check Status
              </Link>
            </>
          ) : status === 'cancelled' ? (
            <>
              <Link
                href="/topup"
                className="flex-1 bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation text-center"
              >
                Try Again
              </Link>
              <Link
                href="/"
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
        )}
      </div>
    </div>
  );
}

export default function PaymentStatus() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-500">Loading...</div>
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
    </ProtectedRoute>
  );
}


