import { Room, MenuItem, CarService, Testimonial, GalleryItem } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'deluxe-king',
    name: 'Deluxe King Suite',
    description: 'A luxurious sanctuary designed with contemporary elegance. Featuring floor-to-ceiling windows overlooking the vibrant skyline of Umuahia, an Italian marble bathroom with dual vanities, an expansive walk-in shower, and bespoke Egyptian cotton linens.',
    pricePerNight: 95000,
    amenities: ['King Bed', 'Free Breakfast', 'Smart TV', 'High-Speed WiFi', 'City View', '29sqm', 'Espresso Machine', '24h Room Service'],
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000'
    ],
    capacity: 2,
    size: '45m²',
    bed: '1 King Bed',
    type: 'deluxe',
    isAvailable: true
  },
  {
    id: 'executive-suite',
    name: 'Executive Garden Suite',
    description: 'Offering a perfect blend of privacy and luxury, this garden-level suite boasts a private sun-drenched terrace, a separate executive lounge area suitable for confidential business meetings or deep relaxation, and curated Nigerian artworks.',
    pricePerNight: 150000,
    amenities: ['King Bed', 'Free Breakfast', 'Smart TV', 'High-Speed WiFi', 'Garden Terrace', '85sqm', 'Mini Bar', 'VIP Lounge Access', 'Airport Pickup'],
    images: [
      'https://images.unsplash.com/photo-1582719478237-9bee3638efcd?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000'
    ],
    capacity: 2,
    size: '85m²',
    bed: '1 King Bed',
    type: 'suite',
    isAvailable: true
  },
  {
    id: 'royal-penthouse',
    name: 'Royal Skyline Penthouse',
    description: 'The supreme definition of international hospitality. Positioned on our top floor, this state-of-the-art suite features two king bedrooms, a private dining room for up to 8 guests, a private library, a standalone copper soaking tub, and a 24-hour dedicated butler service.',
    pricePerNight: 350000,
    amenities: ['2 King Beds', 'Free Breakfast', '85" Smart TV', 'Ultra-Fiber WiFi', '360° Panoramic View', '220sqm', 'Butler Service', 'Private Bar', 'VIP Spa Access'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1000'
    ],
    capacity: 4,
    size: '220m²',
    bed: '2 King Beds',
    type: 'penthouse',
    isAvailable: true
  },
  {
    id: 'standard-executive',
    name: 'Executive Queen Room',
    description: 'A masterpiece of compact luxury, specifically designed for modern corporate executives. It provides an ergonomic executive workspace, seamless high-speed connectivity, automated bedside environmental controls, and a custom plush queen bed.',
    pricePerNight: 65000,
    amenities: ['Queen Bed', 'Free Breakfast', 'Desk', 'High-Speed WiFi', 'Workstation', '32sqm', 'Espresso Brewer'],
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000'
    ],
    capacity: 2,
    size: '35m²',
    bed: '1 Queen Bed',
    type: 'standard',
    isAvailable: true
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'starter-1',
    name: 'Curated Peppered Snail Duo',
    description: 'Succulent forest snails sautéed in habanero infusion, sweet bell peppers, and fresh local herbs.',
    price: 12000,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    isAvailable: true
  },
  {
    id: 'main-1',
    name: 'Prime Grilled Croaker Deluxe',
    description: 'Fresh Atlantic croaker fish spiced with traditional aromatic extracts, flame-grilled and served with crispy yam fries and sweet plantains.',
    price: 25000,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400',
    isAvailable: true
  },
  {
    id: 'main-2',
    name: 'Oxvera Signature Jollof Feast',
    description: 'Smoked firewood Jollof rice served with glazed prime beef short ribs, sweet dodo, and luxury vegetable salad.',
    price: 18000,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    isAvailable: true
  },
  {
    id: 'cocktail-1',
    name: 'The Umuahia Sunburst',
    description: 'A refreshing premium cocktail mixed with aged white rum, passion fruit purée, fresh lime juice, and sweet orange blossom syrup.',
    price: 8500,
    category: 'cocktails',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400',
    isAvailable: true
  }
];

export const INITIAL_FLEET: CarService[] = [
  {
    id: 'car-1',
    name: 'Range Rover Autobiography',
    type: 'suv',
    pricePerDay: 120000,
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: 'car-2',
    name: 'Mercedes-Benz S-Class S580',
    type: 'sedan',
    pricePerDay: 150000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: 'car-3',
    name: 'Toyota Prado VIP Bulletproof',
    type: 'suv',
    pricePerDay: 180000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: 'car-4',
    name: 'Luxury Executive Airport Shuttle',
    type: 'airport-pickup',
    pricePerDay: 35000,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    guestName: 'Chief Emmanuel Uzoma',
    rating: 5,
    comment: 'Oxvera is by far the finest hotel in Umuahia, if not the entire East. The attention to detail, secure environment, super-fast fiber internet, and Michelin-tier dining makes it comparable to top hotels in London or Lagos. Will certainly stay again.',
    source: 'Google Reviews',
    createdAt: '2026-06-25'
  },
  {
    id: 'test-2',
    guestName: 'Dr. Sarah Alabi',
    rating: 5,
    comment: 'I hosted our executive medicine conference in the Oxvera Event Hall. The catering was spectacular, the team was outstanding, and the room bookings for our delegates went seamlessly. The pool bar at sunset is breathtaking!',
    source: 'Booking.com',
    createdAt: '2026-07-02'
  },
  {
    id: 'test-3',
    guestName: 'Kelechi Egwu',
    rating: 5,
    comment: 'Exceptional 5-star experience. The spa is so relaxing and the fitness centre is fully equipped. Airport pickup was highly professional in an executive Mercedes-Benz. Oxvera represents true African hospitality.',
    source: 'Google Reviews',
    createdAt: '2026-07-08'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
    category: 'lobby',
    title: 'Imperial Grand Lobby',
    altText: 'Oxvera Hotel main reception lobby featuring custom gold accents'
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=600',
    category: 'spa',
    title: 'Ananda Wellness Spa',
    altText: 'Serene wellness spa and deep relaxation therapy rooms'
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1582719478237-9bee3638efcd?auto=format&fit=crop&q=80&w=600',
    category: 'rooms',
    title: 'Executive Master Suite',
    altText: 'Exquisite modern hotel room layout'
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=600',
    category: 'pool',
    title: 'The Azure Horizon Pool',
    altText: 'Full panoramic infinity swimming pool view'
  },
  {
    id: 'gal-5',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
    category: 'restaurant',
    title: 'Onyx Michelin Restaurant',
    altText: 'Fine dining seating layout'
  },
  {
    id: 'gal-6',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
    category: 'bar',
    title: 'The Obsidian Executive Bar',
    altText: 'Dark luxury cocktail bar'
  },
  {
    id: 'gal-7',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
    category: 'events',
    title: 'Grand Ballroom Event Hall',
    altText: 'Modern 600-capacity event conference hall'
  },
  {
    id: 'gal-8',
    url: 'https://images.unsplash.com/photo-1535230814474-486cc284db76?auto=format&fit=crop&q=80&w=600',
    category: 'gym',
    title: 'Pulse Fitness Arena',
    altText: 'Professional training gymnasium equipment'
  }
];
