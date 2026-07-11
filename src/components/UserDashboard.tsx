import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Calendar, CheckCircle, Clock, XCircle, 
  MapPin, Phone, Mail, FileText, Printer, Shield, Gift, ArrowLeft, Award
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking } from '../types';
import { formatPrice, CurrencyType } from '../utils/currency';
import { jsPDF } from 'jspdf';

interface UserDashboardProps {
  user: FirebaseUser;
  onNavigate: (view: string) => void;
  currency: CurrencyType;
}

export default function UserDashboard({ user, onNavigate, currency = 'NGN' }: UserDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    async function fetchUserBookings() {
      try {
        const bookingsCol = collection(db, 'bookings');
        const q = query(bookingsCol, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        // Sort bookings by creation date descending
        list.sort((a, b) => {
          const tA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const tB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return tB - tA;
        });
        setBookings(list);
      } catch (err) {
        console.error('Error loading guest bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserBookings();
  }, [user]);

  // Calculate and store Loyalty points in Firestore automatically
  useEffect(() => {
    const completedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed' || !b.status);
    let totalNgnSpent = 0;
    completedBookings.forEach(b => {
      totalNgnSpent += b.totalPrice * 1500;
    });

    const calculatedPoints = Math.floor(totalNgnSpent / 1000);
    setLoyaltyPoints(calculatedPoints);

    const savePoints = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { loyaltyPoints: calculatedPoints }, { merge: true });
      } catch (err) {
        console.warn("Could not save loyalty points to users collection:", err);
      }
    };
    if (bookings.length > 0) {
      savePoints();
    }
  }, [bookings, user.uid]);

  const getLoyaltyTier = (points: number) => {
    if (points >= 3000) return { name: 'Diamond Sovereign', color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5', iconColor: 'text-cyan-400', nextTier: 'Max Tier reached', nextPoints: 0, benefits: ['Complimentary Airport Pickup', '15% Off Spa treatments', 'Late check-out 4 PM', 'Free VIP Lounge Access'] };
    if (points >= 1000) return { name: 'Gold Premium', color: 'text-gold-500 border-gold-500/25 bg-gold-500/5', iconColor: 'text-gold-500', nextTier: 'Diamond Sovereign', nextPoints: 3000, benefits: ['Late check-out 2 PM', '10% Off Onyx Dining', 'Welcome elite zobo cocktail'] };
    if (points >= 300) return { name: 'Silver Elite', color: 'text-gray-300 border-gray-400/20 bg-gray-400/5', iconColor: 'text-gray-300', nextTier: 'Gold Premium', nextPoints: 1000, benefits: ['Complimentary High-speed WiFi', 'Late check-out 1 PM'] };
    return { name: 'Bronze Member', color: 'text-amber-600 border-amber-600/20 bg-amber-600/5', iconColor: 'text-amber-600', nextTier: 'Silver Elite', nextPoints: 300, benefits: ['Complimentary welcome beverage'] };
  };

  const currentTier = getLoyaltyTier(loyaltyPoints);

  const downloadPDF = (invoice: Booking) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const goldColor = [197, 160, 89]; // #c5a059
      const darkColor = [26, 26, 26]; // #1a1a1a
      const lightGray = [245, 245, 245];
      const textGray = [115, 115, 115];

      // Title & Header Border
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // Hotel Brand Logo
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('OXVERA HOTEL', 15, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text('OXVERA BOULEVARD, GRA PHASE II, UMUAHIA, NIGERIA', 15, 25);
      doc.text('PHONE: +234 80 OXVERA | EMAIL: CONTACT@OXVERAHOTEL.COM', 15, 30);

      // Invoice Label
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setFontSize(26);
      doc.setFont('Helvetica', 'bold');
      doc.text('INVOICE', 195, 22, { align: 'right' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.text(`NO: INV-${invoice.id ? invoice.id.substring(0, 8).toUpperCase() : 'N/A'}`, 195, 30, { align: 'right' });

      // Body Section (Billed to & Reservation info)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.text('BILLED TO:', 15, 55);

      doc.setFont('Helvetica', 'normal');
      doc.text(invoice.guestName || user.displayName || 'Prestigious Guest', 15, 61);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text(invoice.guestEmail || user.email || '', 15, 66);

      // Reservation metadata
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.text('RESERVATION DETAILS:', 115, 55);

      doc.setFont('Helvetica', 'normal');
      doc.text(`Suite Type: ${invoice.roomName || 'Oxvera Luxury Suite'}`, 115, 61);
      doc.text(`Check In: ${invoice.checkIn}`, 115, 66);
      doc.text(`Check Out: ${invoice.checkOut}`, 115, 71);
      
      const nights = calculateStayNights(invoice.checkIn, invoice.checkOut);
      doc.text(`Stay Duration: ${nights} Night${nights > 1 ? 's' : ''}`, 115, 76);

      // Line Separator
      doc.setDrawColor(220, 220, 220);
      doc.line(15, 84, 195, 84);

      // Invoice Items Table Headers
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, 90, 180, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Item Description', 18, 95);
      doc.text('Nights', 105, 95, { align: 'center' });
      doc.text('Rate / Night', 140, 95, { align: 'right' });
      doc.text('Total Price', 190, 95, { align: 'right' });

      // Item Value row
      doc.setFont('Helvetica', 'normal');
      doc.text(invoice.roomName || 'Oxvera Executive Suite', 18, 107);
      doc.text(nights.toString(), 105, 107, { align: 'center' });
      
      const rate = Math.round((invoice.totalPrice / nights) * 1500);
      const totalAmount = Math.round(invoice.totalPrice * 1500);

      doc.text(formatPrice(rate, currency), 140, 107, { align: 'right' });
      doc.setFont('Helvetica', 'bold');
      doc.text(formatPrice(totalAmount, currency), 190, 107, { align: 'right' });

      // Divider line
      doc.line(15, 115, 195, 115);

      // Summary Totals
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text('Payment Method: Card Checkout (Stripe)', 15, 126);
      doc.text('Transaction Status: PAID & SECURED', 15, 131);

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('Helvetica', 'bold');
      doc.text('Total Amount Paid:', 135, 126, { align: 'right' });
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setFontSize(14);
      doc.text(formatPrice(totalAmount, currency), 190, 126, { align: 'right' });

      // Fine details/footer
      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 145, 195, 145);

      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(10);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text('Thank you for choosing Oxvera Hotel. We look forward to welcoming you back to contemporary hospitality.', 105, 155, { align: 'center' });

      // Save PDF
      doc.save(`Oxvera_Invoice_INV-${invoice.id ? invoice.id.substring(0,8).toUpperCase() : 'RESERVATION'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF with jsPDF:', err);
      alert('Could not generate PDF. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to request cancellation for this booking? Our team will review the transaction.')) {
      return;
    }
    try {
      const bRef = doc(db, 'bookings', bookingId);
      await updateDoc(bRef, { status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      alert('Cancellation request submitted successfully.');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Could not complete cancellation request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded border border-green-500/15"><CheckCircle className="w-3.5 h-3.5" /> Confirmed</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold tracking-widest uppercase rounded border border-yellow-500/15"><Clock className="w-3.5 h-3.5 animate-pulse" /> Pending</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase rounded border border-red-500/15"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase rounded border border-blue-500/15">Completed</span>;
    }
  };

  const calculateStayNights = (inD: string, outD: string) => {
    const diff = new Date(outD).getTime() - new Date(inD).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  return (
    <div className="py-24 bg-neutral-950 text-white min-h-screen border-b border-neutral-900 select-none font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs text-gold-500 hover:text-gold-400 mb-8 tracking-widest uppercase transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Guest Profile Left Rail */}
          <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6 self-start">
            <div className="flex flex-col items-center text-center pb-6 border-b border-neutral-800">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Guest'} 
                  className="w-20 h-20 rounded-full border border-gold-500/30 shadow-lg mb-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gold-500/5 border border-gold-500/30 flex items-center justify-center mb-4 text-gold-500">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
              <h2 className="text-xl font-serif text-white">{user.displayName || 'Prestigious Guest'}</h2>
              <span className="text-[10px] font-mono text-gold-500 uppercase tracking-widest mt-1">Oxvera Club Member</span>
            </div>

            {/* Profile Info fields */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-gold-500" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="w-4 h-4 text-gold-500" />
                <span>Account Verified</span>
              </div>
            </div>

            {/* Loyalty Points Section */}
            <div className="py-6 border-y border-neutral-800 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-widest uppercase text-gold-500">Loyalty Club</h3>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentTier.color}`}>
                  {currentTier.name}
                </span>
              </div>

              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase font-mono">Available Balance</span>
                    <strong className="text-xl font-serif text-white">{loyaltyPoints.toLocaleString()} <span className="text-xs font-sans font-light text-gold-500">Points</span></strong>
                  </div>
                  <Award className={`w-8 h-8 ${currentTier.iconColor}`} />
                </div>

                {currentTier.nextPoints > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-gray-400">
                      <span>Next: {currentTier.nextTier}</span>
                      <span>{loyaltyPoints} / {currentTier.nextPoints} pts</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="bg-gold-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (loyaltyPoints / currentTier.nextPoints) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-cyan-400 font-serif italic">★ Ultimate sovereign status achieved</p>
                )}
              </div>

              {/* Benefits list */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">Your Tier Benefits:</span>
                <ul className="text-[11px] text-gray-300 space-y-1 pl-1">
                  {currentTier.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gold-500 rounded-full shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 text-left">
              <div className="bg-gold-500/5 p-4 rounded border border-gold-500/10 flex items-center gap-3">
                <Gift className="w-5 h-5 text-gold-500 shrink-0" />
                <div>
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-white">Active Reward</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Use code <strong className="text-gold-500">PROMO20</strong> during booking to claim 20% off any luxury suite.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table Right Section */}
          <div className="lg:col-span-8 space-y-8 text-left">
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Reservation History</h3>
              <p className="text-xs text-gray-400">View details, request cancellations, or download secure PDF invoice records for your hotel bookings.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-neutral-900/50 p-12 text-center rounded border border-neutral-800">
                <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h4 className="text-sm font-bold text-gray-400">No Reservations Found</h4>
                <p className="text-xs text-gray-500 mt-2">When you book rooms, your reservations will securely compile here.</p>
                <button 
                  onClick={() => onNavigate('rooms')}
                  className="mt-6 px-6 py-2.5 bg-gold-500 text-neutral-950 font-bold text-xs tracking-widest uppercase rounded cursor-pointer"
                >
                  Book A Suite Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const stayNights = calculateStayNights(booking.checkIn, booking.checkOut);

                  return (
                    <div 
                      key={booking.id}
                      className="bg-neutral-900 p-6 rounded border border-neutral-800 space-y-4 hover:border-gold-500/10 transition-all duration-300"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-neutral-800">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 uppercase">Reservation ID: {booking.id.substring(0, 12)}</span>
                          <h4 className="text-lg font-serif text-white mt-1">{booking.roomName || 'Oxvera Executive Room'}</h4>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-gray-300">
                        <div>
                          <span className="text-[9px] text-gray-500 block">CHECK IN</span>
                          <strong>{booking.checkIn}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block">CHECK OUT</span>
                          <strong>{booking.checkOut}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block">DURATION</span>
                          <strong>{stayNights} night{stayNights > 1 ? 's' : ''}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block">TOTAL PAID</span>
                          <strong className="text-gold-500 text-sm">{formatPrice(booking.totalPrice * 1500, currency)}</strong>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2 text-xs">
                        <button
                          onClick={() => setSelectedInvoice(booking)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-neutral-800 hover:border-gold-500/30 text-gray-300 hover:text-gold-500 rounded transition-all cursor-pointer font-bold uppercase tracking-widest text-[9px]"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Invoice
                        </button>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-500 text-red-400 rounded transition-all cursor-pointer font-bold uppercase tracking-widest text-[9px]"
                          >
                            Cancel Stay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-neutral-950 p-8 rounded-lg shadow-2xl max-w-2xl w-full relative border border-neutral-200">
            {/* Invoice Top Actions */}
            <div className="absolute top-4 right-4 flex gap-2 no-print">
              <button 
                onClick={() => downloadPDF(selectedInvoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-sm"
                title="Download Premium PDF Invoice"
              >
                <FileText className="w-3.5 h-3.5" /> PDF Download
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-sm cursor-pointer text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="space-y-6 pt-4 text-left">
              <div className="flex justify-between items-start pb-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-neutral-900">OXVERA HOTEL</h2>
                  <p className="text-xs text-neutral-500 mt-1">Oxvera Boulevard, GRA Phase II, Umuahia</p>
                  <p className="text-xs text-neutral-500">Abia State, Nigeria</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-neutral-800">INVOICE</h3>
                  <p className="text-xs text-neutral-500 mt-1 font-mono">No: INV-{selectedInvoice.id.substring(0,8).toUpperCase()}</p>
                  <p className="text-xs text-neutral-500 font-mono">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Guest / Bill info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">BILLED TO:</h4>
                  <p className="font-semibold text-neutral-900 mt-1">{selectedInvoice.guestName || user.displayName}</p>
                  <p className="text-neutral-500 mt-0.5">{selectedInvoice.guestEmail || user.email}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">RESERVATION DATES:</h4>
                  <p className="font-semibold text-neutral-950 mt-1">{selectedInvoice.checkIn} to {selectedInvoice.checkOut}</p>
                  <p className="text-neutral-500 mt-0.5">Duration: {calculateStayNights(selectedInvoice.checkIn, selectedInvoice.checkOut)} Nights</p>
                </div>
              </div>

              {/* Table breakdown */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-300 bg-neutral-50 text-neutral-700">
                    <th className="py-2 px-3 font-bold">Suite Description</th>
                    <th className="py-2 px-3 text-right font-bold">Nights</th>
                    <th className="py-2 px-3 text-right font-bold">Rate / Night</th>
                    <th className="py-2 px-3 text-right font-bold">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100 text-neutral-800">
                    <td className="py-3 px-3 font-medium">{selectedInvoice.roomName || 'Oxvera Executive Suite'}</td>
                    <td className="py-3 px-3 text-right">{calculateStayNights(selectedInvoice.checkIn, selectedInvoice.checkOut)}</td>
                    <td className="py-3 px-3 text-right">{formatPrice(Math.round((selectedInvoice.totalPrice / calculateStayNights(selectedInvoice.checkIn, selectedInvoice.checkOut)) * 1500), currency)}</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-900">{formatPrice(Math.round(selectedInvoice.totalPrice * 1500), currency)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Invoice note */}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                  ✓ Paid via Stripe Checkout Card
                </span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Total Paid ({currency})</span>
                  <span className="text-xl font-bold text-neutral-900">{formatPrice(Math.round(selectedInvoice.totalPrice * 1500), currency)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-400 italic pt-6">
                Thank you for choosing Oxvera Hotel. We look forward to welcoming you back to contemporary luxury.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple loader helper inline to prevent compile bugs
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
