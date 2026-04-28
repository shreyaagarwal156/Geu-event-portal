import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Star, CreditCard as Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Event, EventRegistration } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) fetchEvent();
  }, [id, user]);

  async function fetchEvent() {
    setLoading(true);
    const { data: eventData } = await supabase
      .from('events')
      .select('*, profiles(name, email), clubs(name, logo_url, id)')
      .eq('id', id!)
      .maybeSingle();

    if (eventData) {
      setEvent(eventData as Event);

      const { data: regs } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id!);

      if (regs) {
        setRegistrations(regs as EventRegistration[]);
        if (user) {
          setIsRegistered(regs.some(r => r.user_id === user.id));
        }
      }
    }
    setLoading(false);
  }

  async function handleRegister() {
    if (!user || !profile) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    setError('');
    setSuccess('');

    if (isRegistered) {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', id!)
        .eq('user_id', user.id);

      if (error) { setError('Failed to unregister'); } else {
        setIsRegistered(false);
        setRegistrations(prev => prev.filter(r => r.user_id !== user.id));
        setSuccess('Successfully unregistered from this event');
      }
    } else {
      if (event?.max_attendees && registrations.length >= event.max_attendees) {
        setError('This event is at full capacity');
        setRegistering(false);
        return;
      }
      const { error } = await supabase
        .from('event_registrations')
        .insert({ event_id: id!, user_id: user.id });

      if (error) { setError('Failed to register'); } else {
        setIsRegistered(true);
        setRegistrations(prev => [...prev, { id: '', event_id: id!, user_id: user.id, registered_at: new Date().toISOString() }]);
        setSuccess('Successfully registered for this event!');
      }
    }
    setRegistering(false);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id!);
    if (!error) navigate('/events');
  }

  const canManage = profile && event && (
    profile.role === 'main_admin' ||
    (profile.role === 'club_admin' && event.creator_id === profile.id)
  );

  const isFull = event?.max_attendees ? registrations.length >= event.max_attendees : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Event not found</p>
          <Link to="/events"><Button>Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const fallbackBanner = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920';

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={event.banner_url || fallbackBanner}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = fallbackBanner; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        {canManage && (
          <div className="absolute top-6 right-6 flex gap-2">
            <Link to={`/admin/events/${id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
                <Edit className="w-4 h-4" /> Edit
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-900/80 backdrop-blur border border-rose-500/30 rounded-xl text-rose-300 hover:text-white text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.is_grafest && <Badge variant="amber"><Star className="w-3 h-3 mr-1 fill-amber-400" />Grafest</Badge>}
                <Badge variant={event.status === 'upcoming' ? 'emerald' : 'slate'}>
                  {event.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">{event.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Calendar className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xs">Date & Time</p>
                    <p className="text-white text-sm font-medium">
                      {eventDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xs">Venue</p>
                    <p className="text-white text-sm font-medium">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xs">Attendees</p>
                    <p className="text-white text-sm font-medium">
                      {registrations.length}
                      {event.max_attendees && ` / ${event.max_attendees}`}
                      {isFull && <span className="ml-2 text-rose-400 text-xs">(Full)</span>}
                    </p>
                  </div>
                </div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400 text-xs">{tag}</span>
                  ))}
                </div>
              )}

              <div>
                <h2 className="text-white font-semibold mb-3">About this Event</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <GlassCard className="p-6">
              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 text-sm">{success}</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <p className="text-rose-400 text-sm">{error}</p>
                </div>
              )}

              {event.status === 'upcoming' ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Spots filled</span>
                      <span className="text-white">{registrations.length}{event.max_attendees ? `/${event.max_attendees}` : ''}</span>
                    </div>
                    {event.max_attendees && (
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((registrations.length / event.max_attendees) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {profile?.role === 'student' ? (
                    <Button
                      onClick={handleRegister}
                      loading={registering}
                      variant={isRegistered ? 'secondary' : 'primary'}
                      className="w-full"
                      disabled={!isRegistered && isFull}
                    >
                      {isRegistered ? 'Unregister' : isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  ) : !user ? (
                    <Link to="/login">
                      <Button className="w-full">Sign in to Register</Button>
                    </Link>
                  ) : (
                    <p className="text-slate-400 text-sm text-center">Admins cannot register for events</p>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <Badge variant="slate" size="md">This event has ended</Badge>
                </div>
              )}
            </GlassCard>

            {/* Organizer Info */}
            {event.clubs && (
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold mb-3 text-sm">Organized by</h3>
                <Link to={`/clubs/${event.club_id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                    {event.clubs.logo_url ? (
                      <img src={event.clubs.logo_url} alt={event.clubs.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                        {event.clubs.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-emerald-400 group-hover:text-emerald-300 text-sm font-medium transition-colors">{event.clubs.name}</span>
                </Link>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
