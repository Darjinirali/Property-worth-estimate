import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Home, Trash2, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HistoryEntry {
  id: string;
  timestamp: string;
  city: string;
  room_type: string;
  property_type: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  nightly_rate: number;
  review_scores_rating: number;
}

const CITY_FLAGS: Record<string, string> = {
  NYC: '🗽', LA: '🌴', Chicago: '🌆', SF: '🌉', Miami: '🌊',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ✅ FIX: Har user ki alag key — email se unique key banao
  const storageKey = user?.email ? `stayworth_history_${user.email}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setHistory(JSON.parse(raw));
      else setHistory([]);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  const deleteEntry = (id: string) => {
    if (!storageKey) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!storageKey) return;
    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  const avg = history.length
    ? Math.round(history.reduce((s, h) => s + h.nightly_rate, 0) / history.length)
    : 0;

  const highest = history.length
    ? Math.max(...history.map(h => h.nightly_rate))
    : 0;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-widest text-red-500 font-bold text-xs mb-3">
            Your Activity
          </p>
          <h1 className="text-4xl font-black mb-2">Estimate Dashboard</h1>
          <p className="text-gray-400 text-sm">All your saved property estimates in one place.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats row */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total Estimates', value: history.length, icon: BarChart2, color: 'text-red-600' },
              { label: 'Average Rate',    value: `$${avg}/night`, icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Highest Rate',    value: `$${highest}/night`, icon: TrendingUp, color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <s.icon size={20} className={`${s.color} mb-3`} />
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* History list */}
        {history.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
            <Home size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No estimates yet</h3>
            <p className="text-gray-500 text-sm">
              Go to the <span className="text-red-600 font-semibold">Estimate</span> tab and run your first prediction.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {history.length} Estimate{history.length > 1 ? 's' : ''}
              </h2>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Clear all
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[...history].reverse().map(entry => (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {CITY_FLAGS[entry.city] ?? '🏠'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{entry.city}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {entry.room_type}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {entry.property_type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-0.5">
                          <span>{entry.accommodates} guests</span>
                          <span>{entry.bedrooms} bed{entry.bedrooms !== 1 ? 's' : ''}</span>
                          <span>{entry.bathrooms} bath</span>
                          <span>⭐ {entry.review_scores_rating}</span>
                          {entry.amenities.length > 0 && (
                            <span>{entry.amenities.length} amenities</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                          <Clock size={11} />
                          {new Date(entry.timestamp).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right — price + delete */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-3xl font-black text-red-600">
                          ${entry.nightly_rate.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">per night</div>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}