import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, ArrowLeft, Search, Tag, Share2, Loader2, Award } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Culinary' | 'Wellness' | 'Lifestyle' | 'News' | string;
  image: string;
  readTime: string;
  createdAt: string;
  author?: string;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    title: "Behind the Scenes of Onyx: Crafting Our Michelin-Style Afro-Fusion Menu",
    excerpt: "Join our master Executive Chef as we explore the culinary inspirations, rich traditional flavors, and modern styling behind Oxvera's acclaimed fine dining experience.",
    category: "Culinary",
    readTime: "5 Min Read",
    createdAt: "2026-07-01",
    author: "Chef Antoinette Madu",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
    content: `At Onyx Restaurant, culinary art is more than just combining ingredients—it is a spiritual connection to history, tradition, and global luxury. Our master Executive Chef, Antoinette Madu, has designed a sensory journey that marries rich Nigerian heritage with French classical techniques.

### The Philosophy of Afro-Fusion

"Our goal was never just to copy European dishes," Chef Antoinette explains during an early-morning prep session in our state-of-the-art kitchen. "Our dream is to honor the incredible, earthy profiles of native ingredients like black soup spices, ehuru, and locust beans, while presenting them in a style that rivals any fine dining institution in Paris, Tokyo, or New York."

One of the signature showpieces of the menu is our *Claypot-Charred Red Snapper*. The fish is sourced fresh daily, marinated in an intricate oil infusion of twenty local herbs, and slow-seared over traditional hardwood embers. It is served with a delicate lemongrass emulsion and a wild hibiscus gel that provides an acidic, floral balance.

### Sourcing & Mastery

A crucial part of our Michelin-level standard is ingredient integrity. We collaborate closely with organic local farms across Abia State to supply fresh vegetables, lemongrass, and native micro-greens. Our premium black truffles and vintage balsamic oils are flown in directly from Italy, creating a truly global dialogue on the plate.

Whether you are enjoying our gourmet *Deconstructed Suya Filet* or our signature *Zobo-Spiced Velvet Mousse*, you are experiencing hours of refinement, testing, and absolute culinary devotion. Book your next private table at Onyx to taste history redefined.`
  },
  {
    title: "The Ultimate Guide to Rejuvenation: 5 Wellness Rituals at Ananda Spa",
    excerpt: "Escape the noise and restore your physical and mental balance. Discover our most therapeutic treatments designed to completely align your chakras.",
    category: "Wellness",
    readTime: "4 Min Read",
    createdAt: "2026-07-05",
    author: "Elena Rostov (Lead Therapist)",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
    content: `Modern life demands constant high-performance, leaving our bodies and minds in a state of continuous overstimulation. At Ananda Wellness & Spa, we have crafted a quiet, timeless sanctuary to counter this fatigue. Here are five therapeutic rituals recommended by our world-class therapists to deeply restore your energy.

### 1. The Royal Hot Stone Basalt Massage
Using heated, smooth volcanic basalt stones placed along your spine's key energy lines, this massage utilizes deep thermal conductivity to relax stiff muscles. The heat expands blood vessels, promoting healthy circulation and melting away mental anxiety.

### 2. Pure Eucalyptus Steam Therapy
Our high-tech steam rooms are infused with premium grade organic eucalyptus oil. Inhaling this soothing vapor clears the respiratory tract, detoxifies the skin, and instills a deep sense of tranquil breathing.

### 3. Absolute Hydration Floral Facial
Perfect for restoring dry or tired skin, this facial uses cold-pressed rosewater and avocado seed extracts to infuse skin cells with essential vitamins and natural glow.

### 4. Deep-Tissue Sound Resonance Alignments
Sound therapy using traditional brass singing bowls creates micro-vibrations that echo through your body. These sound waves have been scientifically proven to slow brainwaves into a deep alpha-theta state, enabling profound meditation.

### 5. Signature Lemongrass Body Polishes
Exfoliate dead skin cells using our custom-ground sugar crystals blended with cold-pressed lemongrass oils, leaving your body smooth, glowing, and smelling of the pure African savanna.

Our sanctuary is open daily from 8:00 AM to 9:00 PM. Reserve your luxury therapy slot and step into a world of ultimate peace.`
  },
  {
    title: "Introducing the Oxvera VIP Experience: Airport Pickup in Our Luxury Fleet",
    excerpt: "Arrive in Umuahia with pristine class. Learn about our armored vehicles, highly trained chauffeurs, and private secure airport pick-up services.",
    category: "Lifestyle",
    readTime: "3 Min Read",
    createdAt: "2026-07-09",
    author: "PMS Concierge Desk",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
    content: `From the very second you step off your plane, your luxury experience with Oxvera Hotel begins. We believe that transit should not be a stressful transition, but rather an elegant continuation of your comfort.

### Armored Security & Unmatched Class
For our VIP guests, corporate executives, and diplomats, security and discretion are paramount. We are proud to operate a pristine fleet of luxury vehicles, including armored Mercedes-Benz S-Class sedans, heavy SUV Range Rovers, and executive luxury vans for corporate groups.

Each vehicle is outfitted with:
* High-speed private onboard WiFi
* Chilled mineral waters and premium juices
* Climate-control configurations tailored to your preference
* Rear-seat entertainment systems

### Elite Professional Chauffeurs
Our chauffeurs are not just drivers—they are elite specialists trained in defensive driving, executive etiquette, and local routes. They handle your luggage with ultimate care and coordinate directly with our armed security details to ensure a seamless, completely secure route from any regional airport (including Owerri, Port Harcourt, and Enugu) directly to our secure GRA GRA Phase II gates.

Experience transit redefined. Simply select your preferred fleet vehicle when reserving your suite, or request a concierge pick-up through your VIP guest dashboard.`
  }
];

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const blogsCol = collection(db, 'blogs');
        const q = query(blogsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
        } else {
          setBlogs(INITIAL_BLOGS);
        }
      } catch (err) {
        console.warn('Could not load blogs from Firestore, using seeded articles:', err);
        setBlogs(INITIAL_BLOGS);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const categories = ['All', 'Culinary', 'Wellness', 'Lifestyle', 'News'];

  const filteredBlogs = blogs.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const regularPosts = filteredBlogs.length > 1 ? filteredBlogs.slice(1) : [];

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert(`Link to "${post.title}" copied to clipboard!`);
    }
  };

  return (
    <div className="py-24 bg-neutral-950 text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
        {selectedPost ? (
          /* Immersive Blog Post Reading View */
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-xs text-gold-500 hover:text-gold-400 tracking-widest uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Articles
            </button>

            <div className="space-y-4">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-gold-500 bg-gold-500/15 border border-gold-500/35 px-3 py-1 rounded-sm">
                {selectedPost.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-wide leading-tight">
                {selectedPost.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 items-center text-xs text-gray-400 font-mono pt-2 border-b border-neutral-900 pb-4">
                <span>By <strong>{selectedPost.author || 'Oxvera Editorial'}</strong></span>
                <span>•</span>
                <span>{selectedPost.createdAt}</span>
                <span>•</span>
                <span>{selectedPost.readTime}</span>
              </div>
            </div>

            <div className="aspect-video w-full rounded-md overflow-hidden border border-neutral-900 shadow-2xl">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Content body with beautiful text layouts */}
            <div className="prose prose-invert prose-gold max-w-none text-gray-300 text-sm leading-relaxed space-y-6 font-light">
              {selectedPost.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('###')) {
                  return <h3 key={index} className="text-xl font-serif font-bold text-white pt-4 text-gold-500">{paragraph.replace('###', '').trim()}</h3>;
                }
                if (paragraph.startsWith('*')) {
                  return (
                    <ul key={index} className="list-disc pl-5 space-y-2 text-gray-300 font-light">
                      {paragraph.split('\n').map((li, idx) => (
                        <li key={idx}>{li.replace('*', '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index} className="whitespace-pre-line">{paragraph}</p>;
              })}
            </div>

            <div className="border-t border-neutral-900 pt-8 flex justify-between items-center">
              <button 
                onClick={() => handleShare(selectedPost)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-gold-500" /> Share Article
              </button>
              <button 
                onClick={() => { setSelectedPost(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-5 py-2.5 bg-gold-500 text-neutral-950 text-xs font-bold uppercase tracking-widest rounded-sm cursor-pointer"
              >
                Back to Feed
              </button>
            </div>
          </div>
        ) : (
          /* General Blog Feed Grid */
          <div className="space-y-12">
            {/* Page Title */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold tracking-[0.25em] text-gold-500 uppercase block">The Editorial Collection</span>
              <h1 className="text-4xl md:text-5xl font-serif text-white">Oxvera Chronicles</h1>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Discover the culinary masterpieces, deep wellness secrets, and prestigious lifestyle stories inside Abia's premier five-star luxury hotel.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900/40 p-4 rounded border border-neutral-900">
              {/* Category buttons */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-gold-500 text-neutral-950 font-extrabold' 
                        : 'bg-neutral-900 text-gray-400 border border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gold-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded py-2 pl-9 pr-4 text-xs text-white focus:border-gold-500 outline-none transition-colors"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="bg-neutral-900/20 p-12 text-center rounded border border-neutral-900">
                <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h4 className="text-sm font-bold text-gray-400">No Articles Found</h4>
                <p className="text-xs text-gray-500 mt-2">Adjust your filters or try searching for another term.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Featured Post Card (only shown when not filtering heavily or when search has results) */}
                {featuredPost && (
                  <div 
                    onClick={() => { setSelectedPost(featuredPost); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-neutral-900/40 p-6 rounded border border-neutral-900 hover:border-gold-500/10 transition-all duration-500 cursor-pointer group"
                  >
                    <div className="lg:col-span-7 aspect-[16/10] rounded overflow-hidden border border-neutral-800 shadow-xl relative">
                      <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-neutral-950/90 backdrop-blur-md border border-gold-500/20 px-3 py-1 text-[9px] font-mono font-bold tracking-widest text-gold-500 uppercase rounded">
                        Featured Article
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-between py-2">
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest font-mono flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> {featuredPost.category}
                        </span>
                        
                        <h2 className="text-2xl font-serif text-white group-hover:text-gold-500 transition-colors duration-300">
                          {featuredPost.title}
                        </h2>
                        
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-neutral-900 mt-6">
                        <div className="flex gap-4 text-[10px] font-mono text-gray-500">
                          <span>{featuredPost.createdAt}</span>
                          <span>•</span>
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gold-500 uppercase tracking-wider group-hover:gap-2 transition-all">
                          Read Story <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular posts grid */}
                {regularPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                      <div 
                        key={post.id || post.title}
                        onClick={() => { setSelectedPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-neutral-900/20 rounded border border-neutral-900 hover:border-gold-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full"
                      >
                        <div>
                          <div className="aspect-[16/10] rounded-t overflow-hidden border-b border-neutral-900 relative">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider text-gold-500 px-2.5 py-1 rounded border border-gold-500/10 uppercase">
                              {post.category}
                            </span>
                          </div>

                          <div className="p-6 space-y-3">
                            <h3 className="text-lg font-serif text-white group-hover:text-gold-500 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 pt-0">
                          <div className="flex justify-between items-center pt-4 border-t border-neutral-900/60 text-[10px] font-mono text-gray-500">
                            <span>{post.createdAt}</span>
                            <span className="flex items-center gap-1 font-bold text-gold-500 tracking-wider font-sans group-hover:gap-1.5 transition-all uppercase">
                              Read <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
