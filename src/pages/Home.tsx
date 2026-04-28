import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calendar, Users, Star, Zap, ChevronRight, Trophy, Music, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Event, Club } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { EventCard } from '../components/ui/EventCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [grafestEvents, setGrafestEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ events: 0, clubs: 0, students: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [eventsRes, clubsRes, grafestRes, statsRes] = await Promise.all([
      supabase.from('events').select('*').eq('status', 'upcoming').eq('is_grafest', false).order('date', { ascending: true }).limit(3),
      supabase.from('clubs').select('*').limit(6),
      supabase.from('events').select('*').eq('is_grafest', true).order('date', { ascending: true }).limit(2),
      supabase.from('events').select('id', { count: 'exact' }),
    ]);

    if (eventsRes.data) setUpcomingEvents(eventsRes.data as Event[]);
    if (clubsRes.data) setClubs(clubsRes.data as Club[]);
    if (grafestRes.data) setGrafestEvents(grafestRes.data as Event[]);
    if (statsRes.count !== null) {
      const clubCount = clubsRes.data?.length ?? 0;
      setStats({ events: statsRes.count, clubs: clubCount, students: 5000 });
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const fallbackClubLogo = 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=200';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1562280/pexels-photo-1562280.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            Graphic Era University Official Portal
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Campus Experience
            </span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore hundreds of events, join vibrant clubs, and be part of the legendary Grafest celebration. Your university journey starts here.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex gap-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events, clubs, Grafest..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
                />
              </div>
              <Button type="submit" size="lg" className="flex-shrink-0">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/events">
              <Button size="lg" className="gap-2">
                Explore Events <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/grafest">
              <Button variant="amber" size="lg" className="gap-2">
                <Star className="w-4 h-4" /> Grafest 2026
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-6">
            <div className="grid grid-cols-3 gap-6 divide-x divide-white/10">
              {[
                { label: 'Total Events', value: stats.events, icon: Calendar, color: 'text-emerald-400' },
                { label: 'Active Clubs', value: stats.clubs, icon: Users, color: 'text-teal-400' },
                { label: 'Students', value: '5,000+', icon: Trophy, color: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center gap-2 px-4">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="emerald" size="md">Upcoming</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Events to Look Forward To</h2>
              <p className="text-slate-400 mt-2">Register now and secure your spot</p>
            </div>
            <Link to="/events" className="hidden sm:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No upcoming events yet. Check back soon!</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/events">
              <Button variant="secondary">View All Events <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Grafest Teaser Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920"
                alt="Grafest"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-amber-950/40" />
            </div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-semibold mb-6">
                  <Star className="w-4 h-4 fill-amber-400" />
                  Mega Fest 2026
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Grafest is{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                    Coming
                  </span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  The most anticipated event of the year. Music, culture, competitions, and memories that last a lifetime. Get ready for Grafest 2026!
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { icon: Music, label: 'Live Performances' },
                    { icon: Trophy, label: 'Competitions' },
                    { icon: Camera, label: 'Cultural Events' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm">
                      <item.icon className="w-4 h-4 text-amber-400" />
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link to="/grafest">
                    <Button variant="amber" size="lg" className="gap-2">
                      <Star className="w-4 h-4" /> Explore Grafest
                    </Button>
                  </Link>
                  {grafestEvents.length > 0 && (
                    <Link to={`/events/${grafestEvents[0].id}`}>
                      <Button variant="secondary" size="lg">View Events</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Clubs Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="teal" size="md">Community</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Explore Our Clubs</h2>
              <p className="text-slate-400 mt-2">Find your tribe and pursue your passion</p>
            </div>
            <Link to="/clubs" className="hidden sm:flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
              All Clubs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {clubs.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No clubs registered yet.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {clubs.map(club => (
                <Link key={club.id} to={`/clubs/${club.id}`}>
                  <GlassCard hover className="p-4 text-center group">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                      <img
                        src={club.logo_url || fallbackClubLogo}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).src = fallbackClubLogo; }}
                      />
                    </div>
                    <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{club.name}</p>
                    {club.category && (
                      <p className="text-slate-500 text-xs mt-1">{club.category}</p>
                    )}
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/clubs">
              <Button variant="secondary">View All Clubs <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard className="p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to dive in?</h2>
              <p className="text-slate-400 mb-8 text-lg">Join thousands of students already experiencing the best of GEU campus life.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <Link to="/events">
                  <Button variant="secondary" size="lg">Browse Events</Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
