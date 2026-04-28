import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { Event } from '../../types';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';

interface EventCardProps {
  event: Event;
  registrationCount?: number;
}

export function EventCard({ event, registrationCount }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isPast = event.status === 'past';

  const fallbackBanner = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <Link to={`/events/${event.id}`}>
      <GlassCard hover className="overflow-hidden group h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.banner_url || fallbackBanner}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackBanner; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {event.is_grafest && <Badge variant="amber">Grafest</Badge>}
            <Badge variant={isPast ? 'slate' : 'emerald'}>{isPast ? 'Past' : 'Upcoming'}</Badge>
          </div>
          {event.is_grafest && (
            <div className="absolute top-3 right-3">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-white font-semibold text-lg leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' '}at{' '}
                {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            {registrationCount !== undefined && (
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{registrationCount} registered</span>
                {event.max_attendees && <span className="text-slate-500">/ {event.max_attendees}</span>}
              </div>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
