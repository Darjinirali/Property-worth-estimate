import { useState } from 'react';
import { Send, CheckCircle, Mail, MessageCircle, Star } from 'lucide-react';

const FORMSPREE_ID = 'xzdkdnyq';

const RATINGS = [1, 2, 3, 4, 5];

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '', rating: 5,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [hoverRating, setHoverRating] = useState(0);

  const update = (key: string, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('loading');
    try {
      // Use no-cors mode to bypass CORS on localhost
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          subject: form.subject || 'StayWorth Feedback',
          message: form.message,
          rating:  `${form.rating} / 5 stars`,
        }),
      });
      // With no-cors we can't read response, but if no exception = success
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '', rating: 5 });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-widest text-red-500 font-bold text-xs mb-3">
            Get in Touch
          </p>
          <h1 className="text-4xl font-black mb-2">Contact & Feedback</h1>
          <p className="text-gray-400 text-sm">
            We read every message. Your feedback helps us improve.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Left — info cards */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {[
              {
                icon: Mail,
                title: 'Email Us',
                desc: "We typically reply within 24 hours on business days.",
              },
              {
                icon: MessageCircle,
                title: 'Share Feedback',
                desc: "Tell us what you love, what's broken, or what you want next.",
              },
              {
                icon: Star,
                title: 'Rate Your Experience',
                desc: "Rate StayWorth and help us understand how we're doing.",
              },
            ].map(c => (
              <div
                key={c.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-4">
                  <c.icon size={18} className="text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            {status === 'success' ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 shadow-sm text-center h-full flex flex-col items-center justify-center gap-4">
                <CheckCircle size={48} className="text-emerald-500" />
                <h3 className="text-2xl font-black text-gray-900">Message Sent!</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Thanks for reaching out. We will get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6">Send us a message</h2>

                <div className="flex flex-col gap-4">
                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="field-label">Your Name *</label>
                      <input
                        className="field-input"
                        placeholder="Rahul Sharma"
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Email *</label>
                      <input
                        type="email"
                        className="field-input"
                        placeholder="rahul@example.com"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="field-label">Subject</label>
                    <input
                      className="field-input"
                      placeholder="Feedback / Bug report / Suggestion..."
                      value={form.subject}
                      onChange={e => update('subject', e.target.value)}
                    />
                  </div>

                  {/* Star rating */}
                  <div>
                    <label className="field-label">Rate your experience</label>
                    <div className="flex items-center gap-1.5">
                      {RATINGS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onMouseEnter={() => setHoverRating(r)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => update('rating', r)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={28}
                            className={
                              r <= (hoverRating || form.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200 fill-gray-200'
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || form.rating]}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="field-label">Message *</label>
                    <textarea
                      className="field-input resize-none"
                      rows={5}
                      placeholder="Tell us anything — bugs, feature requests, or just say hi!"
                      value={form.message}
                      onChange={e => update('message', e.target.value)}
                    />
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <p className="text-sm text-red-500">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'loading' || !form.name || !form.email || !form.message}
                    className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-900/20"
                  >
                    {status === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}