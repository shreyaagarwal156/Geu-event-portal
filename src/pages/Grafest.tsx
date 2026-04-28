import { useEffect, useState } from 'react';
import { Star, Music, Trophy, Camera, Flame, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Event, GrafestGalleryImage } from '../types';
import { EventCard } from '../components/ui/EventCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

type Tab = 'upcoming' | 'past' | 'gallery';

export function Grafest() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [gallery, setGallery] = useState<GrafestGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GrafestGalleryImage | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [upcoming, past, galleryRes] = await Promise.all([
      supabase.from('events').select('*').eq('is_grafest', true).eq('status', 'upcoming').order('date'),
      supabase.from('events').select('*').eq('is_grafest', true).eq('status', 'past').order('date', { ascending: false }),
      supabase.from('grafest_gallery').select('*').order('year', { ascending: false }),
    ]);
    if (upcoming.data) setUpcomingEvents(upcoming.data as Event[]);
    if (past.data) setPastEvents(past.data as Event[]);
    if (galleryRes.data) setGallery(galleryRes.data as GrafestGalleryImage[]);
    setLoading(false);
  }

  const features = [
    { icon: Music, label: 'Live Music', desc: 'National artists & bands' },
    { icon: Trophy, label: 'Competitions', desc: '50+ events across categories' },
    { icon: Camera, label: 'Cultural Shows', desc: 'Dance, drama & art' },
    { icon: Flame, label: 'Night Events', desc: 'Unforgettable evenings' },
  ];

  const tabs = [
    { key: 'upcoming', label: 'Upcoming Events' },
    { key: 'past', label: 'Past Events' },
    { key: 'gallery', label: 'Memories Gallery' },
  ];

  const currentEvents = tab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Grafest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-amber-950/20" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            Graphic Era's Mega Fest
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
              GRAFEST
            </span>
          </h1>
          <p className="text-slate-300 text-xl mb-4">The Annual Cultural Extravaganza</p>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Three days of music, culture, competitions, and memories. The most electrifying event of the academic year returns bigger and better.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map(feature => (
              <GlassCard key={feature.label} className="p-4 text-center">
                <feature.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">{feature.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-10 max-w-lg">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : tab === 'gallery' ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <Badge variant="amber" size="md">Memories</Badge>
              <h2 className="text-2xl font-bold text-white">Grafest Through the Years</h2>
            </div>

            {gallery.length === 0 ? (
              <GlassCard className="p-16 text-center">
                <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Gallery Coming Soon</h3>
                <p className="text-slate-400 text-sm">Grafest memories will be added here after the event.</p>
              </GlassCard>
            ) : (
              <>
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                  {gallery.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || 'Grafest memory'}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-all duration-300 flex items-end p-3">
                        {img.caption && (
                          <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</p>
                        )}
                      </div>
                      {img.year && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500/80 backdrop-blur rounded-lg text-slate-900 text-xs font-bold">
                          {img.year}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedImage && (
                  <div
                    className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                  >
                    <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                      <img
                        src={selectedImage.image_url}
                        alt={selectedImage.caption || ''}
                        className="w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                      {selectedImage.caption && (
                        <p className="text-white text-center mt-4">{selectedImage.caption}</p>
                      )}
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="mt-4 mx-auto block px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-slate-300 text-sm transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <Badge variant={tab === 'upcoming' ? 'amber' : 'slate'} size="md">
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
              </Badge>
              <h2 className="text-2xl font-bold text-white">
                {tab === 'upcoming' ? 'Grafest 2026 Events' : 'Previous Grafest Events'}
              </h2>
            </div>

            {currentEvents.length === 0 ? (
              <GlassCard className="p-16 text-center">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">
                  {tab === 'upcoming' ? 'Stay Tuned!' : 'No Past Events'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {tab === 'upcoming'
                    ? 'Grafest 2026 events will be announced soon. Keep an eye out!'
                    : 'Past Grafest events will appear here.'}
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
