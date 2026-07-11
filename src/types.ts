export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  discountPrice?: number;
  amenities: string[];
  images: string[];
  capacity: number;
  size: string;
  bed: string;
  type: 'standard' | 'deluxe' | 'suite' | 'penthouse';
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  totalPrice: number;
  adults: number;
  children: number;
  promoCode?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'starters' | 'main' | 'desserts' | 'wines' | 'cocktails';
  image: string;
  isAvailable: boolean;
}

export interface CarService {
  id: string;
  name: string;
  type: 'suv' | 'sedan' | 'airport-pickup' | 'wedding-car';
  pricePerDay: number;
  image: string;
  isAvailable: boolean;
}

export interface Testimonial {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  source: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'rooms' | 'spa' | 'restaurant' | 'pool' | 'gym' | 'lobby' | 'bar' | 'events';
  title: string;
  altText: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  isActive: boolean;
  expiryDate: string;
}
