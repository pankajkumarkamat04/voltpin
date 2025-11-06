'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function History() {
  const [activeTab, setActiveTab] = useState('order');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');

  const orderTransactions = [
    { id: 1, status: 'Successful', game: 'Mobile Legends Weekly Pass', date: '2025/10/28 14:24:54', amount: '135 INR', orderId: 'ORD123456', paymentTime: '2025/10/28 14:24:54', gameName: 'Mobile Legends', userId: '12345', zoneId: '6789', pack: 'Weekly Pass' },
    { id: 2, status: 'Failed', game: 'Mobile Legends Weekly Pass', date: '2025/10/28 14:24:54', amount: '135 INR', orderId: 'ORD123457', paymentTime: '2025/10/28 14:24:54', gameName: 'Mobile Legends', userId: '12345', zoneId: '6789', pack: 'Weekly Pass' },
  ];

  const walletTransactions = [
    { id: 1, amount: '+1000', before: '200', after: '1200', productInfo: '', transactionId: 'TXN123456', date: '2025/10/28 14:24:54' },
    { id: 2, amount: '-800', before: '200', after: '1200', productInfo: '', transactionId: 'TXN123457', date: '2025/10/28 14:24:54' },
  ];

  const paymentTransactions = [
    { id: 1, status: 'Successful', game: 'Free Fire Diamond Pack', date: '2025/10/27 10:15:30', amount: '250 INR', orderId: 'PAY123456', paymentTime: '2025/10/27 10:15:30', gameName: 'Free Fire', userId: '54321', zoneId: '9876', pack: 'Diamond Pack' },
    { id: 2, status: 'Successful', game: 'PUBG Mobile UC', date: '2025/10/26 16:45:12', amount: '500 INR', orderId: 'PAY123457', paymentTime: '2025/10/26 16:45:12', gameName: 'PUBG Mobile', userId: '11111', zoneId: '2222', pack: 'UC Pack' },
  ];

  const handleViewOrder = (orderId: number) => {
    setSelectedOrder(orderId);
    setShowOrderDetails(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Header */}
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
        <Link href="/home" className="text-white touch-manipulation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
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
                <span className="text-black font-semibold text-base">1000</span>
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
              <button className="bg-[#2F6BFD] border-2 border-white text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation shrink-0">
                Add Points
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
            placeholder="Search..."
            className="flex-1 min-w-0 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-xs touch-manipulation"
          />
          <button className="bg-[#2F6BFD] text-white px-3 py-2 rounded-lg font-semibold text-xs shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <button className="text-gray-600 touch-manipulation shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      )}

      {/* Transaction List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {activeTab === 'order' && orderTransactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => handleViewOrder(transaction.id)}
            className="bg-[#2F6BFD] rounded-xl p-4 flex items-center gap-4 cursor-pointer touch-manipulation active:opacity-90 transition-opacity"
          >
            {/* Game Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white">
              <Image
                src="/game.jpg"
                alt={transaction.game}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg mb-1">{transaction.status}</h3>
              <p className="text-white text-sm mb-1">{transaction.game}</p>
              <p className="text-white/80 text-xs">{transaction.date}</p>
            </div>

            {/* Amount Button */}
            <div className="bg-white text-[#2F6BFD] px-4 py-2 rounded-lg font-semibold text-sm shadow-md shrink-0">
              {transaction.amount}
            </div>
          </div>
        ))}

        {activeTab === 'wallet' && walletTransactions.map((transaction) => (
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
              <h3 className="text-white font-bold text-2xl mb-2">{transaction.amount}</h3>
              <div className="space-y-1 text-white text-xs">
                <p>Before : {transaction.before} After : {transaction.after}</p>
                <p>Product info:</p>
                <p>Transaction ID:</p>
                <p>{transaction.date}</p>
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'payment' && paymentTransactions.map((transaction) => (
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
                    {transaction.paymentTime}
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
        ))}
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
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Order ID</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.orderId || '---'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Payment Time</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.paymentTime || '---'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Game Name</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.gameName || '---'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">User ID</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.userId || '---'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Zone ID</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.zoneId || '---'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Pack</span>
                    <p className="text-white font-semibold text-base text-right">
                      {orderTransactions.find((t) => t.id === selectedOrder)?.pack || '---'}
                    </p>
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


