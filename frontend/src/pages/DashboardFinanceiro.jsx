import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ArrowRight,
  CheckCircle,
  Coins,
  ArrowLeft
} from 'lucide-react';
import {
  getDashboardFinanceiro,
  updateEtapa,
  exportarCSV
} from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DashboardFinanceiro = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    tcv: 0,
    total_recebido: 0,
    total_faturado: 0,
    total_a_receber: 0,
    total_atrasado: 0,
    receita_por_area: [],
    fluxo_caixa: [],
    marcos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filtros da tabela de marcos
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await getDashboardFinanceiro();
      setData(res);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
      setError('Falha ao carregar dados financeiros. Verifique se a API está online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Alteração Snappy do status de faturamento
  const handleAlterarStatus = async (marçoId, novoStatus) => {
    setUpdatingId(marçoId);
    try {
      // 1. Atualizar no backend
      await updateEtapa(marçoId, { status_faturamento: novoStatus });

      // 2. Recarregar dados para atualizar KPIs e gráficos
      const res = await getDashboardFinanceiro();
      setData(res);
    } catch (err) {
      console.error('Erro ao atualizar status do marco:', err);
      alert('Erro ao atualizar o status do faturamento.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Formatar valores para moeda brasileira
  const formatarBRL = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Filtros aplicados sobre a listagem de marcos
  const marcosFiltrados = data.marcos.filter((m) => {
    const correspondeTexto =
      m.nome_projeto.toLowerCase().includes(busca.toLowerCase()) ||
      m.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      m.nome_tarefa.toLowerCase().includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'todos' ||
      m.status_faturamento.toLowerCase() === filtroStatus.toLowerCase();

    return correspondeTexto && correspondeStatus;
  });

  // Cores personalizadas para o gráfico de Donut de Receita por Área
  const COLORS = ['#D9972B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B'];

  if (loading && !data.tcv) {
    return (
      <div className="flex items-center justify-center h-screen bg-aldebaran-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-theme-weak font-medium">Carregando painel financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in text-theme-strong">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-aldebaran-border pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-theme-weak hover:text-theme-strong transition-all text-xs font-semibold group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-2xl font-bold text-theme-strong lowercase tracking-tight">
            painel financeiro dos contratos
          </h1>
          <p className="text-theme-weak text-sm mt-1 lowercase font-mono">
            gestão inteligente de faturamento e fluxo de caixa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarDados}
            className="p-2 bg-transparent text-theme-weak hover:text-theme-strong border border-aldebaran-border hover:border-theme-strong rounded-none transition"
            title="Recarregar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-transparent text-theme-weak border border-aldebaran-border hover:border-theme-strong rounded-none text-xs font-semibold lowercase transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            exportar csv
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-4 flex items-start gap-3">
          <AlertTriangle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-rose-400 font-bold text-sm">Erro de Comunicação</h4>
            <p className="text-rose-300/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* CARDS DE RESUMO FINANCEIRO (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TCV */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-aldebaran-gold/40 transition-colors">
          <div className="p-3 bg-aldebaran-gold/10 rounded-none text-aldebaran-gold shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">TCV (Carteira Ativa)</span>
            <h3 className="text-xl font-extrabold text-theme-strong font-mono mt-1 truncate" title={formatarBRL(data.tcv)}>
              {formatarBRL(data.tcv)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">soma dos contratos ativos</span>
          </div>
        </div>

        {/* RECEBIDO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-none text-emerald-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Total Pago / Liquidado</span>
            <h3 className="text-xl font-extrabold text-emerald-400 font-mono mt-1 truncate" title={formatarBRL(data.total_recebido)}>
              {formatarBRL(data.total_recebido)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">recurso em caixa</span>
          </div>
        </div>

        {/* FATURADO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="p-3 bg-blue-500/10 rounded-none text-blue-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Total Faturado</span>
            <h3 className="text-xl font-extrabold text-blue-400 font-mono mt-1 truncate" title={formatarBRL(data.total_faturado)}>
              {formatarBRL(data.total_faturado)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">nota emitida / em cobrança</span>
          </div>
        </div>

        {/* A FATURAR / PENDENTE */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-amber-500/30 transition-colors">
          <div className="p-3 bg-amber-500/10 rounded-none text-amber-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Total A Receber</span>
            <h3 className="text-xl font-extrabold text-amber-400 font-mono mt-1 truncate" title={formatarBRL(data.total_a_receber)}>
              {formatarBRL(data.total_a_receber)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">agendado / pendente</span>
          </div>
        </div>

        {/* ATRASADO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-rose-500/40 transition-colors">
          <div className="p-3 bg-rose-500/10 rounded-none text-rose-500 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Inadimplência / Atrasado</span>
            <h3 className="text-xl font-extrabold text-rose-500 font-mono mt-1 truncate" title={formatarBRL(data.total_atrasado)}>
              {formatarBRL(data.total_atrasado)}
            </h3>
            <span className="text-[10px] text-rose-400 lowercase mt-1 block">prazos vencidos não pagos</span>
          </div>
        </div>
      </div>

      {/* GRÁFICOS FINANCEIROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Previsão de Fluxo de Caixa (Barras) */}
        <div className="border border-aldebaran-border p-6 bg-aldebaran-gray rounded-none lg:col-span-2 flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Planejamento e Entradas</span>
            <h4 className="text-base font-bold text-theme-strong lowercase mt-1">projeção de faturamento — 6 meses (R$)</h4>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            {data.fluxo_caixa.length === 0 ? (
              <div className="h-full flex items-center justify-center text-theme-weak italic">
                Nenhum faturamento previsto nos próximos meses.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.fluxo_caixa}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(tick) => `R$ ${(tick / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161922',
                      borderColor: '#2d3345',
                      borderRadius: '0px',
                      color: '#f3f4f6'
                    }}
                    formatter={(value) => [formatarBRL(value), '']}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#d1d5db' }} />
                  <Bar dataKey="pago" name="Recebido (Pago)" fill="#10B981" stackId="a" />
                  <Bar dataKey="previsto" name="Previsto (Aberto)" fill="#D9972B" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Receita por Área de Atuação (Donut) */}
        <div className="border border-aldebaran-border p-6 bg-aldebaran-gray rounded-none flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Composição de Carteira</span>
            <h4 className="text-base font-bold text-theme-strong lowercase mt-1">distribuição de receita por área (TCV)</h4>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center text-xs">
            {data.receita_por_area.length === 0 ? (
              <div className="h-full flex items-center justify-center text-theme-weak italic">
                Nenhum contrato ativo para exibição de áreas.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.receita_por_area}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.receita_por_area.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161922',
                        borderColor: '#2d3345',
                        borderRadius: '0px',
                        color: '#f3f4f6'
                      }}
                      formatter={(value) => [formatarBRL(value), 'TCV']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Central text for Donut */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[9px] uppercase font-bold text-theme-weak tracking-wider">Total TCV</span>
                  <span className="text-sm font-extrabold text-theme-strong font-mono mt-0.5">{formatarBRL(data.tcv)}</span>
                </div>
              </>
            )}
          </div>

          {/* Legenda customizada */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-aldebaran-border/50 text-[11px] font-mono">
            {data.receita_por_area.map((area, idx) => (
              <div key={area.name} className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="truncate text-theme-normal font-semibold">{area.name}</span>
                <span className="text-theme-weak ml-auto font-mono">
                  {Math.round((area.value / (data.tcv || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TABELA DE CONCILIAÇÃO DE MARCOS FINANCEIROS */}
      <div className="border border-aldebaran-border rounded-none p-6 bg-aldebaran-gray space-y-6">

        {/* Topo da tabela e Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Conciliação Financeira</span>
            <h3 className="text-lg font-bold text-theme-strong lowercase mt-1">todos os marcos de faturamento</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Campo Busca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-theme-weak absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="filtrar projeto, parcela..."
                className="w-[200px] sm:w-[260px] pl-9 pr-4 py-1.5 bg-aldebaran-dark border border-aldebaran-border text-theme-normal text-xs rounded-none placeholder-theme-weak/50 focus:outline-none focus:border-theme-strong transition-colors"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-1.5 bg-aldebaran-dark border border-aldebaran-border text-theme-normal text-xs rounded-none focus:outline-none focus:border-theme-strong cursor-pointer font-bold uppercase tracking-wider text-theme-weak"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="faturado">Faturado</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>

        {/* Tabela de Dados */}
        {marcosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-aldebaran-border text-theme-weak text-sm lowercase font-mono">
            nenhum marco de faturamento localizado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-aldebaran-border text-[10px] uppercase font-bold text-theme-weak tracking-wider">
                  <th className="pb-3 px-2">projeto / cliente</th>
                  <th className="pb-3 px-2">parcela / milestone</th>
                  <th className="pb-3 px-2">responsável</th>
                  <th className="pb-3 px-2">vencimento</th>
                  <th className="pb-3 px-2">valor do faturamento</th>
                  <th className="pb-3 px-2">alterar status do faturamento</th>
                  <th className="pb-3 px-2 text-right">ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aldebaran-border/50 text-sm">
                {marcosFiltrados.map((marco) => {
                  const status = (marco.status_faturamento || 'pendente').toLowerCase();

                  // Classes de cores do badge com base no status de faturamento
                  let statusStyles = '';
                  if (status === 'pago') {
                    statusStyles = 'border-emerald-500/30 text-emerald-500 bg-emerald-500/[0.04] focus:border-emerald-500';
                  } else if (status === 'faturado') {
                    statusStyles = 'border-blue-500/30 text-blue-400 bg-blue-500/[0.04] focus:border-blue-500';
                  } else if (status === 'atrasado') {
                    statusStyles = 'border-rose-500/30 text-rose-500 bg-rose-500/[0.04] focus:border-rose-500';
                  } else {
                    statusStyles = 'border-amber-500/30 text-amber-500 bg-amber-500/[0.04] focus:border-amber-500';
                  }

                  return (
                    <tr
                      key={marco.id}
                      className={`group transition-colors ${updatingId === marco.id ? 'opacity-50 pointer-events-none' : 'hover:bg-aldebaran-border/10'
                        }`}
                    >
                      {/* Projeto / Cliente */}
                      <td className="py-4 px-2">
                        <div className="font-bold text-theme-strong">{marco.nome_projeto}</div>
                        <div className="text-xs text-theme-weak font-mono lowercase">{marco.cliente}</div>
                      </td>

                      {/* Parcela / Milestone */}
                      <td className="py-4 px-2">
                        <span className="text-theme-normal font-semibold">{marco.nome_tarefa}</span>
                      </td>

                      {/* Responsável */}
                      <td className="py-4 px-2 text-xs text-theme-weak">
                        <span>{marco.responsavel || 'Sem Responsável'}</span>
                      </td>

                      {/* Vencimento */}
                      <td className="py-4 px-2 text-xs font-mono text-theme-weak">
                        {formatarData(marco.data_termino)}
                      </td>

                      {/* Valor do Faturamento */}
                      <td className="py-4 px-2 font-bold font-mono text-theme-strong">
                        {formatarBRL(marco.valor_faturamento)}
                      </td>

                      {/* Dropdown de conciliação snappier */}
                      <td className="py-4 px-2">
                        <select
                          value={status}
                          onChange={(e) => handleAlterarStatus(marco.id, e.target.value)}
                          className={`px-3 py-1.5 border rounded-none text-xs font-bold font-mono uppercase focus:outline-none transition-colors cursor-pointer w-36 ${statusStyles}`}
                        >
                          <option value="pendente" className="bg-aldebaran-dark text-amber-500">Pendente</option>
                          <option value="faturado" className="bg-aldebaran-dark text-blue-400">Faturado</option>
                          <option value="pago" className="bg-aldebaran-dark text-emerald-500">Pago</option>
                          <option value="atrasado" className="bg-aldebaran-dark text-rose-500">Atrasado</option>
                        </select>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={() => navigate(`/contratos/${marco.contrato_id}`)}
                          className="px-3 py-1.5 bg-transparent text-theme-weak border border-aldebaran-border hover:border-theme-strong rounded-none text-xs font-semibold lowercase transition-colors inline-flex items-center gap-1.5"
                        >
                          ver cronograma
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
  );
};

export default DashboardFinanceiro;
