import { useState } from 'react';
import toast from 'react-hot-toast';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success('Connexion réussie !');
        onLoginSuccess();
      } else {
        toast.error('Mot de passe incorrect !');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-100 to-white">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
        {/* En-tête */}
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            Accès Administrateur
          </h2>
          <p className="text-gray-600">
            Veuillez entrer le mot de passe pour continuer
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="block mb-1 font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              loading
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
            }`}
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        {/* Message info */}
        <div className="p-3 mt-6 text-sm text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
          L’accès administrateur est requis pour téléverser des documents.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
