import React from 'react';

interface Props {
  onGetEstimate: () => void;
}

const CITIES = [
  { name: 'Manhattan', price: '$192' },
  { name: 'Brooklyn', price: '$127' },
  { name: 'Chicago', price: '$101' },
  { name: 'San Francisco', price: '$218' },
  { name: 'Miami Beach', price: '$168' },
  { name: 'Los Angeles', price: '$180' },
];

const REVIEWS = [
  {
    text: 'StayWorth helped me price my NYC apartment 20% higher than I originally planned. The AI suggestions were spot on!',
    name: 'Sarah M.',
    loc: 'New York, NY',
    initials: 'SM',
  },
  {
    text: 'Finally a tool that actually understands short-term rental pricing. Saved me hours of research on my Miami listing.',
    name: 'James R.',
    loc: 'Miami, FL',
    initials: 'JR',
  },
  {
    text: 'The charts and breakdown make it so easy to understand why my property is priced the way it is. Love it.',
    name: 'Priya K.',
    loc: 'San Francisco, CA',
    initials: 'PK',
  },
];

// Reusable CTA Button
const CTAButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-lg font-bold px-12 py-4 rounded-full transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50"
  >
    {children}
  </button>
);

export default function Home({ onGetEstimate }: Props) {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-6 py-2.5 rounded-full mb-8">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Free Rental Price Estimator • AI Powered</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            What's your rental<br />
            property <span className="text-red-500">worth?</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-lg mx-auto mb-10 leading-relaxed">
            Instant AI-powered price estimates for short-term rentals.
            No agent. No waiting. Just real data.
          </p>
          <CTAButton onClick={onGetEstimate}>Get Free Estimate →</CTAButton>
        </div>
      </section>

      {/* City Ticker */}
      <div className="bg-gray-50 py-3.5 border-b overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap text-sm text-gray-600">
          {CITIES.map((c, i) => (
            <span key={i} className="mx-8">
              {c.name} · <strong className="text-gray-900 font-bold">{c.price}/night</strong>
            </span>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="uppercase tracking-widest text-red-600 font-bold text-xs mb-3">How it works</p>
        <h2 className="text-4xl font-black mb-4">Get your estimate in minutes</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-16">
          No agent needed. No waiting. Just real pricing data.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Create a free account', desc: 'Sign up in seconds — no credit card needed.' },
            { n: '02', title: 'Tell us about your property', desc: 'Enter city, bedrooms, amenities and more.' },
            { n: '03', title: 'See your price estimate', desc: 'Get accurate nightly rate + interactive charts.' },
          ].map(s => (
            <div
              key={s.n}
              className="group border border-gray-200 rounded-2xl p-10 hover:border-red-500 hover:shadow-lg hover:shadow-red-50 transition-all cursor-default text-left"
            >
              <div className="text-5xl font-black text-gray-100 mb-6 group-hover:text-red-100 transition-colors">
                {s.n}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center px-6">
          {[
            { stat: '2M+', label: 'Listings analysed' },
            { stat: '50+', label: 'US cities covered' },
            { stat: 'Free', label: 'Always free to use' },
          ].map(t => (
            <div key={t.stat}>
              <div className="text-5xl font-black">{t.stat}</div>
              <div className="text-sm text-gray-400 mt-2">{t.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Avg. Nightly Rate</div>
                <div className="text-3xl font-black text-white">$164</div>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Cities Covered</div>
                <div className="text-3xl font-black text-white">50+</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
              {[
                { label: 'New York', pct: 88 },
                { label: 'San Francisco', pct: 95 },
                { label: 'Miami', pct: 74 },
                { label: 'Chicago', pct: 62 },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-28 shrink-0">{b.label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="text-xs text-white/40">${Math.round(b.pct * 2.1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right text */}
          <div>
            <p className="uppercase tracking-widest text-red-600 font-bold text-xs mb-3">About StayWorth</p>
            <h2 className="text-4xl font-black mb-4 leading-tight">
              Built for hosts who want<br />real answers, fast.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              StayWorth uses machine learning trained on millions of real Airbnb listings
              to give you an accurate, data-backed nightly rate — in seconds.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icon: '🧠', title: 'ML-Powered Predictions', desc: 'XGBoost + LightGBM + CatBoost ensemble for high accuracy.' },
                { icon: '📊', title: 'Interactive Analytics', desc: 'See how city, room type, and amenities affect your price.' },
                { icon: '🔒', title: 'Private & Secure', desc: 'Your data stays yours. No selling, no sharing.' },
              ].map(f => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-0.5">{f.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="uppercase tracking-widest text-red-600 font-bold text-xs mb-3">Testimonials</p>
          <h2 className="text-4xl font-black mb-3">Hosts love StayWorth</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Thousands of hosts use StayWorth to price smarter every day.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="border border-gray-200 rounded-2xl p-7 hover:shadow-md transition-all">
              <div className="text-orange-400 text-sm mb-3">★★★★★</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{r.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {r.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to price your property?</h2>
        <p className="text-gray-500 mb-8">
          Join thousands of hosts who use StayWorth to maximize their rental income.
        </p>
        <CTAButton onClick={onGetEstimate}>Get Started — It's Free</CTAButton>
      </section>
    </div>
  );
}