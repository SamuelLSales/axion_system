import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DetalheContrato from './pages/DetalheContrato';
import NovoContrato from './pages/NovoContrato';
import Responsaveis from './pages/Responsaveis';
import Contratos from './pages/Contratos';
import AreasAtuacao from './pages/AreasAtuacao';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import LandingPage from './pages/LandingPage';
import ActivateAccount from './pages/ActivateAccount';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-aldebaran-dark flex items-center justify-center text-amber-500 font-bold tracking-widest uppercase text-sm">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Layout principal do sistema
function MainLayout() {
  return (
    <div className="flex bg-aldebaran-dark min-h-screen text-slate-100 font-sans">
      {/* Barra Lateral Esquerda */}
      <Sidebar />

      {/* Corpo Principal do Sistema */}
      <div className="flex-1 flex flex-col min-w-0 bg-aldebaran-dark">
        {/* Cabeçalho Superior Fixo */}
        <Header />

        {/* Área de Visualização das Páginas */}
        <main className="flex-1 overflow-y-auto bg-aldebaran-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota Pública Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Rota Pública de Login/Cadastro/Ativação */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/activate" element={<ActivateAccount />} />

          {/* Rotas Principais (Protegidas) */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contratos/:id" element={<DetalheContrato />} />
            <Route path="/contratos/novo" element={<NovoContrato />} />
            <Route path="/responsaveis" element={<Responsaveis />} />
            <Route path="/areas" element={<AreasAtuacao />} />
            <Route path="/area/:area" element={<Contratos />} />
            <Route path="/contratos" element={<Contratos />} />
          </Route>

          {/* Redirecionamento padrão para rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
