import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">GEU<span className="text-emerald-400">Event</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              The official event management portal for Graphic Era University. Discover, register, and experience the vibrant campus life.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>566/6, Bell Rd, Clement Town, Dehradun, Uttarakhand 248002</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>events@geu.ac.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 135 270 0300</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Events', to: '/events' },
                { label: 'Grafest', to: '/grafest' },
                { label: 'Clubs', to: '/clubs' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { label: 'Sign In', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'Dashboard', to: '/dashboard' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Graphic Era University. All rights reserved.
          </p>
          <p className="text-slate-600 text-sm">
            Built with <span className="text-emerald-400">GEUEvent Portal</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
