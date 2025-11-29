'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiPhone, HiShoppingBag, HiHome, HiPaperAirplane } from 'react-icons/hi';
import { FiEdit2 } from 'react-icons/fi';
import { authAPI, walletAPI, otherAPI } from '../lib/api';
import ProtectedRoute from '../components/ProtectedRoute';

function ProfileContent() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getUserInfo();
      const data = await response.json();

      if (response.ok) {
        const user = data.user || data.data || data;
        setUsername(user.name || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || user.phone || '');
        setWalletBalance(user.walletBalance || 0);
        if (user.profilePicture) {
          setProfilePicture(user.profilePicture);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await otherAPI.updateProfile({
        name: username,
        email: email,
        phoneNumber: phoneNumber,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Profile updated successfully!');
        fetchUserData();
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const handleProfilePictureClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleProfilePictureUpload(file);
      }
    };
    input.click();
  };

  const handleProfilePictureUpload = async (file: File) => {
    setIsUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await otherAPI.updateProfilePicture(formData);
      const data = await response.json();

      if (response.ok) {
        toast.success('Profile picture updated successfully!');
        // Update the profile picture URL
        if (data.profilePicture || data.data?.profilePicture) {
          setProfilePicture(data.profilePicture || data.data.profilePicture);
        }
        // Refresh user data to get updated picture
        fetchUserData();
      } else {
        toast.error(data.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('An error occurred while uploading profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      {/* Blue Background Section - Header and User Details */}
      <div className="bg-[#2F6BFD] pb-6">
        {/* Header */}
        <header className="bg-[#2F6BFD] px-4 py-3 flex items-center gap-3 relative">
          <button onClick={() => router.back()} className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg flex-1 text-center absolute left-0 right-0">User Profile</h1>
        </header>

        {/* First White Card - User Profile Information */}
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Profile Picture Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Profile Picture with Edit Icon */}
            <div className="relative shrink-0">
              <div 
                onClick={handleProfilePictureClick}
                className="w-20 h-20 rounded-full bg-[#2F6BFD] border-2 border-white flex items-center justify-center shadow-md overflow-hidden cursor-pointer touch-manipulation relative"
              >
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setProfilePicture(null);
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
                {isUploadingPicture && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {/* Edit Icon Overlay */}
              <button
                onClick={handleProfilePictureClick}
                disabled={isUploadingPicture}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm cursor-pointer touch-manipulation hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <FiEdit2 className="text-gray-700 text-xs" />
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1 pt-2">
              <h2 className="text-black font-bold text-lg mb-2">{username || 'Username'}</h2>
              <div className="flex items-center gap-2">
                <HiPhone className="text-gray-600 text-base" />
                <span className="text-black text-sm">{phoneNumber || '+91 123456789'}</span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm touch-manipulation"
            />
            <input
              type="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-sm touch-manipulation"
            />
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
          </div>
        </div>
      </div>

      {/* White Background Section - Rest of Content */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Combined Blue Card - Volt Points Balance & Navigation/Action Buttons */}
        <div className="bg-[#2F6BFD] rounded-2xl shadow-lg p-4 space-y-4">
          {/* Volt Points Balance Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-base mb-1">Volt Points</h3>
              <p className="text-white text-sm">Available Balance</p>
            </div>
            <div className="bg-white rounded-full px-5 py-2.5">
              <span className="text-[#2F6BFD] font-semibold text-sm">
                {isLoading ? '...' : `${walletBalance} coins`}
              </span>
            </div>
          </div>

          {/* Navigation/Action Buttons Section */}
          <div className="flex items-center justify-between gap-3">
            {/* Orders Button */}
            <Link href="/history" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/30 transition-colors touch-manipulation">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                <HiShoppingBag className="text-[#2F6BFD] text-xl" />
              </div>
              <span className="text-white font-medium text-sm">Orders</span>
            </Link>

            {/* Home Button */}
            <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/30 transition-colors touch-manipulation">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                <HiHome className="text-[#2F6BFD] text-xl" />
              </div>
              <span className="text-white font-medium text-sm">Home</span>
            </Link>

            {/* Contact Button */}
            <Link href="/social" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/30 transition-colors touch-manipulation">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                <HiPaperAirplane className="text-[#2F6BFD] text-xl" />
              </div>
              <span className="text-white font-medium text-sm">Contact</span>
            </Link>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="px-4 pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-[#2F6BFD] text-white py-3.5 rounded-lg font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

