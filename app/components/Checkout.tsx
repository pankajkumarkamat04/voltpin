'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Checkout() {
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('diamonds');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleValidate = () => {
    // Just validate - don't open payment options
    if (userId && zoneId) {
      // Validation successful - can add toast or feedback here
    }
  };

  const handlePackageSelect = (pkgId: number) => {
    setSelectedPackage(pkgId);
    if (userId && zoneId) {
      setShowPaymentOptions(true);
    }
  };

  const packages = [
    { id: 1, diamonds: 86, originalPrice: 100, discountedPrice: 80, onSale: true },
    { id: 2, diamonds: 86, originalPrice: 100, discountedPrice: 80, onSale: true },
    { id: 3, diamonds: 86, originalPrice: 100, discountedPrice: 80, onSale: true },
  ];
  return (
    <>
      {/* Top Blue Section - 50% */}
      <div className="h-[50vh] bg-[#2F6BFD] relative">
        {/* Header */}
        <header className="px-4 py-3 flex items-center gap-3">
          <Link href="/home" className="text-white touch-manipulation">
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
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="/game.jpg"
                  alt="Mobile Legends"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-gray-900 font-bold text-xl">Mobile Legends</h2>
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
                className="w-full bg-[#2F6BFD] text-white py-3 rounded-xl font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation"
              >
                Validate
              </button>
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
                  className={`flex-shrink-0 w-20 bg-white rounded-xl shadow-md p-2.5 flex flex-col items-center gap-1.5 touch-manipulation border-2 transition-all ${
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
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg.id)}
              className={`bg-white rounded-xl shadow-md p-4 flex items-center gap-4 touch-manipulation border-2 ${
                selectedPackage === pkg.id ? 'border-[#2F6BFD]' : 'border-transparent'
              }`}
            >
              {/* Diamond Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16M8 12H16" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Package Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900 font-semibold text-base">{pkg.diamonds} Diamonds</span>
                  {pkg.onSale && (
                    <span className="bg-[#2F6BFD] text-white px-2 py-0.5 rounded text-xs font-medium">On Sale</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col items-end">
                <span className="text-red-500 line-through text-sm">{pkg.originalPrice} INR</span>
                <span className="text-green-600 font-bold text-base">{pkg.discountedPrice} INR</span>
              </div>
            </div>
          ))}
        </div>
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
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-white">
                    <div className="mb-1">
                      <span className="text-xs opacity-90">Diamonds:</span>
                      <span className="ml-2 font-semibold text-sm">{packages.find(p => p.id === selectedPackage)?.diamonds || 86}</span>
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
                      <span className="ml-2 font-semibold text-sm">---</span>
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
                  <button className="bg-[#2F6BFD] text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation">
                    Apply
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                {/* Volt Points Option */}
                <div className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                  </div>
                  <Link
                    href="/payment-status?status=success"
                    className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation inline-block"
                  >
                    1000 INR
                  </Link>
                </div>

                {/* UPI Option */}
                <div className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <span className="text-gray-900 font-bold text-[10px]">UPI</span>
                      <p className="text-gray-600 text-[7px] leading-tight">UNIFIED PAYMENTS<br/>INTERFACE</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 font-semibold text-sm">UPI</span>
                  </div>
                  <Link
                    href="/payment-status?status=success"
                    className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation inline-block"
                  >
                    1000 INR
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

