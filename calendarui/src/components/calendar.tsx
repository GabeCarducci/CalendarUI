import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Calendar() {
    const { getAccessTokenSilently, user } = useAuth0();
    const [events, setEvents] = useState([]);
    const [importing, setImporting] = useState(false);

    // Show import button only for Google users
    const isGoogleUser = user?.sub?.startsWith('google-oauth2|');

    const fetchEvents = useCallback(async () => {
        const token = await getAccessTokenSilently();
        const res = await fetch('/api/calendar/events', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEvents(data.map((e: any) => ({
            id: e.id,
            title: e.title,           
            start: e.startTime,       
            end: e.endTime,
        })));
    }, [getAccessTokenSilently]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    async function handleDateClick({ dateStr }: { dateStr: string }) {
        const title = prompt('Event title:');
        if (!title) return;

        const token = await getAccessTokenSilently();
        await fetch('/api/calendar/event', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                start: `${dateStr}T10:00:00`,
                end: `${dateStr}T11:00:00`,
            }),
        });
        fetchEvents();
    }

    async function handleImportGoogle() {
        setImporting(true);
        const token = await getAccessTokenSilently();
        const res = await fetch('/api/calendar/import-google', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        alert(`Imported ${data.imported} events from Google Calendar`);
        setImporting(false);
        fetchEvents(); // refresh to show imported events
    }

    return (
        <div>
            {isGoogleUser && (
                <button onClick={handleImportGoogle} disabled={importing}>
                    {importing ? 'Importing...' : 'Import from Google Calendar'}
                </button>
            )}
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
            />
        </div>
    );
}