import React, { useState, useEffect } from 'react';
import { X, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { INITIAL_GALLERY } from '../constants/initialData';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { GalleryItem } from '../types';

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryItem[];
        setGalleryItems(items);
      } else {
        setGalleryItems(INITIAL_GALLERY);
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to load gallery items from Firestore:", error);
      setGalleryItems(INITIAL_GALLERY);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Lobby', value: 'lobby' },
    { label: 'Suites', value: 'rooms' },
    { label: 'Dining', value: 'restaurant' },
    { label: 'Wellness Spa', value: 'spa' },
    { label: 'Heated Pool', value: 'pool' },
    { label: 'Obsidian Bar', value: 'bar' },
    { label: 'Grand Ballroom', value: 'events' },
    { label: 'Fitness Center', value: 'gym' }
  ];

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const openLightbox = (url: string) => {
    const idx = galleryItems.findIndex(item => item.url === url);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && galleryItems.length > 0) {
      setLightboxIndex((prev) => (prev! - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && galleryItems.length > 0) {
      setLightboxIndex((prev) => (prev! + 1) % galleryItems.length);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-neutral-950 text-white select-none border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3">Hotel Portfolio</span>
          <h2 className="text-3xl md:text-5xl font-serif">The Oxvera Experience</h2>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-gold-500 text-neutral-950 font-black'
                  : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item.url)}
              className="group relative rounded overflow-hidden aspect-[4/3] cursor-pointer border border-neutral-800/80 hover:border-gold-500/25 transition-all duration-500 shadow-lg shadow-black/40"
            >
              <img
                src={item.url || null}
                alt={item.altText}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Luxury dark hover overlay */}
              <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                <div className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 mb-2 transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-serif text-white font-semibold tracking-wide">{item.title}</h4>
                <span className="text-[9px] text-gold-500 uppercase font-mono tracking-widest mt-1">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && galleryItems.length > 0 && galleryItems[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in cursor-zoom-out"
        >
          {/* Top Bar controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white select-none">
            <span className="text-xs font-mono">
              {lightboxIndex + 1} / {galleryItems.length} -{' '}
              <span className="text-gold-500 uppercase font-bold">{galleryItems[lightboxIndex].category}</span>
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white hover:text-gold-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left arrow */}
          <button
            onClick={handleLightboxPrev}
            className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-white hover:text-gold-500 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="max-w-4xl max-h-[75vh] relative flex flex-col items-center">
            <img
              src={galleryItems[lightboxIndex].url || null}
              alt={galleryItems[lightboxIndex].altText}
              className="max-w-full max-h-[70vh] object-contain rounded border border-gold-500/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="text-center mt-4 px-6 max-w-xl">
              <h3 className="text-lg font-serif text-white">{galleryItems[lightboxIndex].title}</h3>
              <p className="text-xs text-gray-400 mt-1">{galleryItems[lightboxIndex].altText}</p>
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={handleLightboxNext}
            className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-white hover:text-gold-500 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
