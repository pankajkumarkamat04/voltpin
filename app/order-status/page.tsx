'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiMenu, HiUser } from 'react-icons/hi';
import { HiCheck, HiX, HiClock, HiBan } from 'react-icons/hi';
import { orderAPI } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'cancelled' | 'processing'>('pending');
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    orderTime: '',
    amount: '',
    currency: '',
    paymentMethod: '',
    itemName: '',
    quantity: '',
    playerId: '',
    server: '',
    description: '',
  });
  const [performance, setPerformance] = useState({
    totalProviders: 0,
    successfulCount: 0,
    failedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderStatus = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching order status:', { orderId });
      
      const response = await orderAPI.getOrderStatus(orderId);
      
      console.log('Order status response:', response.status);
      const responseData = await response.json();
      console.log('Order status data:', responseData);

      if (response.ok && responseData.success) {
        const order = responseData.order;
        
        if (!order) {
          console.error('Order data not found in response');
          setStatus('failed');
          toast.error('Order data not found.');
          return;
        }

        // Map order status to our valid status types
        const orderStatus = order.status || 'pending';
        let validStatus: 'pending' | 'success' | 'failed' | 'cancelled' | 'processing' = 'pending';
        
        if (orderStatus === 'completed' || orderStatus === 'success') {
          validStatus = 'success';
        } else if (orderStatus === 'failed' || orderStatus === 'cancelled') {
          validStatus = orderStatus as 'failed' | 'cancelled';
        } else if (orderStatus === 'processing') {
          validStatus = 'processing';
        } else {
          validStatus = 'pending';
        }
        
        setStatus(validStatus);
        
        // Parse description if it's a JSON string
        let parsedDescription = '';
        let playerId = '';
        let server = '';
        
        try {
          if (order.description) {
            const desc = typeof order.description === 'string' 
              ? JSON.parse(order.description) 
              : order.description;
            parsedDescription = desc.text || order.description || '';
            playerId = desc.playerId || '';
            server = desc.server || '';
          }
        } catch {
          parsedDescription = order.description || '';
        }
        
        // Get item details
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
        
        // Set order details - use top-level orderId from response, fallback to order._id
        setOrderDetails({
          orderId: responseData.orderId || order.orderId || order._id || orderId || 'N/A',
          orderTime: order.createdAt || new Date().toISOString(),
          amount: order.amount?.toString() || '0',
          currency: order.currency || 'INR',
          paymentMethod: order.paymentMethod || 'N/A',
          itemName: firstItem?.itemName || parsedDescription || 'Diamond Pack',
          quantity: firstItem?.quantity?.toString() || '1',
          playerId: playerId || 'N/A',
          server: server || 'N/A',
          description: parsedDescription || 'Diamond pack purchase',
        });
        
        // Set performance metrics if available
        if (responseData.performance) {
          setPerformance({
            totalProviders: responseData.performance.totalProviders || 0,
            successfulCount: responseData.performance.successfulCount || 0,
            failedCount: responseData.performance.failedCount || 0,
          });
        }
      } else {
        setStatus('failed');
        toast.error(responseData.message || 'Failed to fetch order status.');
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      setStatus('failed');
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle both orderId and order_id parameter names
    const orderId = searchParams.get('orderId') || 
                   searchParams.get('order_id');
    const statusParam = searchParams.get('status');

    console.log('Order status page loaded with params:', { orderId, statusParam });

    if (orderId) {
      console.log('Calling fetchOrderStatus with:', { orderId });
      fetchOrderStatus(orderId);
    } else if (statusParam) {
      // If status is provided directly in URL, use it
      const validStatus = ['pending', 'success', 'failed', 'cancelled', 'processing'].includes(statusParam) 
        ? statusParam as 'pending' | 'success' | 'failed' | 'cancelled' | 'processing'
        : 'pending';
      setStatus(validStatus);
      setIsLoading(false);
    } else {
      console.log('No order ID or status param found');
      setStatus('pending');
      setIsLoading(false);
    }
  }, [searchParams, fetchOrderStatus]);

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
            <p className="text-gray-500">Checking order status...</p>
          </div>
        ) : (
          <>
            {/* Status Icon */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg mb-6 ${
              status === 'success' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' :
              status === 'cancelled' ? 'bg-gray-500' :
              status === 'processing' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}>
              {status === 'success' ? (
                <HiCheck className="text-white text-6xl" />
              ) : status === 'failed' ? (
                <HiX className="text-white text-6xl" />
              ) : status === 'cancelled' ? (
                <HiBan className="text-white text-6xl" />
              ) : status === 'processing' ? (
                <HiClock className="text-white text-6xl" />
              ) : (
                <HiClock className="text-white text-6xl" />
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-black font-bold text-3xl mb-8">
              {status === 'success' ? 'Order Successful' :
               status === 'failed' ? 'Order Failed' :
               status === 'cancelled' ? 'Order Cancelled' :
               status === 'processing' ? 'Order Processing' :
               'Order Pending'}
            </h1>
          </>
        )}

        {/* Order Details Card */}
        {!isLoading && (
          <div className="w-full max-w-md bg-[#2F6BFD] rounded-2xl shadow-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Order ID</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.orderId || 'N/A'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Order Time</span>
                <p className="text-white font-semibold text-base text-right">
                  {formatDate(orderDetails.orderTime)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Amount</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.currency} {orderDetails.amount}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Payment Method</span>
                <p className="text-white font-semibold text-base text-right capitalize">
                  {orderDetails.paymentMethod}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Item</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.itemName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Quantity</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.quantity}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Player ID</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.playerId}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Server</span>
                <p className="text-white font-semibold text-base text-right">
                  {orderDetails.server}
                </p>
              </div>
              {performance.totalProviders > 0 && (
                <div className="pt-3 border-t border-white/20 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">Providers</span>
                    <p className="text-white font-semibold text-base text-right">
                      {performance.successfulCount}/{performance.totalProviders} Successful
                    </p>
                  </div>
                </div>
              )}
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
          ) : status === 'pending' || status === 'processing' ? (
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

export default function OrderStatus() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-500">Loading...</div>
        </div>
      }>
        <OrderStatusContent />
      </Suspense>
    </ProtectedRoute>
  );
}

