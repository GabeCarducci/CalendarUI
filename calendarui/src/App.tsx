import './App.css'
import { useState } from 'react';
import Calendar from './components/calendar'
import Header from './components/header'
import CalendarPicker from './components/calendarPicker'
import { useAuth0 } from '@auth0/auth0-react';

const App: React.FC = () => {
    //function App() {
    const { isAuthenticated, isLoading } = useAuth0();
    const [calendarId, setCalendarId] = useState<string | null>(null);
    return (
        <>
            <Header />
            <div className="belowHeader">
                {!isLoading && !isAuthenticated && (
                    <main style={{ padding: '2rem' }}>
                        <h1>Welcome to the Landing Page</h1>
                        <p>Please log in to access your calendar.</p>
                    </main>
                )}
                {!isLoading && isAuthenticated && (
                    <main style={{ padding: '2rem' }}>
                        <CalendarPicker selectedId={calendarId} onSelect={setCalendarId} />
                        {calendarId && <Calendar calendarId={calendarId} />}
                    </main>
                )}
            </div>
        </>
    )
}

export default App
