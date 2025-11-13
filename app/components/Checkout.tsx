'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { gameAPI, orderAPI, walletAPI } from '../lib/api';

interface CheckoutProps {
  gameId?: string;
}

export default function Checkout({ gameId = 'default-game-id' }: CheckoutProps = {}) {
  const router = useRouter();
  const [validationFields, setValidationFields] = useState<Record<string, string>>({});
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

  // Helper function to format field name to display label
  const getFieldLabel = (fieldName: string): string => {
    const labelMap: Record<string, string> = {
      playerId: 'Player ID',
      userId: 'User ID',
      server: 'Server',
      zoneId: 'Zone ID',
      zone: 'Zone',
    };
    
    if (labelMap[fieldName]) {
      return labelMap[fieldName];
    }
    
    // Convert camelCase to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper function to update validation field
  const updateValidationField = (fieldName: string, value: string) => {
    setValidationFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Helper function to map validation fields to API parameters (playerId and server)
  const mapValidationFieldsToAPI = () => {
    const fieldsList = gameData?.validationFields || ['playerId', 'server'];
    let playerId = '';
    let server = '';
    
    // Find playerId field - prioritize fields with 'player' or 'user' in name
    for (const field of fieldsList) {
      const fieldLower = field.toLowerCase();
      if (fieldLower.includes('player') || fieldLower.includes('user') || fieldLower === 'playerid' || fieldLower === 'userid') {
        playerId = validationFields[field] || '';
        break;
      }
    }
    // If no player/user field found, use first field
    if (!playerId && fieldsList.length > 0) {
      playerId = validationFields[fieldsList[0]] || '';
    }
    
    // Find server field - prioritize fields with 'server' or 'zone' in name
    for (const field of fieldsList) {
      const fieldLower = field.toLowerCase();
      if (fieldLower.includes('server') || fieldLower.includes('zone') || fieldLower === 'serverid' || fieldLower === 'zoneid') {
        server = validationFields[field] || '';
        break;
      }
    }
    // If no server/zone field found, use second field or last field
    if (!server && fieldsList.length > 1) {
      server = validationFields[fieldsList[1]] || validationFields[fieldsList[fieldsList.length - 1]] || '';
    }
    
    return { playerId, server };
  };

  const ensureAuthenticated = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      toast.error('Please log in to continue checkout.');
      try {
        const redirectPath = `${window.location.pathname}${window.location.search}`;
        localStorage.setItem('intendedPath', redirectPath || '/');
      } catch {}
      router.push('/login');
      return false;
    }

    return true;
  };

  const fetchDiamondPacks = async () => {
    try {
      setIsLoading(true);
      const response = await gameAPI.getDiamondPacks(gameId);
      const data = await response.json();

      if (response.ok && data.success) {
        setGameData(data.gameData);
        setPackages(data.diamondPacks || []);
        
        // Initialize validation fields based on gameData.validationFields
        if (data.gameData?.validationFields && Array.isArray(data.gameData.validationFields)) {
          const initialFields: Record<string, string> = {};
          data.gameData.validationFields.forEach((field: string) => {
            initialFields[field] = '';
          });
          setValidationFields(initialFields);
        } else {
          // Fallback to default fields if validationFields is not available
          setValidationFields({ playerId: '', server: '' });
        }
      }
    } catch (error) {
      console.error('Error fetching diamond packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setWalletBalance(0);
          return;
        }
      }
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
    // Validate all required fields
    const validationFieldsList = gameData?.validationFields || ['playerId', 'server'];
    for (const field of validationFieldsList) {
      if (!validationFields[field]?.trim()) {
        const fieldLabel = getFieldLabel(field);
        toast.error(`Please enter your ${fieldLabel}`);
        return;
      }
    }

    // Map validation fields to API parameters
    const { playerId, server: serverId } = mapValidationFieldsToAPI();

    if (!playerId || !serverId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsValidating(true);
    try {
      const response = await gameAPI.validateUser(gameId, playerId, serverId);
      const data = await response.json();

      // Handle new validation response structure
      if (response.ok && (data.response === true || data.valid === true)) {
        toast.success(data.msg || data.data?.msg || 'User validated successfully!');
        
        // Extract nickname and server from response
        const nickname = data.name || data.data?.nickname || data.nickname || 'N/A';
        const server = data.server || data.data?.server || serverId || 'N/A';
        
        setValidatedInfo({
          nickname: nickname,
          server: server
        });
      } else {
        toast.error(data.msg || data.data?.msg || 'Invalid information provided');
        setValidatedInfo(null);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePackageSelect = (pkg: any) => {
    // Validate all required fields are filled
    const validationFieldsList = gameData?.validationFields || ['playerId', 'server'];
    const allFieldsFilled = validationFieldsList.every((field: string) => validationFields[field]?.trim());
    
    if (!allFieldsFilled) {
      toast.error('Please fill all required fields and validate first');
      return;
    }
    
    if (!validatedInfo) {
      toast.error('Please validate your information first');
      return;
    }
    
    setSelectedPackage(pkg);
    if (!ensureAuthenticated()) {
      return;
    }
    setShowPaymentOptions(true);
  };

  const processWalletPayment = async () => {
    if (!selectedPackage) {
      toast.error('No package selected');
      return;
    }

    if (!ensureAuthenticated()) {
      return;
    }

    if (walletBalance < selectedPackage.amount) {
      toast.error(`Insufficient coins! You have ${walletBalance} coins but need ${selectedPackage.amount} coins.`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Map dynamic validation fields to API parameters
      const { playerId, server } = mapValidationFieldsToAPI();
      
      const response = await orderAPI.createOrderWithWallet({
        diamondPackId: selectedPackage._id,
        playerId: playerId,
        server: server,
        quantity: 1
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment completed successfully!');
        setShowPaymentOptions(false);
        router.push('/');
      } else {
        toast.error(data.message || 'Failed to process payment');
      }
    } catch (error) {
      toast.error('An error occurred while processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processUPIPayment = async () => {
    if (!selectedPackage) {
      toast.error('No package selected');
      return;
    }

    if (!ensureAuthenticated()) {
      return;
    }

    setIsProcessingPayment(true);
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/payment-status`
        : 'https://voltpin.in/payment-status';

      // Map dynamic validation fields to API parameters
      const { playerId, server } = mapValidationFieldsToAPI();

      const response = await orderAPI.createOrderWithUPI({
        diamondPackId: selectedPackage._id,
        playerId: playerId,
        server: server,
        amount: selectedPackage.amount,
        quantity: 1,
        redirectUrl
      });

      const data = await response.json();

      if (response.ok && data.success && data.transaction?.paymentUrl) {
        toast.success('Payment request created successfully! Redirecting...');
        window.location.href = data.transaction.paymentUrl;
      } else {
        toast.error(data.message || 'Failed to create payment request');
      }
    } catch (error) {
      toast.error('An error occurred while processing payment');
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
                  src={gameData?.image || "/game.jpg"}
                  alt={gameData?.name || "Game"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/game.jpg";
                  }}
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
                {gameData?.validationFields && Array.isArray(gameData.validationFields) && gameData.validationFields.length > 0 ? (
                  gameData.validationFields.map((field: string) => {
                    const fieldValue = validationFields[field] || '';
                    const fieldLabel = getFieldLabel(field);
                    const fieldLower = field.toLowerCase();
                    // Check if field is server/zone related (server, zone, zoneId, serverId, etc.)
                    const isServerRelatedField = fieldLower.includes('server') || fieldLower.includes('zone') || fieldLower === 'region';
                    const regionList = gameData?.regionList || [];

                    // If it's a server/zone related field and regionList exists, show dropdown
                    if (isServerRelatedField && regionList.length > 0) {
                      return (
                        <select
                          key={field}
                          value={fieldValue}
                          onChange={(e) => updateValidationField(field, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 text-base touch-manipulation bg-white"
                        >
                          <option value="">Select {fieldLabel}</option>
                          {regionList.map((region: any) => (
                            <option key={region.code} value={region.code}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    // Otherwise, show text input
                    return (
                      <input
                        key={field}
                        type="text"
                        placeholder={fieldLabel.toUpperCase()}
                        value={fieldValue}
                        onChange={(e) => updateValidationField(field, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                      />
                    );
                  })
                ) : (
                  // Fallback to default fields if validationFields is not available
                  <>
                    <input
                      type="text"
                      placeholder="PLAYER ID"
                      value={validationFields.playerId || ''}
                      onChange={(e) => updateValidationField('playerId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                    />
                    {/* Show dropdown for server if regionList exists, otherwise text input */}
                    {gameData?.regionList && Array.isArray(gameData.regionList) && gameData.regionList.length > 0 ? (
                      <select
                        value={validationFields.server || ''}
                        onChange={(e) => updateValidationField('server', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 text-base touch-manipulation bg-white"
                      >
                        <option value="">Select Server</option>
                        {gameData.regionList.map((region: any) => (
                          <option key={region.code} value={region.code}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="SERVER"
                        value={validationFields.server || ''}
                        onChange={(e) => updateValidationField('server', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                      />
                    )}
                  </>
                )}
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
                    {/* Dynamically display validation fields */}
                    {gameData?.validationFields && Array.isArray(gameData.validationFields) ? (
                      gameData.validationFields.map((field: string) => {
                        const fieldValue = validationFields[field] || '---';
                        const fieldLabel = getFieldLabel(field);
                        const fieldLower = field.toLowerCase();
                        // Check if field is server/zone related
                        const isServerRelatedField = fieldLower.includes('server') || fieldLower.includes('zone') || fieldLower === 'region';
                        // Get region name if it's a server-related field and value matches a region code
                        let displayValue = fieldValue;
                        if (isServerRelatedField && gameData?.regionList && Array.isArray(gameData.regionList)) {
                          const region = gameData.regionList.find((r: any) => r.code === fieldValue);
                          displayValue = region ? region.name : fieldValue;
                        }
                        return (
                          <div key={field} className="mb-1">
                            <span className="text-xs opacity-90">{fieldLabel}:</span>
                            <span className="ml-2 font-semibold text-sm">{displayValue}</span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="mb-1">
                          <span className="text-xs opacity-90">Player ID:</span>
                          <span className="ml-2 font-semibold text-sm">{validationFields.playerId || '---'}</span>
                        </div>
                        <div className="mb-1">
                          <span className="text-xs opacity-90">Server:</span>
                          <span className="ml-2 font-semibold text-sm">
                            {gameData?.regionList && Array.isArray(gameData.regionList) ? (
                              (() => {
                                const region = gameData.regionList.find((r: any) => r.code === validationFields.server);
                                return region ? region.name : (validationFields.server || '---');
                              })()
                            ) : (
                              validationFields.server || '---'
                            )}
                          </span>
                        </div>
                      </>
                    )}
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
                        toast.success(`Coupon "${couponCode.trim()}" applied successfully!`);
                      } else {
                        toast.error('Please enter a coupon code');
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

