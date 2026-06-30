import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Zap, ArrowRight, Loader2, LogOut } from 'lucide-react';
import CheckoutTransparente from '../components/CheckoutTransparente';

const PLANOS = [
  {
    id: 'mensal',
    label: 'Mensal',
    desconto: 0,
    badge: null,
    preco: 200,
    total: null,
    economia: null,
    ciclo: 'mês',
  },
  {
    id: 'trimestral',
    label: 'Trimestral',
    desconto: 10,
    badge: '10% off',
    preco: 180,
    total: 540,
    economia: 60,
    ciclo: 'trimestre',
  },
  {
    id: 'semestral',
    label: 'Semestral',
    desconto: 15,
    badge: '15% off',
    preco: 170,
    total: 1020,
    economia: 180,
    ciclo: 'semestre',
  },
  {
    id: 'anual',
    label: 'Anual',
    desconto: 25,
    badge: 'Melhor valor',
    preco: 150,
    total: 1800,
    economia: 600,
    ciclo: 'ano',
    destaque: true,
  },
];

const FEATURES = [
  'Contratos ilimitados',
  'Fases e etapas ilimitadas',
  'Painel financeiro completo',
  'Multi-usuário (acesso por equipe)',
  'Alertas automáticos de prazo',
  'Exportação de relatórios CSV',
  'Histórico de auditoria',
  'Suporte por e-mail',
];

export default function EscolherPlanoPage() {
  const { logoutUser } = useAuth();
  const [cicloAtivo, setCicloAtivo] = useState('anual');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const plano = PLANOS.find(p => p.id === cicloAtivo);

  const handleNextStep = () => {
    setError('');
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-[#0D9488] selection:text-white flex flex-col">
      
      {/* Header Minimalista */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center shrink-0">
                <span className="text-white font-extrabold text-sm">G</span>
              </div>
              <span className="font-title font-extrabold text-slate-100 text-xl tracking-tight">
                GEOGEST <span className="text-[#34d399]">SaaS</span>
              </span>
            </div>
            
            <button 
              onClick={logoutUser}
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full">
          
          {step === 1 ? (
            <>
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold tracking-widest uppercase text-[#0D9488] block mb-3">Bem-vindo(a) ao GEOGEST</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-slate-900 mb-4">
                  Ative sua assinatura para continuar
                </h2>
                <p className="text-slate-400 text-lg">
                  Um único plano com acesso a todas as ferramentas de gestão. Economize escolhendo um ciclo maior.
                </p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-center text-sm font-bold animate-fade-in max-w-3xl mx-auto rounded-xl">
                  {error}
                </div>
              )}

              {/* Pricing Section (copiado e adaptado da LandingPage) */}
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center animate-fade-in">
                {/* Seletor de ciclo — esquerda */}
                <div className="w-full lg:w-72 shrink-0 space-y-3">
                  {PLANOS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setCicloAtivo(p.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 border transition-all text-left rounded-xl ${
                        cicloAtivo === p.id
                          ? 'border-[#0D9488] bg-[#0D9488]/10 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50/55'
                      }`}
                    >
                      <div>
                        <span className={`font-bold text-sm block ${cicloAtivo === p.id ? 'text-slate-900' : 'text-slate-700'}`}>
                          {p.label}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          R$ {p.preco.toFixed(2).replace('.', ',')}/mês
                        </span>
                      </div>
                      {p.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.destaque
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30'
                        }`}>
                          {p.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Card de preço — direita */}
                <div className="flex-1 w-full max-w-2xl bg-white border border-slate-200 p-8 relative overflow-hidden rounded-2xl shadow-lg">
                  {plano.destaque && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 rounded-full flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> Melhor Custo-Benefício
                      </span>
                    </div>
                  )}

                  {/* Glow sutil */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0D9488]/5 rounded-full blur-[80px] pointer-events-none" />

                  {/* Preço principal */}
                  <div className="mb-6 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                      Plano {plano.label}
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-extrabold text-slate-900 font-mono">
                        R$ {plano.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-slate-400 text-sm mb-1.5 font-mono">/mês</span>
                    </div>

                    {plano.total && (
                      <div className="mt-3 flex flex-col gap-1">
                        <span className="text-sm text-slate-400 font-mono">
                          Cobrado <strong className="text-slate-700">R$ {plano.total.toFixed(2).replace('.', ',')} </strong>
                          por {plano.ciclo}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                          <CheckCircle className="w-4 h-4" />
                          Você economiza R$ {plano.economia.toFixed(2).replace('.', ',')} vs. plano mensal
                        </span>
                      </div>
                    )}

                    {plano.desconto === 0 && (
                      <span className="text-xs text-slate-400 mt-2 block font-mono">Sem compromisso. Cancele quando quiser.</span>
                    )}
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-slate-200 mb-6" />

                  {/* Features incluídas */}
                  <div className="mb-8 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
                      Tudo incluso no plano:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {FEATURES.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm tracking-wider uppercase transition-all shadow-md group relative z-10 bg-[#0D9488] hover:bg-[#0b7c71] text-white rounded-xl"
                  >
                    <>Assinar Plano {plano.label} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  </button>

                  <p className="text-[11px] text-slate-400 mt-4 font-mono text-center">
                    Pagamentos 100% seguros processados pela Asaas.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center w-full animate-fade-in">
              <CheckoutTransparente 
                plano={plano} 
                onBack={() => setStep(1)} 
              />
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
