import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Camera, CreditCard as Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Club, ClubMember, ClubGalleryImage, Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { EventCard } from '../components/ui/EventCard';
import { Badge } from '../components/ui/Badge';

type Tab = 'about' | 'team' | 'events' | 'gallery';

const FALLBACK_AVATAR = 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=200';

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [gallery, setGallery] = useState<ClubGalleryImage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('about');
  const [selectedImage, setSelectedImage] = useState<ClubGalleryImage | null>(null);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    const [clubRes, membersRes, galleryRes, upcomingRes, pastRes] = await Promise.all([
      supabase.from('clubs').select('*, profiles(name, email)').eq('id', id!).maybeSingle(),
      supabase.from('club_members').select('*').eq('club_id', id!).order('display_order'),
      supabase.from('club_gallery').select('*').eq('club_id', id!).order('created_at', { ascending: false }),
      supabase.from('events').select('*').eq('club_id', id!).eq('status', 'upcoming').order('date'),
      supabase.from('events').select('*').eq('club_id', id!).eq('status', 'past').order('date', { ascending: false }),
    ]);

    if (clubRes.data) setClub(clubRes.data as Club);
    if (membersRes.data) setMembers(membersRes.data as ClubMember[]);
    if (galleryRes.data) setGallery(galleryRes.data as ClubGalleryImage[]);
    if (upcomingRes.data) setUpcomingEvents(upcomingRes.data as Event[]);
    if (pastRes.data) setPastEvents(pastRes.data as Event[]);
    setLoading(false);
  }

  const isClubAdmin = profile && club && (
    profile.role === 'main_admin' ||
    (profile.role === 'club_admin' && club.admin_id === profile.id)
  );

  const tabs = [
    { key: 'about', label: 'About', count: null },
    { key: 'team', label: 'Team', count: members.length },
    { key: 'events', label: 'Events', count: upcomingEvents.length + pastEvents.length },
    { key: 'gallery', label: 'Gallery', count: gallery.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Club not found</p>
          <Link to="/clubs"><button className="text-teal-400 hover:underline">Back to Clubs</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Banner */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <img
          src={club.banner_url || 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt={club.name}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1920'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {isClubAdmin && (
          <Link
            to={`/admin/clubs/${id}/edit`}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all"
          >
            <Edit className="w-4 h-4" /> Edit Club
          </Link>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
        {/* Club Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-800 flex-shrink-0 shadow-2xl">
            <img
              src={club.logo_url || FALLBACK_AVATAR}
              alt={club.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{club.name}</h1>
              {club.category && <Badge variant="teal">{club.category}</Badge>}
            </div>
            {club.tagline && <p className="text-slate-400 italic mb-2">{club.tagline}</p>}
            {club.founded_year && <p className="text-slate-500 text-sm">Established {club.founded_year}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-10 max-w-xl overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'about' && (
          <GlassCard className="p-8">
            <h2 className="text-white font-semibold text-xl mb-4">About the Club</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {club.description || 'No description provided yet.'}
            </p>
            {club.profiles && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-slate-400 text-sm">Club Admin: <span className="text-white">{club.profiles.name}</span></p>
              </div>
            )}
          </GlassCard>
        )}

        {tab === 'team' && (
          <div>
            <h2 className="text-white font-semibold text-xl mb-6">Position Holders</h2>
            {members.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No team members listed yet.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map(member => (
                  <GlassCard key={member.id} className="p-5 text-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 bg-white/5 border border-white/10">
                      <img
                        src={member.image_url || FALLBACK_AVATAR}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                      />
                    </div>
                    <h3 className="text-white font-semibold text-sm">{member.name}</h3>
                    <p className="text-teal-400 text-xs mt-1">{member.position}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="emerald" size="md">Upcoming</Badge>
                <h2 className="text-white font-semibold text-xl">Upcoming Events</h2>
              </div>
              {upcomingEvents.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No upcoming events from this club.</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="slate" size="md">Past</Badge>
                <h2 className="text-white font-semibold text-xl">Previous Events</h2>
              </div>
              {pastEvents.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No past events from this club.</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            <h2 className="text-white font-semibold text-xl mb-6">Club Gallery</h2>
            {gallery.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Camera className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No gallery images yet.</p>
              </GlassCard>
            ) : (
              <>
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                  {gallery.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || ''}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {img.caption && (
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/50 transition-all flex items-end p-3">
                          <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</p>
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
                      <img src={selectedImage.image_url} alt="" className="w-full max-h-[80vh] object-contain rounded-2xl" />
                      {selectedImage.caption && <p className="text-white text-center mt-4">{selectedImage.caption}</p>}
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
          </div>
        )}
      </div>
    </div>
  );
}
