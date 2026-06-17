import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  User,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  History,
  FileText,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  getContrato,
  updateContrato,
  deleteContrato,
  createFase,
  updateFase,
  deleteFase,
  createEtapa,
  updateEtapa,
  deleteEtapa,
  getResponsaveis,
  getAreasAtuacao,
  exportarCSV
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';

const formatArea = (nome) => {
  if (!nome) return '';
  return nome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const formatarCategoria = (cat) => {
  const cats = {
    logistica: 'Logística',
    pessoal: 'Mão de Obra',
    terceiros: 'Serviços Terceiros',
    taxas: 'Taxas e Licenças'
  };
  return cats[cat] || cat;
};


const DetalheContrato = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contrato, setContrato] = useState(null);
  const [responsaveis, setResponsaveis] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos Modais
  const [modalContratoAberto, setModalContratoAberto] = useState(false);
  const [modalFaseAberto, setModalFaseAberto] = useState(false);
  const [fasesExpandidas, setFasesExpandidas] = useState({});
  const [modalEtapaAberto, setModalEtapaAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Estados dos Formulários
  const [editContratoForm, setEditContratoForm] = useState({});
  const [faseForm, setFaseForm] = useState({ id: null, nome_fase: '', ordem: 1 });
  const [etapaForm, setEtapaForm] = useState({
    id: null, // se preenchido, é edição
    fase_id: null,
    nome_tarefa: '',
    responsavel: '',
    progresso: 0,
    data_inicio: '',
    data_termino: '',
    data_conclusao: '',
    dias_previstos: 0,
    observacoes: '',
    valor_faturamento: 0.0,
    status_faturamento: 'pendente'
  });
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dadosContrato, listaResponsaveis, listaAreas] = await Promise.all([
        getContrato(id),
        getResponsaveis(),
        getAreasAtuacao()
      ]);
      setContrato(dadosContrato);
      setEditContratoForm(dadosContrato);
      setResponsaveis(listaResponsaveis);
      setAreas(listaAreas);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhes do contrato:', err);
      setError('Erro ao carregar dados do contrato. Certifique-se de que o backend está online.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirContrato = () => {
    setModalExcluirAberto(true);
  };

  const confirmarExclusaoContrato = async () => {
    try {
      await deleteContrato(id);
      navigate('/contratos');
    } catch (err) {
      console.error('Erro ao excluir contrato:', err);
      alert('Erro ao excluir o contrato. Verifique a conexão com o servidor.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  // Formatação de data
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const date = new Date(dataStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataStr) => {
    if (!dataStr) return '-';
    const date = new Date(dataStr);
    return date.toLocaleString('pt-BR');
  };

  // Obter as iniciais de um colaborador para o avatar
  const obterIniciais = (nome) => {
    if (!nome) return 'U';
    const partes = nome.split(' ');
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

  // Cálculo de Progresso Geral do Contrato
  const calcularProgressoGeral = () => {
    if (!contrato || !contrato.fases) return 0;
    const todasEtapas = contrato.fases.flatMap(f => f.etapas || []);
    if (todasEtapas.length === 0) return 0;
    const soma = todasEtapas.reduce((acc, e) => acc + (e.progresso || 0), 0);
    return (soma / todasEtapas.length) * 100;
  };

  const toggleFase = (faseId) => {
    setFasesExpandidas(prev => ({
      ...prev,
      [faseId]: prev[faseId] === undefined ? false : !prev[faseId]
    }));
  };

  // --- FUNÇÕES DE AÇÃO ---

  // 1. Atualizar Contrato (Informações Gerais)
  const handleSalvarContrato = async (e) => {
    e.preventDefault();
    try {
      const dataInicio = editContratoForm.data_inicio ? new Date(editContratoForm.data_inicio).toISOString() : null;
      const dataEntrega = editContratoForm.data_entrega_final ? new Date(editContratoForm.data_entrega_final).toISOString() : null;

      await updateContrato(contrato.id, {
        ...editContratoForm,
        data_inicio: dataInicio,
        data_entrega_final: dataEntrega,
        dias_campo_total: parseInt(editContratoForm.dias_campo_total) || 0,
        valor_total: parseFloat(editContratoForm.valor_total) || 0.0,
        gasto_total: parseFloat(editContratoForm.gasto_total) || 0.0
      });
      setModalContratoAberto(false);
      carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      alert('Erro ao atualizar dados do contrato.');
    }
  };

  // 2. Salvar Fase (Criar ou Editar)
  const handleSalvarFase = async (e) => {
    e.preventDefault();
    try {
      if (faseForm.id) {
        await updateFase(faseForm.id, {
          nome_fase: faseForm.nome_fase,
          ordem: parseInt(faseForm.ordem) || 1
        });
      } else {
        await createFase({
          contrato_id: contrato.id,
          nome_fase: faseForm.nome_fase,
          ordem: parseInt(faseForm.ordem) || 1
        });
      }
      setModalFaseAberto(false);
      setFaseForm({ id: null, nome_fase: '', ordem: contrato.fases.length + 1 });
      carregarDados();
    } catch (err) {
      console.error('Erro ao salvar fase:', err);
      alert('Erro ao salvar os dados da fase.');
    }
  };

  const abrirModalCriarFase = () => {
    setFaseForm({ id: null, nome_fase: '', ordem: contrato.fases ? contrato.fases.length + 1 : 1 });
    setModalFaseAberto(true);
  };

  const abrirModalEditarFase = (fase) => {
    setFaseForm({ id: fase.id, nome_fase: fase.nome_fase, ordem: fase.ordem });
    setModalFaseAberto(true);
  };

  // Excluir Fase
  const handleExcluirFase = async (faseId, nome) => {
    if (window.confirm(`Deseja realmente excluir a fase "${nome}"? Todas as etapas internas serão apagadas definitivamente!`)) {
      try {
        await deleteFase(faseId);
        carregarDados();
      } catch (err) {
        console.error('Erro ao excluir fase:', err);
        alert('Erro ao excluir fase.');
      }
    }
  };

  // 3. Abrir Modal de Etapa (Criar)
  const abrirModalCriarEtapa = (faseId) => {
    setEtapaForm({
      id: null,
      fase_id: faseId,
      nome_tarefa: '',
      responsavel: responsaveis[0]?.nome || '',
      progresso: 0,
      data_inicio: '',
      data_termino: '',
      data_conclusao: '',
      dias_previstos: 0,
      observacoes: '',
      valor_faturamento: 0.0,
      status_faturamento: 'pendente'
    });
    setModalEtapaAberto(true);
  };

  // Abrir Modal de Etapa (Editar)
  const abrirModalEditarEtapa = (etapa) => {
    setEtapaForm({
      id: etapa.id,
      fase_id: etapa.fase_id,
      nome_tarefa: etapa.nome_tarefa,
      responsavel: etapa.responsavel,
      progresso: Math.round(etapa.progresso * 100), // convert 0.5 to 50
      data_inicio: etapa.data_inicio ? etapa.data_inicio.split('T')[0] : '',
      data_termino: etapa.data_termino ? etapa.data_termino.split('T')[0] : '',
      data_conclusao: etapa.data_conclusao ? etapa.data_conclusao.split('T')[0] : '',
      dias_previstos: etapa.dias_previstos,
      observacoes: etapa.observacoes || '',
      valor_faturamento: etapa.valor_faturamento || 0.0,
      status_faturamento: etapa.status_faturamento || 'pendente'
    });
    setModalEtapaAberto(true);
  };

  // Salvar Etapa (Criar ou Editar)
  const handleSalvarEtapa = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome_tarefa: etapaForm.nome_tarefa,
        responsavel: etapaForm.responsavel,
        progresso: parseFloat(etapaForm.progresso) / 100, // convert 50 to 0.5
        data_inicio: etapaForm.data_inicio ? new Date(etapaForm.data_inicio).toISOString() : null,
        data_termino: etapaForm.data_termino ? new Date(etapaForm.data_termino).toISOString() : null,
        data_conclusao: etapaForm.data_conclusao ? new Date(etapaForm.data_conclusao).toISOString() : null,
        dias_previstos: parseInt(etapaForm.dias_previstos) || 0,
        observacoes: etapaForm.observacoes,
        valor_faturamento: parseFloat(etapaForm.valor_faturamento) || 0.0,
        status_faturamento: etapaForm.status_faturamento || 'pendente'
      };

      if (etapaForm.id) {
        // Editar
        await updateEtapa(etapaForm.id, payload);
      } else {
        // Criar
        await createEtapa({
          fase_id: etapaForm.fase_id,
          ...payload
        });
      }
      setModalEtapaAberto(false);
      carregarDados();
    } catch (err) {
      console.error('Erro ao salvar etapa:', err);
      alert('Erro ao salvar os dados da etapa.');
    }
  };

  // Excluir Etapa
  const handleExcluirEtapa = async (etapaId, nome) => {
    if (window.confirm(`Deseja realmente deletar a etapa "${nome}"?`)) {
      try {
        await deleteEtapa(etapaId);
        carregarDados();
      } catch (err) {
        console.error('Erro ao excluir etapa:', err);
        alert('Erro ao remover etapa.');
      }
    }
  };



  // Slider de alteração direta de progresso no card
  const handleProgressoSlider = async (etapa, novoValorDecimal) => {
    try {
      const updatePayload = { progresso: novoValorDecimal };
      if (novoValorDecimal === 1.0 && !etapa.data_conclusao) {
        updatePayload.data_conclusao = new Date().toISOString();
      } else if (novoValorDecimal < 1.0) {
        updatePayload.data_conclusao = null;
      }
      await updateEtapa(etapa.id, updatePayload);
      // Atualizar o state local imediatamente para fluidez visual e depois recarregar
      setContrato(prev => {
        const fasesAtualizadas = prev.fases.map(f => {
          const etapasAtualizadas = f.etapas.map(e => {
            if (e.id === etapa.id) return { ...e, ...updatePayload };
            return e;
          });
          return { ...f, etapas: etapasAtualizadas };
        });
        return { ...prev, fases: fasesAtualizadas };
      });
      // Recarregar dados em background para recalcular status e históricos
      const dadosAtualizados = await getContrato(id);
      setContrato(dadosAtualizados);
    } catch (err) {
      console.error('Erro ao atualizar progresso rápido:', err);
    }
  };

  // Marcar como Concluída (100%)
  const handleConcluirEtapa = (etapa) => {
    handleProgressoSlider(etapa, 1.0);
  };

  if (loading && !contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-aldebaran-dark text-theme-strong">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-theme-weak font-medium">Carregando detalhes do contrato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-theme-strong max-w-xl mx-auto mt-12 bg-transparent text-rose-500 border border-rose-500/20 rounded-none">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-bold">Erro de Carregamento</h2>
        </div>
        <p className="text-theme-normal mt-2">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-theme-weak hover:text-theme-strong transition-all text-sm font-semibold group"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const progressoGeral = calcularProgressoGeral();

  const totalGastos = contrato?.gasto_total || 0;

  // Cores das Fases na Timeline
  const faseColors = {
    1: { border: 'border-l-blue-500', text: 'text-aldebaran-gold', badge: 'bg-aldebaran-gold/10 text-aldebaran-gold' },
    2: { border: 'border-l-emerald-500', text: 'text-emerald-400', badge: 'bg-transparent text-emerald-500 text-emerald-400' },
    3: { border: 'border-l-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400' }
  };

  const getFaseColor = (ordem) => {
    return faseColors[ordem] || { border: 'border-l-slate-500', text: 'text-theme-weak', badge: 'bg-aldebaran-dark0/10 text-theme-weak' };
  };

  const calcularBadgeAtraso = (etapa) => {
    if (!etapa.data_termino) return null;

    const prazo = new Date(etapa.data_termino);
    prazo.setHours(23, 59, 59, 999);

    if (etapa.progresso >= 1) {
      if (!etapa.data_conclusao) return null;
      const conclusao = new Date(etapa.data_conclusao);
      conclusao.setHours(0, 0, 0, 0);
      const diffTime = conclusao - prazo;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">⚠️ Finalizou com {diffDays} dia(s) de atraso</span>;
      }
      return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">✅ No prazo</span>;
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const diffTime = hoje - prazo;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">🔴 Atrasado há {diffDays} dia(s)</span>;
      }
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">

      {/* VOLTAR E AÇÕES DO TOPO */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm font-bold text-theme-weak hover:text-aldebaran-gold transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao Dashboard
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => exportarCSV(id)}
            className="px-4 py-2 bg-transparent hover:bg-aldebaran-gray text-theme-weak hover:text-theme-strong border border-aldebaran-border rounded-none text-sm font-semibold transition flex items-center gap-2 hover:scale-[1.02]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Baixar Planilha
          </button>

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setModalContratoAberto(true)}
                className="px-4 py-2 bg-aldebaran-gray hover:bg-aldebaran-gray text-theme-normal border border-aldebaran-border rounded-none text-sm font-semibold transition flex items-center gap-2 hover:scale-[1.02]"
              >
                <Edit3 className="w-4 h-4" />
                Editar Contrato
              </button>

              <button
                onClick={handleExcluirContrato}
                className="px-4 py-2 bg-transparent hover:bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:border-rose-500/50 rounded-none text-sm font-semibold transition flex items-center gap-2 hover:scale-[1.02]"
                title="Excluir Contrato"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* CABEÇALHO DO CONTRATO */}
      <div className="bg-aldebaran-gray border border-aldebaran-border p-6 rounded-none shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold uppercase tracking-wider bg-transparent border border-aldebaran-border text-aldebaran-gold`}>
                {contrato.area_atuacao ? formatArea(contrato.area_atuacao.nome) : 'Sem Área'}
              </span>
              <StatusBadge status={contrato.status} />
            </div>
            <h1 className="text-3xl font-extrabold text-theme-strong mt-2">{contrato.nome_projeto}</h1>
            <p className="text-theme-weak text-sm mt-1">
              Cliente: <span className="text-theme-normal font-semibold">{contrato.cliente}</span> | Executor: {contrato.empresa}
            </p>
          </div>

          {/* Caixa de Prazos rápidos no canto */}
          <div className="bg-aldebaran-dark border border-aldebaran-border/80 px-4 py-3 rounded-none flex items-center gap-3 self-start md:self-auto min-w-[200px]">
            <Clock className="w-5 h-5 text-theme-weak" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-theme-weak block">Prazo Final</span>
              <span className="text-sm font-bold text-theme-normal">{formatarData(contrato.data_entrega_final)}</span>
            </div>
          </div>
        </div>

        {/* Informações detalhadas em Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-aldebaran-border/60 text-sm">
          <div>
            <span className="text-theme-weak text-xs block">Diretor do Projeto</span>
            <span className="text-theme-normal font-semibold mt-0.5 block">{contrato.diretor_projeto}</span>
          </div>
          <div>
            <span className="text-theme-weak text-xs block">Total de Gastos (Custos)</span>
            <span className="text-theme-normal font-semibold mt-0.5 block text-rose-500">
              {totalGastos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div>
            <span className="text-theme-weak text-xs block">Direitos Minerários</span>
            <span className="text-theme-normal font-semibold mt-0.5 block font-mono">{contrato.direitos_minerarios || '-'}</span>
          </div>
          <div>
            <span className="text-theme-weak text-xs block">Início das Atividades</span>
            <span className="text-theme-normal font-semibold mt-0.5 block">{formatarData(contrato.data_inicio)}</span>
          </div>
          <div>
            <span className="text-theme-weak text-xs block">Total de Dias de Campo</span>
            <span className="text-theme-normal font-semibold mt-0.5 block">{contrato.dias_campo_total} dias</span>
          </div>
        </div>

        {contrato.observacoes && (
          <div className="pt-3 border-t border-aldebaran-border/40 text-xs">
            <span className="text-theme-weak uppercase font-semibold block">Observações do Projeto:</span>
            <p className="text-theme-weak mt-1 leading-relaxed bg-aldebaran-dark/30 p-2.5 rounded-none border border-aldebaran-border/20">{contrato.observacoes}</p>
          </div>
        )}
      </div>

      {/* BARRA DE PROGRESSO GERAL DO CONTRATO */}
      <div className="bg-aldebaran-gray border border-aldebaran-border p-5 rounded-none shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-theme-strong">Progresso Geral do Contrato</span>
          <span className="text-sm font-extrabold text-aldebaran-gold font-mono">{Math.round(progressoGeral)}% concluído</span>
        </div>
        <ProgressBar value={progressoGeral} showText={false} />
      </div>



      {/* TIMELINE DE FASES E ETAPAS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-aldebaran-border pb-3">
          <h2 className="text-xl font-bold text-theme-strong flex items-center gap-2">
            <FileText className="w-5 h-5 text-aldebaran-goldDark" />
            Cronograma e Linha do Tempo
          </h2>
        </div>

        {contrato.fases && contrato.fases.length > 0 ? (
          <div className="space-y-8 pl-4 border-l border-aldebaran-border/60 ml-2">
            {contrato.fases
              .sort((a, b) => a.ordem - b.ordem)
              .map((fase) => {
                const faseEstilo = getFaseColor(fase.ordem);
                return (
                  <div key={fase.id} className="relative space-y-4">
                    {/* Indicador de Timeline */}
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-aldebaran-dark border-2 border-aldebaran-border"></span>

                    {/* TÍTULO DA FASE */}
                    <div
                      onClick={() => toggleFase(fase.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-aldebaran-dark/40 p-3 rounded-none border border-aldebaran-border/50 cursor-pointer hover:border-aldebaran-border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {fasesExpandidas[fase.id] === false ? <ChevronDown className="w-5 h-5 text-theme-weak" /> : <ChevronUp className="w-5 h-5 text-theme-weak" />}
                        <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold font-mono uppercase ${faseEstilo.badge}`}>
                          Fase {fase.ordem}
                        </span>
                        <h3 className="text-base font-bold text-theme-strong">{fase.nome_fase}</h3>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirModalCriarEtapa(fase.id); }}
                            className="px-3 py-1.5 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-xs transition flex items-center gap-1.5 border border-transparent"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar Etapa
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirModalEditarFase(fase); }}
                            className="p-1 hover:bg-transparent text-theme-weak hover:text-aldebaran-gold rounded-none transition"
                            title="Editar Fase"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleExcluirFase(fase.id, fase.nome_fase); }}
                            className="p-1 hover:bg-transparent text-rose-500 text-theme-weak hover:text-rose-400 rounded-none transition"
                            title="Remover Fase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* LISTA DE ETAPAS DA FASE (Layout em Linha/Compacto) */}
                    {fasesExpandidas[fase.id] !== false && (
                      <div className="flex flex-col gap-2 ml-2 animate-fade-in">
                        {fase.etapas && fase.etapas.length > 0 ? (
                          fase.etapas.map((etapa) => {
                            const progressoCem = Math.round(etapa.progresso * 100);
                            return (
                              <div
                                key={etapa.id}
                                className={`bg-aldebaran-dark0 border border-aldebaran-border rounded-none p-3 flex flex-col gap-3 hover:border-aldebaran-gold/50 transition-all ${progressoCem === 100 ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : ''
                                  }`}
                              >
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                  {/* Lado Esquerdo: Nome, Observação, Responsável, Datas */}
                                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className={`text-sm font-bold text-theme-strong truncate ${progressoCem === 100 ? 'text-theme-normal' : ''}`}>
                                        {etapa.nome_tarefa}
                                      </h4>

                                      {etapa.observacoes && (
                                        <span className="text-[10px] text-theme-weak italic truncate hidden sm:block">
                                          - {etapa.observacoes}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-theme-weak w-full">
                                      <div className="flex items-center gap-1 font-semibold">
                                        <div className="w-4 h-4 rounded-none bg-aldebaran-gold flex items-center justify-center text-white font-bold text-[8px]">
                                          {obterIniciais(etapa.responsavel)}
                                        </div>
                                        <span className="text-theme-normal">{etapa.responsavel}</span>
                                      </div>

                                      <div className="flex items-center gap-1 text-theme-weak">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Início: <span className="font-semibold text-theme-normal">{formatarData(etapa.data_inicio)}</span></span>
                                      </div>
                                      <div className="flex items-center gap-1 text-theme-weak">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Prazo: <span className="font-semibold text-theme-normal">{formatarData(etapa.data_termino)}</span></span>
                                      </div>
                                      {etapa.data_conclusao && (
                                        <div className="flex items-center gap-1 text-emerald-500">
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Término Real: <span className="font-semibold">{formatarData(etapa.data_conclusao)}</span></span>
                                        </div>
                                      )}
                                      <div className="ml-auto">
                                        {calcularBadgeAtraso(etapa)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lado Direito: Progresso e Ações */}
                                  <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0 border-t xl:border-t-0 border-aldebaran-border pt-3 xl:pt-0">
                                    {/* Botão de Concluir / Desfazer */}
                                    <div className="flex items-center gap-3 w-32 sm:w-48 justify-end">
                                      {progressoCem === 100 ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                            <Check className="w-4 h-4" /> Finalizado
                                          </span>
                                          {user?.role === 'admin' && (
                                            <button
                                              onClick={() => handleProgressoSlider(etapa, 0)}
                                              className="text-[10px] text-theme-weak hover:text-rose-400 underline transition"
                                              title="Desfazer e marcar como Pendente"
                                            >
                                              Desfazer
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-theme-weak">Pendente</span>
                                          {user?.role === 'admin' && (
                                            <button
                                              onClick={() => handleConcluirEtapa(etapa)}
                                              className="px-3 py-1.5 bg-transparent border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-none text-[11px] font-bold transition flex items-center gap-1"
                                              title="Marcar tarefa como Concluída"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                              Concluir
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Ações */}
                                    {user?.role === 'admin' && (
                                      <div className="flex items-center gap-1 pl-3 border-l border-aldebaran-border">
                                        <button
                                          onClick={() => abrirModalEditarEtapa(etapa)}
                                          className="p-1 hover:bg-aldebaran-gray text-theme-weak hover:text-theme-normal rounded-none transition"
                                          title="Editar"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleExcluirEtapa(etapa.id, etapa.nome_tarefa)}
                                          className="p-1 hover:bg-transparent text-theme-weak hover:text-rose-500 rounded-none transition"
                                          title="Remover"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>


                              </div>
                            );
                          })
                        ) : (
                          <div className="py-4 border border-dashed border-aldebaran-border rounded-none flex items-center justify-center text-xs text-theme-weak italic">
                            Sem etapas adicionadas a esta fase. Clique em "+ Adicionar Etapa".
                          </div>
                        )}
                      </div>
                    )} {/* fim condicional fasesExpandidas */}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-8 border border-dashed border-aldebaran-border rounded-none flex flex-col items-center justify-center text-theme-weak gap-2">
            <p className="text-sm font-medium">Este contrato não possui nenhuma fase cadastrada.</p>
            {user?.role === 'admin' && (
              <button onClick={abrirModalCriarFase} className="px-3 py-1.5 bg-aldebaran-gray text-theme-strong rounded-none hover:bg-aldebaran-gray text-xs font-semibold">Criar Primeira Fase</button>
            )}
          </div>
        )}

        {/* BOTÃO ADICIONAR FASE NO FINAL */}
        {contrato.fases && contrato.fases.length > 0 && user?.role === 'admin' && (
          <button
            onClick={abrirModalCriarFase}
            className="w-full py-3 bg-aldebaran-dark hover:bg-aldebaran-gray border border-dashed border-aldebaran-border hover:border-aldebaran-border rounded-none text-xs font-bold text-theme-weak hover:text-theme-normal transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Nova Fase ao Cronograma
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🛡️ MODAIS DE INTERAÇÃO */}

      {/* 1. MODAL EDITAR CONTRATO */}
      {modalContratoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none w-full max-w-2xl overflow-hidden shadow-md">
            <div className="p-5 border-b border-aldebaran-border flex justify-between items-center bg-aldebaran-dark/40">
              <h3 className="text-base font-bold text-theme-strong flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-aldebaran-goldDark" />
                Editar Informações Gerais do Contrato
              </h3>
              <button
                onClick={() => setModalContratoAberto(false)}
                className="text-theme-weak hover:text-theme-strong transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarContrato} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Nome do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={editContratoForm.nome_projeto || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, nome_projeto: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Cliente *</label>
                  <input
                    type="text"
                    required
                    value={editContratoForm.cliente || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, cliente: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Empresa *</label>
                  <input
                    type="text"
                    required
                    value={editContratoForm.empresa || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, empresa: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Diretor do Projeto *</label>
                  <select
                    required
                    value={editContratoForm.diretor_projeto || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, diretor_projeto: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  >
                    {responsaveis.map(r => (
                      <option key={r.id} value={r.nome} className="bg-aldebaran-dark">{r.nome} ({r.cargo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Área *</label>
                  <select
                    required
                    name="area_id"
                    value={editContratoForm.area_id || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, area_id: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  >
                    {areas.map(a => (
                      <option key={a.id} value={a.id} className="bg-aldebaran-dark">{formatArea(a.nome)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Direitos Minerários</label>
                  <input
                    type="text"
                    value={editContratoForm.direitos_minerarios || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, direitos_minerarios: e.target.value })}
                    placeholder="ex: 831.199/2025"
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Dias de Campo Total</label>
                  <input
                    type="number"
                    value={editContratoForm.dias_campo_total === 0 ? '' : editContratoForm.dias_campo_total}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, dias_campo_total: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editContratoForm.valor_total === 0 ? '' : editContratoForm.valor_total}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, valor_total: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Gasto Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editContratoForm.gasto_total === 0 ? '' : editContratoForm.gasto_total}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, gasto_total: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Data Início</label>
                  <input
                    type="date"
                    value={editContratoForm.data_inicio ? editContratoForm.data_inicio.split('T')[0] : ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, data_inicio: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Data Entrega Final</label>
                  <input
                    type="date"
                    value={editContratoForm.data_entrega_final ? editContratoForm.data_entrega_final.split('T')[0] : ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, data_entrega_final: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Observações</label>
                  <textarea
                    value={editContratoForm.observacoes || ''}
                    onChange={(e) => setEditContratoForm({ ...editContratoForm, observacoes: e.target.value })}
                    rows="3"
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-aldebaran-border">
                <button
                  type="button"
                  onClick={() => setModalContratoAberto(false)}
                  className="px-4 py-2 bg-transparent border border-aldebaran-border hover:bg-aldebaran-dark text-theme-normal rounded-none text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-xs transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL ADICIONAR / EDITAR FASE */}
      {modalFaseAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none w-full max-w-md overflow-hidden shadow-md">
            <div className="p-5 border-b border-aldebaran-border flex justify-between items-center bg-aldebaran-dark/40">
              <h3 className="text-base font-bold text-theme-strong flex items-center gap-2">
                {faseForm.id ? <Edit3 className="w-5 h-5 text-aldebaran-goldDark" /> : <Plus className="w-5 h-5 text-aldebaran-goldDark" />}
                {faseForm.id ? 'Editar Fase do Cronograma' : 'Criar Nova Fase do Cronograma'}
              </h3>
              <button
                onClick={() => setModalFaseAberto(false)}
                className="text-theme-weak hover:text-theme-strong transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarFase} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-theme-weak block mb-1">Nome da Fase *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fase 4 - Licenciamento Ambiental"
                  value={faseForm.nome_fase}
                  onChange={(e) => setFaseForm({ ...faseForm, nome_fase: e.target.value })}
                  className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-weak block mb-1">Ordem / Posição</label>
                <input
                  type="number"
                  value={faseForm.ordem}
                  onChange={(e) => setFaseForm({ ...faseForm, ordem: e.target.value })}
                  className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-aldebaran-border">
                <button
                  type="button"
                  onClick={() => setModalFaseAberto(false)}
                  className="px-4 py-2 bg-transparent border border-aldebaran-border hover:bg-aldebaran-dark text-theme-normal rounded-none text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-xs transition flex items-center gap-1.5"
                >
                  {faseForm.id ? 'Salvar Alterações' : 'Criar Fase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL ADICIONAR / EDITAR ETAPA */}
      {modalEtapaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none w-full max-w-xl overflow-hidden shadow-md">
            <div className="p-5 border-b border-aldebaran-border flex justify-between items-center bg-aldebaran-dark/40">
              <h3 className="text-base font-bold text-theme-strong flex items-center gap-2">
                {etapaForm.id ? <Edit3 className="w-5 h-5 text-aldebaran-goldDark" /> : <Plus className="w-5 h-5 text-aldebaran-goldDark" />}
                {etapaForm.id ? 'Editar Etapa / Tarefa' : 'Adicionar Nova Etapa / Tarefa'}
              </h3>
              <button
                onClick={() => setModalEtapaAberto(false)}
                className="text-theme-weak hover:text-theme-strong transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEtapa} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-theme-weak block mb-1">Nome da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Coleta de amostras de solo"
                  value={etapaForm.nome_tarefa}
                  onChange={(e) => setEtapaForm({ ...etapaForm, nome_tarefa: e.target.value })}
                  className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Responsável *</label>
                  <select
                    required
                    value={etapaForm.responsavel}
                    onChange={(e) => setEtapaForm({ ...etapaForm, responsavel: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  >
                    {responsaveis.map(r => (
                      <option key={r.id} value={r.nome} className="bg-aldebaran-dark">{r.nome} ({r.cargo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Status da Tarefa</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setEtapaForm({ ...etapaForm, progresso: etapaForm.progresso === 100 ? 0 : 100 })}
                      className={`px-4 py-2 border rounded-none text-xs font-bold transition flex items-center gap-2 w-full justify-center ${etapaForm.progresso === 100
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20'
                          : 'bg-transparent border-aldebaran-border text-theme-weak hover:text-theme-normal hover:border-theme-weak'
                        }`}
                    >
                      {etapaForm.progresso === 100 ? (
                        <>
                          <Check className="w-4 h-4" /> Concluído (Clique para Desfazer)
                        </>
                      ) : (
                        'Pendente (Clique para Concluir)'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Data Início</label>
                  <input
                    type="date"
                    value={etapaForm.data_inicio}
                    onChange={(e) => setEtapaForm({ ...etapaForm, data_inicio: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Data do Prazo</label>
                  <input
                    type="date"
                    value={etapaForm.data_termino}
                    onChange={(e) => setEtapaForm({ ...etapaForm, data_termino: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Data Conclusão Real</label>
                  <input
                    type="date"
                    value={etapaForm.data_conclusao}
                    onChange={(e) => setEtapaForm({ ...etapaForm, data_conclusao: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-weak block mb-1">Dias Previstos</label>
                  <input
                    type="number"
                    value={etapaForm.dias_previstos}
                    onChange={(e) => setEtapaForm({ ...etapaForm, dias_previstos: e.target.value })}
                    className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                  />
                </div>


              </div>

              <div>
                <label className="text-xs font-semibold text-theme-weak block mb-1">Observações da Tarefa</label>
                <textarea
                  value={etapaForm.observacoes}
                  onChange={(e) => setEtapaForm({ ...etapaForm, observacoes: e.target.value })}
                  rows="2"
                  placeholder="Instruções ou andamento específico da tarefa..."
                  className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-aldebaran-border">
                <button
                  type="button"
                  onClick={() => setModalEtapaAberto(false)}
                  className="px-4 py-2 bg-transparent border border-aldebaran-border hover:bg-aldebaran-dark text-theme-normal rounded-none text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-xs transition flex items-center gap-1.5"
                >
                  {etapaForm.id ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {modalExcluirAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-aldebaran-gray border border-aldebaran-border w-full max-w-md p-6 rounded-none shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setModalExcluirAberto(false)}
              className="absolute top-4 right-4 text-theme-weak hover:text-theme-strong transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mb-6 mt-2">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-strong">Excluir Contrato</h2>
                <p className="text-theme-weak text-sm mt-2 leading-relaxed">
                  Deseja realmente excluir este contrato? Esta ação é <strong className="text-rose-500">irreversível</strong> e apagará todas as fases, etapas e históricos associados.
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-aldebaran-border">
              <button
                onClick={() => setModalExcluirAberto(false)}
                className="flex-1 py-2.5 bg-transparent border border-aldebaran-border hover:bg-aldebaran-dark text-theme-normal rounded-none text-sm font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusaoContrato}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-none text-sm transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetalheContrato;
