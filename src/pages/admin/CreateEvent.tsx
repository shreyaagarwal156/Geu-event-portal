import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Club } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function CreateEvent() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGrafest = searchParams.get('grafest') === 'true';

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW: State to hold the physical image file and its local preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    is_grafest: isGrafest,
    club_id: '',
    max_attendees: '',
    tags: '',
    status: 'upcoming' as 'upcoming' | 'past',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role === 'student') { navigate('/dashboard'); return; }
    fetchClubs();
  }, [user, profile]);

  async function fetchClubs() {
    const isMainAdmin = profile?.role === 'main_admin';
    const query = supabase.from('clubs').select('*');
    if (!isMainAdmin && profile) query.eq('admin_id', profile.id);
    const { data } = await query;
    if (data) setClubs(data as Club[]);
  }

  // NEW: Cloudinary Upload Function
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
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // NEW: Handle local file selection and create a preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Creates a temporary local URL for preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = '';

      // 1. Upload Image to Cloudinary First
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      } else {
        throw new Error('Please select a banner image for the event.');
      }

      // 2. Prepare Data for Supabase
      const tagsArray = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const eventData = {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
        venue: form.venue,
        banner_url: finalImageUrl, // Use the Cloudinary URL!
        is_grafest: form.is_grafest,
        club_id: form.club_id || null,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        tags: tagsArray,
        status: form.status,
        creator_id: profile.id,
      };

      // 3. Save to Supabase
      const { error: dbError } = await supabase.from('events').insert(eventData);

      if (dbError) throw dbError;

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the event.');
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm';
  const labelClass = 'block text-slate-300 text-sm font-medium mb-2';

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={form.is_grafest ? 'amber' : 'emerald'} size="md">
                {form.is_grafest ? 'Grafest Event' : 'New Event'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white">Create Event</h1>
          </div>
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
                <input name="title" type="text" value={form.title} onChange={handleChange} placeholder="Enter event title" required className={inputClass} />
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
                <input name="venue" type="text" value={form.venue} onChange={handleChange} placeholder="Enter venue name or location" required className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the event..." rows={4} className={`${inputClass} resize-none`} />
              </div>

              {/* NEW: Device File Upload Input */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Banner Image (Upload from device) *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required 
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all cursor-pointer"
                />
                {previewUrl && (
                  <div className="mt-4 h-48 rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">Image Preview</div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Max Attendees</label>
                <input name="max_attendees" type="number" value={form.max_attendees} onChange={handleChange} placeholder="Leave empty for unlimited" min="1" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Club (optional)</label>
                <select name="club_id" value={form.club_id} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                  <option value="" className="bg-slate-800">No club (standalone event)</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Tags (comma-separated)</label>
                <input name="tags" type="text" value={form.tags} onChange={handleChange} placeholder="e.g. Tech, Workshop, Hackathon" className={inputClass} />
              </div>

              {profile?.role === 'main_admin' && (
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_grafest"
                        checked={form.is_grafest}
                        onChange={e => setForm(prev => ({ ...prev, is_grafest: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${form.is_grafest ? 'bg-amber-500' : 'bg-white/10'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5 left-0.5 ${form.is_grafest ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-300 text-sm font-medium">Mark as Grafest Event</span>
                      <p className="text-slate-500 text-xs mt-0.5">This event will appear in the Grafest section</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {/* Button text changes to show uploading status */}
              <Button type="submit" loading={loading} size="lg">
                {loading && imageFile ? 'Uploading Image & Saving...' : 'Create Event'}
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