import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './components/Home';
import AdminPage from './components/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fef9c3',
            color: '#422006',
          },
          success: {
            iconTheme: { primary: '#65a30d', secondary: '#fef9c3' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fef9c3' },
          },
          loading: {
            iconTheme: { primary: '#65a30d', secondary: '#fef9c3' },
          },
        }}
      />

      {currentPage === 'home' ? <Home /> : <AdminPage />}
    </>
  );
}

export default App;
