import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  AlertCircle,
  Clock,
  User,
  Calendar,
  TrendingUp,
  BarChart2,
  ArrowRight,
  Search,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { getDashboardData, getContratos, exportarCSV } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_contratos: 0,
    contratos_no_prazo: 0,
    contratos_atencao: 0,
    contratos_atrasados: 0,
    contratos_concluidos: 0,
    progresso_medio_geral: 0,
    distribuicao_area: { Topografia: 0, Geologia: 0, Outros: 0 },
    proximos_vencimentos: []
  });
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState('geral'); // 'geral' ou 'gargalos'

  // Filtro de contratos em aberto
  const [termoBusca, setTermoBusca] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('todas');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [dadosDashboard, listaContratos] = await Promise.all([
          getDashboardData(),
          getContratos()
        ]);
        setStats(dadosDashboard);
        setContratos(listaContratos);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Falha ao carregar os dados. Verifique a conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Funções utilitárias
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    try {
      const dataApenas = dataStr.split('T')[0];
      const [ano, mes, dia] = dataApenas.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (e) {
      return dataStr;
    }
  };

  const calcularDiasRestantes = (dataFinal) => {
    if (!dataFinal) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataApenas = dataFinal.split('T')[0];
    const partes = dataApenas.split('-');
    if (partes.length < 3) return null;
    const [ano, mes, dia] = partes;
    const entrega = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const diffTime = entrega - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const obterProgressoContrato = (contrato) => {
    const etapas = [];
    contrato.fases?.forEach(f => {
      f.etapas?.forEach(e => {
        etapas.push(e);
      });
    });
    if (etapas.length === 0) return 0;
    const soma = etapas.reduce((acc, e) => acc + (e.progresso || 0), 0);
    return Math.round((soma / etapas.length) * 100);
  };

  const obterDiasAtraso = (dataTerminoStr) => {
    if (!dataTerminoStr) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataApenas = dataTerminoStr.split('T')[0];
    const [ano, mes, dia] = dataApenas.split('-');
    const entrega = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const diffTime = hoje - entrega;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Processar Etapas Atrasadas (Gargalos)
  const obterEtapasAtrasadas = () => {
    const atrasadas = [];
    contratos.forEach(contrato => {
      if (contrato.status === 'concluido') return;

      contrato.fases?.forEach(fase => {
        fase.etapas?.forEach(etapa => {
          if ((etapa.progresso || 0) < 1 && etapa.data_termino) {
            const diasAtraso = obterDiasAtraso(etapa.data_termino);
            if (diasAtraso > 0) {
              atrasadas.push({
                id: etapa.id,
                nome_tarefa: etapa.nome_tarefa,
                responsavel: etapa.responsavel || 'Sem Responsável',
                data_termino: etapa.data_termino,
                dias_atraso: diasAtraso,
                progresso: Math.round((etapa.progresso || 0) * 100),
                contrato_id: contrato.id,
                nome_projeto: contrato.nome_projeto,
                nome_fase: fase.nome_fase
              });
            }
          }
        });
      });
    });
    return atrasadas.sort((a, b) => b.dias_atraso - a.dias_atraso);
  };

  const etapasAtrasadas = obterEtapasAtrasadas();

  // Calcular agregados de gargalo
  const obterAgregadosGargalo = () => {
    const delaysByCollab = {};
    const delaysByFase = { 'Planejamento': 0, 'Campo/Mapeamento': 0, 'Relatório/Escritório': 0, 'Outros': 0 };

    etapasAtrasadas.forEach(e => {
      // Por colaborador
      delaysByCollab[e.responsavel] = (delaysByCollab[e.responsavel] || 0) + e.dias_atraso;

      // Por fase
      const nomeLower = e.nome_fase.toLowerCase();
      if (nomeLower.includes('planejamento')) {
        delaysByFase['Planejamento'] += e.dias_atraso;
      } else if (nomeLower.includes('campo') || nomeLower.includes('mapeamento') || nomeLower.includes('execução')) {
        delaysByFase['Campo/Mapeamento'] += e.dias_atraso;
      } else if (nomeLower.includes('relatório') || nomeLower.includes('elaboração') || nomeLower.includes('escritório')) {
        delaysByFase['Relatório/Escritório'] += e.dias_atraso;
      } else {
        delaysByFase['Outros'] += e.dias_atraso;
      }
    });

    const colabGargalos = Object.entries(delaysByCollab).map(([nome, dias]) => {
      const count = etapasAtrasadas.filter(e => e.responsavel === nome).length;
      return { nome, dias, count };
    }).sort((a, b) => b.dias - a.dias);

    const faseGargalos = Object.entries(delaysByFase)
      .map(([fase, dias]) => ({ fase, dias }))
      .filter(f => f.dias > 0)
      .sort((a, b) => b.dias - a.dias);

    let respCritico = 'Nenhum';
    let maxCollabDelay = 0;
    Object.entries(delaysByCollab).forEach(([name, delay]) => {
      if (delay > maxCollabDelay) {
        maxCollabDelay = delay;
        respCritico = name;
      }
    });

    const mediaAtraso = etapasAtrasadas.length > 0
      ? Math.round(etapasAtrasadas.reduce((acc, e) => acc + e.dias_atraso, 0) / etapasAtrasadas.length)
      : 0;

    const maiorAtraso = etapasAtrasadas.length > 0 ? etapasAtrasadas[0].dias_atraso : 0;

    return {
      colabGargalos,
      faseGargalos,
      respCritico,
      mediaAtraso,
      maiorAtraso
    };
  };

  const gargalosInfo = obterAgregadosGargalo();

  // Filtragem de Contratos em Aberto
  const contratosEmAberto = contratos.filter(c => {
    if (c.status === 'concluido') return false;

    // Filtro de busca por texto
    const correspondeTexto =
      c.nome_projeto.toLowerCase().includes(termoBusca.toLowerCase()) ||
      c.cliente.toLowerCase().includes(termoBusca.toLowerCase()) ||
      c.diretor_projeto.toLowerCase().includes(termoBusca.toLowerCase());

    const areaNome = c.area_atuacao ? c.area_atuacao.nome : 'Desconhecida';
    const correspondeArea =
      areaFiltro === 'todas' ||
      areaNome.toLowerCase() === areaFiltro.toLowerCase();

    return correspondeTexto && correspondeArea;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-aldebaran-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-theme-weak font-medium">Carregando dados da Aldebaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">

      {/* CADASTRAR/EXPORTAR CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-aldebaran-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-strong lowercase tracking-tight">
            controle de contratos
          </h1>
          <p className="text-theme-weak text-sm mt-1 lowercase font-mono">
            topografia geologia — belo horizonte, mg
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportarCSV}
            className="px-4 py-1.5 bg-transparent text-theme-weak border border-aldebaran-border hover:border-theme-strong rounded-none text-xs font-semibold lowercase transition-colors"
          >
            exportar csv
          </button>
          <button
            onClick={() => navigate('/contratos/novo')}
            className="px-4 py-1.5 bg-aldebaran-gold hover:opacity-90 text-white rounded-none text-xs font-bold lowercase transition-all shadow-sm flex items-center gap-1.5"
          >
            + novo contrato
          </button>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO DO DASHBOARD */}
      <div className="flex border-b border-aldebaran-border gap-6">
        <button
          onClick={() => setAbaAtiva('geral')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${abaAtiva === 'geral'
              ? 'text-aldebaran-gold border-b-2 border-aldebaran-gold font-extrabold'
              : 'text-theme-weak hover:text-theme-normal'
            }`}
        >
          Visão Geral & Contratos
        </button>
        <button
          onClick={() => setAbaAtiva('gargalos')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${abaAtiva === 'gargalos'
              ? 'text-aldebaran-gold border-b-2 border-aldebaran-gold font-extrabold'
              : 'text-theme-weak hover:text-theme-normal'
            }`}
        >
          Análise de Gargalos & Atrasos
          {etapasAtrasadas.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse block"></span>
          )}
        </button>
      </div>

      {/* ERROS DE CONEXÃO */}
      {error && (
        <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-4 flex items-start gap-3">
          <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-rose-400 font-bold text-sm">Problema com o servidor</h4>
            <p className="text-rose-300/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 1: VISÃO GERAL */}
      {abaAtiva === 'geral' && (
        <div className="space-y-6">
          {/* LISTA DE CONTRATOS EM ABERTO */}
          <div className="border border-aldebaran-border rounded-none p-6 bg-aldebaran-dark0/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Contratos em Aberto</span>
                <h3 className="text-lg font-bold text-theme-strong lowercase mt-1">todos os projetos em andamento</h3>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Busca */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-theme-weak absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="filtrar projeto, cliente..."
                    className="w-[200px] sm:w-[240px] pl-9 pr-4 py-1.5 bg-aldebaran-dark border border-aldebaran-border text-theme-normal text-xs rounded-none placeholder-theme-weak/50 focus:outline-none focus:border-theme-strong transition-colors"
                  />
                </div>

                {/* Filtro por Área */}
                <select
                  value={areaFiltro}
                  onChange={(e) => setAreaFiltro(e.target.value)}
                  className="px-3 py-1.5 bg-aldebaran-dark border border-aldebaran-border text-theme-normal text-xs rounded-none focus:outline-none focus:border-theme-strong"
                >
                  <option value="todas">todas as áreas</option>
                  <option value="topografia">topografia</option>
                  <option value="geologia">geologia</option>
                </select>
              </div>
            </div>

            {contratosEmAberto.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-aldebaran-border text-theme-weak text-sm lowercase font-mono">
                nenhum contrato em aberto localizado com os filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-aldebaran-border text-[10px] uppercase font-bold text-theme-weak tracking-wider">
                      <th className="pb-3 px-2">projeto / cliente</th>
                      <th className="pb-3 px-2">área</th>
                      <th className="pb-3 px-2">diretor responsável</th>
                      <th className="pb-3 px-2">entrega prevista</th>
                      <th className="pb-3 px-2">dias restantes</th>
                      <th className="pb-3 px-2">progresso</th>
                      <th className="pb-3 px-2 text-right">ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aldebaran-border/50 text-sm">
                    {contratosEmAberto.map(contrato => {
                      const progresso = obterProgressoContrato(contrato);
                      const diasRestantes = calcularDiasRestantes(contrato.data_entrega_final);

                      let diasBadgeStyle = 'text-theme-normal';
                      if (diasRestantes !== null) {
                        if (diasRestantes < 0) {
                          diasBadgeStyle = 'text-rose-500 font-bold';
                        } else if (diasRestantes <= 7) {
                          diasBadgeStyle = 'text-aldebaran-gold font-bold';
                        } else {
                          diasBadgeStyle = 'text-emerald-500';
                        }
                      }

                      return (
                        <tr
                          key={contrato.id}
                          onClick={() => navigate(`/contratos/${contrato.id}`)}
                          className="group hover:bg-aldebaran-border/10 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-2">
                            <div className="font-bold text-theme-strong group-hover:text-aldebaran-gold transition-colors">{contrato.nome_projeto}</div>
                            <div className="text-xs text-theme-weak font-mono lowercase">{contrato.cliente}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-none font-mono lowercase bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
                              {contrato.area_atuacao ? contrato.area_atuacao.nome : 'Sem Área'}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-aldebaran-border text-theme-weak text-[10px] font-bold flex items-center justify-center">
                                {contrato.diretor_projeto ? contrato.diretor_projeto.substring(0, 2).toUpperCase() : '??'}
                              </div>
                              <span className="text-theme-normal text-xs">{contrato.diretor_projeto}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-xs font-mono text-theme-weak">
                            {formatarData(contrato.data_entrega_final)}
                          </td>
                          <td className="py-4 px-2 text-xs font-mono">
                            {diasRestantes !== null ? (
                              <span className={diasBadgeStyle}>
                                {diasRestantes < 0
                                  ? `atrasado há ${Math.abs(diasRestantes)}d`
                                  : `${diasRestantes} dias`}
                              </span>
                            ) : (
                              <span className="text-theme-weak">-</span>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3 min-w-[120px]">
                              <div className="flex-1 h-1.5 bg-aldebaran-border rounded-none relative overflow-hidden">
                                <div
                                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${contrato.status === 'atrasado'
                                      ? 'bg-rose-500'
                                      : contrato.status === 'atencao'
                                        ? 'bg-aldebaran-gold'
                                        : 'bg-emerald-500'
                                    }`}
                                  style={{ width: `${progresso}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold font-mono text-theme-strong w-8 text-right">{progresso}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button className="p-1 hover:bg-transparent text-theme-weak hover:text-theme-strong rounded-none transition">
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: ANÁLISE DE GARGALOS */}
      {abaAtiva === 'gargalos' && (
        <div className="space-y-6 animate-fade-in">
          {/* CARDS DE RESUMO DE ATRASOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-aldebaran-border p-5 bg-aldebaran-dark0/10 flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 rounded-none text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Tarefas Atrasadas</span>
                <h3 className="text-2xl font-extrabold text-theme-strong font-mono mt-1">
                  {etapasAtrasadas.length.toString().padStart(2, '0')}
                </h3>
                <span className="text-[10px] text-rose-400 lowercase mt-1 block">necessitam de atenção</span>
              </div>
            </div>

            <div className="border border-aldebaran-border p-5 bg-aldebaran-dark0/10 flex items-start gap-4">
              <div className="p-3 bg-aldebaran-gold/10 rounded-none text-aldebaran-gold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Média de Atraso</span>
                <h3 className="text-2xl font-extrabold text-theme-strong font-mono mt-1">
                  {gargalosInfo.mediaAtraso.toString().padStart(2, '0')} <span className="text-xs font-semibold text-theme-weak">dias</span>
                </h3>
                <span className="text-[10px] text-theme-weak lowercase mt-1 block">por atividade pendente</span>
              </div>
            </div>

            <div className="border border-aldebaran-border p-5 bg-aldebaran-dark0/10 flex items-start gap-4">
              <div className="p-3 bg-red-600/10 rounded-none text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Maior Gargalo Único</span>
                <h3 className="text-2xl font-extrabold text-theme-strong font-mono mt-1">
                  {gargalosInfo.maiorAtraso.toString().padStart(2, '0')} <span className="text-xs font-semibold text-theme-weak">dias</span>
                </h3>
                <span className="text-[10px] text-theme-weak lowercase mt-1 block">maior atraso isolado</span>
              </div>
            </div>

            <div className="border border-aldebaran-border p-5 bg-aldebaran-dark0/10 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-none text-blue-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Responsável Crítico</span>
                <h3 className="text-lg font-bold text-theme-strong mt-1 truncate max-w-[200px]" title={gargalosInfo.respCritico}>
                  {gargalosInfo.respCritico}
                </h3>
                <span className="text-[10px] text-[#F2AF47] lowercase mt-1 block">maior acúmulo de atraso</span>
              </div>
            </div>
          </div>

          {/* GRÁFICOS DE ANÁLISE DE GARGALOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Gargalo por Colaborador */}
            <div className="border border-aldebaran-border p-6 bg-aldebaran-dark0/10 flex flex-col space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Métricas de Sobrecarga</span>
                <h4 className="text-base font-bold text-theme-strong lowercase mt-1">atraso acumulado por responsável (dias)</h4>
              </div>

              {gargalosInfo.colabGargalos.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-16 text-theme-weak text-xs font-mono lowercase">
                  sem atrasos registrados para colaboradores.
                </div>
              ) : (
                <div className="space-y-4">
                  {gargalosInfo.colabGargalos.map((colab, index) => {
                    const maxDelay = gargalosInfo.colabGargalos[0]?.dias || 1;
                    const percent = (colab.dias / maxDelay) * 100;

                    return (
                      <div key={colab.nome} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-theme-normal font-bold">{colab.nome}</span>
                          <span className="text-theme-weak">
                            {colab.dias} dias em {colab.count} tarefas
                          </span>
                        </div>
                        <div className="h-4 bg-aldebaran-border rounded-none relative">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#d9972b] to-rose-600 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gargalo por Fase */}
            <div className="border border-aldebaran-border p-6 bg-aldebaran-dark0/10 flex flex-col space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Gargalos de Processo</span>
                <h4 className="text-base font-bold text-theme-strong lowercase mt-1">atraso acumulado por fase do projeto (dias)</h4>
              </div>

              {gargalosInfo.faseGargalos.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-16 text-theme-weak text-xs font-mono lowercase">
                  sem atrasos registrados por fases.
                </div>
              ) : (
                <div className="space-y-4">
                  {gargalosInfo.faseGargalos.map((fase, index) => {
                    const maxDelay = gargalosInfo.faseGargalos[0]?.dias || 1;
                    const percent = (fase.dias / maxDelay) * 100;

                    return (
                      <div key={fase.fase} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-theme-normal font-bold lowercase">{fase.fase}</span>
                          <span className="text-theme-weak">{fase.dias} dias de atraso</span>
                        </div>
                        <div className="h-4 bg-aldebaran-border rounded-none relative">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-aldebaran-gold to-orange-600 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* DETALHAMENTO DAS TAREFAS ATRASADAS (MAPEAMENTO CRÍTICO) */}
          <div className="border border-aldebaran-border rounded-none p-6 bg-aldebaran-dark0/5 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Mapeamento Crítico</span>
              <h3 className="text-lg font-bold text-theme-strong lowercase mt-1">todas as atividades atualmente com prazo vencido</h3>
            </div>

            {etapasAtrasadas.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-aldebaran-border text-emerald-400 text-sm lowercase font-mono flex flex-col items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                excelente! nenhuma tarefa está atrasada no momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-aldebaran-border text-[10px] uppercase font-bold text-theme-weak tracking-wider">
                      <th className="pb-3 px-2">tarefa / etapa</th>
                      <th className="pb-3 px-2">projeto (fase)</th>
                      <th className="pb-3 px-2">responsável</th>
                      <th className="pb-3 px-2">prazo previsto</th>
                      <th className="pb-3 px-2">atraso</th>
                      <th className="pb-3 px-2">progresso atual</th>
                      <th className="pb-3 px-2 text-right">ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aldebaran-border/50 text-sm">
                    {etapasAtrasadas.map(etapa => (
                      <tr
                        key={etapa.id}
                        onClick={() => navigate(`/contratos/${etapa.contrato_id}`)}
                        className="group hover:bg-aldebaran-border/10 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-2">
                          <span className="font-bold text-theme-strong group-hover:text-aldebaran-gold transition-colors">{etapa.nome_tarefa}</span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-xs text-theme-normal font-semibold">{etapa.nome_projeto}</div>
                          <div className="text-[10px] text-theme-weak lowercase font-mono">{etapa.nome_fase}</div>
                        </td>
                        <td className="py-4 px-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span className="text-theme-normal">{etapa.responsavel}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-xs font-mono text-theme-weak">
                          {formatarData(etapa.data_termino)}
                        </td>
                        <td className="py-4 px-2 text-xs font-mono">
                          <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-none font-bold">
                            {etapa.dias_atraso}d atraso
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-aldebaran-border rounded-none relative">
                              <div className="absolute left-0 top-0 h-full bg-rose-500" style={{ width: `${etapa.progresso}%` }}></div>
                            </div>
                            <span className="text-xs font-bold font-mono text-theme-weak">{etapa.progresso}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="p-1 hover:bg-transparent text-theme-weak hover:text-theme-strong rounded-none transition">
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;