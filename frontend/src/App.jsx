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
import Configuracoes from './pages/Configuracoes';
import DashboardFinanceiro from './pages/DashboardFinanceiro';
import EscolherPlanoPage from './pages/EscolherPlanoPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para rotas protegidas
function ProtectedRoute({ children, requirePlan = true }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-amber-500 font-bold tracking-widest uppercase text-sm">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se a rota exige um plano ativo, e o usuário não tem plano ou está inadimplente
  if (requirePlan && user?.empresa) {
    // Permite bypass apenas se o banco de dados marcar explicitamente plano="isento"
    const isIsento = user.empresa.plano === "isento";
    const isPlanOk = user.empresa.plano && user.empresa.status_pagamento === "ativo";
    
    if (!isIsento && !isPlanOk) {
      return <Navigate to="/escolher-plano" replace />;
    }
  }
  
  return children;
}

// Layout principal do sistema
function MainLayout() {
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Barra Lateral Esquerda */}
      <Sidebar />

      {/* Corpo Principal do Sistema */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Cabeçalho Superior Fixo */}
        <Header />

        {/* Área de Visualização das Páginas */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
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

          {/* Rotas de Onboarding (Protegidas, mas não exigem plano ativo) */}
          <Route path="/escolher-plano" element={<ProtectedRoute requirePlan={false}><EscolherPlanoPage /></ProtectedRoute>} />

          {/* Rotas Principais (Protegidas, Exigem Plano) */}
          <Route element={<ProtectedRoute requirePlan={true}><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/financeiro" element={<DashboardFinanceiro />} />
            <Route path="/contratos/:id" element={<DetalheContrato />} />
            <Route path="/contratos/novo" element={<NovoContrato />} />
            <Route path="/responsaveis" element={<Responsaveis />} />
            <Route path="/areas" element={<AreasAtuacao />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
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

