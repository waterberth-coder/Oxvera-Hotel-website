import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Calendar, CreditCard, Hotel, DollarSign, Loader2, Printer } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { formatPrice, CurrencyType } from '../utils/currency';

interface RoomData {
  name: string;
  pricePerNight: number;
}

interface BookingSuccessProps {
  currency: CurrencyType;
}

export default function BookingSuccess({ currency = 'NGN' }: BookingSuccessProps) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [persisted, setPersisted] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Email and Calendar States
  const [emailInput, setEmailInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const p: Record<string, string> = {};
    urlParams.forEach((val, key) => p[key] = val);
    setParams(p);

    if (p.roomId) {
      fetchRoomData(p.roomId, p);
    } else {
      setLoadingRoom(false);
    }

    // Auto populate email input if user is signed in
    if (auth.currentUser?.email) {
      setEmailInput(auth.currentUser.email);
    }
  }, []);

  const generateICSFile = () => {
    const roomName = roomData ? roomData.name : 'Deluxe King Suite';
    const checkInDate = params.checkIn || new Date().toISOString().split('T')[0];
    const checkOutDate = params.checkOut || new Date().toISOString().split('T')[0];
    
    // Format checkIn/checkOut for ICS: YYYYMMDD
    const start = checkInDate.replace(/-/g, '');
    const end = checkOutDate.replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Oxvera Hotel//Reservation Calendar//EN',
      'BEGIN:VEVENT',
      `UID:oxvera-${params.session_id || 'guest'}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:Oxvera Hotel Stay - ${roomName}`,
      `DESCRIPTION:Your stay is confirmed!\\nTransaction ID: ${params.session_id || 'N/A'}\\nCheck-In: ${checkInDate}\\nCheck-Out: ${checkOutDate}`,
      'LOCATION:Oxvera Boulevard, GRA Phase II, Umuahia, Abia State, Nigeria',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `oxvera_booking_${params.session_id || 'stay'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGoogleCalendarUrl = () => {
    const roomName = roomData ? roomData.name : 'Deluxe King Suite';
    const checkInDate = params.checkIn || new Date().toISOString().split('T')[0];
    const checkOutDate = params.checkOut || new Date().toISOString().split('T')[0];
    
    const start = checkInDate.replace(/-/g, '');
    const end = checkOutDate.replace(/-/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Oxvera Hotel Stay - ${roomName}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Your stay at Oxvera Hotel is confirmed!\n\nBooking Reference: ${params.session_id || 'N/A'}\nCheck-In Date: ${checkInDate}\nCheck-Out Date: ${checkOutDate}\n\nWe look forward to welcoming you!`)}&location=${encodeURIComponent('Oxvera Boulevard, GRA Phase II, Umuahia, Abia State, Nigeria')}`;
  };

  const handleSendEmailReceipt = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setSendingEmail(true);
    setEmailError('');
    setEmailSuccess(false);

    try {
      const response = await fetch('/api/send-email-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          roomName: roomData ? roomData.name : 'Deluxe King Suite',
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          sessionId: params.session_id,
          totalPrice: roomData ? roomData.pricePerNight * nightsCount : 95000,
          currency: currency
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailSuccess(true);
      } else {
        setEmailError(result.error || 'Failed to dispatch email receipt via Firebase Cloud Function emulation.');
      }
    } catch (err: any) {
      console.error("Error sending receipt:", err);
      setEmailError('Network error. Unable to trigger receipt function.');
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchRoomData = async (roomId: string, p: Record<string, string>) => {
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', roomId));
      let currentRoom: RoomData | null = null;
      if (roomDoc.exists()) {
        const data = roomDoc.data() as RoomData;
        setRoomData(data);
        currentRoom = data;
      }
      
      // Persist stay after verifying details
      if (p.session_id && !persisted) {
        await persistBooking(p, currentRoom);
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setLoadingRoom(false);
    }
  };

  const calculateStayNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 1;
    const diff = new Date(outDate).getTime() - new Date(inDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const persistBooking = async (p: Record<string, string>, currentRoom: RoomData | null) => {
    try {
      const nights = calculateStayNights(p.checkIn, p.checkOut);
      
      // Calculate rate
      const rate = currentRoom ? currentRoom.pricePerNight : 95000;
      const finalNaira = rate * nights;
      
      // Convert to USD equivalent for standard DB metadata storage (1 USD = 1500 NGN)
      const usdTotal = Math.round(finalNaira / 1500);

      await setDoc(doc(db, 'bookings', p.session_id), {
        userId: p.userId || 'anonymous-guest',
        roomId: p.roomId,
        roomName: currentRoom ? currentRoom.name : 'Deluxe King Suite',
        checkIn: p.checkIn,
        checkOut: p.checkOut,
        totalPrice: usdTotal, // stored in USD for checkout representation
        status: 'confirmed',
        paymentIntentId: p.session_id,
        guestName: 'Prestigious Guest',
        createdAt: new Date().toISOString()
      });
      setPersisted(true);
    } catch (e) {
      console.error("Error persisting booking:", e);
    }
  };

  const nightsCount = params.checkIn && params.checkOut ? calculateStayNights(params.checkIn, params.checkOut) : 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4 py-24 select-none font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-neutral-900 p-8 md:p-12 text-center rounded-lg shadow-2xl border border-neutral-800"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-16 h-16 bg-green-500/10 border border-green-500/25 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
        </div>

        <h2 className="text-3xl font-serif text-white mb-2">Reservation Confirmed</h2>
        <p className="text-xs text-gray-400 font-light leading-relaxed mb-8">
          Your stay at Oxvera Hotel is secured. A premium luxury suite awaits your arrival.
        </p>

        <div className="space-y-4 text-left border-y border-neutral-800 py-6 mb-8 text-xs font-mono text-gray-300">
          {loadingRoom ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-gold-500" /> Room Selected
                </span>
                <span className="text-white font-bold">{roomData ? roomData.name : 'Deluxe King Suite'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gold-500" /> Stay Duration
                </span>
                <span className="text-white font-bold">{nightsCount} Night{nightsCount > 1 ? 's' : ''}</span>
              </div>

              {roomData && (
                <div className="flex justify-between items-center bg-gold-500/5 p-3 rounded border border-gold-500/10 text-xs">
                  <span className="text-gray-300">Total Paid (Est)</span>
                  <span className="text-gold-500 font-bold text-sm">
                    {formatPrice(roomData.pricePerNight * nightsCount, currency)}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check In
            </span>
            <span className="text-white">{params.checkIn}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check Out
            </span>
            <span className="text-white">{params.checkOut}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-gold-500" /> Booking Transaction
            </span>
            <span className="text-white truncate max-w-[150px]">{params.session_id}</span>
          </div>
        </div>

        {/* Calendar & Email Actions */}
        <div className="space-y-4 border-b border-neutral-800 pb-6 mb-8 text-left">
          <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest flex items-center gap-1.5">
            Reservation Options
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Add to Google Calendar */}
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-3 rounded text-[11px] font-semibold text-gray-200 transition-all text-center cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              <span>Google Calendar</span>
            </a>

            {/* Download iCal */}
            <button
              onClick={generateICSFile}
              className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-3 rounded text-[11px] font-semibold text-gray-200 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              <span>Download iCal</span>
            </button>
          </div>

          {/* Email Receipt Input Form */}
          <div className="bg-neutral-950 p-4 rounded border border-neutral-850 space-y-2.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Send Email Receipt (Cloud Function)</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1 bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-xs outline-none focus:border-gold-500/55 transition-all"
              />
              <button
                onClick={handleSendEmailReceipt}
                disabled={sendingEmail}
                className="px-4 py-2.5 bg-gold-500 text-neutral-950 font-bold uppercase tracking-wider text-[10px] rounded hover:bg-gold-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
            {emailSuccess && (
              <p className="text-[10px] text-green-400 font-medium">Receipt emailed successfully via Cloud Function!</p>
            )}
            {emailError && (
              <p className="text-[10px] text-red-400 font-medium">{emailError}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/"
            className="flex-1 bg-gold-500 text-neutral-950 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors flex items-center justify-center gap-2 rounded cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return Home
          </a>
          <button 
            onClick={() => window.print()}
            className="flex-1 border border-neutral-800 hover:border-gold-500 hover:text-gold-500 text-gray-300 py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}
