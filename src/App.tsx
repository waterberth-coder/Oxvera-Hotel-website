import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Facilities from './components/Facilities';
import RoomList from './components/RoomList';
import BookingSuccess from './components/BookingSuccess';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Testimonials from './components/Testimonials';
import GallerySection from './components/GallerySection';
import ServiceViews from './components/ServiceViews';
import AttractionsNewsletter from './components/AttractionsNewsletter';
import Footer from './components/Footer';
import BlogSection from './components/BlogSection';
import SEOMetadata from './components/SEOMetadata';
import { Loader2, LogOut } from 'lucide-react';

import { auth, db, signInWithGoogle, logout } from './lib/firebase';
import { User } from 'firebase/auth';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { INITIAL_ROOMS } from './constants/initialData';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyType } from './utils/currency';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currency, setCurrency] = useState<CurrencyType>(() => {
    return (localStorage.getItem('preferred_currency') as CurrencyType) || 'NGN';
  });

  const [globalSettings, setGlobalSettings] = useState<{
    logoUrl?: string;
    heroSlides?: any[];
  }>({});

  // Access Control States
  const [accessGranted, setAccessGranted] = useState<boolean>(true);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(false);
  
  // Search state passed from Hero widget to the RoomList stay calculator
  const [searchParams, setSearchParams] = useState<{
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    promoCode: string;
  } | undefined>(undefined);

  useEffect(() => {
    // Sync active auth user
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u && u.email === "waterberth@gmail.com") {
        seedRooms();
      }
    });

    // Load global settings
    async function loadGlobalSettings() {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'global'));
        if (docSnap.exists()) {
          setGlobalSettings(docSnap.data());
        }
      } catch (err) {
        console.warn('Could not load global brand settings:', err);
      }
    }
    loadGlobalSettings();

    // Check custom URL for successful checkout redirection
    if (window.location.pathname === '/booking-success' || window.location.href.includes('booking-success')) {
      setCurrentView('success');
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setAccessGranted(true);
      return;
    }

    if (user.email === 'waterberth@gmail.com') {
      setAccessGranted(true);
      return;
    }

    async function checkUserAccess() {
      setCheckingAccess(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setAccessGranted(!!userData.accessGranted);
        } else {
          // Check if pre-approved first
          const safeId = btoa(user.email || '').replace(/=/g, '');
          const preRef = doc(db, 'users', `pre_${safeId}`);
          const preSnap = await getDoc(preRef);

          if (preSnap.exists() && preSnap.data().accessGranted) {
            // Upgrade pre-approved user to real user document
            await setDoc(userRef, {
              email: user.email?.toLowerCase(),
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              loyaltyPoints: 0,
              accessGranted: true,
              createdAt: new Date().toISOString()
            });
            setAccessGranted(true);
          } else {
            // Create pending user
            await setDoc(userRef, {
              email: user.email?.toLowerCase(),
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              loyaltyPoints: 0,
              accessGranted: false,
              createdAt: new Date().toISOString()
            });
            setAccessGranted(false);
          }
        }
      } catch (err) {
        console.warn("Could not check user access status:", err);
        setAccessGranted(false);
      } finally {
        setCheckingAccess(false);
      }
    }

    checkUserAccess();
  }, [user]);

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const seedRooms = async () => {
    try {
      const roomsCol = collection(db, 'rooms');
      const snapshot = await getDocs(roomsCol);
      if (snapshot.empty) {
        console.log("Admin logged in. Seeding premium suites to Firestore...");
        for (const room of INITIAL_ROOMS) {
          await setDoc(doc(db, 'rooms', room.id), room);
        }
        console.log("Seeding process succeeded.");
      }
    } catch (e) {
      console.warn("Room database check:", e instanceof Error ? e.message : "Access restricted");
    }
  };

  const handleHeroSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    setCurrentView('rooms');
    
    // Scroll smoothly to room grid section
    setTimeout(() => {
      const roomElement = document.getElementById('rooms');
      if (roomElement) {
        roomElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkingAccess) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex flex-col justify-center items-center px-4 font-sans selection:bg-gold-500 selection:text-neutral-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto" />
          <p className="text-xs text-gray-400 font-mono uppercase tracking-[0.2em]">Verifying guest credentials...</p>
        </div>
      </div>
    );
  }

  if (user && !accessGranted && user.email !== 'waterberth@gmail.com') {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-gold-500 selection:text-neutral-950">
        {/* Abstract luxury background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.04),transparent_50%)]" />
        
        <div className="relative max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 md:p-10 rounded text-center space-y-6 shadow-2xl animate-fade-in">
          {/* Logo mark */}
          <div className="mx-auto w-12 h-12 border border-gold-500 rounded-full flex items-center justify-center bg-gold-500/5">
            <span className="text-gold-500 font-serif font-bold text-xl animate-pulse">O</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-gold-500 uppercase tracking-[0.25em] block">Exclusive Entry Sanctuary</span>
            <h2 className="text-2xl font-serif text-white tracking-wide">Invitation Required</h2>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent w-full" />

          <p className="text-xs text-gray-400 leading-relaxed font-light">
            Oxvera Hotel guest portals are strictly private. Your registration under <strong className="text-white font-mono">{user.email}</strong> is pending authorization from the administrator.
          </p>

          <div className="p-4 bg-neutral-950 rounded border border-neutral-850 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gold-500">Awaiting Whitelist Approval</span>
            </div>
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              Once granted access by the property admin from the PMS dashboard, this screen will auto-refresh and unlock premium features.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={async () => {
                try {
                  const userRef = doc(db, 'users', user.uid);
                  const snap = await getDoc(userRef);
                  if (snap.exists() && snap.data().accessGranted) {
                    setAccessGranted(true);
                  }
                } catch (e) {
                  console.warn(e);
                }
              }}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-gold-500 font-bold text-[10px] uppercase tracking-widest rounded transition-all cursor-pointer"
            >
              Check Status Again
            </button>
            <button
              onClick={() => logout()}
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold text-[10px] uppercase tracking-widest rounded transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out / Exit Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen selection:bg-gold-500 selection:text-neutral-950">
      <SEOMetadata currentView={currentView} />
      
      {/* Sticky Translucent Header */}
      {currentView !== 'success' && (
        <Navbar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          user={user} 
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          logoUrl={globalSettings.logoUrl}
        />
      )}

      {/* Primary Dynamic Content Views */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (currentView === 'dashboard' ? (user ? '-user' : '-guest') : '') + (currentView === 'admin' ? (user?.email === 'waterberth@gmail.com' ? '-allowed' : '-restricted') : '')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {currentView === 'success' && (
              <BookingSuccess currency={currency} />
            )}

            {currentView === 'home' && (
              <>
                <Hero onSearch={handleHeroSearch} heroSlides={globalSettings.heroSlides} />
                <Facilities onBookRoom={() => handleNavigate('rooms')} onNavigate={handleNavigate} />
                <RoomList user={user} searchParams={searchParams} currency={currency} />
                <Testimonials />
                <GallerySection />
                <AttractionsNewsletter />
              </>
            )}

            {currentView === 'rooms' && (
              <RoomList user={user} searchParams={searchParams} currency={currency} />
            )}

            {['dining', 'spa', 'cars', 'events', 'about'].includes(currentView) && (
              <ServiceViews view={currentView} onBookNow={() => handleNavigate('rooms')} currency={currency} />
            )}

            {currentView === 'gallery' && (
              <GallerySection />
            )}

            {currentView === 'blog' && (
              <BlogSection />
            )}

            {currentView === 'dashboard' && user && (
              <UserDashboard user={user} onNavigate={handleNavigate} currency={currency} />
            )}

            {currentView === 'dashboard' && !user && (
              <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-serif text-white mb-4">VIP Guest Portal</h2>
                <p className="text-gray-400 text-xs max-w-sm mb-6">Sign in with your Google Account to manage hotel reservations, print tax invoices, and track reward codes.</p>
                <button 
                  onClick={signInWithGoogle}
                  className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded shadow-lg transition-colors cursor-pointer"
                >
                  Access VIP Portal
                </button>
              </div>
            )}

            {currentView === 'admin' && user?.email === 'waterberth@gmail.com' && (
              <AdminDashboard onNavigate={handleNavigate} />
            )}

            {currentView === 'admin' && user?.email !== 'waterberth@gmail.com' && (
              <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-xl font-serif text-red-400">Access Restricted</h2>
                <p className="text-gray-400 text-xs mt-2">Only verified PMS administrators are permitted to enter this panel.</p>
                <button 
                  onClick={() => handleNavigate('home')} 
                  className="mt-6 px-5 py-2 bg-neutral-900 text-gold-500 text-xs rounded border border-neutral-800 cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Multi-column Footer Section */}
      {currentView !== 'success' && (
        <Footer onNavigate={handleNavigate} />
      )}

    </div>
  );
}
