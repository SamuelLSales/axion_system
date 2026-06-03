import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
 Wifi, 
 WifiOff, 
 Calendar, 
 User
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Header = () => {
 const { user } = useAuth();
 const location = useLocation();
 const [online, setOnline] = useState(true);
 const [dataAtual, setDataAtual] = useState('');
 

 // Mapeamento dinâmico de títulos por rota
 const obterTituloPagina = () => {
 const path = location.pathname;
 if (path === '/') return 'Dashboard Principal';
 if (path === '/responsaveis') return 'Gestão de Colaboradores';
 if (path === '/contratos/novo') return 'Abertura de Projeto';
 if (path.startsWith('/contratos/')) return 'Detalhamento do Contrato';
 return 'Sistema AXION';
 };

 useEffect(() => {
  const hoje = new Date();
 const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
 setDataAtual(hoje.toLocaleDateString('pt-BR', opcoes));

 const verificarConexao = async () => {
 try {
 await api.get('/');
 setOnline(true);
 } catch (err) {
 setOnline(false);
 }
 };

 verificarConexao();
 const interval = setInterval(verificarConexao, 8000);

 return () => clearInterval(interval);
 }, []);

 

  return (
    <header className="bg-aldebaran-gray shadow-sm border-b border-aldebaran-border/60 h-[70px] px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
  
  {/* Active Page Title */}
  <div>
  <h2 className="text-[13px] font-semibold text-theme-weak tracking-wider">
  AXION / <span className="text-theme-strong lowercase">{obterTituloPagina()}</span>
  </h2>
  </div>

  {/* Meta Indicators */}
  <div className="flex items-center gap-6 text-[11px] font-semibold font-sans uppercase tracking-widest">
  
  

  {/* API Status Check */}
  <div className="flex items-center">
  {online ? (
  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 lowercase">
  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
  api online
  </span>
  ) : (
  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-rose-500 bg-rose-500/10 border border-rose-500/20 lowercase">
  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
  api offline
  </span>
  )}
  </div>

  {/* User Badge */}
  <div className="flex items-center text-theme-weak capitalize font-medium text-[13px]">
  {user?.nome || 'Gestor AXION'}
  </div>
  </div>

  </header>
 );
};

export default Header;
