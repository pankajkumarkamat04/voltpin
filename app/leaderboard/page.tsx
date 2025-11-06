'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { otherAPI } from '../lib/api';

interface LeaderboardPlayer {
  _id: string;
  totalPurchaseAmount: number;
  purchaseCount: number;
  name: string;
  email: string;
  avatar?: string | null;
}

interface LeaderboardData {
  currentMonth: {
    month: string;
    leaderboard: LeaderboardPlayer[];
  };
  lastMonth: {
    month: string;
    leaderboard: LeaderboardPlayer[];
  };
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const response = await otherAPI.getLeaderboard();
      const data = await response.json();

      if (response.ok && data) {
        setLeaderboardData(data);
      } else {
        const errorMsg = 'Failed to load leaderboard data';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      const errorMsg = 'Failed to load leaderboard data';
      setError(errorMsg);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get top 3 players from current month leaderboard
  const topThreePlayers = leaderboardData?.currentMonth?.leaderboard?.slice(0, 3) || [];
  
  // Get remaining players (ranks 4-11) from current month leaderboard
  const rankedPlayers = leaderboardData?.currentMonth?.leaderboard?.slice(3, 11) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-20">
        <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
          <Link href="/" className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-white font-bold text-lg flex-1 text-center absolute left-0 right-0">Leaderboards</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-20">
        <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
          <Link href="/" className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-white font-bold text-lg flex-1 text-center absolute left-0 right-0">Leaderboards</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Header */}
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
        <Link href="/" className="text-white touch-manipulation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-white font-bold text-lg flex-1 text-center absolute left-0 right-0">Leaderboards</h1>
      </header>

      {/* Top 3 Leaderboard Section */}
      <div className="bg-[#2F6BFD] pt-6">
        <div className="flex items-end justify-center gap-4 px-4">
          {/* Rank 2 */}
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <span className="text-white font-bold text-2xl mb-2">#2</span>
            <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center mb-2 relative">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white text-sm font-medium mb-2">
              {topThreePlayers[0]?.name || 'N/A'}
            </span>
            <div className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold mb-2">
              ₹{topThreePlayers[0]?.totalPurchaseAmount?.toLocaleString() || '0'}
            </div>
            <div className="w-16 h-20 bg-blue-400/30 rounded-t-lg"></div>
          </div>

          {/* Rank 1 - Larger */}
          <div className="flex flex-col items-center flex-1 max-w-[120px]">
            <span className="text-white font-bold text-3xl mb-3">#1</span>
            <div className="w-24 h-24 bg-white rounded-full border-4 border-black flex items-center justify-center mb-3 relative">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white text-base font-medium mb-2">
              {topThreePlayers[1]?.name || 'N/A'}
            </span>
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-2">
              ₹{topThreePlayers[1]?.totalPurchaseAmount?.toLocaleString() || '0'}
            </div>
            <div className="w-20 h-28 bg-blue-400/40 rounded-t-lg"></div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <span className="text-white font-bold text-2xl mb-2">#3</span>
            <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center mb-2 relative">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white text-sm font-medium mb-2">
              {topThreePlayers[2]?.name || 'N/A'}
            </span>
            <div className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold mb-2">
              ₹{topThreePlayers[2]?.totalPurchaseAmount?.toLocaleString() || '0'}
            </div>
            <div className="w-16 h-16 bg-blue-400/30 rounded-t-lg"></div>
          </div>
        </div>
      </div>

      {/* Ranked List Section */}
      <div className="flex-1 bg-white px-4 py-4">
        <div className="space-y-2">
          {rankedPlayers.map((player, index) => (
            <div
              key={player._id || index}
              className="bg-[#2F6BFD] rounded-xl px-4 py-3 flex items-center gap-3"
            >
              {/* Rank Number */}
              <span className="text-white font-bold text-base">#{index + 4}</span>
              
              {/* Separator */}
              <div className="h-6 w-px bg-white"></div>
              
              {/* Name */}
              <div className="flex-1">
                <span className="text-white font-medium text-base">{player.name || 'N/A'}</span>
              </div>
              
              {/* Score Button */}
              <button className="bg-white text-[#2F6BFD] px-4 py-1.5 rounded-lg font-semibold text-sm shadow-md active:bg-gray-50 hover:bg-gray-50 transition-colors touch-manipulation">
                ₹{player.totalPurchaseAmount?.toLocaleString() || '0'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

