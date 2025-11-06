'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['6', '1', '3', '', '', '']);
  const [email] = useState('igngloomy@gmail.com');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (i < pastedData.length && /^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Top Blue Section - 50% */}
      <div className="h-[50vh] min-h-[280px] bg-[#2F6BFD] flex flex-col items-center justify-start pt-8 sm:pt-12 relative px-4 overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="text-white touch-manipulation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        
        {/* Dashed circles background effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-full opacity-30"></div>
            <div className="absolute inset-4 border-2 border-blue-400 border-dashed rounded-full opacity-20"></div>
            <div className="absolute inset-8 border-2 border-blue-400 border-dashed rounded-full opacity-10"></div>
          </div>
        </div>

        {/* Hand holding phone illustration */}
        <div className="relative z-10 mb-2 sm:mb-2">
          <svg
            width="100"
            height="100"
            viewBox="0 0 200 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[180px] h-[200px] sm:w-[220px] sm:h-[240px]"
          >
            {/* Hand - simplified shape */}
            <path
              d="M100 200 C110 190, 120 180, 130 170 C140 160, 145 150, 148 140 C150 130, 150 120, 148 110 C145 100, 138 90, 130 85 C120 80, 110 75, 100 70 C90 75, 80 80, 70 85 C62 90, 55 100, 52 110 C50 120, 50 130, 52 140 C55 150, 60 160, 70 170 C80 180, 90 190, 100 200 Z"
              fill="#FFDBB3"
            />
            {/* Blue cuff/sleeve */}
            <rect x="95" y="175" width="10" height="35" rx="5" fill="#2F6BFD" />
            {/* Phone body */}
            <rect x="75" y="30" width="50" height="100" rx="6" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
            {/* Phone screen with green background */}
            <rect x="82" y="45" width="36" height="70" rx="3" fill="#4ADE80" />
            {/* Large checkmark */}
            <path
              d="M88 85 L98 98 L112 80"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center text-white relative z-10 -mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold">OTP Verification</h1>
        </div>
      </div>

      {/* Bottom Light Grey Section - 50% */}
      <div className="flex-1 bg-[#F8F8F8] relative min-h-[50vh]">
        {/* White Card Overlay - Half on blue, half on grey */}
        <div className="absolute top-[-50px] sm:top-[-50px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md">
          <div className="bg-white rounded-t-4xl sm:rounded-t-[2.5rem] rounded-b-3xl shadow-xl p-6 sm:p-8">
            {/* Instructional Text */}
            <p className="text-gray-600 text-sm sm:text-base mb-2 text-center">
              Enter the OTP sent to
            </p>

            {/* Email Address */}
            <p className="text-gray-900 font-bold text-base sm:text-lg mb-8 text-center">
              {email}
            </p>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-b-2 border-gray-300 focus:border-[#2F6BFD] focus:outline-none transition-colors touch-manipulation"
                />
              ))}
            </div>

            {/* Resend OTP Link */}
            <div className="text-center mb-6">
              <p className="text-xs sm:text-sm text-gray-600">
                Didn't you receive the OTP?{' '}
                <a
                  href="#"
                  className="text-[#2F6BFD] font-medium underline touch-manipulation"
                >
                  Resend OTP
                </a>
              </p>
            </div>

            {/* Log In Button */}
            <Link
              href="/home"
              className="w-full bg-[#2F6BFD] text-white py-4 sm:py-3.5 rounded-xl font-semibold text-base shadow-md active:bg-[#2563eb] hover:bg-[#2563eb] transition-colors touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

