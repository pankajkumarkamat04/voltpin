'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HiSpeakerphone } from 'react-icons/hi';
import { HiChevronDown } from 'react-icons/hi';
import { otherAPI } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function AnnouncementContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await otherAPI.getNews(1, 20);
      const data = await response.json();

      if (response.ok && data.success && data.news) {
        setAnnouncements(data.news);
      } else {
        const errorMsg = 'Failed to load announcements';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      const errorMsg = 'Failed to load announcements';
      setError(errorMsg);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
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
      {/* Title Section - Blue Background */}
      <header className="bg-[#2F6BFD] px-4 py-6 flex flex-col items-center relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/" className="text-white touch-manipulation">
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
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading announcements...</div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">{error}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No announcements found</div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-2xl shadow-lg p-4 relative"
            >
              {/* Update Label */}
              <div className="absolute top-4 left-4">
                <span className="bg-[#2F6BFD] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Update
                </span>
              </div>

              {/* Read More Button */}
              <button 
                onClick={() => {
                  const newExpanded = new Set(expandedAnnouncements);
                  if (newExpanded.has(announcement._id)) {
                    newExpanded.delete(announcement._id);
                  } else {
                    newExpanded.add(announcement._id);
                  }
                  setExpandedAnnouncements(newExpanded);
                }}
                className="absolute top-4 right-4 bg-[#2F6BFD] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation"
              >
                {expandedAnnouncements.has(announcement._id) ? 'Read Less' : 'Read More'}
                <HiChevronDown className={`text-white text-sm transition-transform ${expandedAnnouncements.has(announcement._id) ? 'rotate-180' : ''}`} />
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
                    {announcement.title || announcement.description || 'Announcement'}
                  </p>
                  {expandedAnnouncements.has(announcement._id) && announcement.content && (
                    <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Announcement() {
  return (
    <ProtectedRoute>
      <AnnouncementContent />
    </ProtectedRoute>
  );
}

