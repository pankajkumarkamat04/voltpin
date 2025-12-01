'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';
import AuthChecker from './AuthChecker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Use useLayoutEffect for synchronous check before paint
  useLayoutEffect(() => {
    // Check if we have a token in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // No token - redirect immediately
        try {
          localStorage.setItem('intendedPath', pathname || '/');
        } catch {}
        setShouldRedirect(true);
        router.replace(redirectTo);
      } else {
        // Token exists - verify it
        setHasToken(true);
      }
      setIsChecking(false);
    } else {
      setIsChecking(false);
    }
  }, [router, redirectTo, pathname]);

  // Show loading spinner while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2F6BFD]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show loading (don't render children)
  if (shouldRedirect || !hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2F6BFD]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a token, use AuthChecker to verify it
  return <AuthChecker>{children}</AuthChecker>;
}

