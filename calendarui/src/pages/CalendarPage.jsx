import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Calendar from '../components/calendar';
import '../index.css';
import './CalendarPage.css';

export default function CalendarPage() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main>
      <div className="calendar-page-actions">
        <button
          className="logout-button"
          type="button"
          disabled={isLoading}
          onClick={() => isAuthenticated
            ? logout({ logoutParams: { returnTo: window.location.origin } })
            : loginWithRedirect()}
        >
          {isAuthenticated ? 'Log out' : 'Log in'}
        </button>
      </div>
      <h1>Community Calendar</h1>
      {showCalendar ? (
        <Calendar />
      ) : (
        <>
          <h2>Bring Everyone Together</h2>
          <h3>Create Your First Calendar Below</h3>
          <button className="create-calendar-button" type="button" disabled={isLoading} onClick={() => isAuthenticated ? setShowCalendar(true) : loginWithRedirect()}>
            Create Calendar
          </button>
        </>
      )}
    </main>
  );
}
