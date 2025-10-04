import { useState } from 'react';
import toast from 'react-hot-toast';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Hard-coded admin password (you can change this)
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a brief delay for better UX
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success('Login successful!');
        onLoginSuccess();
      } else {
        toast.error('Invalid password!');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="card-title text-3xl justify-center mb-2">
              Admin Access
            </h2>
            <p className="text-base-content/70">
              Enter password to upload PDFs
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered input-primary w-full"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          {/* Info Alert */}
          <div className="alert alert-info mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">Admin access required to upload documents</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;