import React, { useState, useEffect } from 'react';
import { Calendar, Users, Percent } from 'lucide-react';

interface HeroProps {
  onSearch: (searchParams: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    promoCode: string;
  }) => void;
  heroSlides?: any[];
}

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600',
    tag: 'Prestige & Splendor',
    title: 'Stay Defined by Comfort',
    subtitle: 'Welcome to the crowning jewel of Umuahia.'
  },
  {
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1600',
    tag: 'Azure Horizons',
    title: 'Sanctuary of Pure Peace',
    subtitle: 'Relax beside our grand heated panoramic pools.'
  },
  {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600',
    tag: 'Fine Culinary Art',
    title: 'Sensory Dining Excellence',
    subtitle: 'Savor traditional Afro-Fusion and international Michelin-style menus.'
  },
  {
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1600',
    tag: 'Wellness & Spa',
    title: 'Rejuvenate Your Mind & Body',
    subtitle: 'Escape into an oasis of steam baths and deep-tissue treatments.'
  }
];

export default function Hero({ onSearch, heroSlides }: HeroProps) {
  const activeSlides = heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults,
      children,
      promoCode
    });
  };

  return (
    <section className="relative min-h-screen lg:h-[95vh] lg:min-h-[680px] w-full overflow-hidden bg-neutral-950 flex flex-col justify-center py-16 lg:py-0">
      {/* Background Slider */}
      {activeSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Parallax Zoom Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[6000ms] ease-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.01)' : 'scale(1.08)',
            }}
          />
          {/* Multi-layered luxury shading overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-black/85" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center items-center text-center mt-12 md:mt-16">
        <div className="max-w-4xl animate-fade-in mb-8 lg:mb-12">
          {/* Animated luxury top badge */}
          {activeSlides[currentSlide] && (
            <>
              <span className="inline-block text-[9px] md:text-[11px] font-bold tracking-[0.3em] uppercase text-gold-500 bg-gold-500/10 border border-gold-500/30 px-3.5 py-1.5 rounded-full mb-4 md:mb-6">
                {activeSlides[currentSlide].tag}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-white tracking-wide mb-4 md:mb-6 leading-tight">
                {activeSlides[currentSlide].title}
              </h1>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-sans text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
                {activeSlides[currentSlide].subtitle}
              </p>
            </>
          )}
        </div>

        {/* Floating Search Rooms Widget */}
        <div className="w-full max-w-6xl mx-auto bg-neutral-900/90 backdrop-blur-md border border-gold-500/15 rounded-md p-4 md:p-6 shadow-2xl shadow-black/90">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end text-left">
            {/* Check In */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check In
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-500 text-white rounded p-2 text-xs font-mono tracking-wider outline-none"
              />
            </div>

            {/* Check Out */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check Out
              </label>
              <input
                type="date"
                required
                min={checkIn || new Date().toISOString().split('T')[0]}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-500 text-white rounded p-2 text-xs font-mono tracking-wider outline-none"
              />
            </div>

            {/* Guests counts */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gold-500" /> Occupancy
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-500 text-white rounded p-2 text-xs outline-none"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Adult{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-500 text-white rounded p-2 text-xs outline-none"
                >
                  {[0, 1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n} Child{n !== 1 ? 'ren' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-gold-500 uppercase flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-gold-500" /> Promo Code
              </label>
              <input
                type="text"
                placeholder="PROMO20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-gold-500 text-white placeholder-neutral-600 rounded p-2 text-xs font-bold tracking-wider outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-neutral-950 font-bold text-xs tracking-widest uppercase rounded py-3.5 transition-colors duration-300 shadow-lg shadow-gold-500/10 cursor-pointer"
            >
              Search Rooms
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
