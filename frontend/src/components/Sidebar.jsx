import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Compass,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LogOut,
  Settings
} from 'lucide-react';
import { exportarCSV, getAreasAtuacao } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
 const [isExpanded, setIsExpanded] = useState(true);
 const { user, logoutUser } = useAuth();
 const [areas, setAreas] = useState([]);

 useEffect(() => {
   const carregarAreas = async () => {
     if (!user) return;
     try {
       const data = await getAreasAtuacao();
       setAreas(data);
     } catch (err) {
       console.error("Erro ao carregar áreas no sidebar:", err);
     }
   };
   carregarAreas();
 }, [user]);

 return (
  <aside 
  className={`bg-aldebaran-gray border-r border-aldebaran-border flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 relative ${
  isExpanded ? 'w-64' : 'w-20'
  }`}
  >
  
  

  {/* BRAND HEADER */}
  <div className={`bg-[#111827] border-b border-[#1f2937] h-[70px] relative flex items-center ${isExpanded ? 'px-4 justify-start overflow-visible' : 'justify-center overflow-hidden'}`}>
  {isExpanded ? (
    <img 
      src="/axion_lateral.png" 
      alt="AXION" 
      style={{
        position: 'absolute',
        top: '-9px',
        left: '-7px',
        width: '170px',
        height: 'auto',
        pointerEvents: 'none'
      }}
      className="animate-fade-in z-10" 
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center">
      <img 
        src="/axion_aba.png" 
        alt="AX" 
        style={{
          transform: 'scale(1.65) translateY(16px) translateX(8.29%)'
        }}
        className="w-[60px] h-[60px] object-cover" 
      />
    </div>
  )}
  </div>

  {/* NAVIGATION ITEMS */}
  <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
  
  <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'h-auto opacity-100 mb-4' : 'h-0 opacity-0 mb-0'}`}>
  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak px-3 block whitespace-nowrap">
  Painel Operacional
  </span>
  </div>
  
  <NavLink 
  to="/dashboard" 
  title={!isExpanded ? "Dashboard" : ""}
  className={({ isActive }) => 
  `flex items-center gap-3 py-2.5 rounded-none text-sm font-bold transition-all ${isExpanded ? 'px-3' : 'justify-center px-0'} ${
  isActive 
  ? 'bg-aldebaran-dark text-aldebaran-gold border-l-4 border-l-aldebaran-orange border-y border-r border-aldebaran-border shadow-sm' 
  : 'text-theme-weak hover:bg-aldebaran-dark hover:text-theme-normal border-l-4 border-l-transparent border-y border-r border-y-transparent border-r-transparent'
  }`
  }
  >
  <LayoutDashboard className="w-5 h-5 shrink-0" />
  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
  Dashboard Geral
  </span>
  </NavLink>

  {areas.map(area => {
    const areaUrl = area.nome.toLowerCase().replace(/\s+/g, '-');
    return (
      <NavLink 
      key={area.id}
      to={`/area/${areaUrl}`} 
      title={!isExpanded ? area.nome : ""}
      className={({ isActive }) => 
      `flex items-center gap-3 py-2.5 rounded-none text-sm font-bold transition-all ${isExpanded ? 'px-3' : 'justify-center px-0'} ${
      isActive 
      ? 'bg-aldebaran-dark text-aldebaran-gold border-l-4 border-l-aldebaran-orange border-y border-r border-aldebaran-border shadow-sm' 
      : 'text-theme-weak hover:bg-aldebaran-dark hover:text-theme-normal border-l-4 border-l-transparent border-y border-r border-y-transparent border-r-transparent'
      }`
      }
      >
      <FolderOpen className="w-5 h-5 shrink-0" style={{ color: area.cor_visual }} />
      <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
      {area.nome}
      </span>
      </NavLink>
    );
  })}

  <NavLink 
  to="/responsaveis" 
  title={!isExpanded ? "Equipe" : ""}
  className={({ isActive }) => 
  `flex items-center gap-3 py-2.5 rounded-none text-sm font-bold transition-all ${isExpanded ? 'px-3' : 'justify-center px-0'} ${
  isActive 
  ? 'bg-aldebaran-dark text-aldebaran-gold border-l-4 border-l-aldebaran-orange border-y border-r border-aldebaran-border shadow-sm' 
  : 'text-theme-weak hover:bg-aldebaran-dark hover:text-theme-normal border-l-4 border-l-transparent border-y border-r border-y-transparent border-r-transparent'
  }`
  }
  >
  <Users className="w-5 h-5 shrink-0" />
  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
  Equipe
  </span>
  </NavLink>

  <NavLink 
  to="/contratos/novo" 
  title={!isExpanded ? "Novo Contrato" : ""}
  className={({ isActive }) => 
  `flex items-center gap-3 py-2.5 rounded-none text-sm font-bold transition-all ${isExpanded ? 'px-3' : 'justify-center px-0'} ${
  isActive 
  ? 'bg-aldebaran-dark text-aldebaran-gold border-l-4 border-l-aldebaran-orange border-y border-r border-aldebaran-border shadow-sm' 
  : 'text-theme-weak hover:bg-aldebaran-dark hover:text-theme-normal border-l-4 border-l-transparent border-y border-r border-y-transparent border-r-transparent'
  }`
  }
  >
  <PlusCircle className="w-5 h-5 shrink-0" />
  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
  Novo Contrato
  </span>
  </NavLink>

  <NavLink 
  to="/areas" 
  title={!isExpanded ? "Configurações" : ""}
  className={({ isActive }) => 
  `flex items-center gap-3 py-2.5 rounded-none text-sm font-bold transition-all ${isExpanded ? 'px-3' : 'justify-center px-0'} ${
  isActive 
  ? 'bg-aldebaran-dark text-aldebaran-gold border-l-4 border-l-aldebaran-orange border-y border-r border-aldebaran-border shadow-sm' 
  : 'text-theme-weak hover:bg-aldebaran-dark hover:text-theme-normal border-l-4 border-l-transparent border-y border-r border-y-transparent border-r-transparent'
  }`
  }
  >
  <Settings className="w-5 h-5 shrink-0" />
  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
  Áreas de Atuação
  </span>
  </NavLink>
  </nav>

  {/* TOGGLE FOOTER */}
  <div className="p-4 border-t border-aldebaran-border space-y-3">
    {/* USER PROFILE INFO */}
    {isExpanded && (
      <div className="flex items-center justify-between p-2.5 bg-aldebaran-dark/40 border border-aldebaran-border rounded-none">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-none bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-500 font-bold text-xs uppercase">
            {user?.nome?.substring(0, 2) || 'AD'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-theme-strong truncate block">{user?.nome || 'Usuário'}</span>
            <span className="text-[9px] font-bold text-theme-weak uppercase tracking-wider block">{user?.username || 'username'}</span>
          </div>
        </div>
      </div>
    )}

    <button
      onClick={logoutUser}
      title="Sair do Sistema"
      className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-none text-xs font-bold border border-red-500/20 transition shadow-sm w-full"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      {isExpanded && (
        <span className="whitespace-nowrap overflow-hidden animate-fade-in">
          Sair
        </span>
      )}
    </button>

    <button
      onClick={() => setIsExpanded(!isExpanded)}
      title={isExpanded ? "Recolher Menu" : "Expandir Menu"}
      className="flex items-center justify-center gap-2 py-2.5 bg-aldebaran-dark hover:bg-aldebaran-border text-theme-weak hover:text-theme-strong rounded-none text-xs font-bold border border-aldebaran-border transition shadow-sm w-full"
    >
      {isExpanded ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
      {isExpanded && (
        <span className="whitespace-nowrap overflow-hidden animate-fade-in">
          Recolher Aba
        </span>
      )}
    </button>
  </div>

 </aside>
 );
};

export default Sidebar;
