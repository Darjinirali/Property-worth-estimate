import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Estimate from './pages/Estimate';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export type Page = 'home' | 'estimate' | 'dashboard' | 'contact';

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage]   = useState<Page>('home');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleGetEstimate = () => {
    if (user) setPage('estimate');
    else setAuthModal('register');
  };

  const goTo = (p: Page) => {
    if ((p === 'estimate' || p === 'dashboard') && !user) {
      setAuthModal('login');
      return;
    }
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        currentPage={page}
        onGoTo={goTo}
        onOpenLogin={() => setAuthModal('login')}
        onOpenRegister={() => setAuthModal('register')}
      />

      {page === 'home'      && <Home onGetEstimate={handleGetEstimate} />}
      {page === 'estimate'  && <Estimate />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'contact'   && <Contact />}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(m) => setAuthModal(m)}
          onSuccess={() => { setAuthModal(null); setPage('estimate'); }}
        />
      )}
    </div>
  );
}