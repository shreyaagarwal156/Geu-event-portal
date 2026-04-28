import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Calendar, Users, Eye, Settings, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Event, Club } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type Tab = 'events' | 'clubs' | 'grafest';

export function AdminPanel() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [grafestEvents, setGrafestEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile && profile.role === 'student') { navigate('/dashboard'); return; }
  }, [user, profile]);

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  async function fetchData() {
    setLoading(true);
    const isMainAdmin = profile?.role === 'main_admin';

    const eventsQuery = supabase
      .from('events')
      .select('*, clubs(name)')
      .eq('is_grafest', false)
      .order('date', { ascending: false });

    if (!isMainAdmin && profile) {
      eventsQuery.eq('creator_id', profile.id);
    }

    const grafestQuery = supabase
      .from('events')
      .select('*')
      .eq('is_grafest', true)
      .order('date', { ascending: false });

    const clubsQuery = isMainAdmin
      ? supabase.from('clubs').select('*, profiles(name)').order('name')
      : supabase.from('clubs').select('*, profiles(name)').eq('admin_id', profile!.id);

    const [eventsRes, clubsRes, grafestRes] = await Promise.all([eventsQuery, clubsQuery, grafestQuery]);

    if (eventsRes.data) setEvents(eventsRes.data as Event[]);
    if (clubsRes.data) setClubs(clubsRes.data as Club[]);
    if (grafestRes.data) setGrafestEvents(grafestRes.data as Event[]);
    setLoading(false);
  }

  async function deleteEvent(id: string, creatorId: string) {
    if (!profile) return;
    if (profile.role !== 'main_admin' && creatorId.toString() !== profile.id.toString()) {
      alert('You can only delete your own events');
      return;
    }
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setGrafestEvents(prev => prev.filter(e => e.id !== id));
    }
  }

  const tabs = [
    { key: 'events', label: 'My Events', count: events.length },
    { key: 'clubs', label: 'Clubs', count: clubs.length },
    ...(profile?.role === 'main_admin' ? [{ key: 'grafest', label: 'Grafest', count: grafestEvents.length }] : []),
  ];

  const EventRow = ({ event }: { event: Event }) => (
    <div className="flex items-center gap-4 p-4 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
        <img
          src={event.banner_url || 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=200'}
          alt=""
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=200'; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <Badge variant={event.status === 'upcoming' ? 'emerald' : 'slate'}>{event.status}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/events/${event.id}`}>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Eye className="w-4 h-4" />
          </button>
        </Link>
        <Link to={`/admin/events/${event.id}/edit`}>
          <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all">
            <Edit className="w-4 h-4" />
          </button>
        </Link>
        <button
          onClick={() => deleteEvent(event.id, event.creator_id)}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Badge variant={profile?.role === 'main_admin' ? 'amber' : 'teal'} size="md" className="mb-3">
              {profile?.role === 'main_admin' ? 'Main Admin' : 'Club Admin'}
            </Badge>
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-2">
              {profile?.role === 'main_admin' ? 'Universal management dashboard' : 'Manage your club and events'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/events/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-emerald-400' },
            { label: 'Clubs', value: clubs.length, icon: Users, color: 'text-teal-400' },
            { label: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length, icon: Settings, color: 'text-blue-400' },
            ...(profile?.role === 'main_admin' ? [{ label: 'Grafest Events', value: grafestEvents.length, icon: Image, color: 'text-amber-400' }] : []),
          ].map(stat => (
            <GlassCard key={stat.label} className="p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <GlassCard key={i} className="h-16 animate-pulse" />
            ))}
          </div>
        ) : tab === 'events' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Your Events</h2>
              <Link to="/admin/events/create">
                <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Event</Button>
              </Link>
            </div>
            {events.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No events created yet</p>
                <Link to="/admin/events/create">
                  <Button>Create Your First Event</Button>
                </Link>
              </GlassCard>
            ) : (
              events.map(event => <EventRow key={event.id} event={event} />)
            )}
          </div>
        ) : tab === 'grafest' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Grafest Events</h2>
              <Link to="/admin/events/create?grafest=true">
                <Button variant="amber" size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Grafest Event</Button>
              </Link>
            </div>
            {grafestEvents.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No Grafest events created yet</p>
              </GlassCard>
            ) : (
              grafestEvents.map(event => <EventRow key={event.id} event={event} />)
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Clubs</h2>
              <Link to="/admin/clubs/create">
                <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Club</Button>
              </Link>
            </div>
            {clubs.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No clubs found</p>
                <Link to="/admin/clubs/create">
                  <Button>Register Your Club</Button>
                </Link>
              </GlassCard>
            ) : (
              clubs.map(club => (
                <div key={club.id} className="flex items-center gap-4 p-4 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    <img src={club.logo_url || 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{club.name}</p>
                    <p className="text-slate-400 text-xs">{club.category}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/clubs/${club.id}`}>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                    </Link>
                    <Link to={`/admin/clubs/${club.id}/edit`}>
                      <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
