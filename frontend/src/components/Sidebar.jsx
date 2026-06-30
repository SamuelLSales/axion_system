import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { exportarCSV, getAreasAtuacao } from "../services/api";
import { useAuth } from "../context/AuthContext";

const formatArea = (nome) => {
  if (!nome) return "";
  return nome.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

const NavItem = ({ to, icon: Icon, label, isExpanded, iconColor, end }) => (
  <NavLink
    to={to}
    end={end}
    title={!isExpanded ? label : ""}
    className={({ isActive }) =>
      `flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${isExpanded ? "px-3" : "justify-center px-0"} ${
        isActive
          ? "bg-[#0D9488]/10 text-[#0D9488] shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`
    }
  >
    <Icon className="w-[18px] h-[18px] shrink-0" style={iconColor ? { color: iconColor } : {}} />
    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
      {label}
    </span>
  </NavLink>
);

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
        console.error("Erro ao carregar areas no sidebar:", err);
      }
    };
    carregarAreas();
  }, [user]);

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 shadow-sm ${isExpanded ? "w-64" : "w-20"}`}
    >
      {/* BRAND HEADER */}
      <div className="h-[70px] flex items-center justify-center px-4 border-b border-slate-100">
        {isExpanded ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-extrabold text-sm">G</span>
            </div>
            <span className="text-lg font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#34d399]">
              GEOGEST
            </span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[#0D9488] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base">G</span>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
        {isExpanded && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">
            Painel Operacional
          </p>
        )}

        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard Geral" isExpanded={isExpanded} end />
        <NavItem to="/dashboard/financeiro" icon={FileSpreadsheet} label="Painel Financeiro" isExpanded={isExpanded} />

        {areas.map(area => {
          const areaUrl = area.nome.toLowerCase().replace(/\s+/g, "-");
          return (
            <NavItem
              key={area.id}
              to={`/area/${areaUrl}`}
              icon={FolderOpen}
              label={formatArea(area.nome)}
              isExpanded={isExpanded}
              iconColor={area.cor_visual}
            />
          );
        })}

        <NavItem to="/responsaveis" icon={Users} label="Equipe" isExpanded={isExpanded} />
        <NavItem to="/contratos/novo" icon={PlusCircle} label="Novo Contrato" isExpanded={isExpanded} />
        <NavItem to="/areas" icon={Compass} label="Areas de Atuacao" isExpanded={isExpanded} />
        <NavItem to="/configuracoes" icon={Settings} label="Configuracoes" isExpanded={isExpanded} />
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* User card */}
        {isExpanded && (
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 flex items-center justify-center shrink-0 text-[#0D9488] font-bold text-xs uppercase border border-[#0D9488]/20">
              {user?.nome?.substring(0, 2) || "AD"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">{user?.nome || "Usuario"}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user?.username || "username"}</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logoutUser}
          title="Sair do Sistema"
          className="flex items-center justify-center gap-2 py-2.5 w-full rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 text-xs font-bold border border-rose-100 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isExpanded && <span className="animate-fade-in">Sair</span>}
        </button>

        {/* Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Recolher Menu" : "Expandir Menu"}
          className="flex items-center justify-center gap-2 py-2.5 w-full rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold border border-slate-200 transition-all"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {isExpanded && <span className="animate-fade-in">Recolher Aba</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

