import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'General'];

// Upgraded Member interface to handle physical files and local previews
interface Member { 
  name: string; 
  position: string; 
  image_url: string; 
  file?: File | null; 
  preview?: string; 
}

export function CreateClub() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [members, setMembers] = useState<Member[]>([{ name: '', position: '', image_url: '' }]);

  // NEW: Separate states for Logo and Banner files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    tagline: '',
    founded_year: '',
    category: 'General',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role === 'student') { navigate('/dashboard'); return; }
  }, [user, profile]);

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm';
  const labelClass = 'block text-slate-300 text-sm font-medium mb-2';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      // 1. Upload Logo & Banner to Cloudinary
      let finalLogoUrl = '';
      let finalBannerUrl = '';

      if (logoFile) finalLogoUrl = await uploadToCloudinary(logoFile);
      if (bannerFile) finalBannerUrl = await uploadToCloudinary(bannerFile);

      // 2. Save Club to Supabase
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          name: form.name,
          description: form.description,
          tagline: form.tagline,
          logo_url: finalLogoUrl,
          banner_url: finalBannerUrl,
          founded_year: form.founded_year ? parseInt(form.founded_year) : null,
          category: form.category,
          admin_id: profile.id,
        })
        .select()
        .maybeSingle();

      if (clubError || !club) throw new Error(clubError?.message || 'Failed to create club');

      // 3. Process Team Members (Upload their images if they selected one)
      const validMembers = members.filter(m => m.name && m.position);
      
      if (validMembers.length > 0) {
        // We use Promise.all to upload all member photos at the exact same time (much faster!)
        const membersDataToInsert = await Promise.all(validMembers.map(async (m, i) => {
          let memberImageUrl = '';
          if (m.file) {
            memberImageUrl = await uploadToCloudinary(m.file);
          }
          return {
            name: m.name,
            position: m.position,
            image_url: memberImageUrl,
            club_id: club.id,
            display_order: i
          };
        }));

        const { error: memberError } = await supabase.from('club_members').insert(membersDataToInsert);
        if (memberError) throw new Error(memberError.message);
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Register Club</h1>
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
                <label className={labelClass}>Club Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Tech Innovators Club" className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Tagline</label>
                <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} placeholder="A short, catchy tagline" className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Tell us about the club..." className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Founded Year</label>
                <input type="number" value={form.founded_year} onChange={e => setForm(p => ({ ...p, founded_year: e.target.value }))} placeholder="e.g. 2018" min="1990" max={new Date().getFullYear()} className={inputClass} />
              </div>

              {/* LOGO UPLOAD */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Club Logo (Upload) *</label>
                <input 
                  type="file" accept="image/*" required
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                      setLogoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                />
                {logoPreview && (
                  <img src={logoPreview} alt="Logo Preview" className="mt-4 h-24 w-24 object-cover rounded-full border-2 border-white/10" />
                )}
              </div>

              {/* BANNER UPLOAD */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Club Banner (Upload)</label>
                <input 
                  type="file" accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setBannerFile(e.target.files[0]);
                      setBannerPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                />
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner Preview" className="mt-4 h-32 w-full object-cover rounded-xl border border-white/10" />
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Position Holders</h3>
                <button
                  type="button"
                  onClick={() => setMembers(prev => [...prev, { name: '', position: '', image_url: '' }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white text-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>

              <div className="space-y-4">
                {members.map((member, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/3 border border-white/10 rounded-xl relative">
                    
                    {/* Member Image Upload Box */}
                    <div className="flex-shrink-0">
                      <label className="cursor-pointer group block">
                        <div className="w-20 h-20 rounded-xl border border-white/20 bg-slate-900 flex items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all">
                          {member.preview ? (
                            <img src={member.preview} alt="Member" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-500 group-hover:text-emerald-400">Add Photo</span>
                          )}
                        </div>
                        <input 
                          type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, file: file, preview: URL.createObjectURL(file) } : m));
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        value={member.name}
                        onChange={e => setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, name: e.target.value } : m))}
                        placeholder="Full name"
                        className={inputClass}
                      />
                      <input
                        value={member.position}
                        onChange={e => setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, position: e.target.value } : m))}
                        placeholder="Position/Role (e.g. President)"
                        className={inputClass}
                      />
                    </div>

                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMembers(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-4 right-4 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit" loading={loading} size="lg">
                {loading ? 'Uploading & Registering...' : 'Register Club'}
              </Button>
              <Link to="/admin"><Button type="button" variant="ghost" size="lg">Cancel</Button></Link>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}