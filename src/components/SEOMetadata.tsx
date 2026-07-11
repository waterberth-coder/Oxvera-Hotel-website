import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SEOMetadataProps {
  currentView: string;
}

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

export default function SEOMetadata({ currentView }: SEOMetadataProps) {
  const [seo, setSeo] = useState(() => {
    return DEFAULT_SEO[currentView] || DEFAULT_SEO.home;
  });

  useEffect(() => {
    async function fetchSEO() {
      try {
        const docRef = doc(db, 'seo_settings', currentView);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSeo({
            title: data.title || DEFAULT_SEO[currentView]?.title || DEFAULT_SEO.home.title,
            description: data.description || DEFAULT_SEO[currentView]?.description || DEFAULT_SEO.home.description,
            keywords: data.keywords || DEFAULT_SEO[currentView]?.keywords || DEFAULT_SEO.home.keywords
          });
        } else {
          // Fall back to default
          setSeo(DEFAULT_SEO[currentView] || DEFAULT_SEO.home);
        }
      } catch (err) {
        console.warn("Could not load custom SEO metadata for view", currentView, err);
        setSeo(DEFAULT_SEO[currentView] || DEFAULT_SEO.home);
      }
    }
    fetchSEO();
  }, [currentView]);

  useEffect(() => {
    // 1. Update document title
    document.title = seo.title;

    // 2. Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seo.description);

    // 3. Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seo.keywords);
  }, [seo]);

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "name": "Oxvera Hotel",
      "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000",
      "description": seo.description,
      "telephone": "+234-80-OXVERA-HOTEL",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Oxvera Boulevard, GRA Phase II",
        "addressLocality": "Umuahia",
        "addressRegion": "Abia State",
        "addressCountry": "Nigeria"
      },
      "starRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "priceRange": "₦65,000 - ₦350,000",
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Swimming Pool", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Luxury Spa & Body Treatment", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Pulse Fitness Gym", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Obsidian Executive Bar", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "24h Constant Electricity & Backup Generator", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "24/7 Security Patrol & CCTV", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Airport Pickup & Car Hire Fleet", "value": true }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": "Onyx Restaurant at Oxvera",
      "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400",
      "telephone": "+234-80-OXVERA-DINING",
      "menu": "https://oxvera.com/menu",
      "servesCuisine": "Traditional Nigerian, Afro-Fusion, International Fine Dining",
      "priceRange": "₦5,000 - ₦50,000"
    },
    {
      "@context": "https://schema.org",
      "@type": "EventVenue",
      "name": "Oxvera Grand Ballroom",
      "description": "Premium 600-capacity event conference hall and wedding reception center in Umuahia.",
      "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemas)}
    </script>
  );
}
