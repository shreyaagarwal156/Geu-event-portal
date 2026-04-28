import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import { EventCard } from '../components/ui/EventCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

type Tab = 'upcoming' | 'past';

export function Events() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc'>('date_asc');
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchEvents();
  }, [tab, sortBy]);

  async function fetchEvents() {
    setLoading(true);
    const order = sortBy === 'date_asc' ? { ascending: true } : { ascending: false };

    const { data } = await supabase
      .from('events')
      .select('*, profiles(name, email), clubs(name, logo_url)')
      .eq('status', tab)
      .eq('is_grafest', false)
      .order('date', order);

    if (data) {
      setEvents(data as Event[]);
      await fetchRegistrationCounts(data.map(e => e.id));
    }
    setLoading(false);
  }

  async function fetchRegistrationCounts(eventIds: string[]) {
    if (!eventIds.length) return;
    const { data } = await supabase
      .from('event_registrations')
      .select('event_id')
      .in('event_id', eventIds);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(r => {
        counts[r.event_id] = (counts[r.event_id] || 0) + 1;
      });
      setRegistrationCounts(counts);
    }
  }

  const filteredEvents = events.filter(e =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Header */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <Badge variant="emerald" size="md" className="mb-4">Events</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Campus Events</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Discover and register for upcoming events. Never miss a moment.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events by title, venue, or tag..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'upcoming' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab('past')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'past' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Past
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-300 outline-none focus:border-emerald-500/50 text-sm cursor-pointer"
              >
                <option value="date_asc" className="bg-slate-800">Date: Earliest</option>
                <option value="date_desc" className="bg-slate-800">Date: Latest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Event Count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-slate-400 text-sm">
            {filteredEvents.length} {tab} {filteredEvents.length === 1 ? 'event' : 'events'}
            {search && ` matching "${search}"`}
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="h-72 animate-pulse">
                <div className="h-48 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No events found</h3>
            <p className="text-slate-400 text-sm">
              {search ? `No results for "${search}". Try a different search term.` : `No ${tab} events available right now.`}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                registrationCount={registrationCounts[event.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
