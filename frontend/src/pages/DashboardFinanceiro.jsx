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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Carregando painel financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in text-slate-800">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-all text-xs font-semibold group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel Financeiro dos Contratos</h1>
          <p className="text-slate-500 text-sm mt-1">Gestao de faturamento e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filtroArea}
            onChange={(e) => { setFiltroArea(e.target.value); setFiltroContrato(''); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-[#0D9488] max-w-[150px] shadow-sm"
          >
            <option value="">Todas as Areas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-[#0D9488] max-w-[120px] shadow-sm"
          >
            <option value="">Todos os Anos</option>
            {anosDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
          </select>
          <select
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-[#0D9488] max-w-xs shadow-sm"
          >
            <option value="">Todos os Contratos</option>
            {contratos.filter(c => !filtroArea || c.area_id === parseInt(filtroArea)).map(c => (
              <option key={c.id} value={c.id}>{c.nome_projeto} - {c.cliente}</option>
            ))}
          </select>
          <button
            onClick={() => carregarDados()}
            className="p-2 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-slate-500 hover:text-slate-700 transition-all shadow-sm"
            title="Recarregar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-600 transition-all shadow-sm flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            exportar csv
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Erro de Comunicacao</h4>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-lg transition-shadow">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0"><Coins className="w-5 h-5" /></div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Valor Global (TCV)</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1 truncate" title={formatarBRL(data.tcv)}>{formatarBRL(data.tcv)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">soma dos contratos ativos</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-lg transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0"><TrendingUp className="w-5 h-5" /></div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Margem de Lucro</span>
            <h3 className="text-lg font-extrabold text-indigo-600 mt-1 truncate">{data.margem_projetada || '0'}%</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">rentabilidade da operacao</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-lg transition-shadow">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0"><Receipt className="w-5 h-5" /></div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total de Gastos</span>
            <h3 className="text-lg font-extrabold text-rose-500 mt-1 truncate" title={formatarBRL(data.total_despesas || 0)}>{formatarBRL(data.total_despesas || 0)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">despesas operacionais</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-lg transition-shadow">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0"><DollarSign className="w-5 h-5" /></div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lucro</span>
            <h3 className="text-lg font-extrabold text-emerald-600 mt-1 truncate" title={formatarBRL(data.tcv - (data.total_despesas || 0) - (data.imposto_projetado || 0))}>
              {formatarBRL(data.tcv - (data.total_despesas || 0) - (data.imposto_projetado || 0))}
            </h3>
            <span className="text-[10px] text-slate-400 mt-1 block">valor - gastos - imposto</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-lg transition-shadow">
          <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shrink-0"><TrendingUp className="w-5 h-5" /></div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Imposto (Projetado / Pago)</span>
            <h3 className="text-lg font-extrabold text-orange-500 mt-1 truncate" title={formatarBRL(data.imposto_pago || 0)}>
              {formatarBRL(data.imposto_projetado || 0)} <span className="text-xs text-slate-400 font-normal ml-1">projetado</span>
            </h3>
            <span className="text-[10px] text-slate-400 mt-1 block">pago: {formatarBRL(data.imposto_pago || 0)} ({data.taxa_imposto || 0}%)</span>
          </div>
        </div>
      </div>

      {/* GRAFICOS FINANCEIROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Rentabilidade</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">Valor Contratado vs Gasto por Area (R$)</h4>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            {!data.rentabilidade_por_area || data.rentabilidade_por_area.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
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
        <div className="border border-slate-200 p-6 bg-white rounded-xl flex flex-col space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Composição de Carteira</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">Distribuição de Receita por Área (TCV)</h4>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center text-xs">
            {data.receita_por_area.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
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
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total TCV</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{formatarBRL(data.tcv)}</span>
                </div>
              </>
            )}
          </div>

          {/* Legenda customizada */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] font-mono">
            {data.receita_por_area.map((area, idx) => (
              <div key={area.name} className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="truncate text-slate-700 font-semibold">{area.name}</span>
                <span className="text-slate-400 ml-auto font-mono">
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


