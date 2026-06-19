import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import {
  AlertCircle, User, Briefcase, Phone, Mail, Lock,
  ArrowLeft, ArrowRight, Building2, FileText, Check, Eye, EyeOff
} from 'lucide-react';

const inputClass = "w-full bg-[#F8F9FA] border border-aldebaran-border rounded-none py-3 pl-10 pr-4 text-sm text-theme-strong focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all outline-none placeholder:text-slate-400";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cargo: '',
    telefone: '',
    email: '',
    senha: '',
    empresa: '',
    razao_social: '',
    cnpj: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser(formData);
      setIsRegistered(true);
    } catch (err) {
      console.error("Erro completo:", err);
      let errorMessage = 'Erro ao realizar o cadastro. Verifique os dados e tente novamente.';
      
      if (!err.response) {
        errorMessage = `Erro de conexão com o servidor (${err.message || 'Sem resposta'}). Verifique se o backend está rodando ou se a requisição foi bloqueada por extensões de AdBlock/Privacy (como Brave Shield ou uBlock) no seu navegador.`;
      } else if (err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Erro 422 (Validação do Pydantic)
          errorMessage = 'Campos inválidos: ' + err.response.data.detail.map(d => d.loc.join('.') + ' ' + d.msg).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f4f5f7] selection:bg-emerald-500/20 selection:text-emerald-600">

      {/* Painel Esquerdo — Branding */}
      <div className="w-full md:w-[42%] bg-[#0B0F19] relative overflow-hidden flex flex-col p-8 border-r border-aldebaran-border/50 min-h-[260px] md:min-h-screen">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-aldebaran-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Voltar */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para a Home
          </Link>
        </div>

        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex flex-col flex-1 justify-center mt-8 md:mt-0">
          <div className="mb-8 flex flex-col items-start">
            <div className="w-[56px] h-[52px] relative overflow-hidden mb-4">
              <img
                src="/axion_icon.png"
                alt="AXION"
                style={{ position: 'absolute', width: '145px', height: 'auto', maxWidth: 'none', top: '-21px', left: '-41px' }}
              />
            </div>
            <h1 className="text-2xl font-extrabold tracking-widest text-white uppercase mb-1">AXION</h1>
            <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Contratos & Prazos</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-3 leading-snug">
            Cadastre sua empresa e comece agora
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Centralize contratos, equipes e prazos. Tenha o controle total da sua operação em um único sistema.
          </p>

          {/* O que você ganha */}
          <ul className="space-y-3">
            {[
              'Gestão completa de contratos e fases',
              'Painel financeiro com TCV e margem de lucro',
              'Alertas automáticos de prazo',
              'Multi-usuário com controle de acesso',
              'Exportação de relatórios em CSV',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Painel Direito — Formulário */}
      <div className="w-full md:w-[58%] flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-lg">

          {/* Sucesso */}
          {isRegistered ? (
            <div className="text-center animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-100">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Empresa cadastrada!</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
                Enviamos um e-mail de ativação para <strong className="text-slate-700">{formData.email}</strong>. Clique no link para ativar sua conta e acessar o painel.
              </p>
              <div className="bg-slate-50 border border-slate-200 py-3 px-4 text-emerald-600 font-mono text-sm font-bold rounded-none mb-8 w-full select-all text-center">
                {formData.email}
              </div>
              <Link
                to="/login"
                className="w-full inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wider uppercase py-3.5 text-center transition-colors shadow-sm"
              >
                Ir para o Login
              </Link>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center gap-3 mb-8">
                {[
                  { n: 1, label: 'Dados da Empresa' },
                  { n: 2, label: 'Responsável & Acesso' },
                ].map(({ n, label }, i) => (
                  <React.Fragment key={n}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                        step === n
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : step > n
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {step > n ? <Check className="w-3.5 h-3.5" /> : n}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${step === n ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                    </div>
                    {i < 1 && <div className={`flex-1 h-px ${step > 1 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
                  </React.Fragment>
                ))}
              </div>

              {/* Erro */}
              {error && (
                <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ETAPA 1 — Empresa */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Dados da Empresa</h2>
                    <p className="text-slate-400 text-sm">Preencha as informações da sua empresa para criar a conta.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Nome Fantasia *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Building2 className="w-4 h-4" /></span>
                      <input type="text" name="empresa" value={formData.empresa} onChange={handleChange}
                        placeholder="Ex: Aldebaran Consultoria" className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Razão Social</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FileText className="w-4 h-4" /></span>
                      <input type="text" name="razao_social" value={formData.razao_social} onChange={handleChange}
                        placeholder="Ex: Aldebaran Consultoria Ltda" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>CNPJ</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FileText className="w-4 h-4" /></span>
                      <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange}
                        placeholder="00.000.000/0000-00" className={inputClass} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wider uppercase py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 group"
                  >
                    Próximo passo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="text-center pt-2">
                    <Link to="/login" className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors">
                      Já tem uma conta? Fazer login
                    </Link>
                  </div>
                </form>
              )}

              {/* ETAPA 2 — Responsável */}
              {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Responsável & Acesso</h2>
                    <p className="text-slate-400 text-sm">Dados do administrador principal da conta <strong className="text-slate-600">{formData.empresa}</strong>.</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>Nome *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><User className="w-4 h-4" /></span>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange}
                          placeholder="Nome" className={inputClass} required />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Sobrenome *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><User className="w-4 h-4" /></span>
                        <input type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange}
                          placeholder="Sobrenome" className={inputClass} required />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>Cargo</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Briefcase className="w-4 h-4" /></span>
                        <input type="text" name="cargo" value={formData.cargo} onChange={handleChange}
                          placeholder="Ex: Diretor, Gerente" className={inputClass} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Telefone *</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Phone className="w-4 h-4" /></span>
                        <input type="text" name="telefone" value={formData.telefone} onChange={handleChange}
                          placeholder="(00) 00000-0000" className={inputClass} required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>E-mail corporativo *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail className="w-4 h-4" /></span>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="voce@empresa.com.br" className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Senha *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock className="w-4 h-4" /></span>
                      <input type={showPassword ? 'text' : 'password'} name="senha" value={formData.senha} onChange={handleChange}
                        placeholder="Mínimo 6 caracteres" className={inputClass} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center">
                    Ao criar a conta, você aceita os Termos de Uso e a Política de Privacidade.
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3.5 border border-slate-300 text-slate-500 hover:bg-slate-50 text-sm font-bold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm tracking-wider uppercase py-3.5 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading ? 'Criando Conta...' : 'Criar Conta da Empresa'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
