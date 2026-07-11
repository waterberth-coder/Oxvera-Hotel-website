import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { User } from 'firebase/auth';
import { LogIn, LogOut, Hotel, Menu, X, Calendar, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <Hotel className="w-8 h-8 text-gold-600" />
              <span className="text-2xl font-serif tracking-widest text-gold-900 uppercase">Oxvera</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">Home</a>
              <a href="#rooms" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">Suites</a>
              <a href="#amenities" className="text-sm uppercase tracking-widest hover:text-gold-600 transition-colors">Amenities</a>
              {user ? (
                <div className="flex items-center gap-4 border-l border-gold-200 pl-8">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gold-300" referrerPolicy="no-referrer" />
                  <button 
                    onClick={logout}
                    className="text-xs uppercase tracking-widest flex items-center gap-2 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-gold-900 text-gold-50 px-6 py-2 text-xs uppercase tracking-widest hover:bg-gold-800 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Guest Login
                </button>
              )}
            </nav>

            {/* Mobile Toggle */}
            <button className="md:hidden text-gold-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gold-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-4">
                <a href="/" className="block text-sm uppercase tracking-widest p-2">Home</a>
                <a href="#rooms" className="block text-sm uppercase tracking-widest p-2">Suites</a>
                <a href="#amenities" className="block text-sm uppercase tracking-widest p-2">Amenities</a>
                {user ? (
                  <button onClick={logout} className="w-full text-left text-sm uppercase tracking-widest p-2 flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <button onClick={signInWithGoogle} className="w-full text-left text-sm uppercase tracking-widest p-2 flex items-center gap-2 text-gold-600">
                    <LogIn className="w-4 h-4" /> Guest Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gold-950 text-gold-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gold-800 pb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Hotel className="w-8 h-8 text-gold-400" />
                <span className="text-2xl font-serif tracking-widest uppercase">Oxvera</span>
              </div>
              <p className="text-gold-400 font-light leading-relaxed max-w-sm">
                Where professional service meets luxury living. Experience the pinnacle of hospitality in the heart of the city.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-sm uppercase tracking-[0.2em] font-medium text-gold-400">Newsletter</h4>
              <p className="text-xs font-light text-gold-400">Join our mailing list for exclusive offers and updates.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-transparent border-b border-gold-700 py-2 text-sm flex-grow focus:outline-none focus:border-gold-400"
                />
                <button className="text-xs uppercase tracking-widest border border-gold-700 px-4 py-2 hover:bg-gold-900 transition-colors">Join</button>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm uppercase tracking-[0.2em] font-medium text-gold-400">Contact</h4>
              <ul className="space-y-4 text-xs font-light text-gold-400">
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> 122 Luxury Avenue, London, UK</li>
                <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> +44 20 7123 4567</li>
                <li className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Open 24/7</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gold-500">
            <p>&copy; {new Date().getFullYear()} Oxvera Hotel & Spa. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gold-200">Privacy Policy</a>
              <a href="#" className="hover:text-gold-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
