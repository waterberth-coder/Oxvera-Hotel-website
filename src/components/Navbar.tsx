import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, User, Settings, LogOut, Globe } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { CurrencyType } from '../utils/currency';

interface NavbarProps {
  onNavigate: (section: string) => void;
  currentView: string;
  user: FirebaseUser | null;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  logoUrl?: string;
}

export default function Navbar({ onNavigate, currentView, user, currency, onCurrencyChange, logoUrl }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Authentication Error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdmin = user?.email === 'waterberth@gmail.com';

  const menuItems = [
    { label: 'HOME', value: 'home' },
    { label: 'ROOMS', value: 'rooms' },
    { label: 'ABOUT US', value: 'about' },
    { label: 'CAR SERVICES', value: 'cars' },
    { label: 'SPA & WELLNESS', value: 'spa' },
    { label: 'DINING', value: 'dining' },
    { label: 'EVENTS', value: 'events' },
    { label: 'GALLERY', value: 'gallery' },
    { label: 'BLOG', value: 'blog' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans ${
          isScrolled
            ? 'bg-neutral-950/95 backdrop-blur-md shadow-lg border-b border-gold-500/10 py-3'
            : 'bg-gradient-to-b from-black/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-2">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Oxvera Logo" 
                className="h-10 w-auto object-contain max-w-[120px]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <div className="w-10 h-10 border border-gold-500 rounded-full flex items-center justify-center bg-gold-500/5 transition-transform duration-500 group-hover:rotate-180">
                  <span className="text-gold-500 font-serif font-bold text-lg">O</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white font-serif font-bold tracking-widest text-lg block leading-none">
                    OXVERA
                  </span>
                  <span className="text-gold-500/80 font-sans tracking-[0.2em] text-[8px] font-bold block uppercase mt-0.5">
                    Luxury Hotel
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-5 text-[10px] xl:text-[11px] font-bold tracking-wider xl:tracking-widest text-gray-300">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`hover:text-gold-500 transition-all duration-300 relative py-1 uppercase cursor-pointer whitespace-nowrap ${
                  currentView === item.value ? 'text-gold-500 font-extrabold' : ''
                }`}
              >
                {item.label}
                {currentView === item.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold-500 rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* Contact / Auth / CTA Section */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <a
              href="tel:+234800000000"
              className="text-gray-300 hover:text-gold-500 transition-colors flex items-center gap-1 text-[10px] xl:text-xs font-mono tracking-wider shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-gold-500" />
              <span className="hidden xl:inline">+234 80 OXVERA</span>
              <span className="xl:hidden">Call</span>
            </a>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded px-1.5 xl:px-2 py-1 text-[10px] xl:text-[11px] font-medium text-gray-300 hover:border-gold-500/40 transition-colors">
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyType)}
                className="bg-transparent border-none text-white font-semibold outline-none cursor-pointer pr-1 font-sans focus:ring-0 text-[10px] xl:text-xs"
              >
                <option value="NGN" className="bg-neutral-950 text-white">₦ NGN</option>
                <option value="USD" className="bg-neutral-950 text-white">$ USD</option>
                <option value="EUR" className="bg-neutral-950 text-white">€ EUR</option>
                <option value="GBP" className="bg-neutral-950 text-white">£ GBP</option>
              </select>
            </div>

            {/* Authenticated Actions */}
            {user ? (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="p-1.5 text-gray-300 hover:text-gold-500 transition-colors cursor-pointer"
                  title="Guest Dashboard"
                >
                  <User className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="p-1.5 text-gold-500 hover:text-gold-400 transition-colors cursor-pointer animate-pulse"
                    title="PMS Control Panel"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="text-gray-300 hover:text-gold-500 transition-colors text-xs font-semibold tracking-wider flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </button>
            )}

            <button
              onClick={() => onNavigate('rooms')}
              className="px-3 xl:px-4 py-2 bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-neutral-950 text-[10px] xl:text-xs font-bold tracking-wider xl:tracking-widest rounded-sm transition-all duration-300 shadow-md shadow-gold-500/20 uppercase cursor-pointer shrink-0"
            >
              Book Stay
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="p-1 text-gold-500"
                >
                  <User className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="p-1 text-gold-500"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-gold-500 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-neutral-950 flex flex-col pt-24 px-6 gap-6 overflow-y-auto animate-fade-in lg:hidden">
          <div className="flex flex-col gap-4 text-center">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onNavigate(item.value);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-lg font-bold tracking-widest uppercase hover:text-gold-500 py-2 border-b border-white/5 ${
                  currentView === item.value ? 'text-gold-500' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 pb-12">
            <a
              href="tel:+234800000000"
              className="text-gray-300 flex items-center gap-2 font-mono text-sm"
            >
              <Phone className="w-4 h-4 text-gold-500" />
              <span>+234 80 OXVERA</span>
            </a>

            {/* Mobile Currency Selector */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-4 py-2 w-full max-w-xs justify-center">
              <Globe className="w-4 h-4 text-gold-500" />
              <span className="text-gray-400 text-xs font-semibold uppercase font-mono">Currency:</span>
              <select
                value={currency}
                onChange={(e) => {
                  onCurrencyChange(e.target.value as CurrencyType);
                  setIsMobileMenuOpen(false);
                }}
                className="bg-transparent border-none text-white font-bold outline-none cursor-pointer text-sm"
              >
                <option value="NGN" className="bg-neutral-950 text-white">₦ NGN</option>
                <option value="USD" className="bg-neutral-950 text-white">$ USD</option>
                <option value="EUR" className="bg-neutral-950 text-white">€ EUR</option>
                <option value="GBP" className="bg-neutral-950 text-white">£ GBP</option>
              </select>
            </div>

            {!user ? (
              <button
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="px-6 py-2 border border-gold-500/30 text-gold-500 font-semibold rounded-sm text-sm"
              >
                Sign In / Sign Up
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 font-semibold"
              >
                Sign Out
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('rooms');
                setIsMobileMenuOpen(false);
              }}
              className="w-full max-w-xs py-3 bg-gold-500 text-neutral-950 font-bold tracking-widest uppercase rounded-sm text-center"
            >
              Book Your Stay
            </button>
          </div>
        </div>
      )}
    </>
  );
}

