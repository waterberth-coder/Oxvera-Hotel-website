import React, { useState, useEffect } from 'react';
import { 
  Utensils, GlassWater, Calendar, Shield, Clock, MapPin, 
  Car, Users, Sparkles, CheckCircle, Info, ChevronRight, Loader2
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { INITIAL_MENU, INITIAL_FLEET } from '../constants/initialData';
import { DEFAULT_SPA_SERVICES, SpaService } from '../constants/defaultSpaServices';
import { formatPrice, CurrencyType } from '../utils/currency';
import { MenuItem, CarService } from '../types';

interface ServiceViewsProps {
  view: string;
  onBookNow: () => void;
  currency: CurrencyType;
}

export default function ServiceViews({ view, onBookNow, currency }: ServiceViewsProps) {
  // States
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [diningCover, setDiningCover] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200");
  const [spaCover, setSpaCover] = useState("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200");
  const [carsCover, setCarsCover] = useState("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200");
  
  const [aboutData, setAboutData] = useState({
    title: "About Oxvera Hotel",
    subtitle: "Redefined Luxury",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    header: "A Crown Jewel of Umuahia",
    paragraphs: [
      "Established with a deep commitment to excellence, Oxvera Hotel has redefined the hospitality landscape of Umuahia and Abia State. Competing directly with the world's most prestigious five-star brands, our property integrates contemporary architectural layouts with classical African warmth.",
      "Every single detail is designed for your ultimate relaxation: from the Italian marble finishes in our Deluxe Suites to our state-of-the-art heated Azure pools. With constant electricity guaranteed by heavy generators, ultra-fast fiber WiFi connectivity, full private shuttle transit fleets, and a highly verified 24/7 armed security system, your safety and peace of mind are completely secured."
    ]
  });

  const [eventsData, setEventsData] = useState({
    title: "Grand Imperial Ballroom",
    subtitle: "Celebrations & Forums",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    card1Title: "Ballroom Capacities",
    card1Desc: "Flexible layouts accommodating between 50 to 600 delegates. Perfect for banquet feasts, corporate seminars, and wedding assemblies.",
    card2Title: "Technical Equipment",
    card2Desc: "Equipped with master high-fidelity acoustics, professional subwoofers, HD overhead projectors, dynamic stage spots, and wireless mics."
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [spaServices, setSpaServices] = useState<SpaService[]>(DEFAULT_SPA_SERVICES);
  const [fleetItems, setFleetItems] = useState<CarService[]>(INITIAL_FLEET);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    details: ''
  });

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        if (view === 'about') {
          const docRef = doc(db, 'site_content', 'about');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAboutData({
              title: data.title || "About Oxvera Hotel",
              subtitle: data.subtitle || "Redefined Luxury",
              image: data.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
              header: data.header || "A Crown Jewel of Umuahia",
              paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : (data.paragraphs ? [data.paragraphs] : [])
            });
          }
        } else if (view === 'events') {
          const docRef = doc(db, 'site_content', 'events');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEventsData({
              title: data.title || "Grand Imperial Ballroom",
              subtitle: data.subtitle || "Celebrations & Forums",
              image: data.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
              card1Title: data.card1Title || "Ballroom Capacities",
              card1Desc: data.card1Desc || "Flexible layouts accommodating between 50 to 600 delegates. Perfect for banquet feasts, corporate seminars, and wedding assemblies.",
              card2Title: data.card2Title || "Technical Equipment",
              card2Desc: data.card2Desc || "Equipped with master high-fidelity acoustics, professional subwoofers, HD overhead projectors, dynamic stage spots, and wireless mics."
            });
          }
        } else if (view === 'dining') {
          const colRef = collection(db, 'menu_items');
          const snap = await getDocs(colRef);
          if (!snap.empty) {
            setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
          } else {
            setMenuItems(INITIAL_MENU);
          }
          const coverSnap = await getDoc(doc(db, 'site_content', 'dining'));
          if (coverSnap.exists() && coverSnap.data().image) {
            setDiningCover(coverSnap.data().image);
          }
        } else if (view === 'spa') {
          const colRef = collection(db, 'spa_services');
          const snap = await getDocs(colRef);
          if (!snap.empty) {
            setSpaServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as SpaService)));
          } else {
            setSpaServices(DEFAULT_SPA_SERVICES);
          }
          const coverSnap = await getDoc(doc(db, 'site_content', 'spa'));
          if (coverSnap.exists() && coverSnap.data().image) {
            setSpaCover(coverSnap.data().image);
          }
        } else if (view === 'cars') {
          const colRef = collection(db, 'fleet_items');
          const snap = await getDocs(colRef);
          if (!snap.empty) {
            setFleetItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CarService)));
          } else {
            setFleetItems(INITIAL_FLEET);
          }
          const coverSnap = await getDoc(doc(db, 'site_content', 'cars'));
          if (coverSnap.exists() && coverSnap.data().image) {
            setCarsCover(coverSnap.data().image);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic site content from Firestore, using initial luxury selection:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [view]);

  // Set default details value when the lists load
  useEffect(() => {
    if (view === 'spa' && spaServices.length > 0) {
      setFormData(prev => ({ ...prev, details: spaServices[0].name }));
    } else if (view === 'cars' && fleetItems.length > 0) {
      setFormData(prev => ({ ...prev, details: fleetItems[0].name }));
    } else if (view === 'events') {
      setFormData(prev => ({ ...prev, details: 'Royal Wedding Reception' }));
    }
  }, [view, spaServices, fleetItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent, serviceName: string) => {
    e.preventDefault();
    setReserveSuccess(`Thank you, ${formData.name}! Your ${serviceName} request (${formData.details}) has been securely registered in the PMS database. Our premium concierge team will contact you shortly.`);
    setFormData({ name: '', email: '', phone: '', date: '', time: '', details: '' });
    setTimeout(() => setReserveSuccess(null), 8000);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[70vh] bg-neutral-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-4" />
        <p className="text-gray-400 text-xs font-mono tracking-wider uppercase">Loading Luxury Content...</p>
      </div>
    );
  }

  if (view === 'dining') {
    return (
      <div className="pb-24 bg-neutral-950 text-white min-h-screen animate-fade-in">
        {/* Banner Hero Cover */}
        <div className="relative h-[40vh] min-h-[300px] w-full mb-12">
          <img src={diningCover || null} alt="Dining Banner Cover" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/45 to-black/60" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8 text-center px-4">
            <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3 animate-fade-in">Michelin Afro-Fusion</span>
            <h1 className="text-3xl md:text-5xl font-serif text-white tracking-wide">Onyx Restaurant Menu</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Menu List */}
            <div className="lg:col-span-8 space-y-12">
              {['starters', 'main', 'cocktails'].map((cat) => {
                const filtered = menuItems.filter(item => item.category === cat);
                if (filtered.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-6">
                    <h3 className="text-xl font-serif text-gold-500 uppercase tracking-widest border-b border-neutral-800 pb-3">{cat}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filtered.map((dish) => (
                        <div key={dish.id} className="flex gap-4 p-4 bg-neutral-900/40 rounded border border-neutral-800/60 hover:border-gold-500/10 transition-colors">
                          <img 
                            src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'} 
                            alt={dish.name} 
                            className="w-20 h-20 object-cover rounded"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-semibold text-white">{dish.name}</h4>
                              <span className="text-gold-500 font-bold text-xs font-mono">{formatPrice(dish.price, currency)}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-light mt-1.5 leading-relaxed">{dish.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Reservation Form */}
            <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 self-start">
              <h3 className="text-lg font-serif text-white mb-2">Reserve A Table</h3>
              <p className="text-xs text-gray-400 mb-6">Enjoy luxury private seating arrangements or family dining events.</p>
              
              {reserveSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded leading-relaxed animate-fade-in">
                  {reserveSuccess}
                </div>
              )}

              <form onSubmit={(e) => handleFormSubmit(e, 'restaurant table reservation')} className="space-y-4 text-xs text-gray-300">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Booking Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Details / Notes</label>
                  <textarea name="details" value={formData.details} onChange={handleInputChange} placeholder="e.g. Vegetarian preference, VIP dining lounge required..." className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none h-20 focus:border-gold-500/50 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold py-3 uppercase tracking-widest text-[10px] rounded cursor-pointer transition-all duration-300">
                  Reserve Table
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (view === 'spa') {
    return (
      <div className="pb-24 bg-neutral-950 text-white min-h-screen animate-fade-in">
        {/* Banner Hero Cover */}
        <div className="relative h-[40vh] min-h-[300px] w-full mb-12">
          <img src={spaCover || null} alt="Spa Banner Cover" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/45 to-black/60" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8 text-center px-4">
            <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3 animate-fade-in">Holistic Healing</span>
            <h1 className="text-3xl md:text-5xl font-serif text-white tracking-wide">Ananda Wellness & Spa</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Services List */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spaServices.map((service) => (
                  <div key={service.id} className="p-6 bg-neutral-900/40 border border-neutral-800 hover:border-gold-500/10 transition-colors rounded flex flex-col justify-between">
                    <div>
                      <Sparkles className="w-6 h-6 text-gold-500 mb-4" />
                      <h3 className="text-lg font-serif text-white mb-2">{service.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{service.description}</p>
                    </div>
                    <span className="text-gold-500 font-bold font-mono text-sm block mt-2">
                      {formatPrice(service.price, currency)} / {service.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 self-start">
              <h3 className="text-lg font-serif text-white mb-2">Book Spa Therapy</h3>
              <p className="text-xs text-gray-400 mb-6">Schedule your session of absolute physical and mental rejuvenation.</p>
              
              {reserveSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded leading-relaxed animate-fade-in">
                  {reserveSuccess}
                </div>
              )}

              <form onSubmit={(e) => handleFormSubmit(e, 'spa therapy session')} className="space-y-4 text-xs text-gray-300">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Preferred Session</label>
                  <select name="details" value={formData.details} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors">
                    {spaServices.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({formatPrice(service.price, currency)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Booking Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold py-3 uppercase tracking-widest text-[10px] rounded cursor-pointer transition-colors duration-300">
                  Book Spa Session
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (view === 'cars') {
    return (
      <div className="pb-24 bg-neutral-950 text-white min-h-screen animate-fade-in">
        {/* Banner Hero Cover */}
        <div className="relative h-[40vh] min-h-[300px] w-full mb-12">
          <img src={carsCover || null} alt="Cars Banner Cover" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/45 to-black/60" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8 text-center px-4">
            <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3 animate-fade-in">Prestige Fleet</span>
            <h1 className="text-3xl md:text-5xl font-serif text-white tracking-wide">Executive Car Services</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Fleet List */}
            <div className="lg:col-span-8 space-y-6">
              {fleetItems.map((car) => (
                <div key={car.id} className="flex flex-col md:flex-row gap-6 p-6 bg-neutral-900/40 rounded border border-neutral-800/80 hover:border-gold-500/10 transition-colors">
                  <img 
                    src={car.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400'} 
                    alt={car.name} 
                    className="w-full md:w-56 h-36 object-cover rounded shadow"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gold-500 tracking-widest">{car.type} Class</span>
                      <h3 className="text-xl font-serif text-white font-semibold mt-1">{car.name}</h3>
                      <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">Fully chauffeured luxury transit, secure tracking, VIP privacy tints, and professional uniformed escorts.</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-gold-500 font-bold text-sm font-mono">{formatPrice(car.pricePerDay, currency)} / Day</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 self-start">
              <h3 className="text-lg font-serif text-white mb-2">Book Fleet Vehicle</h3>
              <p className="text-xs text-gray-400 mb-6">Experience world-class transportation or airport transfers.</p>
              
              {reserveSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded leading-relaxed animate-fade-in">
                  {reserveSuccess}
                </div>
              )}

              <form onSubmit={(e) => handleFormSubmit(e, 'luxury car hire')} className="space-y-4 text-xs text-gray-300">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Select Vehicle</label>
                  <select name="details" value={formData.details} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors">
                    {fleetItems.map((car) => (
                      <option key={car.id} value={car.name}>
                        {car.name} ({formatPrice(car.pricePerDay, currency)}/day)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Rent Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold py-3 uppercase tracking-widest text-[10px] rounded cursor-pointer transition-colors duration-300">
                  Reserve Vehicle
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (view === 'events') {
    return (
      <div className="py-24 bg-neutral-950 text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3">{eventsData.subtitle}</span>
            <h1 className="text-4xl md:text-5xl font-serif">{eventsData.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Details and Features */}
            <div className="lg:col-span-8 space-y-8">
              <img 
                src={eventsData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'} 
                alt="Ballroom" 
                className="w-full h-80 object-cover rounded shadow border border-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded">
                  <h4 className="text-gold-500 font-bold tracking-widest uppercase mb-2">{eventsData.card1Title}</h4>
                  <p className="text-gray-300 leading-relaxed font-light">{eventsData.card1Desc}</p>
                </div>
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded">
                  <h4 className="text-gold-500 font-bold tracking-widest uppercase mb-2">{eventsData.card2Title}</h4>
                  <p className="text-gray-300 leading-relaxed font-light">{eventsData.card2Desc}</p>
                </div>
              </div>
            </div>

            {/* Event Hall Inquiry Form */}
            <div className="lg:col-span-4 bg-neutral-900 p-8 rounded border border-neutral-800 self-start">
              <h3 className="text-lg font-serif text-white mb-2">Event Hall Inquiry</h3>
              <p className="text-xs text-gray-400 mb-6">Submit requests for dates and customized catering arrangements.</p>
              
              {reserveSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded leading-relaxed animate-fade-in">
                  {reserveSuccess}
                </div>
              )}

              <form onSubmit={(e) => handleFormSubmit(e, 'Imperial Event Hall registration')} className="space-y-4 text-xs text-gray-300">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Event Type</label>
                  <select name="details" value={formData.details} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors">
                    <option value="Royal Wedding Reception">Royal Wedding Reception</option>
                    <option value="Corporate Summit / Seminar">Corporate Summit / Seminar</option>
                    <option value="Private Birthday Celebration">Private Birthday Celebration</option>
                    <option value="Gourmet Banquet Feast">Gourmet Banquet Feast</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gold-500 uppercase text-[9px]">Event Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold py-3 uppercase tracking-widest text-[10px] rounded cursor-pointer transition-colors duration-300">
                  Submit Event Request
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // default: about
  return (
    <div className="py-24 bg-neutral-950 text-white min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-12 space-y-12 font-sans font-light text-sm text-gray-300 leading-relaxed">
        <div className="text-center">
          <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3">{aboutData.subtitle}</span>
          <h1 className="text-4xl md:text-5xl font-serif text-white">{aboutData.title}</h1>
        </div>

        <img 
          src={aboutData.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'} 
          alt="About Lobby" 
          className="w-full h-80 object-cover rounded shadow border border-neutral-800"
          referrerPolicy="no-referrer"
        />

        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-white">{aboutData.header}</h2>
          {aboutData.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="text-base font-serif text-white">Ready to experience contemporary luxury?</h4>
            <p className="text-xs text-gray-500 mt-1">Book your room or suite online securely today.</p>
          </div>
          <button 
            onClick={onBookNow}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 text-xs font-bold tracking-widest uppercase rounded transition-all cursor-pointer shadow-lg shadow-gold-500/15"
          >
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}
