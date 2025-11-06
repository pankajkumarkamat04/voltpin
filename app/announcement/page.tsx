'use client';

import Link from 'next/link';
import { HiSpeakerphone } from 'react-icons/hi';
import { HiChevronDown } from 'react-icons/hi';

export default function Announcement() {
  const announcements = [
    {
      id: 1,
      text: 'Stay updated with the latest news, updates and promotions',
      date: '2025/10/28 14:24:54',
    },
    {
      id: 2,
      text: 'Stay updated with the latest news, updates and promotions',
      date: '2025/10/28 14:24:54',
    },
    {
      id: 3,
      text: 'Stay updated with the latest news, updates and promotions',
      date: '2025/10/28 14:24:54',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Title Section - Blue Background */}
      <header className="bg-[#2F6BFD] px-4 py-6 flex flex-col items-center relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/home" className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center text-white px-4 mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">News & Announcements</h1>
          <p className="text-sm sm:text-base text-white/90 max-w-md">
            Stay updated with the latest news, updates and promotions
          </p>
        </div>
      </header>

      {/* Announcements Section - White Background */}
      <div className="flex-1 bg-white px-4 py-6 space-y-4 overflow-y-auto">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white rounded-2xl shadow-lg p-4 relative"
          >
            {/* Update Label */}
            <div className="absolute top-4 left-4">
              <span className="bg-[#2F6BFD] text-white px-3 py-1 rounded-full text-xs font-semibold">
                Update
              </span>
            </div>

            {/* Read More Button */}
            <button className="absolute top-4 right-4 bg-[#2F6BFD] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation">
              Read More
              <HiChevronDown className="text-white text-sm" />
            </button>

            {/* Announcement Content */}
            <div className="flex items-start gap-3 mt-10">
              {/* Speaker Icon */}
              <div className="shrink-0 mt-1">
                <HiSpeakerphone className="text-[#2F6BFD] text-2xl" />
              </div>

              {/* Announcement Text and Date */}
              <div className="flex-1 min-w-0">
                <p className="text-black font-medium text-sm sm:text-base mb-2">
                  {announcement.text}
                </p>
                <p className="text-gray-600 text-xs">
                  {announcement.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

