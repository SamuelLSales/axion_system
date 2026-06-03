import React from 'react';
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
  Award
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-aldebaran-dark text-theme-normal font-sans selection:bg-aldebaran-gold selection:text-white">
      
      {/* Header Público */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/axion_aba_copia.png" 
                  alt="AXION" 
                  style={{
                    position: 'absolute',
                    width: '80px',
                    height: 'auto',
                    maxWidth: 'none',
                    top: '-10px',
                    left: '-10px'
                  }}
                  className="shadow-sm" 
                />
              </div>
              <span className="font-title font-extrabold text-slate-100 text-xl tracking-tight hidden sm:block">
                AXION <span className="text-aldebaran-orange">SaaS</span>
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
                className="bg-aldebaran-gold hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold transition-all shadow-md flex items-center gap-2"
              >
                Cadastre-se Gratuitamente
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111827] py-24 sm:py-32 border-b border-[#1f2937]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
          <div className="mx-auto w-[280px] sm:w-[350px] overflow-hidden aspect-[1000/420] relative mb-8">
            <img 
              src="/axion_principal.png" 
              alt="AXION Principal" 
              style={{
                width: '100%',
                height: 'auto',
                transform: 'translateX(8.15%)'
              }}
              className="absolute top-0 left-0"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold font-mono mb-8 border border-blue-500/20">
            <Zap className="w-3 h-3" />
            Nova versão 2.0 disponível
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-title text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Gestão Inteligente de <span className="text-transparent bg-clip-text bg-gradient-to-r from-aldebaran-orange to-blue-400">Contratos e Prazos</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Sistema corporativo para controle absoluto sobre fases, etapas e alertas de vencimento. Ideal para consultorias de engenharia, geologia e meio ambiente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/cadastro" 
              className="w-full sm:w-auto px-8 py-4 bg-aldebaran-orange hover:bg-teal-500 text-white font-bold text-lg transition-all shadow-lg shadow-teal-500/20"
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
      <section id="funcionalidades" className="py-24 bg-aldebaran-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold font-title text-theme-strong mb-4">
              Tudo o que você precisa em um só lugar
            </h2>
            <p className="text-theme-weak text-lg">
              Substitua dezenas de planilhas desatualizadas por um sistema centralizado, 
              inteligente e focado em produtividade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-aldebaran-dark border border-aldebaran-border p-8 hover:border-aldebaran-orange/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-theme-strong mb-3">Multidisciplinar</h3>
              <p className="text-theme-weak leading-relaxed text-sm">
                Crie e configure áreas de atuação totalmente dinâmicas, adaptando a plataforma exatamente aos serviços que sua empresa presta.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-aldebaran-dark border border-aldebaran-border p-8 hover:border-aldebaran-gold/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-amber-500/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-theme-strong mb-3">Alertas de Prazo</h3>
              <p className="text-theme-weak leading-relaxed text-sm">
                Monitoramento automático de vigência e validade das licenças. Não perca mais prazos e evite multas para seus clientes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-aldebaran-dark border border-aldebaran-border p-8 hover:border-teal-500/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-teal-500/10 flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-theme-strong mb-3">Dashboard Interativo</h3>
              <p className="text-theme-weak leading-relaxed text-sm">
                Acompanhe o progresso de fases e etapas com indicadores visuais precisos. Tenha a visão do todo em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre a AXION Section */}
      <section id="sobre" className="py-24 bg-aldebaran-dark border-t border-b border-aldebaran-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column - History & Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-aldebaran-orange block mb-2">
                  Sobre a AXION
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-title text-theme-strong tracking-tight">
                  Gestão Inteligente de Contratos e Prazos
                </h2>
              </div>
              
              <p className="text-lg text-theme-normal font-medium leading-relaxed">
                A AXION nasceu para eliminar o caos das planilhas dispersas, controles manuais e prazos perdidos. Nossa plataforma centraliza contratos, atividades, equipes e documentos em um único ambiente, proporcionando mais controle, produtividade e previsibilidade para sua operação.
              </p>
              
              <div className="space-y-4 text-theme-weak text-sm leading-relaxed">
                <p>
                  Desenvolvida para empresas que trabalham com projetos complexos, a AXION permite acompanhar cada etapa do processo em tempo real, monitorando responsabilidades, vencimentos e entregas com total transparência.
                </p>
                <p>
                  Com dashboards inteligentes, alertas automáticos e indicadores estratégicos, sua equipe ganha visibilidade completa sobre o andamento dos contratos, reduzindo riscos, atrasos e retrabalho.
                </p>
              </div>
              
              <div className="p-4 border-l-4 border-aldebaran-orange bg-aldebaran-gray/50 text-theme-strong font-medium text-sm italic">
                "Mais do que um sistema de gestão, a AXION é uma plataforma criada para transformar controle em resultado."
              </div>
            </div>
            
            {/* Right Column - Mission, Vision, Values */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Missão Card */}
              <div className="bg-aldebaran-gray border border-aldebaran-border p-6 shadow-sm hover:border-aldebaran-orange/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-aldebaran-orange/10 flex items-center justify-center text-aldebaran-orange">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-theme-strong">Missão</h3>
                </div>
                <p className="text-theme-weak text-sm leading-relaxed">
                  Capacitar empresas a gerenciar contratos, prazos e processos de forma simples, inteligente e segura.
                </p>
              </div>
              
              {/* Visão Card */}
              <div className="bg-aldebaran-gray border border-aldebaran-border p-6 shadow-sm hover:border-aldebaran-gold/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-aldebaran-gold/10 flex items-center justify-center text-aldebaran-gold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-theme-strong">Visão</h3>
                </div>
                <p className="text-theme-weak text-sm leading-relaxed">
                  Ser a principal plataforma de gestão contratual e operacional para empresas de engenharia, consultoria e serviços técnicos no Brasil.
                </p>
              </div>
              
              {/* Valores Card */}
              <div className="bg-aldebaran-gray border border-aldebaran-border p-6 shadow-sm hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-theme-strong">Valores</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Transparência nas informações",
                    "Compromisso com resultados",
                    "Inovação contínua",
                    "Segurança dos dados",
                    "Simplicidade na operação"
                  ].map((valor, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-theme-weak text-sm">
                      <CheckCircle className="w-4 h-4 text-aldebaran-orange shrink-0" />
                      <span>{valor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
            
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-aldebaran-border bg-aldebaran-gray">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck className="w-12 h-12 text-aldebaran-gold mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-theme-strong mb-4">Segurança e Isolamento Total</h2>
          <p className="text-theme-weak text-sm leading-relaxed">
            Nossa arquitetura SaaS Multi-Tenant garante que os dados, responsáveis e contratos da sua empresa fiquem estritamente isolados em banco de dados criptografado. Total confidencialidade dos seus processos.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-[#1f2937] py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="w-[114px] h-[48px] overflow-hidden relative mx-auto mb-6">
            <img 
              src="/axion_principal.png" 
              alt="AXION" 
              style={{
                position: 'absolute',
                width: '114px',
                height: 'auto',
                top: 0,
                left: 0,
                transform: 'translateX(8.15%)'
              }}
            />
          </div>
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} AXION Sistemas. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
