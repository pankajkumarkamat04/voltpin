'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Validate email/phone in real-time
  const validateInput = (value: string) => {
    setEmail(value);
    setEmailError('');

    if (!value.trim()) {
      return;
    }

    if (!isPhoneLogin) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setEmailError('Please enter a valid email address');
      }
    } else {
      // Phone validation
      const phoneNumber = value.trim().replace(/[\s\-\(\)]/g, '');
      if (!/^\d{10,}$/.test(phoneNumber)) {
        setEmailError('Please enter a valid phone number (at least 10 digits)');
      }
    }
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      toast.error(`Please enter your ${isPhoneLogin ? 'phone number' : 'email address'}`);
      return;
    }

    // Email validation when not using phone login
    if (!isPhoneLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Phone number validation when using phone login (optional - basic validation)
    if (isPhoneLogin) {
      // Remove spaces, dashes, and parentheses for validation
      const phoneNumber = email.trim().replace(/[\s\-\(\)]/g, '');
      // Check if it's a valid phone number (at least 10 digits)
      if (!/^\d{10,}$/.test(phoneNumber)) {
        toast.error('Please enter a valid phone number (at least 10 digits)');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await authAPI.sendOTP(email, isPhoneLogin);
      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent successfully!');
        // Store email/phone for OTP verification
        localStorage.setItem('loginData', JSON.stringify({
          email: email,
          isPhoneLogin: isPhoneLogin
        }));
        router.push('/otp');
      } else {
        toast.error(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Top Blue Section - 50% */}
      <div className="h-[50vh] min-h-[280px] bg-[#2F6BFD] flex flex-col items-center justify-start pt-8 sm:pt-12 relative px-4">
        {/* Logo */}
        <div className="mb-4 sm:mb-6">
          <Image
            src="/logo.png"
            alt="Voltpin Logo"
            width={100}
            height={100}
            className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-contain"
            priority
          />
        </div>
        
        {/* Welcome Text */}
        <div className="text-center text-white px-4">
          <p className="text-3xl sm:text-base mb-1 sm:mb-2 font-normal">Welcome To</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Voltpin</h1>
        </div>
      </div>

      {/* Bottom Light Grey Section - 50% */}
      <div className="flex-1 bg-[#F8F8F8] relative min-h-[50vh]">
        {/* White Card Overlay - Half on blue, half on grey */}
        <div className="absolute top-[-100px] sm:top-[-120px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md">
          <div className="bg-white rounded-t-4xl sm:rounded-t-[2.5rem] rounded-b-3xl shadow-xl p-6 sm:p-8">
            {/* Email/Phone Input Field */}
            <div className="mb-5">
              <input
                type={isPhoneLogin ? "tel" : "email"}
                placeholder={isPhoneLogin ? "Enter your phone number" : "Enter your email"}
                value={email}
                onChange={(e) => validateInput(e.target.value)}
                className={`w-full px-4 py-4 sm:py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation ${
                  emailError ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* Remember me and Login with number */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <label className="flex items-center cursor-pointer touch-manipulation min-h-[44px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 sm:w-4 sm:h-4 border border-gray-300 rounded mr-2 text-[#2F6BFD] focus:ring-2 focus:ring-[#2F6BFD] accent-[#2F6BFD]"
                />
                <span className="text-gray-800 text-sm sm:text-sm">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPhoneLogin(!isPhoneLogin);
                  setEmail(''); // Clear input when switching
                  setEmailError(''); // Clear error when switching
                }}
                className="text-[#2F6BFD] text-sm font-medium hover:underline touch-manipulation min-h-[44px] flex items-center"
              >
                {isPhoneLogin ? 'Login with email?' : 'Login with number?'}
              </button>
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full bg-[#2F6BFD] text-white py-4 sm:py-3.5 rounded-xl font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors mb-6 touch-manipulation min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SENDING OTP...' : 'Send OTP'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-xs text-gray-800">
                Don't have an account?{' '}
                <a
                  href="/signup"
                  className="text-[#2F6BFD] font-medium hover:underline touch-manipulation inline-flex items-center min-h-[44px]"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

