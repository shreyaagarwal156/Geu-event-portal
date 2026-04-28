import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Event, Club } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // NEW: State for tracking file uploads vs existing URLs
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    banner_url: '',
    is_grafest: false,
    club_id: '',
    max_attendees: '',
    tags: '',
    status: 'upcoming' as 'upcoming' | 'past',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role === 'student') { navigate('/dashboard'); return; }
    if (id) fetchEvent();
    fetchClubs();
  }, [user, profile, id]);

  async function fetchEvent() {
    const { data } = await supabase.from('events').select('*').eq('id', id!).maybeSingle();
    if (data) {
      const event = data as Event;
      if (profile && profile.role !== 'main_admin' && event.creator_id.toString() !== profile.id.toString()) {
        navigate('/admin');
        return;
      }
      const eventDate = new Date(event.date);
      const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
        
      setForm({
        title: event.title,
        description: event.description || '',
        date: localDate,
        venue: event.venue,
        banner_url: event.banner_url || '',
        is_grafest: event.is_grafest,
        club_id: event.club_id || '',
        max_attendees: event.max_attendees?.toString() || '',
        tags: (event.tags || []).join(', '),
        status: event.status,
      });
      // Set the initial preview to the existing image from the database
      setPreviewUrl(event.banner_url || '');
    }
    setLoading(false);
  }

  async function fetchClubs() {
    const isMainAdmin = profile?.role === 'main_admin';
    const query = supabase.from('clubs').select('*');
    if (!isMainAdmin && profile) query.eq('admin_id', profile.id);
    const { data } = await query;
    if (data) setClubs(data as Club[]);
  }

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'geuevent_preset');
    const response = await fetch('https://api.cloudinary.com/v1_1/dnclid1g7/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to upload image');
    return data.secure_url;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');

    try {
      // 1. Check if a NEW image was selected. If yes, upload it. If no, keep the old one.
      let finalImageUrl = form.banner_url;
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      // 2. Prepare Data
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      // 3. Update Supabase
      const { error: updateError } = await supabase.from('events').update({
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
        venue: form.venue,
        banner_url: finalImageUrl, // Uses either the old URL or the new Cloudinary URL
        is_grafest: form.is_grafest,
        club_id: form.club_id || null,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        tags: tagsArray,
        status: form.status,
      }).eq('id', id!);

      if (updateError) throw new Error(updateError.message);

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the event.');
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm';
  const labelClass = 'block text-slate-300 text-sm font-medium mb-2';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Event</h1>
        </div>

        <GlassCard className="p-8">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className={labelClass}>Event Title *</label>
                <input name="title" type="text" value={form.title} onChange={handleChange} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Date & Time *</label>
                <input name="date" type="datetime-local" value={form.date} onChange={handleChange} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                  <option value="upcoming" className="bg-slate-800">Upcoming</option>
                  <option value="past" className="bg-slate-800">Past</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Venue *</label>
                <input name="venue" type="text" value={form.venue} onChange={handleChange} required className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} />
              </div>

              {/* NEW: Device File Upload Input for Editing */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Update Banner Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all cursor-pointer"
                />
                {previewUrl && (
                  <div className="mt-4 h-48 rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {imageFile && (
                      <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">New Image Selected</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Max Attendees</label>
                <input name="max_attendees" type="number" value={form.max_attendees} onChange={handleChange} min="1" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Club (optional)</label>
                <select name="club_id" value={form.club_id} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                  <option value="" className="bg-slate-800">No club</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Tags (comma-separated)</label>
                <input name="tags" type="text" value={form.tags} onChange={handleChange} placeholder="e.g. Tech, Workshop" className={inputClass} />
              </div>

              {profile?.role === 'main_admin' && (
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.is_grafest}
                        onChange={e => setForm(prev => ({ ...prev, is_grafest: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${form.is_grafest ? 'bg-amber-500' : 'bg-white/10'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5 left-0.5 ${form.is_grafest ? 'translate-x-5' : ''}`} />
                      </div>
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Grafest Event</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving} size="lg">
                {saving && imageFile ? 'Uploading New Image...' : 'Save Changes'}
              </Button>
              <Link to="/admin">
                <Button type="button" variant="ghost" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}