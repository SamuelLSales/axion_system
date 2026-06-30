import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  BarChart2, 
  Clock, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Compass,
  Award,
  DollarSign,
  TrendingUp,
  PieChart,
  Receipt,
  Coins,
  FileSpreadsheet
} from 'lucide-react';

// ============================================================
// 📱 WHATSAPP — Altere o número abaixo para o seu
// Formato: código do país + DDD + número (só dígitos)
// Ex: '5531999999999'
// ============================================================
const WPP_PHONE = '5531999999999';
const WPP_MSG = encodeURIComponent('Olá! Gostaria de saber mais sobre o GEOGEST, o sistema de gestão de contratos.');

const WhatsAppButton = () => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <div className={`bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 shadow-xl rounded-lg border border-slate-100 whitespace-nowrap transition-all duration-300 ${
        hovered ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-3 pointer-events-none'
      }`}>
        💬 Fale conosco pelo WhatsApp
        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-slate-100 rotate-45" />
      </div>
      {/* Botão */}
      <a
        href={`https://wa.me/${WPP_PHONE}?text=${WPP_MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Fale conosco pelo WhatsApp"
        className="relative w-14 h-14 flex items-center justify-center rounded-full shadow-lg shadow-[#25D366]/30 transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#25D366' }}
      >
        <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#25D366', opacity: 0.35 }} />
        <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.618 4.64 1.791 6.664L2.667 29.333l6.883-1.755A13.258 13.258 0 0 0 16.003 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.003 2.667Zm0 2.4c5.893 0 10.933 4.88 10.933 10.933 0 6.053-4.88 10.933-10.933 10.933a10.886 10.886 0 0 1-5.6-1.547l-.4-.24-4.08 1.04 1.08-3.947-.267-.413A10.886 10.886 0 0 1 5.07 16c0-6.053 5.04-10.933 10.933-10.933Zm-3.307 5.28c-.267 0-.693.1-.96.373-.267.28-1.013 1.013-1.013 2.427 0 1.413 1.04 2.773 1.187 2.96.146.187 2.026 3.2 5 4.36.693.293 1.227.453 1.653.573.693.2 1.32.173 1.813.107.56-.08 1.707-.68 1.947-1.333.24-.653.24-1.227.167-1.333-.08-.107-.28-.187-.587-.333-.307-.147-1.707-.853-1.973-.947-.267-.093-.453-.147-.653.147-.2.293-.773.947-.947 1.147-.173.2-.347.213-.653.067-.307-.147-1.293-.48-2.467-1.52-.907-.8-1.52-1.787-1.707-2.093-.187-.307-.02-.48.14-.627.147-.133.307-.347.467-.52.16-.173.213-.293.32-.493.107-.2.053-.373-.027-.52-.08-.147-.653-1.6-.907-2.187-.24-.56-.48-.48-.653-.48h-.547Z" />
        </svg>
      </a>
    </div>
  );
};

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

const PricingSection = () => {
  const [cicloAtivo, setCicloAtivo] = useState('anual');
  const plano = PLANOS.find(p => p.id === cicloAtivo);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* Seletor de ciclo — esquerda */}
      <div className="w-full lg:w-72 shrink-0 space-y-3">
        {PLANOS.map(p => (
          <button
            key={p.id}
            onClick={() => setCicloAtivo(p.id)}
            className={`w-full flex items-center justify-between px-5 py-4 border transition-all text-left ${
              cicloAtivo === p.id
                ? 'border-[#0D9488] bg-[#0D9488]/10 text-slate-900'
                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-200 hover:bg-white/80'
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
                  ? 'bg-emerald-50/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30'
              }`}>
                {p.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card de preço — direita */}
      <div className="flex-1 bg-white border border-slate-200 p-8 relative overflow-hidden">
        {plano.destaque && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-emerald-50/60 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              ⭐ Melhor Custo-Benefício
            </span>
          </div>
        )}

        {/* Glow sutil */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0D9488]/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Preço principal */}
        <div className="mb-6">
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
              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
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
        <div className="border-t border-slate-200/40 mb-6" />

        {/* Features incluídas */}
        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">
            Tudo incluso no plano:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          to="/cadastro"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[#0D9488] hover:bg-amber-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg group"
        >
          Começar agora — Plano {plano.label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <p className="text-[11px] text-slate-400 mt-4 font-mono">
          * Preços simulados. Valores sujeitos a alteração. Sem taxa de setup.
        </p>
      </div>

    </div>
  );
};

// ============================================================
// 🎨 PARTICLES CANVAS — Efeito de fundo animado com mouse
// ============================================================
const ParticlesCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 80;
    const MAX_DIST = 140;
    const MOUSE_RADIUS = 160;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => { mouseRef.current = { x: null, y: null }; };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.r = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
      }
      update() {
        const mouse = mouseRef.current;
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            this.x -= dx * force * 0.04;
            this.y -= dy * force * 0.04;
          }
        }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = 1 - dist / MAX_DIST;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(13, 148, 136, ${alpha * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'auto' }}
    />
  );
};


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans selection:bg-[#0D9488] selection:text-white">
      
      {/* Header Público */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <span className="font-title font-extrabold text-slate-100 text-xl tracking-tight">
                GEOGEST <span className="text-[#34d399]">SaaS</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Já tem conta?
              </Link>
              <Link 
                to="/cadastro" 
                className="bg-[#0D9488] hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold transition-all shadow-lg flex items-center gap-2"
              >
                Cadastre-se Gratuitamente
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 sm:py-32 border-b border-[#1f2937]">
        {/* Canvas de Partículas Animadas */}
        <ParticlesCanvas />
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/10 via-transparent to-[#0a0f1e]/60 pointer-events-none z-[1]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
          <div className="mx-auto w-[280px] sm:w-[350px] relative mb-8 flex items-center justify-center">
             <span className="text-5xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#0D9488] to-[#34d399] drop-shadow-lg">
                GEOGEST
             </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold font-mono mb-8 border border-blue-500/20">
            <Zap className="w-3 h-3" />
            Nova versão 2.0 disponível — com Painel Financeiro
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-title text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Gestão Inteligente de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#34d399]">Contratos e Finanças</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Sistema corporativo para controle absoluto sobre fases, etapas, prazos e resultado financeiro. Ideal para consultorias de engenharia, geologia e meio ambiente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/cadastro" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0D9488] hover:bg-[#0b7c71] text-white font-bold text-lg transition-all shadow-lg shadow-teal-500/20"
            >
              Começar Agora
            </Link>
            <a 
              href="#funcionalidades" 
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-lg transition-all"
            >
              Ver Funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold font-title text-slate-900 mb-4">
              Tudo o que você precisa em um só lugar
            </h2>
            <p className="text-slate-400 text-lg">
              Substitua dezenas de planilhas desatualizadas por um sistema centralizado, 
              inteligente e focado em produtividade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 p-8 hover:border-[#0D9488]/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multidisciplinar</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Crie e configure áreas de atuação totalmente dinâmicas, adaptando a plataforma exatamente aos serviços que sua empresa presta.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 p-8 hover:border-[#0D9488]/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-amber-500/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Alertas de Prazo</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Monitoramento automático de vigência e validade das licenças. Não perca mais prazos e evite multas para seus clientes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 p-8 hover:border-teal-500/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-teal-500/10 flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dashboard de Projetos</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Acompanhe o progresso de fases e etapas com indicadores visuais precisos. Tenha a visão do todo em tempo real com alertas automáticos.
              </p>
            </div>

            {/* Feature 4 — Painel Financeiro */}
            <div className="bg-white border border-emerald-500/30 p-8 hover:border-emerald-500/60 transition-colors shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 bg-emerald-50/60 flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Painel Financeiro</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Controle de TCV, despesas, margem de lucro e impostos por contrato. Visualize a rentabilidade real da sua operação com gráficos interativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Painel Financeiro Deep Dive Section */}
      <section id="financeiro" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 block mb-3">
              Novidade — Painel Financeiro
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-slate-900 mb-4">
              Inteligência financeira integrada aos seus contratos
            </h2>
            <p className="text-slate-400 text-lg">
              Visualize receita, despesas, margem de lucro e impostos em um único painel. 
              Tome decisões baseadas em dados reais, não em estimativas.
            </p>
          </div>

          {/* KPI Cards mockup */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { label: 'Valor Global (TCV)', value: 'R$ 1,2M', icon: Coins, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/10' },
              { label: 'Margem de Lucro', value: '38%', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Total de Gastos', value: 'R$ 342K', icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              { label: 'Lucro Líquido', value: 'R$ 428K', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-50/60' },
              { label: 'Imposto Projetado', value: 'R$ 84K', icon: FileSpreadsheet, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map((kpi, i) => (
              <div key={i} className="border border-slate-200 p-5 bg-white flex items-start gap-3 shadow-sm">
                <div className={`p-2.5 ${kpi.bg} rounded-xl ${kpi.color} shrink-0`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{kpi.label}</span>
                  <span className={`text-lg font-extrabold font-mono mt-1 block ${kpi.color}`}>{kpi.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Features do painel financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-50/60 flex items-center justify-center shrink-0">
                <PieChart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Rentabilidade por Área</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Gráficos de barras comparando valor contratado vs. gastos reais por área de atuação (Topografia, Geologia, etc.).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Composição de Carteira</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Gráfico de donut mostrando a distribuição percentual de receita por área. Identifique de onde vem seu faturamento.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Exportação Inteligente</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Baixe o histórico de alterações filtrado por contrato específico. Dados prontos para auditoria ou apresentação ao cliente.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/cadastro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Experimente o Painel Financeiro
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Sobre a Geogest Section */}
      <section id="sobre" className="py-24 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column - History & Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#34d399] block mb-2">
                  Sobre o GEOGEST
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-slate-900 tracking-tight">
                  Gestão Inteligente de Contratos e Prazos
                </h2>
              </div>
              
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                O GEOGEST nasceu para eliminar o caos das planilhas dispersas, controles manuais e prazos perdidos. Nossa plataforma centraliza contratos, atividades, equipes e documentos em um único ambiente, proporcionando mais controle, produtividade e previsibilidade para sua operação.
              </p>
              
              <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
                <p>
                  Desenvolvida para empresas que trabalham com projetos complexos, o GEOGEST permite acompanhar cada etapa do processo em tempo real, monitorando responsabilidades, vencimentos e entregas com total transparência.
                </p>
                <p>
                  Com dashboards inteligentes, alertas automáticos e indicadores estratégicos — incluindo o novo <strong className="text-emerald-400">Painel Financeiro</strong> com controle de TCV, despesas e margem de lucro —, sua equipe ganha visibilidade completa sobre o andamento e a saúde financeira dos contratos.
                </p>
              </div>
              
              <div className="p-4 border-l-4 border-[#0D9488] bg-white/50 text-slate-900 font-medium text-sm italic">
                "Mais do que um sistema de gestão, o GEOGEST é uma plataforma criada para transformar controle em resultado."
              </div>
            </div>
            
            {/* Right Column - Mission, Vision, Values */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Missão Card */}
              <div className="bg-white border border-slate-200 p-6 shadow-sm hover:border-[#0D9488]/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#0D9488]/10 flex items-center justify-center text-[#34d399]">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Missão</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Capacitar empresas a gerenciar contratos, prazos e processos de forma simples, inteligente e segura.
                </p>
              </div>
              
              {/* Visão Card */}
              <div className="bg-white border border-slate-200 p-6 shadow-sm hover:border-[#0D9488]/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Visão</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ser a principal plataforma de gestão contratual e operacional para empresas de engenharia, consultoria e serviços técnicos no Brasil.
                </p>
              </div>
              
              {/* Valores Card */}
              <div className="bg-white border border-slate-200 p-6 shadow-sm hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Valores</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Transparência nas informações",
                    "Compromisso com resultados",
                    "Inovação contínua",
                    "Segurança dos dados",
                    "Simplicidade na operação"
                  ].map((valor, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-400 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#34d399] shrink-0" />
                      <span>{valor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
            
          </div>
        </div>
      </section>


      {/* Seção de Preços */}
      <section id="precos" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0D9488] block mb-3">Planos & Preços</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-slate-900 mb-4">
              Simples, transparente e sem surpresas
            </h2>
            <p className="text-slate-400 text-lg">
              Um único plano com tudo incluso. Economize escolhendo um ciclo maior.
            </p>
          </div>

          {/* Seletor de Ciclo */}
          <PricingSection />

        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck className="w-12 h-12 text-[#0D9488] mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Segurança e Isolamento Total</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Nossa arquitetura SaaS Multi-Tenant garante que os dados, responsáveis e contratos da sua empresa fiquem estritamente isolados em banco de dados criptografado. Total confidencialidade dos seus processos e informações financeiras.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-[#1f2937] py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="relative mx-auto mb-6">
            <span className="text-2xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#0D9488] to-[#34d399] drop-shadow-sm">
                GEOGEST
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} GEOGEST. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Botão flutuante WhatsApp */}
      <WhatsAppButton />

    </div>
  );
};

export default LandingPage;



