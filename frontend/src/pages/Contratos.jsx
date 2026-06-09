import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { getContratos, getAreasAtuacao } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const Contratos = () => {
  const navigate = useNavigate();
  const { area } = useParams(); // 'topografia', 'geologia', ou undefined
  const { user } = useAuth();

  const [contratos, setContratos] = useState([]);
  const [areasOptions, setAreasOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [busca, setBusca] = useState('');
  
  // Função para transformar a URL "meio-ambiente" em "Meio Ambiente"
  const formatUrlArea = (urlArea) => {
    if (!urlArea) return 'Todas';
    return urlArea.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Função para formatar o nome da área para exibição mais limpa
  const formatAreaExibicao = (areaNome) => {
    if (!areaNome || areaNome === 'Todas') return 'Todas';
    return areaNome
      .split('-')
      .join(' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const initialArea = formatUrlArea(area);
  const [filtroArea, setFiltroArea] = useState(initialArea);
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Atualizar filtro quando a URL muda pela Sidebar
  useEffect(() => {
    setFiltroArea(formatUrlArea(area));
  }, [area]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [data, areasData] = await Promise.all([getContratos(), getAreasAtuacao()]);
        setContratos(data);
        setAreasOptions(areasData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar contratos:', err);
        setError('Não foi possível conectar à API local. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const dataApenas = dataStr.split('T')[0];
    const partes = dataApenas.split('-');
    if (partes.length < 3) return dataStr;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
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

  const contratosFiltrados = contratos.filter(c => {
    const matchBusca = 
      c.nome_projeto.toLowerCase().includes(busca.toLowerCase()) || 
      c.cliente.toLowerCase().includes(busca.toLowerCase());
    
    const areaNome = c.area_atuacao ? c.area_atuacao.nome : 'Desconhecida';
    const matchArea = 
      filtroArea === 'Todas' || 
      areaNome.toLowerCase() === filtroArea.toLowerCase() ||
      areaNome.toLowerCase().replace(/\s+/g, '-') === filtroArea.toLowerCase().replace(/\s+/g, '-');
    const matchStatus = filtroStatus === 'Todos' || c.status === filtroStatus;

    return matchBusca && matchArea && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-fade-in text-theme-strong">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aldebaran-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 font-title">
            <FolderOpen className="text-aldebaran-gold w-8 h-8" />
            Contratos: {filtroArea !== 'Todas' ? formatAreaExibicao(filtroArea) : 'Todos os Projetos'}
          </h1>
          <p className="text-theme-weak text-xs mt-1">
            Gerencie e acompanhe os detalhes operacionais dos contratos
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/contratos/novo')}
            className="px-4 py-2 bg-aldebaran-gold hover:bg-aldebaran-goldDark text-aldebaran-dark rounded-none font-bold text-sm transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            Novo Contrato
          </button>
        )}
      </div>

      {error && (
        <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* FILTROS E TABELA */}
      <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none shadow-sm overflow-hidden">
        
        {/* FILTROS */}
        <div className="p-5 border-b border-aldebaran-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-aldebaran-dark0">
          
          {/* Busca textual */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-theme-weak" />
            <input
              type="text"
              placeholder="Buscar projeto ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong placeholder-slate-500 focus:outline-none focus:border-aldebaran-gold transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtrar por Área */}
            <div className="flex items-center gap-2 bg-aldebaran-dark px-3 py-1.5 rounded-none border border-aldebaran-border">
              <Filter className="w-3.5 h-3.5 text-theme-weak" />
              <select
                value={
                  filtroArea === 'Todas'
                    ? 'Todas'
                    : (areasOptions.find(a => 
                        a.nome.toLowerCase() === filtroArea.toLowerCase() || 
                        a.nome.toLowerCase().replace(/\s+/g, '-') === filtroArea.toLowerCase().replace(/\s+/g, '-')
                      )?.nome || filtroArea)
                }
                onChange={(e) => setFiltroArea(e.target.value)}
                className="bg-transparent text-xs text-theme-normal focus:outline-none cursor-pointer"
              >
                <option value="Todas" className="bg-aldebaran-dark">Todas as Áreas</option>
                {areasOptions.map(a => (
                  <option key={a.id} value={a.nome} className="bg-aldebaran-dark">{formatAreaExibicao(a.nome)}</option>
                ))}
              </select>
            </div>

            {/* Filtrar por Status */}
            <div className="flex items-center gap-2 bg-aldebaran-dark px-3 py-1.5 rounded-none border border-aldebaran-border">
              <Clock className="w-3.5 h-3.5 text-theme-weak" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="bg-transparent text-xs text-theme-normal focus:outline-none cursor-pointer"
              >
                <option value="Todos" className="bg-aldebaran-dark">Todos os Status</option>
                <option value="no_prazo" className="bg-aldebaran-dark">No prazo</option>
                <option value="atencao" className="bg-aldebaran-dark">Atenção</option>
                <option value="atrasado" className="bg-aldebaran-dark">Atrasado</option>
                <option value="concluido" className="bg-aldebaran-dark">Concluído</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRID DE CARDS (Substituindo a tabela com rolagem horizontal) */}
        <div className="p-5">
          {contratosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {contratosFiltrados.map((contrato) => {
                const diasRestantes = calcularDiasRestantes(contrato.data_entrega_final);
                return (
                  <div 
                    key={contrato.id} 
                    className="bg-aldebaran-dark border border-aldebaran-border rounded-none p-4 hover:border-aldebaran-gold/50 transition-all flex flex-col justify-between group"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-2">
                        <h3 className="font-bold text-theme-strong text-base group-hover:text-aldebaran-gold transition-colors line-clamp-1" title={contrato.nome_projeto}>
                          {contrato.nome_projeto}
                        </h3>
                        <p className="text-theme-weak text-xs font-medium mt-0.5 line-clamp-1">{contrato.cliente}</p>
                      </div>
                      <StatusBadge status={contrato.status} />
                    </div>

                    {/* Informações Centrais */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider text-aldebaran-gold border border-aldebaran-gold/20`}>
                          {contrato.area_atuacao ? contrato.area_atuacao.nome : 'Sem Área'}
                        </span>
                        <span className="text-xs text-theme-weak truncate">{contrato.diretor_projeto}</span>
                      </div>
                      
                      <div className="bg-aldebaran-dark0 rounded-none p-2.5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-theme-weak">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatarData(contrato.data_entrega_final)}</span>
                        </div>
                        <div className="font-mono font-bold">
                          {contrato.status === 'concluido' ? (
                            <span className="text-emerald-400">Concluído</span>
                          ) : diasRestantes !== null ? (
                            diasRestantes < 0 ? (
                              <span className="text-rose-500">Atrasado ({Math.abs(diasRestantes)}d)</span>
                            ) : (
                              <span className="text-theme-normal">{diasRestantes} dias</span>
                            )
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="mt-auto pt-3 border-t border-aldebaran-border">
                      <button
                        onClick={() => navigate(`/contratos/${contrato.id}`)}
                        className="w-full py-2 bg-transparent hover:bg-aldebaran-gold text-theme-normal hover:text-aldebaran-dark rounded-none text-xs font-bold border border-aldebaran-border hover:border-transparent transition-all flex items-center justify-center gap-2"
                      >
                        Ver Detalhes do Contrato
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-theme-weak gap-3 bg-aldebaran-dark rounded-none border border-dashed border-aldebaran-border">
              <FolderOpen className="w-12 h-12 text-theme-normal" />
              <p className="text-sm font-medium">Nenhum contrato encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contratos;
