import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { AlertCircle, ArrowRight, User, Briefcase, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function Cadastro() {
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // context expects user and token or we can just use setAuth
  
  // Custom auth injection since useAuth's loginUser might be strictly expecting username/pass
  // The context's loginUser usually updates state. Wait, the context's loginUser expects (userData, token).
  // Let's assume the context exposes what we need, but looking at Login.jsx: `loginUser(userData, token)`
  
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    empresa: '',
    telefone: '',
    email: '',
    senha: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser(formData);
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Erro ao realizar o cadastro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-aldebaran-gray selection:bg-amber-500/20 selection:text-amber-500">

      {/* Lado Esquerdo - Branding */}
      <div className="w-full md:w-[45%] bg-[#0B0F19] relative overflow-hidden flex flex-col p-8 border-r border-aldebaran-border/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        {/* Glow decorativo */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-aldebaran-orange/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-aldebaran-gold/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Link voltar para Home — topo do painel escuro */}
        <div className="relative z-10 mb-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para a Home
          </Link>
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center flex-1 justify-center">
          <div className="w-[70px] h-[65px] relative overflow-hidden mb-3">
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
              className="drop-shadow-lg" 
            />
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white uppercase mb-2">
            AXION
          </h1>
          <p className="text-theme-weak text-sm max-w-sm mt-4 leading-relaxed">
            Centralize seus contratos, acompanhe prazos, licenças e gerencie múltiplas áreas da sua empresa em um único lugar seguro.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-[55%] bg-white flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {isRegistered ? (
            <div className="text-center animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-[#0D9488]/10 rounded-full flex items-center justify-center text-[#0D9488] mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-title font-extrabold text-theme-strong mb-4">
                Ative sua conta!
              </h2>
              <p className="text-theme-normal text-sm leading-relaxed mb-6 text-center">
                Quase lá! Para começar a usar a plataforma <strong>AXION</strong>, você precisa ativar sua conta. Enviamos um e-mail com o link de ativação para:
              </p>
              <div className="bg-[#F8F9FA] border border-aldebaran-border py-3 px-4 text-[#0D9488] font-mono text-sm font-bold rounded-none mb-6 w-full select-all text-center">
                {formData.email}
              </div>
              <p className="text-theme-weak text-xs leading-relaxed mb-8 text-center">
                Por favor, verifique sua caixa de entrada (e pasta de spam se necessário). O link de ativação é válido por 24 horas.
              </p>
              <Link 
                to="/login"
                className="w-full inline-block bg-aldebaran-gold hover:bg-blue-700 text-white font-bold text-sm tracking-wider uppercase py-3.5 text-center transition-colors shadow-md"
              >
                Ir para o Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-title font-extrabold text-theme-strong mb-8 text-center">
                Cadastre-se
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-start gap-2.5 rounded-none shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Insira seu nome" 
                      className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                      required 
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      name="sobrenome"
                      value={formData.sobrenome}
                      onChange={handleChange}
                      placeholder="Insira seu sobrenome" 
                      className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                      required 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Empresa" 
                      className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                      required 
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="Insira seu telefone" 
                      className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                      required 
                    />
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Insira seu email de trabalho" 
                    className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                    required 
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-weak">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type="password" 
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Insira sua senha" 
                    className="w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-aldebaran-orange focus:ring-1 focus:ring-aldebaran-orange transition-all outline-none"
                    required 
                  />
                </div>

                <p className="text-[10px] text-theme-weak text-center pt-2">
                  Ao clicar em "Criar conta", você aceita os Termos de Uso e Política de Privacidade.
                </p>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#41b080] hover:bg-[#36956b] active:bg-[#2b7856] text-white font-bold text-sm tracking-wider uppercase py-3.5 transition-all shadow-md mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? 'Criando Conta...' : 'CRIAR MINHA CONTA'}
                </button>
                
              </form>

              <div className="mt-8 text-center border-t border-aldebaran-border pt-8">
                <Link 
                  to="/login"
                  className="w-full inline-block bg-white hover:bg-[#F8F9FA] border border-[#41b080] text-[#41b080] font-bold text-sm tracking-wider uppercase py-3 transition-colors shadow-sm"
                >
                  JÁ TEM UMA CONTA? FAÇA LOGIN
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
