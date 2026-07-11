import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-neutral-950 text-white select-none border-t border-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 border border-gold-500 rounded-full flex items-center justify-center">
              <span className="text-gold-500 font-serif font-bold text-sm">O</span>
            </div>
            <div>
              <span className="text-white font-serif font-bold tracking-widest text-base block leading-none">OXVERA</span>
              <span className="text-gold-500/80 font-sans tracking-[0.2em] text-[7px] font-bold block uppercase mt-0.5">Luxury Hotel</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Ranked as the <strong>best hotel in Umuahia</strong>, Oxvera Hotel offers affordable luxury, contemporary suite accommodations, secure VIP facilities, constant 24h electricity, and authentic hospitality in the heart of Abia State.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Directory Links */}
        <div className="md:col-span-4 grid grid-cols-2 gap-8 text-xs font-light">
          <div>
            <h4 className="font-bold text-gold-500 uppercase tracking-widest mb-6 font-mono text-[10px]">Accommodations</h4>
            <ul className="space-y-3 text-gray-400">
              <li><button onClick={() => onNavigate('rooms')} className="hover:text-gold-500 transition-colors cursor-pointer">Deluxe King Suites</button></li>
              <li><button onClick={() => onNavigate('rooms')} className="hover:text-gold-500 transition-colors cursor-pointer">Executive Garden Suite</button></li>
              <li><button onClick={() => onNavigate('rooms')} className="hover:text-gold-500 transition-colors cursor-pointer">Royal Skylines</button></li>
              <li><button onClick={() => onNavigate('rooms')} className="hover:text-gold-500 transition-colors cursor-pointer">Queen Corporate Rooms</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gold-500 uppercase tracking-widest mb-6 font-mono text-[10px]">Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><button onClick={() => onNavigate('dining')} className="hover:text-gold-500 transition-colors cursor-pointer">Onyx Restaurant</button></li>
              <li><button onClick={() => onNavigate('spa')} className="hover:text-gold-500 transition-colors cursor-pointer">Wellness & Spa</button></li>
              <li><button onClick={() => onNavigate('cars')} className="hover:text-gold-500 transition-colors cursor-pointer">VIP Car Fleet hire</button></li>
              <li><button onClick={() => onNavigate('events')} className="hover:text-gold-500 transition-colors cursor-pointer">Ballroom Event Hall</button></li>
            </ul>
          </div>
        </div>

        {/* Google Map embed */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-bold text-gold-500 uppercase tracking-widest font-mono text-[10px]">Hotel Location</h4>
          <div className="w-full h-32 rounded overflow-hidden border border-neutral-800">
            <iframe 
              title="Oxvera Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15886.726207135065!2d7.4891152!3d5.525547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1042dc0884617be3%3A0x6b107e3a241e5da2!2sUmuahia!5e0!3m2!1sen!2sng!4v1688998822998!5m2!1sen!2sng" 
              className="w-full h-full border-0 grayscale invert opacity-75 focus:outline-none"
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
          <div className="text-[11px] text-gray-400 space-y-1.5 font-light">
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gold-500" /> Oxvera Boulevard, GRA Phase II, Umuahia</div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gold-500" /> +234 80 OXVERA (698372)</div>
          </div>
        </div>

      </div>

      <div className="border-t border-neutral-900 py-6 text-center text-[10px] text-gray-500">
        © {new Date().getFullYear()} Oxvera Hotel. All Rights Reserved. Crafted with international 5-star standards.
      </div>
    </footer>
  );
}
