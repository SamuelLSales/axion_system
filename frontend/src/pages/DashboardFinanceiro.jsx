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
  ArrowLeft,
  Receipt
} from 'lucide-react';
import {
  getDashboardFinanceiro,
  updateEtapa,
  exportarCSV,
  getContratos,
  getAreasAtuacao
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
    rentabilidade_por_area: [],
    marcos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filtros
  const [contratos, setContratos] = useState([]);
  const [filtroContrato, setFiltroContrato] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [areas, setAreas] = useState([]);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  // Anos fixos para o filtro (pode ser dinâmico no futuro)
  const anosDisponiveis = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await getDashboardFinanceiro(
        filtroContrato || undefined, 
        filtroArea || undefined,
        filtroAno || undefined
      );
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
  }, [filtroContrato, filtroArea, filtroAno]);

  useEffect(() => {
    getContratos().then(setContratos).catch(console.error);
    getAreasAtuacao().then(setAreas).catch(console.error);
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
          <h1 className="text-2xl font-bold text-theme-strong tracking-tight">
            Painel Financeiro dos Contratos
          </h1>
          <p className="text-theme-weak text-sm mt-1 font-mono">
            Gestão de faturamento e fluxo de caixa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroArea}
            onChange={(e) => {
              setFiltroArea(e.target.value);
              setFiltroContrato(''); // Reset contract when area changes
            }}
            className="p-2 bg-aldebaran-dark border border-aldebaran-border rounded-none text-xs text-theme-strong focus:outline-none focus:border-aldebaran-gold max-w-[150px] truncate"
          >
            <option value="">Todas as Áreas</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className="p-2 bg-aldebaran-dark border border-aldebaran-border rounded-none text-xs text-theme-strong focus:outline-none focus:border-aldebaran-gold max-w-[120px] truncate"
          >
            <option value="">Todos os Anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
          <select
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="p-2 bg-aldebaran-dark border border-aldebaran-border rounded-none text-xs text-theme-strong focus:outline-none focus:border-aldebaran-gold max-w-xs truncate"
          >
            <option value="">Todos os Contratos</option>
            {contratos
              .filter(c => !filtroArea || c.area_id === parseInt(filtroArea))
              .map(c => (
              <option key={c.id} value={c.id}>{c.nome_projeto} - {c.cliente}</option>
            ))}
          </select>
          <button
            onClick={() => carregarDados()}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Valor Global (TCV)</span>
            <h3 className="text-xl font-extrabold text-theme-strong font-mono mt-1 truncate" title={formatarBRL(data.tcv)}>
              {formatarBRL(data.tcv)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">soma dos contratos ativos</span>
          </div>
        </div>

        {/* MARGEM DE LUCRO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="p-3 bg-blue-500/10 rounded-none text-blue-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Margem de Lucro</span>
            <h3 className="text-xl font-extrabold text-blue-400 font-mono mt-1 truncate" title={data.margem_projetada + '%'}>
              {data.margem_projetada || '0'}%
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">rentabilidade da operação</span>
          </div>
        </div>

        {/* GASTOS / DESPESAS */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-rose-500/30 transition-colors">
          <div className="p-3 bg-rose-500/10 rounded-none text-rose-500 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Total de Gastos</span>
            <h3 className="text-xl font-extrabold text-rose-500 font-mono mt-1 truncate" title={formatarBRL(data.total_despesas || 0)}>
              {formatarBRL(data.total_despesas || 0)}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">despesas e custos operacionais</span>
          </div>
        </div>

        {/* LUCRO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-none text-emerald-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Lucro</span>
            <h3 className="text-xl font-extrabold text-emerald-400 font-mono mt-1 truncate" title={formatarBRL(data.tcv - (data.total_despesas || 0) - (data.imposto_projetado || 0))}>
              {formatarBRL(data.tcv - (data.total_despesas || 0) - (data.imposto_projetado || 0))}
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">valor - gastos - imposto</span>
          </div>
        </div>

        {/* IMPOSTO */}
        <div className="border border-aldebaran-border p-5 bg-aldebaran-gray flex items-start gap-4 shadow-sm hover:border-orange-500/30 transition-colors">
          <div className="p-3 bg-orange-500/10 rounded-none text-orange-500 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-weak block">Imposto (Projetado / Pago)</span>
            <h3 className="text-xl font-extrabold text-orange-400 font-mono mt-1 truncate" title={formatarBRL(data.imposto_pago || 0)}>
              {formatarBRL(data.imposto_projetado || 0)} <span className="text-xs text-theme-weak font-normal ml-1">projetado</span>
            </h3>
            <span className="text-[10px] text-theme-weak lowercase mt-1 block">
              pago: {formatarBRL(data.imposto_pago || 0)} ({data.taxa_imposto || 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* GRÁFICOS FINANCEIROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rentabilidade por Área (Barras Duplas Verticais) */}
        <div className="border border-aldebaran-border p-6 bg-aldebaran-gray rounded-none lg:col-span-2 flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Rentabilidade</span>
            <h4 className="text-base font-bold text-theme-strong mt-1">Valor Contratado vs Gasto por Área (R$)</h4>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            {!data.rentabilidade_por_area || data.rentabilidade_por_area.length === 0 ? (
              <div className="h-full flex items-center justify-center text-theme-weak italic">
                Nenhuma área de atuação com contratos ativos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.rentabilidade_por_area}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis stroke="#6b7280" tickFormatter={(tick) => `R$ ${(tick / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161922',
                      borderColor: '#2d3345',
                      borderRadius: '0px',
                      color: '#f3f4f6'
                    }}
                    formatter={(value, name) => [formatarBRL(value), name === 'faturado' ? 'Valor Contratado' : 'Gasto']}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#d1d5db' }} />
                  <Bar dataKey="faturado" name="Valor Contratado" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gasto" name="Gasto Total" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Receita por Área de Atuação (Donut) */}
        <div className="border border-aldebaran-border p-6 bg-aldebaran-gray rounded-none flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-weak block">Composição de Carteira</span>
            <h4 className="text-base font-bold text-theme-strong mt-1">Distribuição de Receita por Área (TCV)</h4>
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

    </div>
  );
};

export default DashboardFinanceiro;
