'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  useEffect(() => {
    // Get login data from localStorage (set during OTP verification)
    const storedData = localStorage.getItem('loginData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setLoginData(data);
        setIsPhoneLogin(data.isPhoneLogin || false);
        
        if (data.email) {
          // Pre-fill the appropriate field based on login method
          // Both fields will be shown, but login input will pre-fill one of them
          if (data.isPhoneLogin) {
            setPhoneNumber(data.email);
          } else {
            setEmail(data.email);
          }
        }
      } catch (error) {
        console.error('Error parsing login data:', error);
      }
    }
  }, []);

  const handleSignUp = async () => {
    // Validate all fields are filled
    if (!name.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Build registration payload - always include all fields
      const registrationData: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
        password: password,
      };

      const response = await authAPI.completeRegistration(registrationData);

      const data = await response.json();

      // Check if response is successful
      if (response.ok) {
        // Successful registration - show success toast
        // Store auth token if provided
        if (data.token || data.data?.token) {
          localStorage.setItem('authToken', data.token || data.data.token);
        }
        // Clear login data
        localStorage.removeItem('loginData');
        toast.success('Registration successful!');
        // Small delay before redirect to ensure toast is visible
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        // HTTP error status - show error toast
        toast.error(data.message || data.error || 'Registration failed. Please try again.');
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
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="text-white touch-manipulation">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

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

        {/* Title */}
        <div className="text-center text-white px-4 mb-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Sign Up</h1>
        </div>

        {/* Login Prompt */}
        <div className="text-center text-white">
          <p className="text-sm sm:text-base">
            Already have an account?{' '}
            <Link
              href="/"
              className="text-white underline font-medium hover:opacity-80 touch-manipulation"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Light Grey Section - 50% */}
      <div className="flex-1 bg-[#F8F8F8] relative min-h-[50vh]">
        {/* White Card Overlay - Half on blue, half on grey */}
        <div className="absolute top-[-100px] sm:top-[-120px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md">
          <div className="bg-white rounded-t-4xl sm:rounded-t-[2.5rem] rounded-b-3xl shadow-xl p-6 sm:p-8">
            {/* Name Input Field */}
            <div className="mb-5">
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Enter your name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 sm:py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
              />
            </div>

            {/* Email Input Field */}
            <div className="mb-5">
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Enter your email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 sm:py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
              />
            </div>

            {/* Phone Number Input Field */}
            <div className="mb-5">
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Enter your phone number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-4 sm:py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
              />
            </div>

            {/* Password Input Field */}
            <div className="mb-6">
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Create password
              </label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 sm:py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] focus:border-transparent text-gray-800 placeholder-gray-400 text-base touch-manipulation"
              />
            </div>

            {/* Sign Up Button */}
            <button
              onClick={handleSignUp}
              disabled={
                isLoading || 
                !name.trim() || 
                !email.trim() || 
                !phoneNumber.trim() || 
                !password.trim()
              }
              className="w-full bg-[#2F6BFD] text-white py-4 sm:py-3.5 rounded-xl font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing Up...' : 'Sign Up Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

