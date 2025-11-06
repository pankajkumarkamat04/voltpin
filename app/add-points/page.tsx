'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AddPoints() {
  const [amount, setAmount] = useState('');
  const pointOptions = [250, 250, 250, 250, 250, 250];

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Blue Background Section - Title & Main Card */}
      <div className="bg-[#2F6BFD] pb-6">
        {/* Header Section */}
        <header className="bg-[#2F6BFD] px-4 py-6 flex items-center relative">
          {/* Back Button */}
          <div className="absolute left-4">
            <Link href="/profile" className="text-white touch-manipulation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-white font-bold text-xl sm:text-2xl flex-1 text-center">Add Volt Points</h1>
          <div className="w-6"></div>
        </header>

        {/* Main Add Points Card - White Card */}
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Blue Card Inside White Card - Available Points Display */}
            <div className="bg-[#2F6BFD] mx-4 mt-4 mb-4 rounded-xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* V Icon */}
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <Image
                    src="/coin.png"
                    alt="Coin"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-cover"
                  />
                </div>
                <span className="text-white font-medium text-base">Available Volt Points</span>
              </div>
              {/* Points Display */}
              <div className="bg-white rounded-lg px-4 py-2">
                <span className="text-gray-800 font-semibold text-base">1000</span>
              </div>
            </div>

            {/* Input and Button Section - White Area Inside White Card */}
            <div className="px-4 pb-4 flex gap-2">
              <input
                type="text"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 max-w-[60%] px-2 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm touch-manipulation"
              />
              <button className="bg-[#2F6BFD] text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation whitespace-nowrap">
                Add Points
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* White Background Section - Point Selection Grid */}
      <div className="flex-1 bg-white px-4 py-6">
        {/* Point Selection Grid - 2 rows x 3 columns */}
        <div className="grid grid-cols-3 gap-4">
          {pointOptions.map((points, index) => (
            <button
              key={index}
              className="bg-[#2F6BFD] rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center gap-3 active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation"
              onClick={() => setAmount(points.toString())}
            >
              {/* V Icon */}
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <Image
                  src="/coin.png"
                  alt="Coin"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover"
                />
              </div>
              {/* Points Value */}
              <div className="bg-white rounded-lg px-4 py-2 w-full">
                <span className="text-gray-800 font-semibold text-sm">{points}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

