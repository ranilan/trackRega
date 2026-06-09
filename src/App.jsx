import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AuthPage from '@/components/AuthPage';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Sources from './pages/Sources';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import CreateBudget from './pages/CreateBudget';
import AdminUsers from './pages/AdminUsers';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return <AuthPage />;
    }
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/Dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/AddTransaction" element={<Layout><AddTransaction /></Layout>} />
      <Route path="/Sources" element={<Layout><Sources /></Layout>} />
      <Route path="/Categories" element={<Layout><Categories /></Layout>} />
      <Route path="/Budgets" element={<Layout><Budgets /></Layout>} />
      <Route path="/Reports" element={<Layout><Reports /></Layout>} />
      <Route path="/CreateBudget" element={<Layout><CreateBudget /></Layout>} />
      <Route path="/AdminUsers" element={<Layout><AdminUsers /></Layout>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
