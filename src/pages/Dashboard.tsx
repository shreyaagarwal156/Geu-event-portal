import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Shield, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { EventCard } from '../components/ui/EventCard';

type Tab = 'upcoming' | 'past';

export function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile && profile.role !== 'student') { navigate('/admin'); return; }
    fetchRegistrations();
  }, [user, profile]);

  async function fetchRegistrations() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('event_registrations')
      .select('*, events(*)')
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false });

    if (data) {
      const events = data.map(r => r.events).filter(Boolean) as Event[];
      setRegisteredEvents(events);
    }
    setLoading(false);
  }

  const now = new Date();
  const upcomingRegistrations = registeredEvents.filter(e => new Date(e.date) >= now || e.status === 'upcoming');
  const pastRegistrations = registeredEvents.filter(e => new Date(e.date) < now || e.status === 'past');

  const currentList = tab === 'upcoming' ? upcomingRegistrations : pastRegistrations;

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const roleLabels = {
    student: { label: 'Student', variant: 'emerald' as const },
    club_admin: { label: 'Club Admin', variant: 'teal' as const },
    main_admin: { label: 'Main Admin', variant: 'amber' as const },
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="emerald" size="md" className="mb-3">My Dashboard</Badge>
          <h1 className="text-4xl font-bold text-white">Welcome back, {profile.name.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-2">Manage your event registrations and profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-emerald-400">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-white font-bold text-lg">{profile.name}</h2>
              <p className="text-slate-400 text-sm mt-1 truncate">{profile.email}</p>
              <div className="mt-3">
                <Badge variant={roleLabels[profile.role].variant} size="md">
                  {roleLabels[profile.role].label}
                </Badge>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm mb-4">Account Info</h3>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Name</p>
                  <p className="text-white">{profile.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Email</p>
                  <p className="text-white text-xs break-all">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Role</p>
                  <p className="text-white capitalize">{profile.role.replace('_', ' ')}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Upcoming
                  </div>
                  <span className="text-white font-bold">{upcomingRegistrations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Past
                  </div>
                  <span className="text-white font-bold">{pastRegistrations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <BookOpen className="w-4 h-4 text-teal-400" />
                    Total
                  </div>
                  <span className="text-white font-bold">{registeredEvents.length}</span>
                </div>
              </div>
            </GlassCard>

            <Link to="/events">
              <GlassCard hover className="p-4 text-center">
                <p className="text-emerald-400 text-sm font-medium">Browse More Events</p>
                <p className="text-slate-500 text-xs mt-1">Discover & register</p>
              </GlassCard>
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8 w-fit">
              {[
                { key: 'upcoming', label: 'Upcoming Registrations', count: upcomingRegistrations.length },
                { key: 'past', label: 'Past Registrations', count: pastRegistrations.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as Tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.key
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <GlassCard key={i} className="h-60 animate-pulse" />
                ))}
              </div>
            ) : currentList.length === 0 ? (
              <GlassCard className="p-16 text-center">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">
                  {tab === 'upcoming' ? 'No Upcoming Events' : 'No Past Events'}
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  {tab === 'upcoming'
                    ? "You haven't registered for any upcoming events yet."
                    : "You haven't attended any events yet."}
                </p>
                <Link to="/events">
                  <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
                    Explore Events
                  </button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {currentList.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
