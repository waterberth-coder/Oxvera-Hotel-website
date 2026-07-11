import React, { useState, useEffect } from 'react';
import { 
  Building, Utensils, GlassWater, Waves, Car, Award, Shield, Zap, Wifi,
  Calendar, Users, Trophy, ChevronRight, Play, Eye
} from 'lucide-react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface FacilitiesProps {
  onBookRoom: () => void;
  onNavigate: (view: string) => void;
}

export default function Facilities({ onBookRoom, onNavigate }: FacilitiesProps) {
  // Philosophy Scroll Trigger
  const { elementRef: philRef, hasIntersected: philSeen } = useIntersectionObserver({ threshold: 0.15 });
  
  // Counters State
  const [satisfaction, setSatisfaction] = useState(0);
  const [roomsCount, setRoomsCount] = useState(0);
  const [guestsCount, setGuestsCount] = useState(0);

  // Pool Day/Night Toggle
  const [poolTime, setPoolTime] = useState<'day' | 'night'>('day');

  useEffect(() => {
    if (philSeen) {
      // Animate Guest Satisfaction counter (0 to 98)
      let sat = 0;
      const satInterval = setInterval(() => {
        sat += 2;
        if (sat >= 98) {
          setSatisfaction(98);
          clearInterval(satInterval);
        } else {
          setSatisfaction(sat);
        }
      }, 30);

      // Animate Luxury Rooms counter (0 to 150)
      let rms = 0;
      const rmsInterval = setInterval(() => {
        rms += 3;
        if (rms >= 150) {
          setRoomsCount(150);
          clearInterval(rmsInterval);
        } else {
          setRoomsCount(rms);
        }
      }, 25);

      // Animate Happy Guests counter (0 to 5000)
      let gst = 0;
      const gstInterval = setInterval(() => {
        gst += 100;
        if (gst >= 5000) {
          setGuestsCount(5000);
          clearInterval(gstInterval);
        } else {
          setGuestsCount(gst);
        }
      }, 20);

      return () => {
        clearInterval(satInterval);
        clearInterval(rmsInterval);
        clearInterval(gstInterval);
      };
    }
  }, [philSeen]);

  const quickFacilities = [
    { icon: <Building className="w-5 h-5" />, label: 'Luxury Rooms' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Restaurant' },
    { icon: <GlassWater className="w-5 h-5" />, label: 'Executive Bar' },
    { icon: <Waves className="w-5 h-5" />, label: 'Swimming Pool' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Wellness Spa' },
    { icon: <Car className="w-5 h-5" />, label: 'Airport Pickup' },
    { icon: <Car className="w-5 h-5" />, label: 'Car Hire Fleet' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Event Hall' },
    { icon: <Award className="w-5 h-5" />, label: 'Pulse Gym' },
    { icon: <Wifi className="w-5 h-5" />, label: 'High-Speed WiFi' },
    { icon: <Shield className="w-5 h-5" />, label: '24h Security' },
    { icon: <Zap className="w-5 h-5" />, label: 'Constant Power' },
  ];

  return (
    <div className="bg-neutral-950 text-white select-none">
      
      {/* Quick Facilities Bar */}
      <section className="py-12 bg-neutral-900 border-y border-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gold-500 uppercase">World-Class Conveniences</span>
            <h2 className="text-xl md:text-2xl font-serif text-white mt-1">Quick Premier Amenities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {quickFacilities.map((fac, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center p-4 bg-neutral-950/40 rounded border border-neutral-800 hover:border-gold-500/45 hover:scale-[1.03] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold-500/5 text-gold-500 group-hover:bg-gold-500 group-hover:text-neutral-950 transition-all duration-300 mb-2">
                  {fac.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-300 text-center">{fac.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Philosophy Section (Intersection Observed) */}
      <section ref={philRef} className="py-24 overflow-hidden border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image Fades Left */}
            <div className={`lg:col-span-6 transform transition-all duration-1000 ${
              philSeen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <div className="relative pl-6 pb-6">
                <div className="absolute inset-0 border border-gold-500/20 translate-x-3 translate-y-3 rounded" />
                <img 
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000" 
                  alt="Oxvera Grand Lobby" 
                  className="relative z-10 w-full h-[400px] object-cover rounded shadow-2xl"
                />
              </div>
            </div>

            {/* Text Fades Right */}
            <div className={`lg:col-span-6 transform transition-all duration-1000 delay-200 ${
              philSeen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-2">Our Philosophy</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 tracking-wide leading-snug">Hospitality Redefined</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-8">
                At Oxvera Hotel, we believe that every guest deserves more than just accommodation—they deserve an experience. Every detail, from our luxurious rooms to our personalized services, has been thoroughly designed to create unforgettable moments. Whether you're visiting for business, relaxation, or celebration, our commitment to excellence ensures that every stay is defined by comfort, elegance, and genuine hospitality.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <button 
                  onClick={() => onNavigate('about')}
                  className="px-6 py-3 border border-gold-500/40 hover:border-gold-500 text-gold-500 text-xs font-bold tracking-widest rounded transition-all duration-300 uppercase cursor-pointer"
                >
                  Learn More
                </button>
                <button 
                  onClick={onBookRoom}
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest rounded transition-all duration-300 uppercase cursor-pointer"
                >
                  Book Your Stay
                </button>
              </div>
            </div>

          </div>

          {/* Cards Slide Upward (Counters stats) */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 transform transition-all duration-1000 delay-500 ${
            philSeen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 text-center">
              <span className="text-4xl font-serif text-gold-500 font-bold block mb-1">{satisfaction}%</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Guest Satisfaction</span>
            </div>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 text-center">
              <span className="text-4xl font-serif text-gold-500 font-bold block mb-1">{roomsCount}+</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Luxury Rooms</span>
            </div>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 text-center">
              <span className="text-4xl font-serif text-gold-500 font-bold block mb-1">{guestsCount}+</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Happy Guests</span>
            </div>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 text-center">
              <span className="text-4xl font-serif text-gold-500 font-bold block mb-1">5★</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Luxury Rating</span>
            </div>
          </div>

        </div>
      </section>

      {/* Culinary / Dining Section */}
      <section className="py-24 bg-neutral-900/50 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Fine Culinary Art</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Onyx Michelin Restaurant</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-6">
                Under the guidance of award-winning master chefs, Onyx presents a stunning journey across traditional Nigerian delicacy structures paired with sophisticated continental techniques. Prepared strictly with organic, premium ingredients sourced daily.
              </p>
              <div className="border-l-2 border-gold-500 pl-4 italic text-sm text-gray-400 mb-8">
                "An unforgettable symphony of premium fire-roasted grills, smoky African peppers, and classic culinary craftsmanship."
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('dining')}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest rounded uppercase cursor-pointer"
                >
                  View Dining Menu
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000" 
                alt="Fine Dining" 
                className="w-full h-[450px] object-cover rounded shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Obsidian Executive Bar (Luxury Dark) */}
      <section className="py-24 bg-black border-b border-neutral-900 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Cocktails" 
                className="w-full h-[450px] object-cover rounded shadow-2xl border border-gold-500/10"
              />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Elite Lounging</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 text-white">The Obsidian Executive Bar</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-6">
                Indulge in our collection of globally imported single malts, curated vintage cognacs, and bespoke cocktails tailored specifically to your palette. Featuring live classical jazz bands every weekend, ambient acoustic settings, and highly secure VIP lounge facilities for our high-profile guests.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs tracking-wider uppercase text-gray-400 font-mono mb-8">
                <div className="flex items-center gap-2">✔ Handcrafted Cocktails</div>
                <div className="flex items-center gap-2">✔ Premium Old-World Wines</div>
                <div className="flex items-center gap-2">✔ Cozy Live Jazz Lounge</div>
                <div className="flex items-center gap-2">✔ Ultra Private VIP Vault</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Bar & Heated Infinity Pool */}
      <section className="py-24 bg-neutral-900/40 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Azure Oasis</span>
              <h2 className="text-3xl font-serif">Poolside & Cocktails</h2>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0 bg-neutral-950 p-1 rounded border border-neutral-800">
              <button 
                onClick={() => setPoolTime('day')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  poolTime === 'day' ? 'bg-gold-500 text-neutral-950' : 'text-gray-400'
                }`}
              >
                Daylight
              </button>
              <button 
                onClick={() => setPoolTime('night')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  poolTime === 'night' ? 'bg-gold-500 text-neutral-950' : 'text-gray-400'
                }`}
              >
                Twilight DJ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 relative rounded overflow-hidden h-[400px]">
              <img 
                src={
                  poolTime === 'day' 
                    ? 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200'
                    : 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200'
                } 
                alt="Azure Swimming Pool" 
                className="w-full h-full object-cover transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-mono uppercase text-gold-500 tracking-widest">
                  {poolTime === 'day' ? 'Heated Family & Adults Loungers' : 'Sunset BBQ & DJ Beats'}
                </span>
                <p className="text-white text-lg font-serif mt-1">
                  {poolTime === 'day' ? 'Azure Panorama Swimming Pool' : 'Weekend Neon Pool Deck Parties'}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Sunset Pool Bar</span>
                <h3 className="text-lg font-serif mb-4">The Blue Horizon</h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">
                  Sip on ice-cold tropical slushes, fresh coconut mixes, and prime flame-grilled wood-fired BBQ ribs served directly to your poolside lounger bed.
                </p>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Cocktail Specials</span>
                    <span className="text-gold-500 font-bold">₦6,500</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span>Flame Grilled Platter</span>
                    <span className="text-gold-500 font-bold">₦15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Happy Hour Slots</span>
                    <span className="text-gold-500 font-bold">4:00 PM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spa & Wellness */}
      <section className="py-24 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Sanctuary</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Ananda Wellness & Spa</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-6">
                Discover absolute bliss. Ananda Spa offers an immersive sanctuary of private healing therapy rooms, specialized deep-tissue Swedish and hot stone massage routines, relaxing steam bath systems, organic micro-peel facials, and customized aromatherapy oils.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('spa')}
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest rounded uppercase cursor-pointer"
                >
                  Book Therapy Session
                </button>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000" 
                alt="Therapy Room" 
                className="w-full h-[400px] object-cover rounded shadow-2xl border border-gold-500/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pulse Fitness Gymnasium */}
      <section className="py-24 bg-neutral-900/30 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000" 
                alt="Fitness Gymnasium" 
                className="w-full h-[400px] object-cover rounded shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Strength & Health</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Pulse Athletic Gym</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-6">
                Achieve your physical peak using state-of-the-art cardiovascular running machines, targeted strength systems, comprehensive free-weight stations, and dedicated spaces for yoga or core Pilates training. Guided by fully certified personal trainers.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('gym')}
                  className="px-5 py-2.5 border border-gold-500/40 hover:border-gold-500 text-gold-500 text-xs font-bold tracking-widest rounded uppercase cursor-pointer"
                >
                  Explore Gym Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Car Services */}
      <section className="py-24 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase">Prestige Logistics</span>
            <h2 className="text-3xl font-serif mt-1">Car Hiring & Airport Transport</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 hover:border-gold-500/20 transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=400" 
                alt="Premium SUV" 
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-serif mb-2">Luxury SUV Escort</h3>
              <p className="text-gray-400 text-xs mb-4">Command the roads in comfort with fully chauffeured VIP Range Rovers or Toyota Prado bulletproof escorts.</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 hover:border-gold-500/20 transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400" 
                alt="Premium Sedan" 
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-serif mb-2">Mercedes-Benz S-Class</h3>
              <p className="text-gray-400 text-xs mb-4">Arrive at your meetings and high-profile wedding events in pure sophistication with professional chauffeurs.</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded border border-neutral-800 hover:border-gold-500/20 transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400" 
                alt="Shuttle Service" 
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-serif mb-2">Airport VIP Shuttles</h3>
              <p className="text-gray-400 text-xs mb-4">Direct private logistics from nearby airports (Owerri/Port Harcourt/Enugu) straight to the Oxvera suites lobby.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <button 
              onClick={() => onNavigate('cars')}
              className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest rounded uppercase cursor-pointer"
            >
              Reserve Transit Vehicle
            </button>
          </div>
        </div>
      </section>

      {/* Oxvera Event Center */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-gold-500 uppercase block mb-1">Celebrations & Summits</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Imperial Event Grand Ballroom</h2>
              <p className="text-gray-300 text-sm font-light leading-relaxed mb-6">
                Host your dream luxury weddings, high-security regional corporate conferences, birthdays, or academic banquets in our exquisite, 50-to-600 capacity ballroom structure. Fully air-conditioned with modern acoustics and premium banquet support services.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs tracking-wider uppercase text-gray-400 font-mono mb-8">
                <div>👥 50 - 600 Guests Capacity</div>
                <div>🔊 Executive Sound & Mic System</div>
                <div>❄ Constant Heavy AC Cooling</div>
                <div>🍷 Complete Catering Service</div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('events')}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest rounded uppercase cursor-pointer"
                >
                  Book Event Space
                </button>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000" 
                alt="Grand Ballroom Event" 
                className="w-full h-[400px] object-cover rounded shadow-2xl border border-gold-500/10"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
