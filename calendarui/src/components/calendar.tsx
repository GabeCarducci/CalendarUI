import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Scheduler } from 'calendarkit-pro';
import type { CalendarEvent, ViewType } from 'calendarkit-pro';
import { makeSupabase } from '../lib/Supabase';

const fromRow = (r: any): CalendarEvent => ({
  id: r.id, title: r.title, description: r.description,
  start: new Date(r.start_time), end: new Date(r.end_time),
} as CalendarEvent);

export default function Calendar() {
  const { getAccessTokenSilently } = useAuth0();
  const supabase = useMemo(
    () => makeSupabase(() => getAccessTokenSilently()),
    [getAccessTokenSilently]
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewType>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    supabase.from('events').select('*').order('start_time')
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setEvents((data ?? []).map(fromRow));
      });
  }, [supabase]);

  async function createEvent(event: Partial<CalendarEvent>) {
    if (!event.title?.trim() || !event.start || !event.end) return;
    const { data, error } = await supabase.from('events').insert({
      title: event.title.trim(),
      description: (event as any).description ?? null,
      start_time: new Date(event.start).toISOString(),
      end_time: new Date(event.end).toISOString(),
    }).select().single();
    if (error) return console.error(error);
    setEvents(prev => [...prev, fromRow(data)]);
  }

  async function updateEvent(event: CalendarEvent) {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e)); // optimistic
    const { error } = await supabase.from('events').update({
      title: event.title,
      description: (event as any).description ?? null,
      start_time: new Date(event.start).toISOString(),
      end_time: new Date(event.end).toISOString(),
    }).eq('id', event.id);
    if (error) console.error(error);
  }

  async function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error(error);
  }

  const moveEvent = (e: CalendarEvent, start: Date, end: Date) =>
    updateEvent({ ...e, start, end });

  return (
    <div style={{ height: 700, textAlign: 'left' }}>
      <Scheduler
        events={events} view={view} onViewChange={setView}
        date={date} onDateChange={setDate}
        onEventCreate={createEvent} onEventUpdate={updateEvent}
        onEventDelete={deleteEvent} onEventDrop={moveEvent} onEventResize={moveEvent}
      />
    </div>
  );
}