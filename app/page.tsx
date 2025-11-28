'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiPlus, HiShoppingBag, HiChartBar, HiPaperAirplane, HiUser } from 'react-icons/hi';
import BottomNav from './components/BottomNav';
import { gameAPI, walletAPI, authAPI, bannerAPI } from './lib/api';

function HomeContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [username, setUsername] = useState('Username');
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsAuthenticated(!!token);
    
    fetchGames();
    fetchBanners();
    if (token) {
      fetchWalletBalance();
      fetchUserInfo();
    } else {
      setIsLoadingBalance(false);
    }
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown]);

  const fetchGames = async () => {
    try {
      setIsLoadingGames(true);
      const response = await gameAPI.getAllGames();
      const data = await response.json();
      if (response.ok && data.success && data.games) {
        setGames(data.games);
      } else {
        toast.error('Failed to load games. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoadingGames(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setIsLoadingBanners(true);
      const response = await bannerAPI.getPublicBanners();
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        // Sort banners by priority (lower number = higher priority)
        const sortedBanners = [...data.data].sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
        setBanners(sortedBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Silently fail for banners - don't show error toast
    } finally {
      setIsLoadingBanners(false);
    }
  };

  // Auto-play banner carousel
  useEffect(() => {
    const filteredBanners = banners.filter((banner) => banner.type === 'primary banner' || banner.type === 'secondary banner');
    
    if (filteredBanners.length > 1) {
      autoplayIntervalRef.current = setInterval(() => {
        setCurrentBannerIndex((prev) => {
          const nextIndex = (prev + 1) % filteredBanners.length;
          
          // Scroll to current banner
          if (bannerScrollRef.current) {
            const scrollContainer = bannerScrollRef.current;
            const bannerWidth = scrollContainer.offsetWidth * 0.90; // 90% width
            const gap = 16; // gap-4 = 16px
            const scrollPosition = (bannerWidth + gap) * nextIndex;
            scrollContainer.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            });
          }
          
          return nextIndex;
        });
      }, 3000); // Change banner every 3 seconds
    }

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [banners]);

  const fetchWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setIsLoadingBalance(false);
        return;
      }
      const response = await walletAPI.getDashboard();
      const data = await response.json();
      if (response.ok && data.data) {
        const balance = data.data.walletBalance || data.data.user?.walletBalance || 0;
        setWalletBalance(typeof balance === 'number' ? balance : Number(balance) || 0);
      } else {
        // Silently fail if not authenticated
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        return;
      }
      const response = await authAPI.getUserInfo();
      const data = await response.json();
      if (response.ok) {
        const user = data.user || data.data || data;
        setUsername(user.name || 'Username');
        setIsAuthenticated(true);
      } else {
        // Silently fail if not authenticated
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setWalletBalance(0);
    setUsername('Username');
    setIsMenuOpen(false);
  };

  // Filter games based on search query and selected filter
  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'All') {
      return matchesSearch;
    }
    // Add more filter logic here if needed (e.g., by publisher, category, etc.)
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8] pb-20 relative">
      {/* Backdrop Blur - When menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu/Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[70%] max-w-sm bg-white rounded-r-3xl shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <p className="text-gray-900 font-bold text-lg mb-1">Welcome</p>
            <p className="text-[#2F6BFD] font-bold text-xl">
              {isAuthenticated ? username : 'Guest'}
            </p>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center touch-manipulation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#2F6BFD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {[
            { icon: 'home', label: 'Home', href: '/' },
            { icon: 'announcements', label: 'Announcements', href: '/announcement' },
            { icon: 'profile', label: 'Profile', href: '/profile' },
            { icon: 'games', label: 'Games', href: '/' },
            { icon: 'orders', label: 'Orders', href: '/history' },
            { icon: 'leaderboards', label: 'Leaderboards', href: '/leaderboard' },
            { icon: 'contact', label: 'Contact Us', href: '/social' },
            { icon: 'terms', label: 'Terms & Conditions', href: '#' },
            { icon: 'privacy', label: 'Privacy & Policy', href: '#' },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center gap-2 px-6 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <div className="text-[#2F6BFD]">
                {item.icon === 'home' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H9C9.53043 22 10.0391 21.7893 10.4142 21.4142C10.7893 21.0391 11 20.5304 11 20V16C11 15.4696 11.2107 14.9609 11.5858 14.5858C11.9609 14.2107 12.4696 14 13 14H15C15.5304 14 16.0391 14.2107 16.4142 14.5858C16.7893 14.9609 17 15.4696 17 16V20C17 20.5304 17.2107 21.0391 17.5858 21.4142C17.9609 21.7893 18.4696 22 19 22H21C21.5304 22 22.0391 21.7893 22.4142 21.4142C22.7893 21.0391 23 20.5304 23 20V10M19 10L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'announcements' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8A6 6 0 0 0 6 8C6 11.3137 3 14 3 14H21C21 14 18 11.3137 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'profile' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'games' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H4C2.89543 12 2 11.1046 2 10V6C2 4.89543 2.89543 4 4 4H8C9.10457 4 10 4.89543 10 6V8M14 12H20C21.1046 12 22 11.1046 22 10V6C22 4.89543 21.1046 4 20 4H16C14.8954 4 14 4.89543 14 6V8M10 20H14C15.1046 20 16 19.1046 16 18V14C16 12.8954 15.1046 12 14 12H10C8.89543 12 8 12.8954 8 14V18C8 19.1046 8.89543 20 10 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'orders' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'leaderboards' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 10H16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'contact' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9841 21.5573 21.2126 21.3528 21.3992C21.1482 21.5857 20.9071 21.7262 20.6447 21.8117C20.3822 21.8972 20.1044 21.9257 19.83 21.895C16.7425 21.5356 13.787 20.5301 11.19 18.96C8.77382 17.5546 6.72533 15.5061 5.32 13.09C3.74995 10.493 2.74441 7.53752 2.385 4.45C2.35434 4.17557 2.38284 3.89779 2.46834 3.63535C2.55384 3.37291 2.69434 3.13179 2.88084 2.92723C3.06734 2.72268 3.29584 2.55912 3.55078 2.44753C3.80572 2.33594 4.08145 2.27894 4.36 2.28H7.36C8.04522 2.28019 8.70251 2.55073 9.19178 3.03174C9.68105 3.51275 9.96099 4.16392 9.97 4.85C10.0015 5.41364 10.1242 5.96858 10.333 6.49C10.5418 7.01142 10.8334 7.49182 11.195 7.91C11.4558 8.22247 11.6456 8.59035 11.75 8.985C11.8544 9.37965 11.8708 9.79166 11.798 10.192C11.7252 10.5923 11.5647 10.9711 11.33 11.3C11.0953 11.6289 10.7927 11.8995 10.444 12.092C10.0953 12.2845 9.70928 12.3943 9.31 12.413C8.66392 12.423 8.03275 12.223 7.51 11.845C7.09182 11.4834 6.61142 11.1918 6.09 10.983C5.56858 10.7742 5.01364 10.6515 4.45 10.62C3.76392 10.611 3.11275 10.891 2.63174 11.3803C2.15073 11.8695 1.88019 12.5268 1.88 13.212V16.212C1.88019 16.8972 2.15073 17.5545 2.63174 18.0438C3.11275 18.533 3.76392 18.813 4.45 18.822C5.01364 18.8505 5.56858 18.9732 6.09 19.182C6.61142 19.3908 7.09182 19.6824 7.51 20.044C8.03275 20.422 8.66392 20.622 9.31 20.612C9.70928 20.5933 10.0953 20.4835 10.444 20.291C10.7927 20.0985 11.0953 19.8279 11.33 19.499C11.5647 19.1701 11.7252 18.7913 11.798 18.391C11.8708 17.9907 11.8544 17.5787 11.75 17.184C11.6456 16.7894 11.4558 16.4215 11.195 16.109C10.8334 15.6908 10.5418 15.2104 10.333 14.689C10.1242 14.1676 10.0015 13.6126 9.97 13.049C9.96099 12.3639 9.68105 11.7127 9.19178 11.2317C8.70251 10.7507 8.04522 10.4802 7.36 10.48H4.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'terms' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {item.icon === 'privacy' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-gray-900 font-medium text-base">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Log Out/Login Button */}
        <div className="p-6 border-t border-gray-200">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-[#2F6BFD] to-[#2563eb] text-white py-3.5 rounded-xl font-semibold text-base shadow-md active:opacity-90 transition-opacity touch-manipulation"
            >
              Log Out
            </button>
          ) : (
            <Link 
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-gradient-to-r from-[#2F6BFD] to-[#2563eb] text-white py-3.5 rounded-xl font-semibold text-base shadow-md active:opacity-90 transition-opacity touch-manipulation flex items-center justify-center"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
      {/* Top Header Bar */}
      <header className="bg-[#2F6BFD] px-4 py-3 flex items-center justify-between z-50 relative">
        {/* Hamburger Menu */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-white touch-manipulation"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo - Absolute Center */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 touch-manipulation">
          <Image
            src="/logo.png"
            alt="Voltpin Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            priority
          />
        </Link>

        {/* Points and Profile - Right */}
        <div className="flex items-center gap-2">
          {/* Points Button - Only show if authenticated */}
          {isAuthenticated ? (
            <>
              <Link href="/add-points" className="bg-white hover:bg-gray-50 rounded-full px-3 py-1.5 flex items-center gap-1.5 touch-manipulation shadow-md">
                <Image
                  src="/coin.png"
                  alt="Coin"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
                <span className="text-gray-900 font-semibold text-sm">
                  {isLoadingBalance ? '...' : walletBalance}
                </span>
              </Link>
              {/* Profile Icon */}
              <Link href="/profile" className="text-white touch-manipulation">
                <HiUser className="w-6 h-6" />
              </Link>
            </>
          ) : (
            <Link href="/login" className="bg-white hover:bg-gray-50 rounded-full px-3 py-1.5 flex items-center gap-1.5 touch-manipulation shadow-md">
              <span className="text-gray-900 font-semibold text-sm">Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 px-4 pb-4">
        {/* Banner Carousel Section */}
        <div className="mb-6 bg-[#2F6BFD] -mx-4 px-4 pt-4 pb-6">
          {isLoadingBanners ? (
            <div className="flex justify-center gap-4 overflow-x-auto scrollbar-hide pb-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="shrink-0 w-[90%] max-w-md bg-white rounded-2xl shadow-md h-52 animate-pulse"
                />
              ))}
            </div>
          ) : banners.length > 0 ? (
            <div 
              ref={bannerScrollRef}
              className="flex justify-center gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
            >
              {banners
                .filter((banner) => banner.type === 'primary banner' || banner.type === 'secondary banner')
                .map((banner, index) => (
                  <a
                    key={banner._id}
                    href={banner.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`shrink-0 w-[90%] max-w-md bg-white rounded-2xl shadow-md h-52 snap-center overflow-hidden relative mx-auto touch-manipulation active:scale-95 transition-transform`}
                  >
                    <Image
                      src={banner.image || '/game.jpg'}
                      alt={banner.title || 'Banner'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 90vw, 448px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/game.jpg';
                      }}
                    />
                  </a>
                ))}
            </div>
          ) : (
            <div className="flex justify-center gap-4 overflow-x-auto scrollbar-hide pb-2">
              <div className="shrink-0 w-[90%] max-w-md bg-white rounded-2xl shadow-md h-52 opacity-50" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {[
            { icon: HiPlus, label: 'Add Points', href: '/add-points' },
            { icon: HiShoppingBag, label: 'Orders', href: '/history' },
            { icon: HiChartBar, label: 'Leaderboards', href: '/leaderboard' },
            { icon: HiPaperAirplane, label: 'Contact Us', href: '/social' },
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href || '#'}
                className="bg-[#2F6BFD] rounded-lg sm:rounded-xl aspect-square p-0.5 sm:p-1 shadow-md active:bg-[#2563eb] transition-colors touch-manipulation flex flex-col items-center justify-center gap-0.5"
              >
                <IconComponent className="text-white text-xl sm:text-2xl" />
                <span className="text-white text-xs sm:text-sm font-medium text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-2 mb-4">
          {/* All Filter Button */}
          <div className="relative filter-dropdown-container">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-[#2F6BFD] text-white px-3 py-2 rounded-full flex items-center gap-1 text-xs font-medium touch-manipulation shrink-0 active:bg-[#2563eb] transition-colors"
            >
              <span>{selectedFilter}</span>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[120px]">
                {['All', 'Popular', 'New', 'Top Rated'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors touch-manipulation ${
                      selectedFilter === filter ? 'bg-[#2F6BFD]/10 text-[#2F6BFD] font-medium' : 'text-gray-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="search your game"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-white px-3 py-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#2F6BFD] text-gray-800 placeholder-gray-400"
          />

          {/* Search Button */}
          <button 
            onClick={() => {
              // Search is already handled by filteredGames based on searchQuery
              // This button can be used for additional search actions if needed
            }}
            className="bg-[#2F6BFD] text-white p-2 rounded-lg touch-manipulation shrink-0 active:bg-[#2563eb] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Game Cards Grid */}
        {isLoadingGames ? (
          <div className="text-center py-8 text-gray-500">Loading games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No games found</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredGames.map((game) => (
              <Link
                key={game._id}
                href={`/topup?gameId=${game._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden touch-manipulation active:scale-95 transition-transform"
              >
                {/* Game Image */}
                <div className="relative h-28 w-full overflow-hidden">
                  <Image
                    src={game.image || '/game.jpg'}
                    alt={game.name || 'Game'}
                    width={400}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Game Info */}
                <div className="p-3">
                  <h3 className="text-gray-900 font-semibold text-sm mb-1">{game.name || 'Game'}</h3>
                  <p className="text-gray-500 text-xs">{game.publisher || 'Publisher'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
