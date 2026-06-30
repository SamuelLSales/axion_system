import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Wifi, WifiOff, User, Bell } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [online, setOnline] = useState(true);

  const obterTituloPagina = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard Principal";
    if (path === "/dashboard/financeiro") return "Painel Financeiro";
    if (path === "/responsaveis") return "Gestao de Colaboradores";
    if (path === "/contratos/novo") return "Novo Contrato";
    if (path.startsWith("/contratos/")) return "Detalhamento do Contrato";
    if (path === "/areas") return "Areas de Atuacao";
    if (path === "/configuracoes") return "Configuracoes";
    return "Geogest";
  };

  useEffect(() => {
    const verificarConexao = async () => {
      try {
        await api.get("/");
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    verificarConexao();
    const interval = setInterval(verificarConexao, 10000);
    return () => clearInterval(interval);
  }, []);

  const iniciais = user?.nome
    ? user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "GG";

  return (
    <header className="bg-white border-b border-slate-200 h-[70px] px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">Geogest</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">{obterTituloPagina()}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* API Status */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          online
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-rose-50 text-rose-600 border-rose-200"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-rose-500"}`} />
          {online ? "api online" : "api offline"}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D9488] to-[#34d399] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {iniciais}
          </div>
          <span className="text-sm font-semibold text-slate-700 capitalize">
            {user?.nome || "Administrador"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

