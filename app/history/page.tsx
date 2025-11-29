'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { orderAPI, transactionAPI, walletAPI } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

function HistoryContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('order');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  
  // Order History
  const [orderTransactions, setOrderTransactions] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchDate, setSearchDate] = useState('');
  
  // Wallet History
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [isLoadingWalletHistory, setIsLoadingWalletHistory] = useState(false);
  
  // Payment History
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  useEffect(() => {
    if (activeTab === 'order') {
      fetchOrderHistory();
    } else if (activeTab === 'wallet') {
      fetchWalletBalance();
      fetchWalletHistory();
    } else if (activeTab === 'payment') {
      fetchPaymentHistory();
    }
  }, [activeTab, currentPage]);

  const fetchOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await orderAPI.getOrderHistory({
        page: currentPage,
        limit: 10,
        ...(searchOrderId && { orderId: searchOrderId }),
        ...(searchDate && { dateFrom: searchDate }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setOrderTransactions(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setIsLoadingOrders(false);
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

  const fetchWalletHistory = async () => {
    try {
      setIsLoadingWalletHistory(true);
      // Using order history API for wallet transactions (ledger)
      const response = await orderAPI.getOrderHistory({
        page: 1,
        limit: 50,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Transform orders to wallet transactions format
        const transformed = (data.orders || []).map((order: any) => ({
          id: order._id,
          amount: order.amount,
          before: 0,
          after: 0,
          productInfo: order.description || '',
          transactionId: order.orderId,
          date: order.createdAt,
          type: order.paymentMethod === 'wallet' ? 'debit' : 'credit',
        }));
        setWalletTransactions(transformed);
      }
    } catch (error) {
      console.error('Error fetching wallet history:', error);
    } finally {
      setIsLoadingWalletHistory(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setIsLoadingPayment(true);
      const response = await transactionAPI.getTransactionHistory({
        page: 1,
        limit: 10,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const transformed = (data.transactions || []).map((tx: any) => ({
          id: tx._id,
          status: tx.status === 'success' ? 'Successful' : tx.status,
          game: tx.paymentNote || 'Payment',
          date: tx.createdAt,
          amount: `${tx.amount} INR`,
          orderId: tx.orderId || tx._id,
          paymentTime: tx.createdAt,
          gameName: 'Game',
          userId: tx.customerNumber || 'N/A',
          zoneId: 'N/A',
          pack: tx.paymentNote || 'Pack',
        }));
        setPaymentTransactions(transformed);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleAddWalletPoints = async () => {
    if (!walletAmount.trim()) {
      toast.error('Please enter an amount');
      return;
    }

    const amountNumber = Number(walletAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoadingWallet(true);
    try {
      const response = await walletAPI.addCoins(amountNumber);
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.transaction?.paymentUrl) {
          toast.success('Redirecting to payment...');
          window.location.href = data.transaction.paymentUrl;
        } else {
          toast.success('Points added successfully!');
          setWalletAmount('');
          fetchWalletBalance();
          fetchWalletHistory();
        }
      } else {
        toast.error(data.message || 'Failed to add points');
      }
    } catch (error) {
      toast.error('An error occurred while adding points');
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
        <button onClick={() => router.back()} className="text-white touch-manipulation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg flex-1 text-center absolute left-0 right-0">Transaction History</h1>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-[#2F6BFD] px-4 py-3">
        <div className="flex gap-2">
          {[
            { id: 'order', label: 'Order History' },
            { id: 'wallet', label: 'Wallet History' },
            { id: 'payment', label: 'Payment History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-full font-medium text-xs transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'bg-white text-[#2F6BFD]'
                  : 'bg-transparent text-white border border-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Volt Points Section - Only for Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="bg-[#2F6BFD] px-4 py-4">
          <div className="bg-[#2F6BFD] border-2 border-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* V Icon */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shrink-0">
                  <Image
                    src="/coin.png"
                    alt="Coin"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-medium text-base">Available Volt Points</span>
              </div>
              {/* Points Display */}
              <div className="bg-white rounded-full px-4 py-2">
                <span className="text-black font-semibold text-base">{walletBalance}</span>
              </div>
            </div>
            
            {/* Add Points Interface */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter amount"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-400 text-xs touch-manipulation"
              />
              <button
                onClick={handleAddWalletPoints}
                disabled={isLoadingWallet || !walletAmount.trim()}
                className="bg-[#2F6BFD] border-2 border-white text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingWallet ? 'Processing...' : 'Add Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section - Hidden for Wallet Tab */}
      {activeTab !== 'wallet' && (
      <div className="bg-white px-4 py-3 flex items-center gap-2 border-b border-gray-200">
          <button className="bg-[#2F6BFD] text-white px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-medium touch-manipulation shrink-0">
            <span>All</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        
        {/* Search Bar */}
        <div className="flex gap-2 min-w-0 flex-1 max-w-[60%]">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchOrderHistory();
              }
            }}
            className="flex-1 min-w-0 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-xs touch-manipulation"
          />
          <button
            onClick={() => fetchOrderHistory()}
            className="bg-[#2F6BFD] text-white px-3 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="text-gray-600 touch-manipulation shrink-0 bg-transparent border-0 p-0 cursor-pointer"
          style={{ width: '24px', height: '24px', opacity: 0, position: 'absolute' }}
        />
        <button
          onClick={() => {
            const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
            dateInput?.showPicker?.();
          }}
          className="text-gray-600 touch-manipulation shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      )}

      {/* Transaction List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {activeTab === 'order' && (
          isLoadingOrders ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : orderTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders found</div>
          ) : (
            orderTransactions.map((transaction) => {
              const descriptionData = transaction.description ? 
                (() => {
                  try {
                    return JSON.parse(transaction.description);
                  } catch {
                    return { playerId: 'N/A', server: 'N/A' };
                  }
                })() : { playerId: 'N/A', server: 'N/A' };
              
              return (
                <div
                  key={transaction._id}
                  onClick={() => handleViewOrder(transaction)}
                  className="bg-[#2F6BFD] rounded-xl p-4 flex items-center gap-4 cursor-pointer touch-manipulation active:opacity-90 transition-opacity"
                >
                  {/* Game Image */}
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white">
                    <Image
                      src="/game.jpg"
                      alt={transaction.items?.[0]?.itemName || 'Game'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg mb-1 capitalize">{transaction.status || 'Pending'}</h3>
                    <p className="text-white text-sm mb-1">{transaction.items?.[0]?.itemName || 'Order'}</p>
                    <p className="text-white/80 text-xs">{formatDate(transaction.createdAt)}</p>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewOrder(transaction)}
                    className="bg-white text-[#2F6BFD] px-4 py-2 rounded-lg font-semibold text-sm shadow-md shrink-0 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                  >
                    View
                  </button>
                </div>
              );
            })
          )
        )}

        {activeTab === 'wallet' && (
          isLoadingWalletHistory ? (
            <div className="text-center py-8 text-gray-500">Loading wallet transactions...</div>
          ) : walletTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No wallet transactions found</div>
          ) : (
            walletTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-[#2F6BFD] rounded-xl p-4 flex items-start gap-4"
              >
            {/* V Icon */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shrink-0">
              <Image
                src="/coin.png"
                alt="Coin"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>

              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-2xl mb-2">
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                </h3>
                <div className="space-y-1 text-white text-xs">
                  <p>Before: {transaction.before} After: {transaction.after}</p>
                  <p>Product info: {transaction.productInfo || 'N/A'}</p>
                  <p>Transaction ID: {transaction.transactionId}</p>
                  <p>{formatDate(transaction.date)}</p>
                </div>
              </div>
            </div>
          ))
        )
        )}

        {activeTab === 'payment' && (
          isLoadingPayment ? (
            <div className="text-center py-8 text-gray-500">Loading payment history...</div>
          ) : paymentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payment transactions found</div>
          ) : (
            paymentTransactions.map((transaction) => (
              <div key={transaction.id} className="space-y-3">
            {/* Order Details Card - Direct Display */}
            <div className="bg-[#2F6BFD] rounded-2xl shadow-md p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Order ID</span>
                  <p className="text-white font-semibold text-base text-right">
                    {transaction.orderId}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Payment Time</span>
                  <p className="text-white font-semibold text-base text-right">
                    {formatDate(transaction.paymentTime)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Game Name</span>
                  <p className="text-white font-semibold text-base text-right">
                    {transaction.gameName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">User ID</span>
                  <p className="text-white font-semibold text-base text-right">
                    {transaction.userId}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Zone ID</span>
                  <p className="text-white font-semibold text-base text-right">
                    {transaction.zoneId}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-sm">Pack</span>
                  <p className="text-white font-semibold text-base text-right">
                    {transaction.pack}
                  </p>
                </div>
              </div>
            </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowOrderDetails(false)}
          />
          
          {/* Order Details Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 h-[50vh] max-h-[500px] transform transition-transform duration-300 ease-out translate-y-0">
            {/* Modal Header */}
            <div className="bg-white rounded-t-3xl px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-900 touch-manipulation"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-gray-900 font-bold text-lg flex-1 text-center">Order Details</h1>
              <div className="w-6"></div>
            </div>
            
            {/* Order Details Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="bg-[#2F6BFD] rounded-2xl shadow-md p-4">
                <div className="space-y-3">
                  {(() => {
                    const descriptionData = selectedOrder?.description ? 
                      (() => {
                        try {
                          return JSON.parse(selectedOrder.description);
                        } catch {
                          return { playerId: 'N/A', server: 'N/A' };
                        }
                      })() : { playerId: 'N/A', server: 'N/A' };
                    
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">Order ID</span>
                          <p className="text-white font-semibold text-base text-right">
                            {selectedOrder?.orderId || '---'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">Payment Time</span>
                          <p className="text-white font-semibold text-base text-right">
                            {formatDate(selectedOrder?.createdAt || '')}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">Game Name</span>
                          <p className="text-white font-semibold text-base text-right">
                            {selectedOrder?.items?.[0]?.itemName || '---'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">User ID</span>
                          <p className="text-white font-semibold text-base text-right">
                            {descriptionData.playerId}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">Zone ID</span>
                          <p className="text-white font-semibold text-base text-right">
                            {descriptionData.server}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">Pack</span>
                          <p className="text-white font-semibold text-base text-right">
                            {selectedOrder?.items?.[0]?.itemName || '---'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function History() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}


