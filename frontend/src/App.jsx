import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './components/Home';
import AdminPage from './components/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Check URL hash on mount and when it changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    // Check on mount
    checkHash();

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);

    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const navigateToHome = () => {
    window.location.hash = '';
    setCurrentPage('home');
  };

  const navigateToAdmin = () => {
    window.location.hash = '#/admin';
    setCurrentPage('admin');
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Page Content - No Navigation Bar */}
      {currentPage === 'home' ? <Home /> : <AdminPage />}
    </>
  );
}

export default App;