import './App.css'
import Calendar from './components/calendar'
import Header from './components/header'
import { useAuth0 } from '@auth0/auth0-react';

const App: React.FC = () => {
    //function App() {
    const { isAuthenticated, isLoading } = useAuth0();
  return (
      <>
        <Header />
          {!isLoading && !isAuthenticated && (
              <main style={{ padding: '2rem' }}>
                  <h1>Welcome to the Landing Page</h1>
              </main>
          )}
          {!isLoading && isAuthenticated && (
              <main style={{ padding: '2rem' }}>
                  <h1>Logged In!</h1>
                  <Calendar />
              </main>
          )}          
    </>
  )
}

export default App
