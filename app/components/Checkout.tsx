'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// All API calls use the centralized API functions from api.ts which include the base URL
import { gameAPI, orderAPI, walletAPI } from '../lib/api';

interface CheckoutProps {
  gameId?: string;
}

export default function Checkout({ gameId = 'default-game-id' }: CheckoutProps = {}) {
  const router = useRouter();
  const [validationFields, setValidationFields] = useState<Record<string, string>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
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
        
        // Extract unique categories from packages and find most popular product image for each
        const categories = new Set<string>();
        const categoryPkgMap: Record<string, any[]> = {};
        
        (data.diamondPacks || []).forEach((pkg: any) => {
          if (pkg.category) {
            const catLower = pkg.category.toLowerCase();
            categories.add(catLower);
            if (!categoryPkgMap[catLower]) {
              categoryPkgMap[catLower] = [];
            }
            categoryPkgMap[catLower].push(pkg);
          }
        });
        
        // Find the most popular product (first one, or by amount/priority) for each category image
        const images: Record<string, string> = {};
        Object.keys(categoryPkgMap).forEach((category) => {
          const categoryPackages = categoryPkgMap[category];
          // Sort by amount (most expensive/popular first) or use first package with image
          const sortedPkgs = [...categoryPackages].sort((a, b) => (b.amount || 0) - (a.amount || 0));
          const packageWithImage = sortedPkgs.find((pkg) => pkg.logo) || sortedPkgs[0];
          if (packageWithImage && packageWithImage.logo) {
            images[category] = packageWithImage.logo;
          }
        });
        
        const categoriesArray = Array.from(categories);
        setAvailableCategories(categoriesArray);
        setCategoryImages(images);
        
        // Set selectedCurrency to the first category from API response
        if (categoriesArray.length > 0) {
          setSelectedCurrency(categoriesArray[0]);
        }
        
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
    // Check authentication first - user needs to be logged in to validate
    if (!ensureAuthenticated()) {
      return;
    }

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
    // Check authentication when selecting a package
    if (!ensureAuthenticated()) {
      return;
    }
    
    // Set the selected package and open payment options directly
    setSelectedPackage(pkg);
    setShowPaymentOptions(true);
  };

  const handleContinueWithPackage = () => {
    // Check authentication when trying to continue
    if (!ensureAuthenticated()) {
      return;
    }

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
    
    if (!selectedPackage) {
      toast.error('Please select a package first');
      return;
    }
    
    // Open payment options after validation
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Top Blue Section */}
      <div className="bg-gradient-to-br from-[#2F6BFD] to-[#1e40af] relative">
        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between relative z-10">
          <button onClick={() => router.back()} className="text-white touch-manipulation p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg absolute left-1/2 -translate-x-1/2">Checkout</h1>
          <button className="text-white touch-manipulation p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        {/* Game Information Card */}
        <div className="px-4 py-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {isLoading || !gameData ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 relative">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100">
                  <Image
                    src={gameData.image || "/game.jpg"}
                    alt={gameData.name || "Game"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/game.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900 font-bold text-lg mb-1">{gameData.name || 'Game'}</h2>
                  <p className="text-gray-500 text-sm">{validatedInfo?.nickname || 'N.A'}</p>
                </div>
                <button className="w-6 h-6 bg-[#2F6BFD] rounded-full flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Information Card - Overlapping Blue and White */}
        <div className="px-4 mt-4 -mb-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 pt-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold text-base">Enter your informations</h3>
                <button className="text-gray-400 hover:text-gray-600 touch-manipulation">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
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
                        <div key={field} className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <select
                            value={fieldValue}
                            onChange={(e) => updateValidationField(field, e.target.value)}
                            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 text-base touch-manipulation bg-white appearance-none"
                          >
                            <option value="">Select {fieldLabel}</option>
                            {regionList.map((region: any) => (
                              <option key={region.code} value={region.code}>
                                {region.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      );
                    }

                    // Otherwise, show text input with icon
                    const isUserIdField = fieldLower.includes('user') || fieldLower.includes('player');
                    return (
                      <div key={field} className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          {isUserIdField ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder={fieldLabel.toUpperCase()}
                          value={fieldValue}
                          onChange={(e) => updateValidationField(field, e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                        />
                      </div>
                    );
                  })
                ) : (
                  // Fallback to default fields if validationFields is not available
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="USER ID"
                        value={validationFields.playerId || ''}
                        onChange={(e) => updateValidationField('playerId', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                      />
                    </div>
                    {/* Show dropdown for server if regionList exists, otherwise text input */}
                    {gameData?.regionList && Array.isArray(gameData.regionList) && gameData.regionList.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="relative">
                          <select
                            value={validationFields.server || ''}
                            onChange={(e) => updateValidationField('server', e.target.value)}
                            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 text-base touch-manipulation bg-white appearance-none"
                          >
                            <option value="">ZONE ID (required)</option>
                            {gameData.regionList.map((region: any) => (
                              <option key={region.code} value={region.code}>
                                {region.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="ZONE ID (required)"
                          value={validationFields.server || ''}
                          onChange={(e) => updateValidationField('server', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="flex-1 bg-[#2F6BFD] text-white py-3 rounded-lg font-semibold text-sm shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'VALIDATING...' : 'Validate'}
                </button>
              </div>
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
      <div className="flex-1 bg-gray-50 pt-14 px-4 pb-24">
        {/* Currency Type Selection - Card Based */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        ) : availableCategories.length > 0 ? (
          <div className="mb-4 mt-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {availableCategories.map((category, index) => {
              const isSelected = selectedCurrency === category;
              const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
              const categoryImage = categoryImages[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCurrency(category)}
                  className={`shrink-0 w-20 aspect-square bg-white rounded-lg shadow-md p-2 flex flex-col items-center justify-center gap-1 touch-manipulation border-2 transition-all ${
                    isSelected
                      ? 'border-[#2F6BFD] shadow-lg'
                      : 'border-gray-200'
                  } relative overflow-hidden`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-[#2F6BFD] rounded-full flex items-center justify-center shadow-md z-10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div className={`w-full h-full rounded-lg flex items-center justify-center overflow-hidden ${
                    isSelected ? 'ring-2 ring-blue-200' : ''
                  }`}>
                    {categoryImage ? (
                      <Image
                        src={categoryImage}
                        alt={categoryLabel}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/game.jpg';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8V16M8 12H16" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-900 font-medium text-[10px] text-center leading-tight">{categoryLabel}</span>
                </button>
              );
              })}
            </div>
          </div>
        ) : null}

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
            {packages
              .filter((pkg) => {
                // Filter packages by selected currency/category
                if (!selectedCurrency) {
                  return false; // Don't show packages if no category is selected
                }
                return pkg.category?.toLowerCase() === selectedCurrency;
              })
              .map((pkg) => {
                return (
                  <div
                    key={pkg._id}
                    onClick={() => handlePackageSelect(pkg)}
                    className={`bg-white rounded-xl shadow-md overflow-hidden touch-manipulation border-2 transition-all relative ${
                      selectedPackage?._id === pkg._id ? 'border-[#2F6BFD] shadow-lg' : 'border-transparent'
                    }`}
                  >
                    {/* Selected Checkmark */}
                    {selectedPackage?._id === pkg._id && (
                      <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-[#2F6BFD] rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}

                    <div className="p-4 flex items-center gap-4">
                      {/* Package Image/Logo */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        {pkg.logo ? (
                          <Image 
                            src={pkg.logo} 
                            alt={pkg.description} 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 3L3 6V18L6 21H18L21 18V6L18 3H6Z" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 8V16M8 12H16" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-gray-900 font-semibold text-sm truncate">{pkg.description || 'Diamond Pack'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-600 font-bold text-base">₹{pkg.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 2x First Recharge Bonus Note for Mobile Legends */}
        {gameData?.name && 
         gameData.name.toLowerCase().includes('mobile legends') && 
         selectedCurrency && 
         (selectedCurrency.toLowerCase().includes('2x') || selectedCurrency.toLowerCase().includes('2 x')) &&
         (selectedCurrency.toLowerCase().includes('first recharge') || selectedCurrency.toLowerCase().includes('recharge bonus')) && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 className="text-blue-900 font-bold text-base mb-3">2x First Recharge Bonus</h3>
            <p className="text-blue-800 text-sm mb-3">
              Total Diamonds received for each level:
            </p>
            <div className="space-y-2 text-blue-800 text-xs">
              <div className="flex justify-between">
                <span>50 Diamond level:</span>
                <span className="font-semibold">50 base + 50 bonus = 100 total</span>
              </div>
              <div className="flex justify-between">
                <span>150 Diamond level:</span>
                <span className="font-semibold">150 base + 150 bonus = 300 total</span>
              </div>
              <div className="flex justify-between">
                <span>250 Diamond level:</span>
                <span className="font-semibold">250 base + 250 bonus = 500 total</span>
              </div>
              <div className="flex justify-between">
                <span>500 Diamond level:</span>
                <span className="font-semibold">500 base + 500 bonus = 1000 total</span>
              </div>
            </div>
            <p className="text-blue-700 text-xs mt-3 italic">
              Double Diamonds bonus applies only to your first purchase, regardless of payment channel or platform.
            </p>
          </div>
        )}

        {/* Weekly Pass Note */}
        {selectedCurrency && 
         selectedCurrency.toLowerCase().includes('weekly pass') && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 className="text-blue-900 font-bold text-base mb-3">Weekly Pass Notes</h3>
            <div className="space-y-3 text-blue-800 text-xs">
              <p>
                <span className="font-semibold">1.</span> The game account level must reach level 5 in order to purchase the weekly diamond pass.
              </p>
              <p>
                <span className="font-semibold">2.</span> A maximum of 10 weekly diamond passes can be purchased within a 70-day period on the third-party platform (the 10-pass count includes passes purchased in-game). Please do not make additional purchases to avoid losses.
              </p>
              <p>
                <span className="font-semibold">3.</span> You will receive 80 diamonds on the day of purchase, with the extra 20 diamonds being sent to your Vault, which you need to log in to in order to claim. Additionally, you must log in and access the weekly pass page for 6 consecutive days to claim a total of 120 extra diamonds, with 20 extra diamonds per day. During the 7 days, you will earn a total of 220 diamonds.
              </p>
            </div>
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
                      <span className="ml-2 font-semibold text-xs">{selectedPackage?.description || '---'}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-xs opacity-90">Amount:</span>
                      <span className="ml-2 font-semibold text-xs">₹{selectedPackage?.amount || '---'}</span>
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
                <div 
                  onClick={() => {
                    if (!isProcessingPayment && selectedPackage && walletBalance >= (selectedPackage?.amount || 0)) {
                      processWalletPayment();
                    }
                  }}
                  className={`bg-white rounded-xl shadow-md p-3 flex items-center gap-3 cursor-pointer touch-manipulation transition-all border-2 ${
                    isProcessingPayment || !selectedPackage || walletBalance < (selectedPackage?.amount || 0)
                      ? 'border-transparent opacity-50 cursor-not-allowed'
                      : 'border-transparent hover:border-[#2F6BFD] hover:shadow-lg active:bg-gray-50'
                  }`}
                >
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
                  <div className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-medium text-[10px] shadow-md">
                    {selectedPackage ? `₹${selectedPackage.amount}` : '---'}
                  </div>
                </div>

                {/* UPI Option */}
                <div 
                  onClick={() => {
                    if (!isProcessingPayment && selectedPackage) {
                      processUPIPayment();
                    }
                  }}
                  className={`bg-white rounded-xl shadow-md p-3 flex items-center gap-3 cursor-pointer touch-manipulation transition-all border-2 ${
                    isProcessingPayment || !selectedPackage
                      ? 'border-transparent opacity-50 cursor-not-allowed'
                      : 'border-transparent hover:border-[#2F6BFD] hover:shadow-lg active:bg-gray-50'
                  }`}
                >
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
                  <div className="bg-[#2F6BFD] text-white px-3 py-1.5 rounded-lg font-medium text-[10px] shadow-md">
                    {isProcessingPayment ? 'Processing...' : selectedPackage ? `₹${selectedPackage.amount}` : '---'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}