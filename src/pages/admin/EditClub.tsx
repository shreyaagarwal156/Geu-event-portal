import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Club, ClubMember } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'General'];

// Upgraded interface to handle existing URLs vs new local Files
interface EditMember extends ClubMember {
  file?: File | null;
  previewUrl?: string;
}

export function EditClub() {
  const { id } = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [members, setMembers] = useState<EditMember[]>([]);

  // States to hold potential new files for Logo and Banner
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const [form, setForm] = useState({
    name: '', description: '', tagline: '', logo_url: '', banner_url: '',
    founded_year: '', category: 'General',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role === 'student') { navigate('/dashboard'); return; }
    if (id) { fetchClub(); fetchMembers(); }
  }, [user, profile, id]);

  async function fetchClub() {
    const { data } = await supabase.from('clubs').select('*').eq('id', id!).maybeSingle();
    if (data) {
      const club = data as Club;
      if (profile && profile.role !== 'main_admin' && club.admin_id !== profile.id) {
        navigate('/admin'); return;
      }
      setForm({
        name: club.name, description: club.description || '', tagline: club.tagline || '',
        logo_url: club.logo_url || '', banner_url: club.banner_url || '',
        founded_year: club.founded_year?.toString() || '', category: club.category || 'General',
      });
      // Set initial previews from the database URLs
      setLogoPreview(club.logo_url || '');
      setBannerPreview(club.banner_url || '');
    }
    setLoading(false);
  }

  async function fetchMembers() {
    const { data } = await supabase.from('club_members').select('*').eq('club_id', id!).order('display_order');
    if (data) {
      // Map data to our EditMember interface
      setMembers(data.map(m => ({ ...m, previewUrl: m.image_url })));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // 1. Check if new files were selected; if yes, upload them. Otherwise keep old URLs.
      let finalLogoUrl = form.logo_url;
      let finalBannerUrl = form.banner_url;

      if (logoFile) finalLogoUrl = await uploadToCloudinary(logoFile);
      if (bannerFile) finalBannerUrl = await uploadToCloudinary(bannerFile);

      // 2. Update Club in Supabase
      const { error: clubError } = await supabase.from('clubs').update({
        name: form.name, description: form.description, tagline: form.tagline,
        logo_url: finalLogoUrl, banner_url: finalBannerUrl,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
        category: form.category,
      }).eq('id', id!);

      if (clubError) throw new Error(clubError.message);

      // 3. Process Team Members
      await supabase.from('club_members').delete().eq('club_id', id!);
      const validMembers = members.filter(m => m.name && m.position);
      
      if (validMembers.length > 0) {
        const membersDataToInsert = await Promise.all(validMembers.map(async (m, i) => {
          let memberImageUrl = m.image_url; // Keep old URL by default
          if (m.file) {
            memberImageUrl = await uploadToCloudinary(m.file); // Upload new if selected
          }
          return {
            name: m.name, position: m.position, image_url: memberImageUrl, 
            club_id: id!, display_order: i
          };
        }));

        const { error: memberError } = await supabase.from('club_members').insert(membersDataToInsert);
        if (memberError) throw new Error(memberError.message);
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
      setSaving(false);
    }
  };

  const addMember = () => setMembers(prev => [...prev, { id: '', club_id: id!, name: '', position: '', image_url: '', display_order: prev.length, created_at: '', previewUrl: '' }]);
  const removeMember = (i: number) => setMembers(prev => prev.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: string, value: string) => setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm';
  const labelClass = 'block text-slate-300 text-sm font-medium mb-2';

  if (loading) return (
    <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white text-sm transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Club</h1>
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
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className={inputClass} />
              </div>
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Tagline</label>
                <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} className={inputClass} />
              </div>
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className={`${inputClass} resize-none`} />
              </div>
              
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Founded Year</label>
                <input type="number" value={form.founded_year} onChange={e => setForm(p => ({ ...p, founded_year: e.target.value }))} className={inputClass} />
              </div>

              {/* LOGO UPLOAD / EDIT */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Update Club Logo</label>
                <input 
                  type="file" accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                      setLogoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                />
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="mt-4 h-24 w-24 object-cover rounded-full border-2 border-white/10" />
                )}
              </div>

              {/* BANNER UPLOAD / EDIT */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Update Club Banner</label>
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
                  <img src={bannerPreview} alt="Banner" className="mt-4 h-32 w-full object-cover rounded-xl border border-white/10" />
                )}
              </div>
            </div>

            {/* TEAM MEMBERS EDIT */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Position Holders</h3>
                <button type="button" onClick={addMember} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white text-xs transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>
              
              <div className="space-y-4">
                {members.map((m, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/3 border border-white/10 rounded-xl relative">
                    
                    {/* Member Image Edit Box */}
                    <div className="flex-shrink-0">
                      <label className="cursor-pointer group block">
                        <div className="w-20 h-20 rounded-xl border border-white/20 bg-slate-900 flex items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all">
                          {m.previewUrl ? (
                            <img src={m.previewUrl} alt="Member" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-500 group-hover:text-emerald-400 text-center px-1">Change Photo</span>
                          )}
                        </div>
                        <input 
                          type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setMembers(prev => prev.map((member, idx) => idx === i ? { ...member, file: file, previewUrl: URL.createObjectURL(file) } : member));
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="Full name" className={inputClass} />
                      <input value={m.position} onChange={e => updateMember(i, 'position', e.target.value)} placeholder="Position" className={inputClass} />
                    </div>

                    <button type="button" onClick={() => removeMember(i)} className="absolute top-4 right-4 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No members added yet. Click "Add Member" to add position holders.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit" loading={saving} size="lg">
                {saving ? 'Saving Updates...' : 'Save Changes'}
              </Button>
              <Link to="/admin"><Button type="button" variant="ghost" size="lg">Cancel</Button></Link>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}