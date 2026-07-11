import React, { useState } from 'react';
import { MapPin, Mail, Sparkles, CheckCircle, Navigation } from 'lucide-react';

export default function AttractionsNewsletter() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 8000);
    }
  };

  const ATTRACTIONS = [
    {
      name: 'National War Museum, Umuahia',
      distance: '3.5 km / 8 mins drive',
      description: 'The historic preservation of physical artifacts and galleries commemorating local heritage and war vehicles.'
    },
    {
      name: 'Abia State Tower',
      distance: '2.0 km / 5 mins drive',
      description: 'The iconic central monument symbolizing the strength and hospitality of Umuahia.'
    },
    {
      name: 'Amachara Forest & Springs',
      distance: '8.2 km / 18 mins drive',
      description: 'A serene ecotourism escape with lush forest trails, pristine fresh water springs, and picnic spots.'
    },
    {
      name: 'Umuahia Golf Course',
      distance: '4.0 km / 10 mins drive',
      description: 'A challenging, beautifully maintained 18-hole golf course nestled in lush tropical surroundings.'
    }
  ];

  return (
    <section className="py-24 bg-neutral-950 text-white select-none border-b border-neutral-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Nearby Attractions */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-gold-500 uppercase block mb-3">Explore Abia State</span>
              <h2 className="text-3xl md:text-4xl font-serif">Local Attractions Directory</h2>
              <p className="text-xs text-gray-400 mt-2 font-light">Explore famous local monuments and leisure spots surrounding the GRA area.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ATTRACTIONS.map((attr, idx) => (
                <div key={idx} className="p-5 bg-neutral-900/40 border border-neutral-800 rounded hover:border-gold-500/10 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-white">{attr.name}</h4>
                    <span className="text-[9px] font-mono text-gold-500 uppercase shrink-0 bg-gold-500/5 px-2 py-0.5 rounded border border-gold-500/10">{attr.distance}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-light">{attr.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Newsletter Signup */}
          <div className="lg:col-span-5 bg-neutral-900 p-8 rounded border border-neutral-800 space-y-6">
            <Mail className="w-10 h-10 text-gold-500/20" />
            <div>
              <h3 className="text-xl font-serif text-white">Join The Oxvera Club</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-light leading-relaxed">
                Receive secret hotel promotions, complimentary spa sessions, luxury travel guides, and exclusive weekend discount codes.
              </p>
            </div>

            {success ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-green-400" /> Welcome to the Elite Club! Check your inbox for your 20% off coupon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded text-xs outline-none focus:border-gold-500 font-light"
                />
                <button
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-neutral-950 font-bold py-3 text-xs tracking-widest uppercase rounded cursor-pointer transition-all shadow-lg shadow-gold-500/15"
                >
                  Join Club
                </button>
              </form>
            )}

            <p className="text-[10px] text-gray-500 text-center">We value your privacy. Unsubscribe at any time with one click.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
