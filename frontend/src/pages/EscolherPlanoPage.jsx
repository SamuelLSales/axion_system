import React, { useState } from 'react';
import { criarCheckoutAsaas } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Zap, ArrowRight, Loader2, LogOut } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plano = PLANOS.find(p => p.id === cicloAtivo);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError('');
      // Envia o ciclo selecionado para o backend (mensal, trimestral, semestral, anual)
      const data = await criarCheckoutAsaas(cicloAtivo);
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error("Não foi possível gerar o link de pagamento.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Erro ao processar checkout. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aldebaran-dark text-theme-normal font-sans selection:bg-aldebaran-gold selection:text-white flex flex-col">
      
      {/* Header Minimalista */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/axion_aba_copia.png" 
                  alt="AXION" 
                  style={{ position: 'absolute', width: '80px', height: 'auto', maxWidth: 'none', top: '-10px', left: '-10px' }}
                  className="shadow-sm" 
                />
              </div>
              <span className="font-title font-extrabold text-slate-100 text-xl tracking-tight">
                AXION <span className="text-aldebaran-orange">SaaS</span>
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
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-aldebaran-gold block mb-3">Bem-vindo(a) ao AXION</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-theme-strong mb-4">
              Ative sua assinatura para continuar
            </h2>
            <p className="text-theme-weak text-lg">
              Um único plano com acesso a todas as ferramentas de gestão. Economize escolhendo um ciclo maior.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-sm font-bold animate-fade-in max-w-3xl mx-auto rounded-lg">
              {error}
            </div>
          )}

          {/* Pricing Section (copiado e adaptado da LandingPage) */}
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Seletor de ciclo — esquerda */}
            <div className="w-full lg:w-72 shrink-0 space-y-3">
              {PLANOS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setCicloAtivo(p.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 border transition-all text-left rounded-sm ${
                    cicloAtivo === p.id
                      ? 'border-aldebaran-gold bg-aldebaran-gold/10 text-theme-strong'
                      : 'border-aldebaran-border bg-aldebaran-dark text-theme-weak hover:border-aldebaran-border/80 hover:bg-aldebaran-dark/80'
                  }`}
                >
                  <div>
                    <span className={`font-bold text-sm block ${cicloAtivo === p.id ? 'text-theme-strong' : 'text-theme-normal'}`}>
                      {p.label}
                    </span>
                    <span className="text-xs text-theme-weak font-mono">
                      R$ {p.preco.toFixed(2).replace('.', ',')}/mês
                    </span>
                  </div>
                  {p.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      p.destaque
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-aldebaran-gold/10 text-aldebaran-gold border-aldebaran-gold/30'
                    }`}>
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Card de preço — direita */}
            <div className="flex-1 w-full max-w-2xl bg-[#111827] border border-aldebaran-border p-8 relative overflow-hidden rounded-sm shadow-xl shadow-black/20">
              {plano.destaque && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Melhor Custo-Benefício
                  </span>
                </div>
              )}

              {/* Glow sutil */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-aldebaran-gold/5 rounded-full blur-[80px] pointer-events-none" />

              {/* Preço principal */}
              <div className="mb-6 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-theme-weak block mb-2">
                  Plano {plano.label}
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-theme-strong font-mono">
                    R$ {plano.preco.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-theme-weak text-sm mb-1.5 font-mono">/mês</span>
                </div>

                {plano.total && (
                  <div className="mt-3 flex flex-col gap-1">
                    <span className="text-sm text-theme-weak font-mono">
                      Cobrado <strong className="text-theme-normal">R$ {plano.total.toFixed(2).replace('.', ',')} </strong>
                      por {plano.ciclo}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                      <CheckCircle className="w-4 h-4" />
                      Você economiza R$ {plano.economia.toFixed(2).replace('.', ',')} vs. plano mensal
                    </span>
                  </div>
                )}

                {plano.desconto === 0 && (
                  <span className="text-xs text-theme-weak mt-2 block font-mono">Sem compromisso. Cancele quando quiser.</span>
                )}
              </div>

              {/* Divisor */}
              <div className="border-t border-aldebaran-border/40 mb-6" />

              {/* Features incluídas */}
              <div className="mb-8 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block mb-4">
                  Tudo incluso no plano:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FEATURES.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-theme-normal">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm tracking-wider uppercase transition-all shadow-md group relative z-10
                  ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-aldebaran-gold hover:bg-amber-500 text-white'}`}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Gerando Pagamento...</>
                ) : (
                  <>Assinar Plano {plano.label} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>

              <p className="text-[11px] text-theme-weak mt-4 font-mono text-center">
                Pagamentos 100% seguros processados pela Asaas.
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
