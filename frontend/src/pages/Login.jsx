import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginUser(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aldebaran-dark0 flex flex-col items-center justify-center p-4 selection:bg-[#0D9488]/20 selection:text-[#0D9488]">

      {/* Link voltar para Home */}
      <div className="w-full max-w-[420px] mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-theme-weak hover:text-white text-xs font-semibold transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para a Home
        </Link>
      </div>

      <div className="w-full max-w-[420px] bg-[#111317] border border-aldebaran-border p-8 md:p-10 relative overflow-hidden">
        {/* Glow decorativo no fundo */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0D9488]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0D9488]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* LOGO E TÍTULO */}
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <div className="w-[70px] h-[65px] relative overflow-hidden mb-3 animate-fade-in">
            <img 
              src="/axion_icon.png" 
              alt="AXION" 
              style={{
                position: 'absolute',
                width: '180px',
                height: 'auto',
                maxWidth: 'none',
                top: '-26px',
                left: '-51.5px'
              }}
              className="drop-shadow-md" 
            />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">
            AXION
          </h1>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#0D9488] uppercase block mt-1">
            Contratos & Prazos
          </span>
          <p className="text-theme-weak text-xs mt-3">
            Faça login para gerenciar os projetos e prazos
          </p>
        </div>

        {/* FEEDBACK DE ERRO */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-theme-weak mb-2">
              Usuário
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-theme-weak">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#16191f] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-white placeholder-theme-weak focus:border-[#0D9488] focus:outline-none transition-colors"
                placeholder="admin"
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-theme-weak mb-2">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-theme-weak">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#16191f] border border-aldebaran-border rounded-none py-3 pl-10 pr-10 text-sm text-white placeholder-theme-weak focus:border-[#0D9488] focus:outline-none transition-colors"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-weak hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#41b080] hover:bg-[#36956b] active:bg-[#2b7856] text-white font-bold text-sm tracking-wider uppercase py-3.5 px-4 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10 border-t border-aldebaran-border/30 pt-6">
            <Link 
              to="/cadastro"
              className="text-[#41b080] hover:text-[#36956b] text-xs font-bold tracking-wider uppercase transition-colors"
            >
              NÃO TEM CONTA? CRIE AGORA
            </Link>
        </div>
      </div>
    </div>
  );
}
