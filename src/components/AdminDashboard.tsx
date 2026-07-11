import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, Edit, Trash2, ShieldAlert, Key, 
  DollarSign, Percent, Settings, Image as ImageIcon, CheckCircle, 
  XCircle, Loader2, Save, LogOut, ArrowLeft, Hotel, Calendar, Award, Globe, HeartHandshake, Eye, Sparkles, Car,
  Users, UserCheck, UserX
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room, Booking, Coupon, MenuItem, CarService } from '../types';
import { INITIAL_ROOMS, INITIAL_MENU, INITIAL_FLEET } from '../constants/initialData';
import { DEFAULT_SPA_SERVICES, SpaService } from '../constants/defaultSpaServices';
import ImageUploader from './ImageUploader';

const DEFAULT_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  home: {
    title: "Oxvera Hotel | Luxury 5-Star Hotel & Resort in Umuahia",
    description: "Experience premium luxury, world-class amenities, armed security, heated pools, and fine dining at Oxvera Hotel, Umuahia's finest five-star sanctuary.",
    keywords: "luxury hotel, umuahia hotel, 5 star hotel nigeria, oxvera resort, abia state accommodation"
  },
  rooms: {
    title: "Executive Rooms & Presidential Suites | Oxvera Hotel",
    description: "Explore and reserve our elite, master-crafted luxury suites. High-speed fiber internet, private hot tubs, and 24/7 personalized security.",
    keywords: "hotel rooms umuahia, presidential suite, executive suite nigeria, luxury room booking"
  },
  dining: {
    title: "Onyx Restaurant | Michelin Afro-Fusion Fine Dining at Oxvera",
    description: "Indulge in exquisite traditional swallows, fresh continental options, and gourmet Afro-fusion cuisine masterfully prepared by award-winning chefs.",
    keywords: "onyx restaurant, afro fusion food, dining in umuahia, best restaurant abia state"
  },
  spa: {
    title: "Ananda Wellness & Spa | Premium Massage & Therapy",
    description: "Rejuvenate with custom organic skincare, deep tissue massages, and therapeutic heated pool sessions at our high-end luxury spa.",
    keywords: "luxury spa umuahia, massage therapy abia, wellness retreat nigeria, body treatment"
  },
  cars: {
    title: "Executive Car Hire & Armored Escort Fleet | Oxvera",
    description: "Travel in total comfort and safety. Oxvera's premium car rental fleet includes Mercedes-Benz G-Wagons, Toyota Prados, and optional military escorts.",
    keywords: "car hire umuahia, luxury car rental nigeria, bulletproof car escort, travel security"
  },
  gallery: {
    title: "Visual Tour & Photo Gallery | Oxvera Hotel Grounds",
    description: "Take a visual journey through our breathtaking gardens, azure mineral pools, majestic grand ballroom, and high-security gated compound.",
    keywords: "hotel gallery, luxury pool pictures, oxvera hotel photos, umuahia resort"
  },
  blog: {
    title: "The Oxvera Journal | Elite Lifestyle & Travel Blog",
    description: "Stay informed with the latest hotel updates, gourmet dining tips, cultural happenings, and premium travel guides for Abia State.",
    keywords: "oxvera hotel blog, luxury travel nigeria, abia state tourism, elite lifestyle journal"
  },
  events: {
    title: "Oxvera Grand Ballroom | Premium Events & Conferences",
    description: "Our state-of-the-art conference halls and grand ballroom host prestigious corporate events, weddings, and elite local summits.",
    keywords: "event hall umuahia, conference center nigeria, wedding venue abia, oxvera ballroom"
  },
  about: {
    title: "About Oxvera Hotel | Legacy of African Hospitality",
    description: "Learn about Oxvera Hotel's commitment to high security, premium comfort, michelin cuisine, and authentic Nigerian hospitality.",
    keywords: "about oxvera, hotel history, luxury brand nigeria, elite hoteliers"
  }
};

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pms' | 'rooms' | 'coupons' | 'content' | 'images' | 'blogs' | 'seo'>('pms');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamic Content Sub-Tabs
  const [subTab, setSubTab] = useState<'about' | 'events' | 'dining' | 'spa' | 'cars'>('about');
  
  // Forms for Website Content
  const [aboutForm, setAboutForm] = useState({
    title: "About Oxvera Hotel",
    subtitle: "Redefined Luxury",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    header: "A Crown Jewel of Umuahia",
    paragraphs: [
      "Established with a deep commitment to excellence, Oxvera Hotel has redefined the hospitality landscape of Umuahia and Abia State. Competing directly with the world's most prestigious five-star brands, our property integrates contemporary architectural layouts with classical African warmth.",
      "Every single detail is designed for your ultimate relaxation: from the Italian marble finishes in our Deluxe Suites to our state-of-the-art heated Azure pools. With constant electricity guaranteed by heavy generators, ultra-fast fiber WiFi connectivity, full private shuttle transit fleets, and a highly verified 24/7 armed security system, your safety and peace of mind are completely secured."
    ].join('\n\n')
  });

  const [eventsForm, setEventsForm] = useState({
    title: "Grand Imperial Ballroom",
    subtitle: "Celebrations & Forums",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    card1Title: "Ballroom Capacities",
    card1Desc: "Flexible layouts accommodating between 50 to 600 delegates. Perfect for banquet feasts, corporate seminars, and wedding assemblies.",
    card2Title: "Technical Equipment",
    card2Desc: "Equipped with master high-fidelity acoustics, professional subwoofers, HD overhead projectors, dynamic stage spots, and wireless mics."
  });

  // Dining Menu CRUD State
  const [menuItemsAdmin, setMenuItemsAdmin] = useState<MenuItem[]>([]);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 5000,
    category: 'starters',
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
  });

  // Spa CRUD State
  const [spaServicesAdmin, setSpaServicesAdmin] = useState<SpaService[]>([]);
  const [editingSpaService, setEditingSpaService] = useState<SpaService | null>(null);
  const [newSpaService, setNewSpaService] = useState<Partial<SpaService>>({
    name: '',
    price: 25000,
    duration: '60 Mins',
    description: ''
  });

  // Fleet CRUD State
  const [fleetItemsAdmin, setFleetItemsAdmin] = useState<CarService[]>([]);
  const [editingFleetItem, setEditingFleetItem] = useState<CarService | null>(null);
  const [newFleetItem, setNewFleetItem] = useState<Partial<CarService>>({
    name: '',
    pricePerDay: 80000,
    type: 'Luxury',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400'
  });

  // Forms
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    description: '',
    pricePerNight: 50000,
    capacity: 2,
    size: '45m²',
    bed: 'King Bed',
    type: 'deluxe',
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000']
  });

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percent',
    value: 20,
    isActive: true,
    expiryDate: '2026-12-31'
  });

  // Blog states
  const [blogsAdmin, setBlogsAdmin] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'Lifestyle',
    excerpt: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 Mins',
  });

  // Brand Logo and Slides settings
  const [globalSettings, setGlobalSettings] = useState<{
    logoUrl?: string;
    heroSlides?: any[];
  }>({});

  const [diningCoverUrl, setDiningCoverUrl] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200");
  const [spaCoverUrl, setSpaCoverUrl] = useState("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200");
  const [carsCoverUrl, setCarsCoverUrl] = useState("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200");

  // SEO Manager State
  const [selectedSeoSection, setSelectedSeoSection] = useState('home');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaveSuccess, setSeoSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSEOData() {
      if (activeTab !== 'seo') return;
      setSeoLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'seo_settings', selectedSeoSection));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSeoTitle(data.title || '');
          setSeoDescription(data.description || '');
          setSeoKeywords(data.keywords || '');
        } else {
          const defaults = DEFAULT_SEO[selectedSeoSection] || DEFAULT_SEO.home;
          setSeoTitle(defaults.title);
          setSeoDescription(defaults.description);
          setSeoKeywords(defaults.keywords);
        }
      } catch (err) {
        console.warn("Could not load SEO settings:", err);
      } finally {
        setSeoLoading(false);
      }
    }
    loadSEOData();
  }, [selectedSeoSection, activeTab]);

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeoLoading(true);
    setSeoSaveSuccess(false);
    try {
      await setDoc(doc(db, 'seo_settings', selectedSeoSection), {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        updatedAt: new Date().toISOString()
      });
      setSeoSaveSuccess(true);
      setTimeout(() => setSeoSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving SEO settings:", err);
    } finally {
      setSeoLoading(false);
    }
  };

  // User Access Control States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [preApproveEmail, setPreApproveEmail] = useState('');
  const [preApproveLoading, setPreApproveLoading] = useState(false);
  const [preApproveMsg, setPreApproveMsg] = useState('');

  const fetchUsersList = async () => {
    setUsersLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: any[] = [];
      usersSnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsersList(list);
    } catch (err) {
      console.error("Error fetching users list:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'access') {
      fetchUsersList();
    }
  }, [activeTab]);

  const handleToggleAccess = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { accessGranted: !currentStatus });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, accessGranted: !currentStatus } : u));
    } catch (err) {
      console.error("Error toggling user access:", err);
    }
  };

  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preApproveEmail || !preApproveEmail.includes('@')) return;
    setPreApproveLoading(true);
    setPreApproveMsg('');
    try {
      const cleanEmail = preApproveEmail.trim().toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { accessGranted: true });
        setPreApproveMsg(`Successfully granted access to existing user: ${cleanEmail}`);
      } else {
        const safeId = btoa(cleanEmail).replace(/=/g, '');
        await setDoc(doc(db, 'users', `pre_${safeId}`), {
          email: cleanEmail,
          accessGranted: true,
          isPreApproved: true,
          createdAt: new Date().toISOString()
        });
        setPreApproveMsg(`Email ${cleanEmail} pre-approved successfully!`);
      }
      setPreApproveEmail('');
      fetchUsersList();
    } catch (err) {
      console.error("Error pre-approving email:", err);
      setPreApproveMsg("Error pre-approving email.");
    } finally {
      setPreApproveLoading(false);
    }
  };

  // Load PMS Data
  useEffect(() => {
    async function loadPMSData() {
      setLoading(true);
      try {
        // Fetch rooms
        const rSnapshot = await getDocs(collection(db, 'rooms'));
        if (!rSnapshot.empty) {
          setRooms(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
        }

        // Fetch bookings
        const bSnapshot = await getDocs(collection(db, 'bookings'));
        if (!bSnapshot.empty) {
          setBookings(bSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
        }

        // Fetch coupons
        const cSnapshot = await getDocs(collection(db, 'coupons'));
        if (!cSnapshot.empty) {
          setCoupons(cSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
        }

        // Fetch about document
        const aboutDoc = await getDoc(doc(db, 'site_content', 'about'));
        if (aboutDoc.exists()) {
          const data = aboutDoc.data();
          setAboutForm({
            title: data.title || "About Oxvera Hotel",
            subtitle: data.subtitle || "Redefined Luxury",
            image: data.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
            header: data.header || "A Crown Jewel of Umuahia",
            paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs.join('\n\n') : (data.paragraphs || "")
          });
        }

        // Fetch events document
        const eventsDoc = await getDoc(doc(db, 'site_content', 'events'));
        if (eventsDoc.exists()) {
          const data = eventsDoc.data();
          setEventsForm({
            title: data.title || "Grand Imperial Ballroom",
            subtitle: data.subtitle || "Celebrations & Forums",
            image: data.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
            card1Title: data.card1Title || "Ballroom Capacities",
            card1Desc: data.card1Desc || "Flexible layouts accommodating between 50 to 600 delegates. Perfect for banquet feasts, corporate seminars, and wedding assemblies.",
            card2Title: data.card2Title || "Technical Equipment",
            card2Desc: data.card2Desc || "Equipped with master high-fidelity acoustics, professional subwoofers, HD overhead projectors, dynamic stage spots, and wireless mics."
          });
        }

        // Fetch Menu Items
        const mSnapshot = await getDocs(collection(db, 'menu_items'));
        if (!mSnapshot.empty) {
          setMenuItemsAdmin(mSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
        } else {
          setMenuItemsAdmin(INITIAL_MENU);
        }

        // Fetch Spa Services
        const sSnapshot = await getDocs(collection(db, 'spa_services'));
        if (!sSnapshot.empty) {
          setSpaServicesAdmin(sSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpaService)));
        } else {
          setSpaServicesAdmin(DEFAULT_SPA_SERVICES);
        }

        // Fetch Fleet Items
        const fSnapshot = await getDocs(collection(db, 'fleet_items'));
        if (!fSnapshot.empty) {
          setFleetItemsAdmin(fSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarService)));
        } else {
          setFleetItemsAdmin(INITIAL_FLEET);
        }

        // Fetch Blogs
        const blogsSnapshot = await getDocs(collection(db, 'blogs'));
        if (!blogsSnapshot.empty) {
          setBlogsAdmin(blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        } else {
          setBlogsAdmin([]);
        }

        // Fetch Global Settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          setGlobalSettings(settingsDoc.data());
        }

        // Fetch section covers
        const diningCoverDoc = await getDoc(doc(db, 'site_content', 'dining'));
        if (diningCoverDoc.exists()) {
          setDiningCoverUrl(diningCoverDoc.data().image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200");
        }
        const spaCoverDoc = await getDoc(doc(db, 'site_content', 'spa'));
        if (spaCoverDoc.exists()) {
          setSpaCoverUrl(spaCoverDoc.data().image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200");
        }
        const carsCoverDoc = await getDoc(doc(db, 'site_content', 'cars'));
        if (carsCoverDoc.exists()) {
          setCarsCoverUrl(carsCoverDoc.data().image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200");
        }

      } catch (err) {
        console.error('Error loading admin PMS datasets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPMSData();
  }, []);

  // CRUD Room actions
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomPayload = {
        ...newRoom,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'rooms'), roomPayload);
      setRooms(prev => [...prev, { id: docRef.id, ...roomPayload } as Room]);
      alert('Room created successfully in PMS database.');
      setNewRoom({
        name: '',
        description: '',
        pricePerNight: 50000,
        capacity: 2,
        size: '45m²',
        bed: 'King Bed',
        type: 'deluxe',
        isAvailable: true,
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000']
      });
    } catch (err) {
      console.error(err);
      alert('Error creating room doc. Check Firebase Console.');
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      const rRef = doc(db, 'rooms', editingRoom.id);
      const { id, ...payload } = editingRoom;
      await updateDoc(rRef, payload);
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? editingRoom : r));
      alert('Room details updated in PMS.');
      setEditingRoom(null);
    } catch (err) {
      console.error(err);
      alert('Could not update room.');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room? This is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      setRooms(prev => prev.filter(r => r.id !== roomId));
      alert('Room deleted.');
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  // CRUD Coupons
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newCoupon };
      const docRef = await addDoc(collection(db, 'coupons'), payload);
      setCoupons(prev => [...prev, { id: docRef.id, ...payload } as Coupon]);
      alert('Promo coupon code registered.');
      setNewCoupon({ code: '', discountType: 'percent', value: 20, isActive: true, expiryDate: '2026-12-31' });
    } catch (err) {
      console.error(err);
    }
  };

  // Website Content Save & CRUD Handlers
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'site_content', 'about');
      await setDoc(docRef, {
        title: aboutForm.title,
        subtitle: aboutForm.subtitle,
        image: aboutForm.image,
        header: aboutForm.header,
        paragraphs: aboutForm.paragraphs.split('\n\n').filter(p => p.trim() !== '')
      });
      alert('About Us content saved and synchronized successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save About Us content.');
    }
  };

  const handleSaveEvents = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'site_content', 'events');
      await setDoc(docRef, eventsForm);
      alert('Events Ballroom content saved and synchronized successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save Events Ballroom content.');
    }
  };

  // Dining Menu CRUD
  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newMenuItem };
      const docRef = await addDoc(collection(db, 'menu_items'), payload);
      setMenuItemsAdmin(prev => [...prev, { id: docRef.id, ...payload } as MenuItem]);
      alert('Menu item added successfully!');
      setNewMenuItem({
        name: '',
        price: 5000,
        category: 'starters',
        description: '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
      });
    } catch (err) {
      console.error(err);
      alert('Could not add menu item.');
    }
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    try {
      const ref = doc(db, 'menu_items', editingMenuItem.id);
      const { id, ...payload } = editingMenuItem;
      await updateDoc(ref, payload);
      setMenuItemsAdmin(prev => prev.map(m => m.id === editingMenuItem.id ? editingMenuItem : m));
      alert('Menu item updated successfully!');
      setEditingMenuItem(null);
    } catch (err) {
      console.error(err);
      alert('Could not update menu item.');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      setMenuItemsAdmin(prev => prev.filter(m => m.id !== id));
      alert('Menu item deleted.');
    } catch (err) {
      console.error(err);
      alert('Could not delete menu item.');
    }
  };

  // Spa Services CRUD
  const handleCreateSpaService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newSpaService };
      const docRef = await addDoc(collection(db, 'spa_services'), payload);
      setSpaServicesAdmin(prev => [...prev, { id: docRef.id, ...payload } as SpaService]);
      alert('Spa service added successfully!');
      setNewSpaService({
        name: '',
        price: 25000,
        duration: '60 Mins',
        description: ''
      });
    } catch (err) {
      console.error(err);
      alert('Could not add spa service.');
    }
  };

  const handleUpdateSpaService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpaService) return;
    try {
      const ref = doc(db, 'spa_services', editingSpaService.id);
      const { id, ...payload } = editingSpaService;
      await updateDoc(ref, payload);
      setSpaServicesAdmin(prev => prev.map(s => s.id === editingSpaService.id ? editingSpaService : s));
      alert('Spa service updated successfully!');
      setEditingSpaService(null);
    } catch (err) {
      console.error(err);
      alert('Could not update spa service.');
    }
  };

  const handleDeleteSpaService = async (id: string) => {
    if (!window.confirm('Delete this spa service?')) return;
    try {
      await deleteDoc(doc(db, 'spa_services', id));
      setSpaServicesAdmin(prev => prev.filter(s => s.id !== id));
      alert('Spa service deleted.');
    } catch (err) {
      console.error(err);
      alert('Could not delete spa service.');
    }
  };

  // Fleet Vehicle CRUD
  const handleCreateFleetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newFleetItem };
      const docRef = await addDoc(collection(db, 'fleet_items'), payload);
      setFleetItemsAdmin(prev => [...prev, { id: docRef.id, ...payload } as CarService]);
      alert('Vehicle added successfully!');
      setNewFleetItem({
        name: '',
        pricePerDay: 80000,
        type: 'Luxury',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400'
      });
    } catch (err) {
      console.error(err);
      alert('Could not add vehicle.');
    }
  };

  const handleUpdateFleetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFleetItem) return;
    try {
      const ref = doc(db, 'fleet_items', editingFleetItem.id);
      const { id, ...payload } = editingFleetItem;
      await updateDoc(ref, payload);
      setFleetItemsAdmin(prev => prev.map(f => f.id === editingFleetItem.id ? editingFleetItem : f));
      alert('Vehicle updated successfully!');
      setEditingFleetItem(null);
    } catch (err) {
      console.error(err);
      alert('Could not update vehicle.');
    }
  };

  const handleDeleteFleetItem = async (id: string) => {
    if (!window.confirm('Delete this vehicle from fleet? This is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'fleet_items', id));
      setFleetItemsAdmin(prev => prev.filter(f => f.id !== id));
      alert('Vehicle removed from fleet.');
    } catch (err) {
      console.error(err);
      alert('Could not delete vehicle.');
    }
  };

  const handleToggleRoomAvailability = async (roomId: string, currentStatus: boolean) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, { isAvailable: !currentStatus });
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isAvailable: !currentStatus } : r));
      alert(`Suite availability toggled to ${!currentStatus ? 'Available' : 'Booked/Unavailable'}!`);
    } catch (err) {
      console.error(err);
      alert('Could not toggle room availability in Firestore.');
    }
  };

  // Live Firebase Storage to Firestore Media Synchronizers
  const handleUpdateAboutImage = async (newUrl: string) => {
    if (!newUrl) return;
    try {
      const docRef = doc(db, 'site_content', 'about');
      await setDoc(docRef, { image: newUrl }, { merge: true });
      setAboutForm(prev => ({ ...prev, image: newUrl }));
      alert('About Us Cover Image updated successfully in Firestore!');
    } catch (err) {
      console.error(err);
      alert('Could not update About Us cover image in Firestore.');
    }
  };

  const handleUpdateSpaImage = async (serviceId: string, newUrl: string) => {
    if (!newUrl) return;
    try {
      const docRef = doc(db, 'spa_services', serviceId);
      await updateDoc(docRef, { image: newUrl });
      setSpaServicesAdmin(prev => prev.map(s => s.id === serviceId ? { ...s, image: newUrl } : s));
      alert('Spa service image updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Could not update Spa service image in Firestore.');
    }
  };

  const handleUpdateCarImage = async (carId: string, newUrl: string) => {
    if (!newUrl) return;
    try {
      const docRef = doc(db, 'fleet_items', carId);
      await updateDoc(docRef, { image: newUrl });
      setFleetItemsAdmin(prev => prev.map(f => f.id === carId ? { ...f, image: newUrl } : f));
      alert('Vehicle image updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Could not update vehicle image in Firestore.');
    }
  };

  // Blog actions
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBlog,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'blogs'), payload);
      setBlogsAdmin(prev => [{ id: docRef.id, ...payload }, ...prev]);
      alert('Blog post created successfully!');
      setNewBlog({
        title: '',
        category: 'Lifestyle',
        excerpt: '',
        content: '',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
        readTime: '5 Mins',
      });
    } catch (err) {
      console.error(err);
      alert('Could not create blog post.');
    }
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    try {
      const ref = doc(db, 'blogs', editingBlog.id);
      const { id, ...payload } = editingBlog;
      await updateDoc(ref, payload);
      setBlogsAdmin(prev => prev.map(b => b.id === editingBlog.id ? editingBlog : b));
      alert('Blog post updated successfully!');
      setEditingBlog(null);
    } catch (err) {
      console.error(err);
      alert('Could not update blog post.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post? This is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setBlogsAdmin(prev => prev.filter(b => b.id !== id));
      alert('Blog post deleted.');
    } catch (err) {
      console.error(err);
      alert('Could not delete blog post.');
    }
  };

  // Branding Logo and Cover actions
  const handleUpdateLogo = async (newUrl: string) => {
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { logoUrl: newUrl }, { merge: true });
      setGlobalSettings(prev => ({ ...prev, logoUrl: newUrl }));
      alert('Brand Logo updated successfully in settings!');
    } catch (err) {
      console.error(err);
      alert('Could not update brand logo.');
    }
  };

  const handleUpdateSlides = async (updatedSlides: any[]) => {
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { heroSlides: updatedSlides }, { merge: true });
      setGlobalSettings(prev => ({ ...prev, heroSlides: updatedSlides }));
      alert('Homepage Hero slides updated successfully in settings!');
    } catch (err) {
      console.error(err);
      alert('Could not update slides.');
    }
  };

  const handleUpdateDiningCover = async (newUrl: string) => {
    try {
      await setDoc(doc(db, 'site_content', 'dining'), { image: newUrl }, { merge: true });
      setDiningCoverUrl(newUrl);
      alert('Dining section main cover image updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSpaCover = async (newUrl: string) => {
    try {
      await setDoc(doc(db, 'site_content', 'spa'), { image: newUrl }, { merge: true });
      setSpaCoverUrl(newUrl);
      alert('Spa section main cover image updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCarsCover = async (newUrl: string) => {
    try {
      await setDoc(doc(db, 'site_content', 'cars'), { image: newUrl }, { merge: true });
      setCarsCoverUrl(newUrl);
      alert('Executive Cars section main cover image updated!');
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for KPI Metrics
  const totalRevenueUSD = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalRevenueNGN = totalRevenueUSD * 1500;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const occupancyPercentage = rooms.length > 0 ? Math.round((confirmedBookings / rooms.length) * 100) : 0;

  return (
    <div className="py-24 bg-neutral-950 text-white min-h-screen select-none font-sans border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
        {/* Back navigation */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs text-gold-500 hover:text-gold-400 mb-8 tracking-widest uppercase transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </button>

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-900 mb-10">
          <div>
            <span className="text-[10px] font-mono text-gold-500 uppercase tracking-widest block">Oxvera Hotel Property Management System</span>
            <h1 className="text-3xl md:text-4xl font-serif text-white mt-1">PMS Control Center</h1>
          </div>
          <div className="flex items-center gap-3 bg-red-500/10 text-red-400 px-4 py-2 rounded border border-red-500/15 text-xs font-mono">
            <ShieldAlert className="w-4 h-4" /> Administrator Security Auth Active
          </div>
        </div>

        {/* PMS Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveTab('pms')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'pms' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Dashboard Analytics
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'rooms' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Suites Management (CRUD)
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'coupons' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Promo Coupons
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'content' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Website Content (CMS)
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'images' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Image Management
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'blogs' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Blog Articles Manager
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'seo' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            SEO Manager
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'access' ? 'bg-gold-500 text-neutral-950' : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
            }`}
          >
            Access Whitelist
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            {/* TAB: PMS Dashboard */}
            {activeTab === 'pms' && (
              <div className="space-y-10">
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                    <span className="text-[9px] font-bold tracking-widest text-gold-500 uppercase block mb-1">Total Revenue</span>
                    <h3 className="text-2xl font-serif font-bold text-white">₦{totalRevenueNGN.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">${totalRevenueUSD.toLocaleString()} USD Equivalent</p>
                  </div>
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                    <span className="text-[9px] font-bold tracking-widest text-gold-500 uppercase block mb-1">Occupancy Ratio</span>
                    <h3 className="text-2xl font-serif font-bold text-white">{occupancyPercentage}%</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">{confirmedBookings} of {rooms.length} Suites Occupied</p>
                  </div>
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                    <span className="text-[9px] font-bold tracking-widest text-gold-500 uppercase block mb-1">Confirmed Guests</span>
                    <h3 className="text-2xl font-serif font-bold text-white">{confirmedBookings}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Verified stays reserved in system</p>
                  </div>
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                    <span className="text-[9px] font-bold tracking-widest text-gold-500 uppercase block mb-1">Pending Inquiries</span>
                    <h3 className="text-2xl font-serif font-bold text-white">{pendingBookings}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Stripe Checkout holds or draft carts</p>
                  </div>
                </div>

                {/* Bookings table */}
                <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                  <h3 className="text-lg font-serif mb-6 text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-gold-500" /> Live Reservation Stream</h3>
                  <div className="overflow-x-auto text-xs text-gray-300">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-800 text-gray-500 font-mono text-[9px] uppercase tracking-wider">
                          <th className="pb-3">Guest Name</th>
                          <th className="pb-3">Suite Name</th>
                          <th className="pb-3">Dates</th>
                          <th className="pb-3">Amount Paid</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-b border-neutral-800/40 hover:bg-neutral-950/20 py-3">
                            <td className="py-3 font-semibold text-white">{b.guestName}</td>
                            <td className="py-3 text-gold-500">{b.roomName || 'Luxury Suite'}</td>
                            <td className="py-3 font-mono">{b.checkIn} to {b.checkOut}</td>
                            <td className="py-3 font-mono text-white">₦{(b.totalPrice * 1500).toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CRUD Rooms */}
            {activeTab === 'rooms' && (
              <div className="space-y-12">
                {/* Rooms Creation Form */}
                <div className="bg-neutral-900 p-8 rounded border border-neutral-800">
                  <h3 className="text-xl font-serif mb-6 text-white flex items-center gap-2"><Hotel className="w-5 h-5 text-gold-500" /> {editingRoom ? 'Edit Suite Specs' : 'Register New Suite'}</h3>
                  <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Suite Name</label>
                      <input 
                        type="text"
                        required
                        value={editingRoom ? editingRoom.name : newRoom.name}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, name: e.target.value })
                          : setNewRoom({ ...newRoom, name: e.target.value })}
                        placeholder="e.g. Presidential Skyline Room"
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Nightly Rate (₦ NGN)</label>
                      <input 
                        type="number"
                        required
                        value={editingRoom ? editingRoom.pricePerNight : newRoom.pricePerNight}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })
                          : setNewRoom({ ...newRoom, pricePerNight: Number(e.target.value) })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Suite Class</label>
                      <select 
                        value={editingRoom ? editingRoom.type : newRoom.type}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, type: e.target.value as any })
                          : setNewRoom({ ...newRoom, type: e.target.value as any })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      >
                        <option value="standard">Standard</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="suite">Suite</option>
                        <option value="penthouse">Penthouse</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Description</label>
                      <textarea 
                        value={editingRoom ? editingRoom.description : newRoom.description}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, description: e.target.value })
                          : setNewRoom({ ...newRoom, description: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none h-20"
                        placeholder="Introduce the room spacing, marbles, or specialized butler configurations..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Dimension Size (e.g. 55m²)</label>
                      <input 
                        type="text"
                        value={editingRoom ? editingRoom.size : newRoom.size}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, size: e.target.value })
                          : setNewRoom({ ...newRoom, size: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Bed Arrangement</label>
                      <input 
                        type="text"
                        value={editingRoom ? editingRoom.bed : newRoom.bed}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, bed: e.target.value })
                          : setNewRoom({ ...newRoom, bed: e.target.value })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Showcase Photo URL</label>
                      <input 
                        type="text"
                        required
                        value={editingRoom ? (editingRoom.images?.[0] || '') : (newRoom.images?.[0] || '')}
                        onChange={(e) => editingRoom 
                          ? setEditingRoom({ ...editingRoom, images: [e.target.value] })
                          : setNewRoom({ ...newRoom, images: [e.target.value] })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none font-mono text-[10px] mb-2"
                      />
                      <ImageUploader 
                        value={editingRoom ? (editingRoom.images?.[0] || '') : (newRoom.images?.[0] || '')}
                        onChange={(base64) => editingRoom
                          ? setEditingRoom({ ...editingRoom, images: [base64] })
                          : setNewRoom({ ...newRoom, images: [base64] })}
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                      {editingRoom && (
                        <button 
                          type="button" 
                          onClick={() => setEditingRoom(null)}
                          className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer"
                      >
                        {editingRoom ? 'Apply Suite Changes' : 'Save Suite to Catalog'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Suites Grid with Delete/Edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-neutral-900 p-6 rounded border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000'} 
                          alt={room.name} 
                          className="w-16 h-16 object-cover rounded border border-neutral-800 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase text-gold-500">{room.type}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider font-mono ${
                              room.isAvailable !== false 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 animate-pulse' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/15'
                            }`}>
                              {room.isAvailable !== false ? 'Available' : 'Booked/Unavailable'}
                            </span>
                          </div>
                          <h4 className="text-base font-serif text-white font-semibold mt-0.5">{room.name}</h4>
                          <span className="text-xs font-mono text-gray-400">₦{room.pricePerNight.toLocaleString()} / night</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => handleToggleRoomAvailability(room.id, room.isAvailable !== false)}
                          className={`px-3 py-2 rounded border cursor-pointer text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            room.isAvailable !== false
                              ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                          }`}
                          title="Toggle availability status"
                        >
                          {room.isAvailable !== false ? 'Set Unavailable' : 'Set Available'}
                        </button>
                        <button 
                          onClick={() => setEditingRoom(room)}
                          className="p-2 bg-neutral-950 hover:bg-neutral-800 rounded border border-neutral-800 text-gold-500 cursor-pointer"
                          title="Edit Specs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2 bg-neutral-950 hover:bg-red-950/20 rounded border border-neutral-800 text-red-400 cursor-pointer"
                          title="Remove Suite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Coupons */}
            {activeTab === 'coupons' && (
              <div className="space-y-8">
                <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                  <h3 className="text-lg font-serif mb-6 text-white flex items-center gap-2"><Percent className="w-5 h-5 text-gold-500" /> Create Promo Coupons</h3>
                  <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs text-gray-300">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Promo Code</label>
                      <input 
                        type="text"
                        required
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. GUESTSPECIAL"
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none font-bold tracking-wider"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Type</label>
                      <select 
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      >
                        <option value="percent">Percent Discount (%)</option>
                        <option value="flat">Flat Discount ($)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gold-500 uppercase text-[9px]">Discount Value</label>
                      <input 
                        type="number"
                        required
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                        className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="px-4 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-center"
                    >
                      Register Promo Code
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-neutral-900 p-5 rounded border border-neutral-800">
                      <span className="text-[10px] font-bold text-gold-500 uppercase font-mono tracking-widest bg-gold-500/5 px-2.5 py-1 rounded border border-gold-500/10 inline-block mb-3">
                        {coupon.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mb-2">
                        {coupon.discountType === 'percent' ? `${coupon.value}% Off Total Stay` : `$${coupon.value} Flat Off`}
                      </h4>
                      <p className="text-[10px] text-gray-500">Expires: {coupon.expiryDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Website Content CMS */}
            {activeTab === 'content' && (
              <div className="space-y-12">
                {/* CMS Sub-Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-neutral-900 pb-6">
                  <button 
                    onClick={() => { setSubTab('about'); setEditingMenuItem(null); setEditingSpaService(null); setEditingFleetItem(null); }}
                    className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      subTab === 'about' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> About Us Page
                  </button>
                  <button 
                    onClick={() => { setSubTab('events'); setEditingMenuItem(null); setEditingSpaService(null); setEditingFleetItem(null); }}
                    className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      subTab === 'events' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" /> Events Ballroom
                  </button>
                  <button 
                    onClick={() => { setSubTab('dining'); setEditingMenuItem(null); setEditingSpaService(null); setEditingFleetItem(null); }}
                    className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      subTab === 'dining' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Hotel className="w-4 h-4" /> Onyx Restaurant
                  </button>
                  <button 
                    onClick={() => { setSubTab('spa'); setEditingMenuItem(null); setEditingSpaService(null); setEditingFleetItem(null); }}
                    className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      subTab === 'spa' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" /> Wellness & Spa
                  </button>
                  <button 
                    onClick={() => { setSubTab('cars'); setEditingMenuItem(null); setEditingSpaService(null); setEditingFleetItem(null); }}
                    className={`px-4 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      subTab === 'cars' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Award className="w-4 h-4" /> Prestige Fleet
                  </button>
                </div>

                {/* Sub-Tab 1: About Us CMS */}
                {subTab === 'about' && (
                  <form onSubmit={handleSaveAbout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                    <div className="lg:col-span-8 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                      <h3 className="text-xl font-serif text-white mb-4">Edit About Us Section Content</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Main Page Title</label>
                          <input 
                            type="text"
                            required
                            value={aboutForm.title}
                            onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Subtitle Accent</label>
                          <input 
                            type="text"
                            required
                            value={aboutForm.subtitle}
                            onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Lead Section Header</label>
                        <input 
                          type="text"
                          required
                          value={aboutForm.header}
                          onChange={(e) => setAboutForm({ ...aboutForm, header: e.target.value })}
                          className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Body Paragraphs (Separate with double blank lines for spacing)</label>
                        <textarea 
                          required
                          value={aboutForm.paragraphs}
                          onChange={(e) => setAboutForm({ ...aboutForm, paragraphs: e.target.value })}
                          className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded outline-none h-64 font-sans leading-relaxed text-xs"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold uppercase tracking-widest text-[10px] rounded cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save About Us Content
                      </button>
                    </div>

                    <div className="lg:col-span-4 bg-neutral-900 p-6 rounded border border-neutral-800 space-y-6 self-start">
                      <h4 className="font-serif text-white text-base">About Section Media</h4>
                      
                      {aboutForm.image && (
                        <div className="relative group rounded overflow-hidden border border-neutral-800 aspect-video bg-neutral-950">
                          <img 
                            src={aboutForm.image} 
                            alt="About us preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-mono tracking-wider uppercase text-gold-500">Live Cover Image</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="font-bold text-gold-500 uppercase text-[9px] block">Upload New Hero Cover Photo</label>
                        <ImageUploader value={aboutForm.image} onChange={(base64) => setAboutForm({ ...aboutForm, image: base64 })} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Manual Photo URL (Fallback)</label>
                        <input 
                          type="text"
                          value={aboutForm.image}
                          onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                          className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none font-mono text-[9px]"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Sub-Tab 2: Events Ballroom CMS */}
                {subTab === 'events' && (
                  <form onSubmit={handleSaveEvents} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                    <div className="lg:col-span-8 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                      <h3 className="text-xl font-serif text-white mb-4">Edit Ballroom Events Content</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Page Header Title</label>
                          <input 
                            type="text"
                            required
                            value={eventsForm.title}
                            onChange={(e) => setEventsForm({ ...eventsForm, title: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Accent Subtitle</label>
                          <input 
                            type="text"
                            required
                            value={eventsForm.subtitle}
                            onChange={(e) => setEventsForm({ ...eventsForm, subtitle: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-950 rounded border border-neutral-800/60 space-y-4">
                        <h4 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Information Card 1: Capacities</h4>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-400 uppercase text-[9px]">Card Title</label>
                          <input 
                            type="text"
                            required
                            value={eventsForm.card1Title}
                            onChange={(e) => setEventsForm({ ...eventsForm, card1Title: e.target.value })}
                            className="bg-neutral-900 border border-neutral-800 text-white p-2 rounded outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-400 uppercase text-[9px]">Card Description</label>
                          <textarea 
                            required
                            value={eventsForm.card1Desc}
                            onChange={(e) => setEventsForm({ ...eventsForm, card1Desc: e.target.value })}
                            className="bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded outline-none h-20"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-950 rounded border border-neutral-800/60 space-y-4">
                        <h4 className="text-[10px] font-bold text-gold-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Information Card 2: Acoustics & Technical</h4>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-400 uppercase text-[9px]">Card Title</label>
                          <input 
                            type="text"
                            required
                            value={eventsForm.card2Title}
                            onChange={(e) => setEventsForm({ ...eventsForm, card2Title: e.target.value })}
                            className="bg-neutral-900 border border-neutral-800 text-white p-2 rounded outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-400 uppercase text-[9px]">Card Description</label>
                          <textarea 
                            required
                            value={eventsForm.card2Desc}
                            onChange={(e) => setEventsForm({ ...eventsForm, card2Desc: e.target.value })}
                            className="bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded outline-none h-20"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold uppercase tracking-widest text-[10px] rounded cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save Ballroom Info
                      </button>
                    </div>

                    <div className="lg:col-span-4 bg-neutral-900 p-6 rounded border border-neutral-800 space-y-6 self-start">
                      <h4 className="font-serif text-white text-base">Ballroom Media Gallery</h4>
                      
                      {eventsForm.image && (
                        <div className="relative group rounded overflow-hidden border border-neutral-800 aspect-video bg-neutral-950">
                          <img 
                            src={eventsForm.image} 
                            alt="Ballroom preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-mono tracking-wider uppercase text-gold-500">Events Cover Photo</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="font-bold text-gold-500 uppercase text-[9px] block">Upload Cover Photo</label>
                        <ImageUploader value={eventsForm.image} onChange={(base64) => setEventsForm({ ...eventsForm, image: base64 })} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Photo URL Link</label>
                        <input 
                          type="text"
                          value={eventsForm.image}
                          onChange={(e) => setEventsForm({ ...eventsForm, image: e.target.value })}
                          className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none font-mono text-[9px]"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Sub-Tab 3: Dining Menu CRUD CMS */}
                {subTab === 'dining' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                    <div className="lg:col-span-5 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6 h-fit">
                      <h3 className="text-xl font-serif text-white flex items-center gap-2">
                        <Hotel className="w-5 h-5 text-gold-500" /> 
                        {editingMenuItem ? 'Modify Menu Item' : 'Add New Cuisine Item'}
                      </h3>
                      <form onSubmit={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Cuisine Name</label>
                          <input 
                            type="text"
                            required
                            value={editingMenuItem ? editingMenuItem.name : newMenuItem.name}
                            onChange={(e) => editingMenuItem 
                              ? setEditingMenuItem({ ...editingMenuItem, name: e.target.value })
                              : setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                            placeholder="e.g. Seafood Okro Premium"
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Category</label>
                            <select 
                              value={editingMenuItem ? editingMenuItem.category : newMenuItem.category}
                              onChange={(e) => editingMenuItem 
                                ? setEditingMenuItem({ ...editingMenuItem, category: e.target.value as any })
                                : setNewMenuItem({ ...newMenuItem, category: e.target.value as any })}
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            >
                              <option value="starters">Starters / Small Chops</option>
                              <option value="main">Main Course / Swallows</option>
                              <option value="cocktails">Luxury Cocktails</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Price (₦ NGN)</label>
                            <input 
                              type="number"
                              required
                              value={editingMenuItem ? editingMenuItem.price : newMenuItem.price}
                              onChange={(e) => editingMenuItem 
                                ? setEditingMenuItem({ ...editingMenuItem, price: Number(e.target.value) })
                                : setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) })}
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Cuisine Description</label>
                          <textarea 
                            required
                            value={editingMenuItem ? editingMenuItem.description : newMenuItem.description}
                            onChange={(e) => editingMenuItem 
                              ? setEditingMenuItem({ ...editingMenuItem, description: e.target.value })
                              : setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                            placeholder="Describe ingredients, taste profile, or prep details..."
                            className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none h-20"
                          />
                        </div>

                        <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-3">
                          <label className="font-bold text-gold-500 uppercase text-[9px] block">Cuisine Cover Image</label>
                          
                          {(editingMenuItem ? editingMenuItem.image : newMenuItem.image) && (
                            <img 
                              src={editingMenuItem ? editingMenuItem.image : newMenuItem.image} 
                              alt="Cuisine thumbnail" 
                              className="w-16 h-16 object-cover rounded border border-neutral-800"
                            />
                          )}

                          <ImageUploader 
                            value={editingMenuItem ? editingMenuItem.image : (newMenuItem.image || '')}
                            onChange={(base64) => editingMenuItem 
                              ? setEditingMenuItem({ ...editingMenuItem, image: base64 })
                              : setNewMenuItem({ ...newMenuItem, image: base64 })} 
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                          {editingMenuItem && (
                            <button 
                              type="button"
                              onClick={() => setEditingMenuItem(null)}
                              className="px-4 py-2 bg-neutral-800 text-white font-semibold rounded cursor-pointer text-[10px] uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          )}
                          <button 
                            type="submit"
                            className="px-5 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-[10px] uppercase tracking-widest hover:bg-gold-600 transition-colors"
                          >
                            {editingMenuItem ? 'Apply Edit' : 'Add to Menu'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="lg:col-span-7 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                      <h3 className="text-xl font-serif text-white">Live Dining Menu List ({menuItemsAdmin.length} Items)</h3>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {menuItemsAdmin.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800 hover:border-gold-500/10 transition-all">
                            <div className="flex items-center gap-4">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'} 
                                alt={item.name} 
                                className="w-12 h-12 rounded object-cover border border-neutral-800"
                              />
                              <div>
                                <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest">{item.category}</span>
                                <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                                <p className="text-[10px] text-gray-500 max-w-[280px] truncate">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-gold-500 text-xs font-bold">₦{item.price.toLocaleString()}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setEditingMenuItem(item)}
                                  className="p-1.5 text-gold-500 hover:bg-neutral-800 rounded border border-neutral-800 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMenuItem(item.id!)}
                                  className="p-1.5 text-red-400 hover:bg-red-950/20 rounded border border-neutral-800 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Spa Treatment CRUD CMS */}
                {subTab === 'spa' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                    <div className="lg:col-span-5 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6 h-fit">
                      <h3 className="text-xl font-serif text-white flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-gold-500" /> 
                        {editingSpaService ? 'Modify Treatment' : 'Add New Spa Treatment'}
                      </h3>
                      <form onSubmit={editingSpaService ? handleUpdateSpaService : handleCreateSpaService} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Treatment / Service Name</label>
                          <input 
                            type="text"
                            required
                            value={editingSpaService ? editingSpaService.name : newSpaService.name}
                            onChange={(e) => editingSpaService 
                              ? setEditingSpaService({ ...editingSpaService, name: e.target.value })
                              : setNewSpaService({ ...newSpaService, name: e.target.value })}
                            placeholder="e.g. Royal Swedish Full Massage"
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Duration (e.g. 90 Mins)</label>
                            <input 
                              type="text"
                              required
                              value={editingSpaService ? editingSpaService.duration : newSpaService.duration}
                              onChange={(e) => editingSpaService 
                                ? setEditingSpaService({ ...editingSpaService, duration: e.target.value })
                                : setNewSpaService({ ...newSpaService, duration: e.target.value })}
                              placeholder="e.g. 75 Mins"
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Price (₦ NGN)</label>
                            <input 
                              type="number"
                              required
                              value={editingSpaService ? editingSpaService.price : newSpaService.price}
                              onChange={(e) => editingSpaService 
                                ? setEditingSpaService({ ...editingSpaService, price: Number(e.target.value) })
                                : setNewSpaService({ ...newSpaService, price: Number(e.target.value) })}
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Treatment Description</label>
                          <textarea 
                            required
                            value={editingSpaService ? editingSpaService.description : newSpaService.description}
                            onChange={(e) => editingSpaService 
                              ? setEditingSpaService({ ...editingSpaService, description: e.target.value })
                              : setNewSpaService({ ...newSpaService, description: e.target.value })}
                            placeholder="Detail therapeutic features, aroma oils, or target muscle relaxation..."
                            className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none h-24"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                          {editingSpaService && (
                            <button 
                              type="button"
                              onClick={() => setEditingSpaService(null)}
                              className="px-4 py-2 bg-neutral-800 text-white font-semibold rounded cursor-pointer text-[10px] uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          )}
                          <button 
                            type="submit"
                            className="px-5 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-[10px] uppercase tracking-widest hover:bg-gold-600 transition-colors"
                          >
                            {editingSpaService ? 'Apply Edit' : 'Add Treatment'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="lg:col-span-7 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                      <h3 className="text-xl font-serif text-white">Spa Services Catalog ({spaServicesAdmin.length} Offerings)</h3>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {spaServicesAdmin.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800 hover:border-gold-500/10 transition-all">
                            <div>
                              <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest">{item.duration} Session</span>
                              <h4 className="text-sm font-semibold text-white mt-0.5">{item.name}</h4>
                              <p className="text-[10px] text-gray-500 max-w-[400px] mt-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-gold-500 text-xs font-bold">₦{item.price.toLocaleString()}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setEditingSpaService(item)}
                                  className="p-1.5 text-gold-500 hover:bg-neutral-800 rounded border border-neutral-800 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSpaService(item.id!)}
                                  className="p-1.5 text-red-400 hover:bg-red-950/20 rounded border border-neutral-800 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 5: Fleet Prestige Cars CRUD CMS */}
                {subTab === 'cars' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                    <div className="lg:col-span-5 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6 h-fit">
                      <h3 className="text-xl font-serif text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-gold-500" /> 
                        {editingFleetItem ? 'Modify Vehicle' : 'Add Fleet Vehicle'}
                      </h3>
                      <form onSubmit={editingFleetItem ? handleUpdateFleetItem : handleCreateFleetItem} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Vehicle Model Name</label>
                          <input 
                            type="text"
                            required
                            value={editingFleetItem ? editingFleetItem.name : newFleetItem.name}
                            onChange={(e) => editingFleetItem 
                              ? setEditingFleetItem({ ...editingFleetItem, name: e.target.value })
                              : setNewFleetItem({ ...newFleetItem, name: e.target.value })}
                            placeholder="e.g. Armoured Mercedes Benz S-Class"
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Vehicle Class</label>
                            <input 
                              type="text"
                              required
                              value={editingFleetItem ? editingFleetItem.type : newFleetItem.type}
                              onChange={(e) => editingFleetItem 
                                ? setEditingFleetItem({ ...editingFleetItem, type: e.target.value })
                                : setNewFleetItem({ ...newFleetItem, type: e.target.value })}
                              placeholder="e.g. VIP / Executive / SUV"
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-gold-500 uppercase text-[9px]">Rate / Day (₦ NGN)</label>
                            <input 
                              type="number"
                              required
                              value={editingFleetItem ? editingFleetItem.pricePerDay : newFleetItem.pricePerDay}
                              onChange={(e) => editingFleetItem 
                                ? setEditingFleetItem({ ...editingFleetItem, pricePerDay: Number(e.target.value) })
                                : setNewFleetItem({ ...newFleetItem, pricePerDay: Number(e.target.value) })}
                              className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-3">
                          <label className="font-bold text-gold-500 uppercase text-[9px] block">Vehicle Cover Image</label>
                          
                          {(editingFleetItem ? editingFleetItem.image : newFleetItem.image) && (
                            <img 
                              src={editingFleetItem ? editingFleetItem.image : newFleetItem.image} 
                              alt="Vehicle thumbnail" 
                              className="w-24 h-16 object-cover rounded border border-neutral-800"
                            />
                          )}

                          <ImageUploader 
                            value={editingFleetItem ? editingFleetItem.image : (newFleetItem.image || '')}
                            onChange={(base64) => editingFleetItem 
                              ? setEditingFleetItem({ ...editingFleetItem, image: base64 })
                              : setNewFleetItem({ ...newFleetItem, image: base64 })} 
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                          {editingFleetItem && (
                            <button 
                              type="button"
                              onClick={() => setEditingFleetItem(null)}
                              className="px-4 py-2 bg-neutral-800 text-white font-semibold rounded cursor-pointer text-[10px] uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          )}
                          <button 
                            type="submit"
                            className="px-5 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-[10px] uppercase tracking-widest hover:bg-gold-600 transition-colors"
                          >
                            {editingFleetItem ? 'Apply Edit' : 'Add Vehicle'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="lg:col-span-7 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                      <h3 className="text-xl font-serif text-white">Prestige Transit Fleet ({fleetItemsAdmin.length} Vehicles)</h3>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {fleetItemsAdmin.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800 hover:border-gold-500/10 transition-all">
                            <div className="flex items-center gap-4">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400'} 
                                alt={item.name} 
                                className="w-16 h-10 rounded object-cover border border-neutral-800"
                              />
                              <div>
                                <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest bg-gold-500/5 border border-gold-500/10 px-2 py-0.5 rounded">{item.type}</span>
                                <h4 className="text-sm font-semibold text-white mt-1">{item.name}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-gold-500 text-xs font-bold">₦{item.pricePerDay.toLocaleString()} / day</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setEditingFleetItem(item)}
                                  className="p-1.5 text-gold-500 hover:bg-neutral-800 rounded border border-neutral-800 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteFleetItem(item.id!)}
                                  className="p-1.5 text-red-400 hover:bg-red-950/20 rounded border border-neutral-800 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Image Management (Firebase Storage to Firestore sync) */}
            {activeTab === 'images' && (
              <div className="space-y-8 animate-fade-in text-left">
                <div className="bg-neutral-900 p-6 md:p-8 rounded border border-neutral-800">
                  <h2 className="text-xl md:text-2xl font-serif text-white mb-2">Secure Firebase Storage Media Library</h2>
                  <p className="text-xs text-gray-400 font-light max-w-2xl leading-relaxed">
                    Replace or upload fresh media elements for the main pages of Oxvera Hotel. Files uploaded here are saved directly into secure cloud buckets in Firebase Storage, automatically generating persistent, fast-loading public URLs which are safely updated in Firestore.
                  </p>
                </div>

                {/* LOGO UPLOAD CARD */}
                <div className="bg-neutral-900 p-6 rounded border border-neutral-800">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                      <Globe className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Global Brand Identity</span>
                      <h3 className="text-lg font-serif text-white">Oxvera Brand Logo</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neutral-950 rounded border border-neutral-800">
                    <div className="w-32 h-16 bg-neutral-900 rounded flex items-center justify-center border border-neutral-800 shrink-0">
                      {globalSettings.logoUrl ? (
                        <img src={globalSettings.logoUrl} alt="Hotel Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-gold-500 font-serif font-bold text-lg">OXVERA</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                      <p className="text-xs text-gray-400">Upload a custom image to overwrite the default typographic header logo across the entire website navbar and invoice footer.</p>
                      <ImageUploader 
                        value={globalSettings.logoUrl || ''} 
                        folder="logo" 
                        onChange={(url) => handleUpdateLogo(url)} 
                      />
                    </div>
                  </div>
                </div>

                {/* HOME SLIDER SECTION */}
                <div className="bg-neutral-900 p-6 rounded border border-neutral-800 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                      <ImageIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Homepage Slides</span>
                      <h3 className="text-lg font-serif text-white">Hero Slider Configuration</h3>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-4">
                    <h4 className="text-xs font-bold text-gold-500 uppercase tracking-wider">Configure slides:</h4>
                    
                    <div className="space-y-6">
                      {(globalSettings.heroSlides || [
                        {
                          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
                          tag: 'Redefined Hospitality',
                          title: 'A New Paradigm of African Elegance',
                          subtitle: 'Experience Umuahia\'s premium five-star resort complete with state-of-the-art wellness suites, 24/7 security, and world-class service.'
                        },
                        {
                          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
                          tag: 'Prestige & Security',
                          title: 'Your Ultimate Private Sanctuary',
                          subtitle: 'Rest in luxury knowing that your peace is guaranteed by armed multi-tiered security, high-gated fences, and absolute privacy controls.'
                        },
                        {
                          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200',
                          tag: 'Azure Pools & Spa',
                          title: 'Rejuvenate in Therapeutic Azure Pools',
                          subtitle: 'Our master-crafted heated mineral waters and customized spa massage packages ensure therapeutic physical relief and deep wellness.'
                        }
                      ]).map((slide, idx, arr) => (
                        <div key={idx} className="p-4 bg-neutral-900 rounded border border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 space-y-2">
                            <img src={slide.image} alt="Slide Preview" className="w-full aspect-video rounded object-cover border border-neutral-800" />
                            <ImageUploader 
                              value={slide.image} 
                              onChange={(url) => {
                                const copy = [...arr];
                                copy[idx] = { ...copy[idx], image: url };
                                handleUpdateSlides(copy);
                              }} 
                            />
                          </div>
                          
                          <div className="md:col-span-9 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-gold-500 uppercase font-bold">Tagline</label>
                                <input 
                                  type="text" 
                                  value={slide.tag} 
                                  onChange={(e) => {
                                    const copy = [...arr];
                                    copy[idx] = { ...copy[idx], tag: e.target.value };
                                    handleUpdateSlides(copy);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 p-2 text-xs rounded text-white"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-mono text-gold-500 uppercase font-bold">Display Heading</label>
                                <input 
                                  type="text" 
                                  value={slide.title} 
                                  onChange={(e) => {
                                    const copy = [...arr];
                                    copy[idx] = { ...copy[idx], title: e.target.value };
                                    handleUpdateSlides(copy);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 p-2 text-xs rounded text-white"
                                />
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-mono text-gold-500 uppercase font-bold">Description Text</label>
                              <textarea 
                                value={slide.subtitle} 
                                onChange={(e) => {
                                  const copy = [...arr];
                                  copy[idx] = { ...copy[idx], subtitle: e.target.value };
                                  handleUpdateSlides(copy);
                                }}
                                className="bg-neutral-950 border border-neutral-800 p-2 text-xs rounded text-white h-16 resize-none"
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <button 
                                onClick={() => {
                                  const copy = arr.filter((_, sidx) => sidx !== idx);
                                  handleUpdateSlides(copy);
                                }}
                                className="px-3 py-1 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/30 rounded text-[9px] font-bold uppercase tracking-wider"
                              >
                                Delete Slide
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        const current = globalSettings.heroSlides || [
                          {
                            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
                            tag: 'Redefined Hospitality',
                            title: 'A New Paradigm of African Elegance',
                            subtitle: 'Experience Umuahia\'s premium five-star resort complete with state-of-the-art wellness suites, 24/7 security, and world-class service.'
                          }
                        ];
                        const updated = [...current, {
                          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
                          tag: 'Luxury Escapes',
                          title: 'New Majestic Suite Collection',
                          subtitle: 'Enjoy premier services curated for elite global citizens.'
                        }];
                        handleUpdateSlides(updated);
                      }}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-gold-500 font-bold border border-neutral-800 rounded text-xs uppercase tracking-widest cursor-pointer"
                    >
                      + Append New Slide to Carousel
                    </button>
                  </div>
                </div>

                {/* SECTION BANNER COVERS */}
                <div className="bg-neutral-900 p-6 rounded border border-neutral-800 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                      <Award className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Internal Pages Banners</span>
                      <h3 className="text-lg font-serif text-white">Menu & Services Cover Images</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
                    {/* Dining Banner Cover */}
                    <div className="p-4 bg-neutral-950 rounded border border-neutral-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Dining & Cuisine Banner</h4>
                        <img src={diningCoverUrl} alt="Dining Banner Cover" className="w-full aspect-video rounded object-cover border border-neutral-800 mb-4" />
                      </div>
                      <ImageUploader value={diningCoverUrl} onChange={(url) => handleUpdateDiningCover(url)} />
                    </div>

                    {/* Spa Banner Cover */}
                    <div className="p-4 bg-neutral-950 rounded border border-neutral-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Spa & Wellness Banner</h4>
                        <img src={spaCoverUrl} alt="Spa Banner Cover" className="w-full aspect-video rounded object-cover border border-neutral-800 mb-4" />
                      </div>
                      <ImageUploader value={spaCoverUrl} onChange={(url) => handleUpdateSpaCover(url)} />
                    </div>

                    {/* Cars Banner Cover */}
                    <div className="p-4 bg-neutral-950 rounded border border-neutral-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Executive Fleet Banner</h4>
                        <img src={carsCoverUrl} alt="Fleet Banner Cover" className="w-full aspect-video rounded object-cover border border-neutral-800 mb-4" />
                      </div>
                      <ImageUploader value={carsCoverUrl} onChange={(url) => handleUpdateCarsCover(url)} />
                    </div>
                  </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* About Us Card */}
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                          <ImageIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Core Brand Asset</span>
                          <h3 className="text-lg font-serif text-white">About Us Hero Cover</h3>
                        </div>
                      </div>
                      
                      <div className="aspect-video w-full rounded overflow-hidden border border-neutral-800 mb-4 bg-neutral-950">
                        <img 
                          src={aboutForm.image} 
                          alt="About Us current" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUploader 
                        value={aboutForm.image} 
                        folder="about" 
                        onChange={(url) => handleUpdateAboutImage(url)} 
                      />
                      <p className="text-[10px] text-gray-500 text-center font-mono">
                        Folder: <span className="text-gold-500">about/</span> in Firebase Storage
                      </p>
                    </div>
                  </div>

                  {/* Spa Services Card */}
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                          <Sparkles className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Wellness Services</span>
                          <h3 className="text-lg font-serif text-white">Spa & Massages Media</h3>
                        </div>
                      </div>

                      {spaServicesAdmin.length === 0 ? (
                        <p className="text-xs text-gray-500 font-mono py-8 text-center">No Spa services found in Firestore</p>
                      ) : (
                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 mb-4 text-left">
                          {spaServicesAdmin.map((spa) => (
                            <div key={spa.id} className="p-3 bg-neutral-950 rounded border border-neutral-800 flex flex-col gap-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-white truncate">{spa.name}</h4>
                                  <p className="text-[9px] text-gray-400 font-mono">{spa.duration} | ₦{spa.price.toLocaleString()}</p>
                                </div>
                                {spa.image && (
                                  <img 
                                    src={spa.image} 
                                    alt={spa.name} 
                                    className="w-12 h-12 rounded object-cover border border-neutral-800 shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                              <ImageUploader 
                                value={spa.image || ''} 
                                folder="spa" 
                                onChange={(url) => handleUpdateSpaImage(spa.id!, url)} 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prestige Transit Fleet */}
                  <div className="bg-neutral-900 p-6 rounded border border-neutral-800 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-1">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="p-2 bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                          <Car className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest block">Transit Fleet Assets</span>
                          <h3 className="text-lg font-serif text-white">Luxury Vehicles Media</h3>
                        </div>
                      </div>

                      {fleetItemsAdmin.length === 0 ? (
                        <p className="text-xs text-gray-500 font-mono py-8 text-center">No fleet vehicles found in Firestore</p>
                      ) : (
                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 mb-4 text-left">
                          {fleetItemsAdmin.map((car) => (
                            <div key={car.id} className="p-3 bg-neutral-950 rounded border border-neutral-800 flex flex-col gap-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[8px] font-mono bg-gold-500/5 text-gold-500 border border-gold-500/10 px-1.5 py-0.5 rounded uppercase">{car.type}</span>
                                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{car.name}</h4>
                                  <p className="text-[9px] text-gray-400 font-mono">₦{car.pricePerDay.toLocaleString()} / day</p>
                                </div>
                                {car.image && (
                                  <img 
                                    src={car.image} 
                                    alt={car.name} 
                                    className="w-16 h-10 rounded object-cover border border-neutral-800 shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                              <ImageUploader 
                                value={car.image || ''} 
                                folder="cars" 
                                onChange={(url) => handleUpdateCarImage(car.id!, url)} 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Blog Articles Manager (CRUD) */}
            {activeTab === 'blogs' && (
              <div className="space-y-10 animate-fade-in text-left">
                <div className="bg-neutral-900 p-6 md:p-8 rounded border border-neutral-800">
                  <h2 className="text-xl md:text-2xl font-serif text-white mb-2">Corporate Blog Articles Manager</h2>
                  <p className="text-xs text-gray-400 font-light max-w-2xl leading-relaxed">
                    Write, edit, and publish custom articles to the corporate Oxvera Hotel Blog page. Keep guests updated on hotel promotions, culinary events, or tourism guides in Abia State.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-gray-300">
                  <div className="lg:col-span-5 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6 h-fit">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-gold-500" /> 
                      {editingBlog ? 'Modify Blog Post' : 'Write New Blog Post'}
                    </h3>
                    <form onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Post Title</label>
                        <input 
                          type="text"
                          required
                          value={editingBlog ? editingBlog.title : newBlog.title}
                          onChange={(e) => editingBlog 
                            ? setEditingBlog({ ...editingBlog, title: e.target.value })
                            : setNewBlog({ ...newBlog, title: e.target.value })}
                          placeholder="e.g. Fine Dining & Swallows: Redefining Luxury Cuisine"
                          className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Category</label>
                          <select 
                            value={editingBlog ? editingBlog.category : newBlog.category}
                            onChange={(e) => editingBlog 
                              ? setEditingBlog({ ...editingBlog, category: e.target.value })
                              : setNewBlog({ ...newBlog, category: e.target.value })}
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none text-xs"
                          >
                            <option value="Cuisine">Cuisine & Gastronomy</option>
                            <option value="Wellness">Wellness & Spa</option>
                            <option value="Culture">Local Tourism & Culture</option>
                            <option value="Lifestyle">Elite Lifestyle</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Read Time</label>
                          <input 
                            type="text"
                            required
                            value={editingBlog ? editingBlog.readTime : newBlog.readTime}
                            onChange={(e) => editingBlog 
                              ? setEditingBlog({ ...editingBlog, readTime: e.target.value })
                              : setNewBlog({ ...newBlog, readTime: e.target.value })}
                            placeholder="e.g. 5 Mins"
                            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Excerpt / Summary</label>
                        <textarea 
                          required
                          value={editingBlog ? editingBlog.excerpt : newBlog.excerpt}
                          onChange={(e) => editingBlog 
                            ? setEditingBlog({ ...editingBlog, excerpt: e.target.value })
                            : setNewBlog({ ...newBlog, excerpt: e.target.value })}
                          placeholder="Provide a short 1-2 sentence preview summary of the post..."
                          className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none h-16 text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Article Body Content</label>
                        <textarea 
                          required
                          value={editingBlog ? editingBlog.content : newBlog.content}
                          onChange={(e) => editingBlog 
                            ? setEditingBlog({ ...editingBlog, content: e.target.value })
                            : setNewBlog({ ...newBlog, content: e.target.value })}
                          placeholder="Write the full body content here (supports plain text paragraphs)..."
                          className="bg-neutral-950 border border-neutral-800 text-white p-2 rounded outline-none h-40 text-xs"
                        />
                      </div>

                      <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-3">
                        <label className="font-bold text-gold-500 uppercase text-[9px] block">Article Cover Image</label>
                        
                        {(editingBlog ? editingBlog.image : newBlog.image) && (
                          <img 
                            src={editingBlog ? editingBlog.image : newBlog.image} 
                            alt="Cuisine thumbnail" 
                            className="w-24 h-16 object-cover rounded border border-neutral-800"
                          />
                        )}

                        <ImageUploader 
                          value={editingBlog ? editingBlog.image : newBlog.image}
                          onChange={(base64) => editingBlog 
                            ? setEditingBlog({ ...editingBlog, image: base64 })
                            : setNewBlog({ ...newBlog, image: base64 })} 
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        {editingBlog && (
                          <button 
                            type="button"
                            onClick={() => setEditingBlog(null)}
                            className="px-4 py-2 bg-neutral-800 text-white font-semibold rounded cursor-pointer text-[10px] uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit"
                          className="px-5 py-2.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-[10px] uppercase tracking-widest hover:bg-gold-600 transition-colors"
                        >
                          {editingBlog ? 'Apply Edit' : 'Publish Post'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-7 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
                    <h3 className="text-xl font-serif text-white">Published Articles ({blogsAdmin.length})</h3>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      {blogsAdmin.map((post) => (
                        <div key={post.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800 hover:border-gold-500/10 transition-all">
                          <div className="flex items-center gap-4 text-left">
                            <img 
                              src={post.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200'} 
                              alt={post.title} 
                              className="w-16 h-12 rounded object-cover border border-neutral-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest bg-gold-500/5 px-2 py-0.5 rounded border border-gold-500/10">{post.category}</span>
                              <h4 className="text-sm font-semibold text-white mt-1.5 truncate max-w-[280px]">{post.title}</h4>
                              <p className="text-[10px] text-gray-500 font-mono mt-1">{post.date} | {post.readTime}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingBlog(post)}
                              className="p-1.5 text-gold-500 hover:bg-neutral-800 rounded border border-neutral-800 cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBlog(post.id!)}
                              className="p-1.5 text-red-400 hover:bg-red-950/20 rounded border border-neutral-800 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-8 animate-fade-in text-left">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-3xl font-serif text-white tracking-wide">SEO & Meta Manager</h2>
                  <p className="text-xs text-gray-400 font-light mt-1">Configure search engine titles, keywords, and descriptions for each key section of Oxvera Hotel.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column - Section Selector */}
                  <div className="lg:col-span-4 bg-neutral-900 p-6 rounded border border-neutral-800 space-y-4">
                    <h3 className="text-sm font-bold text-gold-500 uppercase tracking-wider">Select Page Section</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Choose which page metadata you would like to edit. Updates will reflect on client-side routing instantly.</p>
                    
                    <div className="space-y-2">
                      {[
                        { id: 'home', label: 'Home Page' },
                        { id: 'rooms', label: 'Rooms & Suites' },
                        { id: 'dining', label: 'Onyx Restaurant Menu' },
                        { id: 'spa', label: 'Ananda Wellness & Spa' },
                        { id: 'cars', label: 'Executive Car Hire' },
                        { id: 'gallery', label: 'Gallery & Grounds' },
                        { id: 'blog', label: 'The Oxvera Journal Blog' },
                        { id: 'events', label: 'Ballroom & Conferences' },
                        { id: 'about', label: 'About Oxvera Hotel' }
                      ].map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setSelectedSeoSection(sec.id)}
                          className={`w-full text-left px-4 py-3 rounded text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${
                            selectedSeoSection === sec.id 
                              ? 'bg-gold-500 text-neutral-950 font-bold border-l-4 border-white' 
                              : 'bg-neutral-950 text-gray-300 hover:bg-neutral-800 border-l-4 border-transparent'
                          }`}
                        >
                          <span>{sec.label}</span>
                          <span className="font-mono text-[9px] opacity-60">/{sec.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Meta Fields Form */}
                  <div className="lg:col-span-8 bg-neutral-900 p-8 rounded border border-neutral-800">
                    <form onSubmit={handleSaveSEO} className="space-y-6">
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                        <span className="text-xs font-mono text-gold-500 uppercase tracking-widest">
                          Editing section: <strong className="text-white">{selectedSeoSection}</strong>
                        </span>
                        {seoLoading && (
                          <div className="flex items-center gap-1.5 text-xs text-gold-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Fetching...</span>
                          </div>
                        )}
                      </div>

                      {seoSaveSuccess && (
                        <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs flex items-center gap-2 animate-pulse">
                          <CheckCircle className="w-4 h-4" />
                          <span>SEO Settings updated successfully in Firestore! Changes are active.</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Meta Page Title</label>
                          <span className="text-[9px] font-mono text-gray-500">{seoTitle.length} chars (Recommended: 50-60)</span>
                        </div>
                        <input 
                          type="text"
                          required
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="e.g. Oxvera Hotel | Luxury 5-Star Hotel & Resort in Umuahia"
                          className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded outline-none text-xs focus:border-gold-500/55 transition-all font-sans"
                        />
                        <p className="text-[10px] text-gray-500 font-light">The title tag of the webpage. This is what displays on search engine result pages (SERPs) and browser tabs.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <label className="font-bold text-gold-500 uppercase text-[9px]">Meta Description</label>
                          <span className="text-[9px] font-mono text-gray-500">{seoDescription.length} chars (Recommended: 120-160)</span>
                        </div>
                        <textarea 
                          required
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Provide a detailed meta description of this section..."
                          className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded outline-none h-28 text-xs focus:border-gold-500/55 transition-all leading-relaxed font-sans"
                        />
                        <p className="text-[10px] text-gray-500 font-light">A brief 1-2 sentence description summarizing the content of the page section. Used as the snippet in SERPs.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gold-500 uppercase text-[9px]">Meta Keywords</label>
                        <textarea 
                          required
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="e.g. luxury hotel, umuahia hotel, 5 star hotel nigeria"
                          className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded outline-none h-20 text-xs focus:border-gold-500/55 transition-all font-mono"
                        />
                        <p className="text-[10px] text-gray-500 font-light">Comma-separated key phrases relevant to this page section. Helps describe the semantic focus of the content.</p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          type="submit"
                          disabled={seoLoading}
                          className="px-6 py-3.5 bg-gold-500 text-neutral-950 font-bold rounded cursor-pointer text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
                        >
                          {seoLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save SEO Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-8 animate-fade-in text-left">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-3xl font-serif text-white tracking-wide">Elite Access Whitelist</h2>
                  <p className="text-xs text-gray-400 font-light mt-1">Manage guest access privileges. Whitelist new client emails before they register, or toggle access for current users.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Whitelist / Pre-approve Email form */}
                  <div className="lg:col-span-4 bg-neutral-900 p-6 rounded border border-neutral-800 space-y-4 h-fit">
                    <h3 className="text-sm font-bold text-gold-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      <span>Pre-Approve Email</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Enter a user's Google Email to pre-authorize them. When they first sign in, they will bypass the pending screen and gain instant elite access.
                    </p>

                    <form onSubmit={handlePreApprove} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gold-500 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          value={preApproveEmail}
                          onChange={(e) => setPreApproveEmail(e.target.value)}
                          placeholder="guest@gmail.com"
                          className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded text-xs outline-none focus:border-gold-500/55 transition-all"
                        />
                      </div>

                      {preApproveMsg && (
                        <div className={`p-3 rounded text-[10px] border ${
                          preApproveMsg.includes('Error') || preApproveMsg.includes('failed')
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                          {preApproveMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={preApproveLoading}
                        className="w-full py-3 bg-gold-500 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded hover:bg-gold-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        {preApproveLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Authorize Email</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right: Registered Users List */}
                  <div className="lg:col-span-8 bg-neutral-900 p-6 rounded border border-neutral-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gold-500" />
                        <span>Registered Users & Guest List</span>
                      </h3>
                      <button 
                        onClick={fetchUsersList}
                        className="text-[10px] font-semibold text-gold-500 hover:text-gold-400 underline transition-all bg-transparent border-none cursor-pointer"
                      >
                        Refresh List
                      </button>
                    </div>

                    {usersLoading ? (
                      <div className="flex justify-center items-center py-16 text-xs text-gold-500 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading registry database...</span>
                      </div>
                    ) : usersList.length === 0 ? (
                      <div className="py-16 text-center text-xs text-gray-400 font-light">
                        No registered users found in the database.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-850 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                              <th className="py-3 px-2">Guest / User</th>
                              <th className="py-3 px-2">Email Address</th>
                              <th className="py-3 px-2">Loyalty Points</th>
                              <th className="py-3 px-2">Role / Status</th>
                              <th className="py-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersList.map((usr) => {
                              const isOwner = usr.email === 'waterberth@gmail.com';
                              return (
                                <tr key={usr.id} className="border-b border-neutral-850 hover:bg-neutral-950/40 transition-colors">
                                  <td className="py-3.5 px-2 flex items-center gap-2.5">
                                    <img 
                                      src={usr.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                                      alt="" 
                                      className="w-7 h-7 rounded-full border border-neutral-800"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-white text-xs">{usr.displayName || 'Anonymous Guest'}</span>
                                      <span className="text-[10px] text-gray-500 font-light">
                                        {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'Pending Creation'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-2 text-gray-300 font-mono text-[11px]">{usr.email}</td>
                                  <td className="py-3.5 px-2">
                                    <span className="text-gold-500 font-bold font-mono text-xs">{usr.loyaltyPoints || 0} pts</span>
                                  </td>
                                  <td className="py-3.5 px-2">
                                    {isOwner ? (
                                      <span className="px-2 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded text-[9px] uppercase tracking-wider font-extrabold">
                                        System Owner
                                      </span>
                                    ) : usr.accessGranted ? (
                                      <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-[9px] uppercase tracking-wider font-semibold">
                                        Granted
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px] uppercase tracking-wider font-semibold animate-pulse">
                                        Pending Approval
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-2 text-right">
                                    {isOwner ? (
                                      <span className="text-[10px] text-gray-500 italic pr-2">Always Allowed</span>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleAccess(usr.id, !!usr.accessGranted)}
                                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                          usr.accessGranted
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                            : 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-neutral-950'
                                        }`}
                                      >
                                        {usr.accessGranted ? 'Revoke' : 'Grant'}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
