import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../constants/initialData';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % INITIAL_TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + INITIAL_TESTIMONIALS.length) % INITIAL_TESTIMONIALS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % INITIAL_TESTIMONIALS.length);
  };

  return (
    <section className="py-24 bg-neutral-900 border-b border-neutral-800 select-none">
      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <span className="text-[10px] font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3">Guest Experience</span>
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-12">Verified Guest Praise</h2>

        {/* Big Quote Symbol */}
        <Quote className="w-12 h-12 text-gold-500/20 mx-auto mb-6" />

        {/* Carousel Content */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {INITIAL_TESTIMONIALS.map((test, idx) => (
            <div
              key={test.id}
              className={`transition-all duration-700 ease-in-out ${
                idx === activeIndex ? 'opacity-100 scale-100 block' : 'opacity-0 scale-95 hidden'
              }`}
            >
              <p className="text-lg md:text-xl font-light font-serif text-gray-200 leading-relaxed max-w-2xl mx-auto mb-8">
                "{test.comment}"
              </p>
              
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>

              {/* Guest metadata */}
              <h4 className="text-xs font-bold tracking-widest text-gold-500 uppercase mb-1">{test.guestName}</h4>
              <span className="text-[10px] font-mono uppercase text-gray-500">{test.source}</span>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
