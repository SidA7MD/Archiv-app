import { useState } from 'react';
import AdminLogin from './AdminLogin';
import PdfUpload from './PdfUpload';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {!isAuthenticated ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <PdfUpload />
      )}
    </>
  );
};

export default AdminPage;