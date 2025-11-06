'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gameAPI, orderAPI, walletAPI } from '../lib/api';

interface CheckoutProps {
  gameId?: string;
}

export default function Checkout({ gameId = 'default-game-id' }: CheckoutProps = {}) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('diamonds');
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedInfo, setValidatedInfo] = useState<{ nickname: string; server: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      fetchDiamondPacks();
    }
  }, [gameId]);

  useEffect(() => {
    if (showPaymentOptions) {
      fetchWalletBalance();
    }
  }, [showPaymentOptions]);

  const fetchDiamondPacks = async () => {
    try {
      setIsLoading(true);
      const response = await gameAPI.getDiamondPacks(gameId);
      const data = await response.json();

      if (response.ok && data.success) {
        setGameData(data.gameData);
        setPackages(data.diamondPacks || []);
      }
    } catch (error) {
      console.error('Error fetching diamond packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getDashboard();
      const data = await response.json();

      if (response.ok && data.data) {
        const balance = data.data.walletBalance || data.data.user?.walletBalance || 0;
        setWalletBalance(typeof balance === 'number' ? balance : Number(balance) || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleValidate = async () => {
    if (!userId.trim()) {
      alert('Please enter your User ID');
      return;
    }
    if (!zoneId.trim()) {
      alert('Please enter your Zone ID');
      return;
    }

    setIsValidating(true);
    try {
      const response = await gameAPI.validateUser(gameId, userId, zoneId);
      const data = await response.json();

      if (response.ok && data.response) {
        alert('User validated successfully!');
        if (data.data) {
          setValidatedInfo({
            nickname: data.data.nickname || 'N/A',
            server: data.data.server || 'N/A'
          });
        }
      } else {
        alert(data.data?.msg || 'Invalid ID or Server');
        setValidatedInfo(null);
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePackageSelect = (pkg: any) => {
    if (!userId || !zoneId) {
      alert('Please validate your User ID and Zone ID first');
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentOptions(true);
  };

  const processWalletPayment = async () => {
    if (!selectedPackage) {
      alert('No package selected');
      return;
    }

    if (walletBalance < selectedPackage.amount) {
      alert(`Insufficient coins! You have ${walletBalance} coins but need ${selectedPackage.amount} coins.`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await orderAPI.createOrderWithWallet({
        diamondPackId: selectedPackage._id,
        playerId: userId,
        server: zoneId,
        quantity: 1
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Payment completed successfully!');
        setShowPaymentOptions(false);
        router.push('/');
      } else {
        alert(data.message || 'Failed to process payment');
      }
    } catch (error) {
      alert('An error occurred while processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processUPIPayment = async () => {
    if (!selectedPackage) {
      alert('No package selected');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/payment-status`
        : 'https://leafstore.in/payment-status';

      const response = await orderAPI.createOrderWithUPI({
        diamondPackId: selectedPackage._id,
        playerId: userId,
        server: zoneId,
        amount: selectedPackage.amount,
        quantity: 1,
        redirectUrl
      });

      const data = await response.json();

      if (response.ok && data.success && data.transaction?.paymentUrl) {
        alert('Payment request created successfully! Redirecting...');
        window.location.href = data.transaction.paymentUrl;
      } else {
        alert(data.message || 'Failed to create payment request');
      }
    } catch (error) {
      alert('An error occurred while processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  return (
    <>
      {/* Top Blue Section - 50% */}
      <div className="h-[50vh] bg-[#2F6BFD] relative">
        {/* Header */}
        <header className="px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-white font-bold text-lg">Checkout</h1>
        </header>

        {/* Game Information Card */}
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/game.jpg"
                  alt="Mobile Legends"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-gray-900 font-bold text-xl">{gameData?.name || 'Mobile Legends'}</h2>
            </div>
          </div>
        </div>

        {/* User Information Card - Overlapping Blue and White */}
        <div className="px-4 mt-4 -mb-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 pt-4 pb-4">
              <h3 className="text-gray-900 font-semibold text-base mb-4">Enter User Information</h3>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="USER ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                />
                <input
                  type="text"
                  placeholder="ZONE ID"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                />
              </div>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full bg-[#2F6BFD] text-white py-3 rounded-xl font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'VALIDATING...' : 'Validate'}
              </button>
              {validatedInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Name:</span> {validatedInfo.nickname}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold">Server:</span> {validatedInfo.server}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom White Section - Rest of page */}
      <div className="flex-1 bg-white pt-28 px-4 pb-6">
        {/* Currency Type Selection - Card Based */}
        <div className="mb-4 mt-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[0, 1, 2, 3].map((index) => {
              const isSelected = index === 0 && selectedCurrency === 'diamonds';
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCurrency('diamonds')}
                  className={`shrink-0 w-20 bg-white rounded-xl shadow-md p-2.5 flex flex-col items-center gap-1.5 touch-manipulation border-2 transition-all ${
                    isSelected
                      ? 'border-[#2F6BFD] shadow-lg'
                      : 'border-gray-200'
                  } relative`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-[#2F6BFD] rounded-full flex items-center justify-center shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16M8 12H16" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium text-xs">Diamonds</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top-up Options List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading packages...</div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No packages available</div>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                onClick={() => handlePackageSelect(pkg)}
                className={`bg-white rounded-xl shadow-md p-4 flex items-center gap-4 touch-manipulation border-2 ${
                  selectedPackage?._id === pkg._id ? 'border-[#2F6BFD]' : 'border-transparent'
                }`}
              >
                {/* Package Logo/Icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {pkg.logo ? (
                    <Image src={pkg.logo} alt={pkg.description} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16M8 12H16" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Package Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 font-semibold text-base">{pkg.description || 'Diamond Pack'}</span>
                    {pkg.category && (
                      <span className="bg-[#2F6BFD] text-white px-2 py-0.5 rounded text-xs font-medium">{pkg.category}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col items-end">
                  <span className="text-green-600 font-bold text-base">₹{pkg.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Options Modal - Half Screen */}
      {showPaymentOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowPaymentOptions(false)}
          />
          
          {/* Payment Options Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 h-[70vh] transform transition-transform duration-300 ease-out translate-y-0">
            {/* Modal Header */}
            <div className="bg-white rounded-t-3xl px-4 py-2 flex items-center gap-2 border-b border-gray-200">
              <button 
                onClick={() => setShowPaymentOptions(false)}
                className="text-gray-900 touch-manipulation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-gray-900 font-bold text-base flex-1 text-center">Payment Options</h1>
              <div className="w-5"></div>
            </div>
            
            {/* Payment Options Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Item Details Card */}
              <div className="bg-[#2F6BFD] rounded-2xl shadow-md p-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-white">
                    <div className="mb-1">
                      <span className="text-xs opacity-90">Product:</span>
                      <span className="ml-2 font-semibold text-sm">{selectedPackage?.description || '---'}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-xs opacity-90">Amount:</span>
                      <span className="ml-2 font-semibold text-sm">₹{selectedPackage?.amount || '---'}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-xs opacity-90">User ID:</span>
                      <span className="ml-2 font-semibold text-sm">{userId || '---'}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-xs opacity-90">Zone ID:</span>
                      <span className="ml-2 font-semibold text-sm">{zoneId || '---'}</span>
                    </div>
                    <div>
                      <span className="text-xs opacity-90">IGN:</span>
                      <span className="ml-2 font-semibold text-sm">{validatedInfo?.nickname || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="bg-white rounded-2xl shadow-md p-3 mb-3">
                <p className="text-gray-600 text-xs mb-2">Enter Coupon code if have any.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-[#2F6BFD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] text-gray-800 placeholder-gray-400 text-xs touch-manipulation"
                  />
                  <button 
                    onClick={() => {
                      if (couponCode.trim()) {
                        setAppliedCoupon(couponCode.trim());
                        alert(`Coupon "${couponCode.trim()}" applied successfully!`);
                      } else {
                        alert('Please enter a coupon code');
                      }
                    }}
                    className="bg-[#2F6BFD] text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation"
                  >
                    {appliedCoupon ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                {/* Volt Points Option */}
                <div className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Volt Points"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 font-semibold text-sm">Volt Points</span>
                    <p className="text-gray-500 text-xs mt-1">Available: {walletBalance} coins</p>
                  </div>
                  <button
                    onClick={processWalletPayment}
                    disabled={isProcessingPayment || !selectedPackage || walletBalance < (selectedPackage?.amount || 0)}
                    className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedPackage ? `₹${selectedPackage.amount}` : '---'}
                  </button>
                </div>

                {/* UPI Option */}
                <div className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <div className="text-center">
                      <span className="text-gray-900 font-bold text-[10px]">UPI</span>
                      <p className="text-gray-600 text-[7px] leading-tight">UNIFIED PAYMENTS<br/>INTERFACE</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 font-semibold text-sm">UPI</span>
                  </div>
                  <button
                    onClick={processUPIPayment}
                    disabled={isProcessingPayment || !selectedPackage}
                    className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? 'Processing...' : selectedPackage ? `₹${selectedPackage.amount}` : '---'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

