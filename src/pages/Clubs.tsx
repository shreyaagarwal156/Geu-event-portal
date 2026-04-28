import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, ChevronRight, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Club } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'General'];

export function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('*, profiles(name, email)').order('name');
    if (data) setClubs(data as Club[]);
    setLoading(false);
  }

  const filtered = clubs.filter(club => {
    const matchSearch = !search ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      (club.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (club.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || club.category === category;
    return matchSearch && matchCategory;
  });

  const fallbackBanner = 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Header */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <Badge variant="teal" size="md" className="mb-4">Community</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Clubs Directory</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Explore all student clubs at GEU. Find your community and pursue your passion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6">{filtered.length} clubs found</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="h-48 animate-pulse">
                <div className="h-24 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No clubs found</h3>
            <p className="text-slate-400 text-sm">
              {search ? `No results for "${search}".` : 'No clubs registered yet.'}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(club => (
              <Link key={club.id} to={`/clubs/${club.id}`}>
                <GlassCard hover className="overflow-hidden group h-full flex flex-col">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={club.banner_url || fallbackBanner}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = fallbackBanner; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  </div>

                  <div className="p-5 flex flex-col flex-1 -mt-6 relative">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-800 mb-3 flex-shrink-0">
                      <img
                        src={club.logo_url || fallbackBanner}
                        alt={club.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = fallbackBanner; }}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-base group-hover:text-teal-400 transition-colors leading-tight">{club.name}</h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 flex-shrink-0 transition-colors mt-0.5" />
                    </div>

                    {club.tagline && (
                      <p className="text-slate-400 text-sm italic mb-3">{club.tagline}</p>
                    )}

                    {club.description && (
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3 flex-1">{club.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      {club.category && <Badge variant="teal">{club.category}</Badge>}
                      {club.founded_year && (
                        <span className="text-slate-500 text-xs">Est. {club.founded_year}</span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
