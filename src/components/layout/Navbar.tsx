import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Events', to: '/events' },
    { label: 'Grafest', to: '/grafest' },
    { label: 'Clubs', to: '/clubs' },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              GEU<span className="text-emerald-400">Event</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs font-bold">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-white text-sm font-medium max-w-24 truncate">{profile.name}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white text-sm font-semibold truncate">{profile.name}</p>
                      <p className="text-slate-400 text-xs truncate">{profile.email}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${profile.role === 'main_admin' ? 'bg-amber-500/20 text-amber-400' : profile.role === 'club_admin' ? 'bg-teal-500/20 text-teal-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {profile.role === 'main_admin' ? 'Main Admin' : profile.role === 'club_admin' ? 'Club Admin' : 'Student'}
                      </span>
                    </div>
                    <div className="p-2">
                      {profile.role === 'student' && (
                        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-sm transition-all">
                          <User className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      {(profile.role === 'club_admin' || profile.role === 'main_admin') && (
                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-sm transition-all">
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/25">Register</Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(link.to) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-1">
              {user && profile ? (
                <>
                  {profile.role === 'student' && (
                    <Link to="/dashboard" className="block px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">Dashboard</Link>
                  )}
                  {(profile.role === 'club_admin' || profile.role === 'main_admin') && (
                    <Link to="/admin" className="block px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">Admin Panel</Link>
                  )}
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">Sign In</Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-xl text-sm bg-emerald-500 text-white font-medium text-center transition-all">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
