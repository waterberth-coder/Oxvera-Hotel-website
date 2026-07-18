import React, { useState, useEffect } from 'react';
import { 
  Users, Square, BedDouble, ArrowRight, Loader2, Calendar, 
  Percent, Shield, Coffee, Tv, Wifi, Airplay, CheckCircle, XCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room } from '../types';
import { INITIAL_ROOMS } from '../constants/initialData';
import { formatPrice, CurrencyType } from '../utils/currency';
import { getApiUrl } from '../lib/api';

interface RoomListProps {
  user: User | null;
  searchParams?: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    promoCode: string;
  };
  currency: CurrencyType;
}

export default function RoomList({ user, searchParams, currency = 'NGN' }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Booking states per room
  const [checkInDates, setCheckInDates] = useState<Record<string, string>>({});
  const [checkOutDates, setCheckOutDates] = useState<Record<string, string>>({});
  const [coupons, setCoupons] = useState<Record<string, string>>({});
  const [activeDiscounts, setActiveDiscounts] = useState<Record<string, number>>({}); // % discount
  const [invalidPromo, setInvalidPromo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchRooms() {
      setLoadingRooms(true);
      try {
        const roomsCol = collection(db, 'rooms');
        const snapshot = await getDocs(roomsCol);
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
          setRooms(list);
        }
      } catch (err) {
        console.warn('Could not load live rooms, using initial luxury selection:', err);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, []);

  // Pre-fill dates from hero search if available
  useEffect(() => {
    if (searchParams) {
      const updatedIn: Record<string, string> = {};
      const updatedOut: Record<string, string> = {};
      const updatedPromo: Record<string, string> = {};
      
      rooms.forEach(room => {
        updatedIn[room.id] = searchParams.checkIn;
        updatedOut[room.id] = searchParams.checkOut;
        if (searchParams.promoCode) {
          updatedPromo[room.id] = searchParams.promoCode;
          // Apply initial promo code simulation
          if (searchParams.promoCode.toUpperCase() === 'PROMO20') {
            setActiveDiscounts(prev => ({ ...prev, [room.id]: 20 }));
          }
        }
      });

      setCheckInDates(prev => ({ ...prev, ...updatedIn }));
      setCheckOutDates(prev => ({ ...prev, ...updatedOut }));
      setCoupons(prev => ({ ...prev, ...updatedPromo }));
    }
  }, [searchParams, rooms]);

  const handleApplyPromo = (roomId: string) => {
    const code = (coupons[roomId] || '').toUpperCase().trim();
    if (code === 'PROMO20' || code === 'OXVERA5STAR') {
      setActiveDiscounts(prev => ({ ...prev, [roomId]: 20 }));
      setInvalidPromo(prev => ({ ...prev, [roomId]: false }));
    } else {
      setInvalidPromo(prev => ({ ...prev, [roomId]: true }));
      setActiveDiscounts(prev => ({ ...prev, [roomId]: 0 }));
    }
  };

  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 1;
    const diff = new Date(outDate).getTime() - new Date(inDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleBook = async (room: Room) => {
    const inDate = checkInDates[room.id] || new Date().toISOString().split('T')[0];
    const outDate = checkOutDates[room.id] || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const discount = activeDiscounts[room.id] || 0;
    
    // Original price in Naira converted to USD equivalent for sandbox Stripe processing
    const originalNaira = room.pricePerNight;
    const finalNaira = originalNaira * (1 - discount / 100);
    // Fixed luxury sandbox rate: 1 USD = 1500 NGN
    const usdEquivalent = Math.round(finalNaira / 1500);

    setLoadingId(room.id);
    try {
      const response = await fetch(getApiUrl('/api/create-checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          roomName: room.name,
          pricePerNight: usdEquivalent, // passed in USD to Stripe
          nights: calculateNights(inDate, outDate),
          checkIn: inDate,
          checkOut: outDate,
          userId: user?.uid || 'anonymous-guest'
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Could not configure payments. Ensure your Stripe Secret Keys are set up in the secret settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate transaction.');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredRooms = filterType === 'all' 
    ? rooms 
    : rooms.filter(r => r.type === filterType);

  return (
    <section id="rooms" className="py-24 bg-neutral-950 text-white border-b border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.4em] text-gold-500 font-bold block">Exclusive Accommodations</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white">Our Master Suites</h2>
          </div>
          <p className="max-w-md text-sm text-gray-400 font-light leading-relaxed">
            Every suite is carefully curated to offer premium spaces, custom handcrafted Italian marbles, fast fiber internet, and complimentary gourmet breakfast.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-neutral-800 pb-6">
          {['all', 'standard', 'deluxe', 'suite', 'penthouse'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                filterType === type 
                  ? 'bg-gold-500 text-neutral-950 font-black shadow-lg shadow-gold-500/10' 
                  : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
              }`}
            >
              {type === 'all' ? 'All Suites' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Room Grid */}
        <div className="space-y-16">
          {filteredRooms.map((room) => {
            const currentIn = checkInDates[room.id] || '';
            const currentOut = checkOutDates[room.id] || '';
            const nights = calculateNights(currentIn, currentOut);
            const discount = activeDiscounts[room.id] || 0;
            const finalRate = room.pricePerNight * (1 - discount / 100);
            const isAvailable = room.isAvailable !== false;

            return (
              <div 
                key={room.id}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-neutral-900/40 p-4 md:p-8 rounded-md border border-neutral-800/80 hover:border-gold-500/15 transition-all duration-500"
              >
                {/* Image Section */}
                <div className="lg:col-span-5 relative aspect-[4/3] rounded overflow-hidden shadow-xl">
                  <img 
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000'} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md text-gold-500 border border-gold-500/20 px-3.5 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm">
                    {room.type} Suite
                  </div>
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10 animate-fade-in">
                      <span className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 mb-3 animate-pulse">
                        <XCircle className="w-8 h-8" />
                      </span>
                      <h4 className="text-lg font-serif text-white mb-1 uppercase tracking-wider">Suite Unavailable</h4>
                      <p className="text-[10px] text-gray-400 max-w-[240px] leading-relaxed">
                        This suite is currently booked or temporarily taken offline by property management.
                      </p>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="lg:col-span-7 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <h3 className="text-2xl md:text-3xl font-serif text-white">{room.name}</h3>
                      <div className="text-right">
                        {discount > 0 && (
                          <span className="text-xs text-red-400 line-through block font-mono">
                            {formatPrice(room.pricePerNight, currency)}
                          </span>
                        )}
                        <span className="text-xl md:text-2xl font-serif text-gold-500 font-bold">
                          {formatPrice(finalRate, currency)} <span className="text-[10px] uppercase font-sans tracking-widest text-gray-400 font-light">/ Night</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs font-light leading-relaxed mb-6">
                      {room.description}
                    </p>

                    {/* Room Stats */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-neutral-800 text-xs text-gray-400 font-mono mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold-500" />
                        <span>Max {room.capacity} Guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-gold-500" />
                        <span>{room.size || '35m²'} space</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-gold-500" />
                        <span>{room.bed || 'King Bed'}</span>
                      </div>
                    </div>

                    {/* Dynamic Reservation Options */}
                    <div className={`bg-neutral-950 p-4 rounded border border-neutral-800 space-y-4 ${!isAvailable ? 'opacity-40 select-none pointer-events-none' : ''}`}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gold-500 uppercase">Check In</span>
                          <input 
                            type="date"
                            disabled={!isAvailable}
                            min={new Date().toISOString().split('T')[0]}
                            value={currentIn}
                            onChange={(e) => setCheckInDates(prev => ({ ...prev, [room.id]: e.target.value }))}
                            className="bg-neutral-900 border border-neutral-800 text-white rounded p-1.5 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gold-500 uppercase">Check Out</span>
                          <input 
                            type="date"
                            disabled={!isAvailable}
                            min={currentIn || new Date().toISOString().split('T')[0]}
                            value={currentOut}
                            onChange={(e) => setCheckOutDates(prev => ({ ...prev, [room.id]: e.target.value }))}
                            className="bg-neutral-900 border border-neutral-800 text-white rounded p-1.5 text-xs outline-none"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-gold-500 uppercase flex justify-between">
                            Promo Code
                            {discount > 0 && <span className="text-green-400 lowercase font-mono">20% off applied</span>}
                          </span>
                          <div className="flex gap-1">
                            <input 
                              type="text"
                              disabled={!isAvailable}
                              placeholder="PROMO20"
                              value={coupons[room.id] || ''}
                              onChange={(e) => setCoupons(prev => ({ ...prev, [room.id]: e.target.value }))}
                              className={`w-full bg-neutral-900 border text-white rounded p-1.5 text-xs outline-none font-bold tracking-wider ${
                                invalidPromo[room.id] ? 'border-red-500' : 'border-neutral-800'
                              }`}
                            />
                            <button 
                              onClick={() => handleApplyPromo(room.id)}
                              disabled={!isAvailable}
                              className="px-2.5 bg-neutral-800 hover:bg-neutral-700 text-gold-500 font-bold rounded text-xs cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>

                      {currentIn && currentOut && isAvailable && (
                        <div className="flex justify-between items-center bg-gold-500/5 p-2 rounded border border-gold-500/10 text-xs">
                          <span className="text-gray-300 font-light">Duration: <strong className="text-white font-mono">{nights} night{nights > 1 ? 's' : ''}</strong></span>
                          <span className="text-gray-300 font-light">Estimated Total: <strong className="text-gold-500 font-bold text-sm">{formatPrice(finalRate * nights, currency)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isAvailable ? (
                    <button 
                      onClick={() => handleBook(room)}
                      disabled={loadingId === room.id}
                      className="w-full mt-6 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 text-neutral-950 font-bold text-xs tracking-widest uppercase rounded py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold-500/15"
                    >
                      {loadingId === room.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> Securing Luxury Room...
                        </>
                      ) : (
                        <>
                          Confirm Stay & Pay <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full mt-6 bg-neutral-900 border border-neutral-800 text-red-500 font-bold text-xs tracking-widest uppercase rounded py-3.5 flex items-center justify-center gap-2 cursor-not-allowed font-mono"
                    >
                      <XCircle className="w-4 h-4" /> Fully Booked / Unavailable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
