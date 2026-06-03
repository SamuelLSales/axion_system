import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 ArrowLeft, 
 Briefcase, 
 User, 
 Calendar, 
 Check, 
 AlertCircle,
 FileText,
 Clock,
 MapPin,
 ListPlus
} from 'lucide-react';
import { createContrato, getResponsaveis, getAreasAtuacao } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const NovoContrato = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [responsaveis, setResponsaveis] = useState([]);
 const [diretores, setDiretores] = useState([]);
 const [areas, setAreas] = useState([]);
 const [loading, setLoading] = useState(true);
 const [errorMessage, setErrorMessage] = useState('');
 
 // Estado do formulário
 const [form, setForm] = useState({
 nome_projeto: '',
 cliente: '',
 empresa: 'AXION Sistemas',
 direitos_minerarios: '',
 area_id: '',
 diretor_projeto: '',
 data_inicio: '',
 data_entrega_final: '',
 dias_campo_total: 0,
 valor_total: 0.0,
 observacoes: ''
 });

 // Estado de validações inline
 const [erros, setErros] = useState({});

 useEffect(() => {
 const carregarDiretores = async () => {
 try {
 const lista = await getResponsaveis();
 setResponsaveis(lista);
 
 // Filtrar diretores para o select de diretor do projeto
 const filtrados = lista.filter(r => r.cargo.toLowerCase() === 'diretor');
 setDiretores(filtrados);
 
 // Definir primeiro diretor como default se houver
 if (filtrados.length > 0) {
 setForm(prev => ({ ...prev, diretor_projeto: filtrados[0].nome }));
 } else if (lista.length > 0) {
 setForm(prev => ({ ...prev, diretor_projeto: lista[0].nome }));
 }
 } catch (err) {
 console.error('Erro ao carregar dados:', err);
 } finally {
 setLoading(false);
 }
 };
 
 const carregarAreas = async () => {
   try {
     const listaAreas = await getAreasAtuacao();
     setAreas(listaAreas);
     if (listaAreas.length > 0) {
       setForm(prev => ({ ...prev, area_id: listaAreas[0].id }));
     }
   } catch (err) {
     console.error('Erro ao carregar áreas:', err);
   }
 };

 Promise.all([carregarDiretores(), carregarAreas()]);
 }, []);

 const validarFormulario = () => {
 const novosErros = {};
 
 if (!form.nome_projeto.trim()) novosErros.nome_projeto = 'Nome do projeto é obrigatório';
 if (!form.cliente.trim()) novosErros.cliente = 'Nome do cliente é obrigatório';
 if (!form.empresa.trim()) novosErros.empresa = 'Empresa responsável é obrigatória';
 if (!form.area_id) novosErros.area_id = 'Selecione uma área de atuação (Cadastre em Configurações caso esteja vazio)';
 if (!form.diretor_projeto) novosErros.diretor_projeto = 'Selecione um diretor para o projeto';
 
 if (form.data_inicio && form.data_entrega_final) {
 const inicio = new Date(form.data_inicio);
 const fim = new Date(form.data_entrega_final);
 if (fim < inicio) {
 novosErros.data_entrega_final = 'A data de entrega final não pode ser anterior à data de início';
 }
 }

 setErros(novosErros);
 return Object.keys(novosErros).length === 0;
 };

 const handleInputChange = (e) => {
 const { name, value } = e.target;
 setForm(prev => ({ ...prev, [name]: value }));
 
 // Limpar erro do campo modificado
 if (erros[name]) {
 setErros(prev => ({ ...prev, [name]: null }));
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setErrorMessage('');
 
 if (!validarFormulario()) {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 return;
 }

 try {
 // Ajustar formato de datas
 const payload = {
 ...form,
 data_inicio: form.data_inicio ? new Date(form.data_inicio).toISOString() : null,
 data_entrega_final: form.data_entrega_final ? new Date(form.data_entrega_final).toISOString() : null,
 dias_campo_total: parseInt(form.dias_campo_total) || 0,
 valor_total: parseFloat(form.valor_total) || 0.0
 };

 const contratoCriado = await createContrato(payload);
 
 // Redireciona para a página de detalhes do novo contrato criado
 navigate(`/contratos/${contratoCriado.id}`);
 } catch (err) {
 console.error('Erro ao salvar contrato:', err);
 setErrorMessage('Não foi possível salvar o contrato. Verifique os dados digitados ou a conexão do servidor.');
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 };

 if (user?.role !== 'admin') {
   return <Navigate to="/contratos" replace />;
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-aldebaran-dark text-theme-strong">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
 <p className="text-theme-weak font-medium">Carregando dados necessários...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="p-6 space-y-6 max-w-[900px] mx-auto animate-fade-in text-theme-strong">
 
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* CABEÇALHO */}
 <div className="flex items-center justify-between border-b border-aldebaran-border pb-4">
 <div className="space-y-1">
 <button 
 type="button"
 onClick={() => navigate('/dashboard')}
 className="flex items-center gap-2 text-theme-weak hover:text-theme-strong transition-all text-xs font-semibold group mb-2"
 >
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Voltar ao Dashboard
 </button>
 <h1 className="text-2xl font-extrabold flex items-center gap-2">
 <Briefcase className="text-aldebaran-goldDark w-7 h-7" />
 Cadastrar Novo Contrato
 </h1>
 <p className="text-theme-weak text-xs">
 Insira os dados técnicos para iniciar o acompanhamento e gerar o cronograma
 </p>
 </div>
 
 <div className="hidden sm:flex gap-3">
   <button
     type="submit"
     className="px-6 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center gap-1.5"
   >
     <Check className="w-4 h-4" />
     Criar Contrato
   </button>
 </div>
 </div>

 {errorMessage && (
 <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-4 flex items-start gap-3">
 <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
 <p className="text-rose-300 text-xs">{errorMessage}</p>
 </div>
 )}
 
 {/* SEÇÃO 1 — DADOS DO CONTRATO */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-6 rounded-none space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-aldebaran-gold flex items-center gap-2 border-b border-aldebaran-border/60 pb-2">
 <FileText className="w-4 h-4" />
 1. Dados Gerais do Projeto
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Nome do Projeto */}
 <div className="col-span-1 md:col-span-2">
 <label className="text-xs font-semibold text-theme-weak block mb-1">Nome do Projeto *</label>
 <input 
 type="text"
 name="nome_projeto"
 value={form.nome_projeto}
 onChange={handleInputChange}
 placeholder="ex: Mapeamento Igaratinga MG"
 className={`w-full p-2.5 bg-aldebaran-dark border ${erros.nome_projeto ? 'border-rose-500' : 'border-aldebaran-border'} rounded-none text-sm placeholder-slate-600 focus:outline-none focus:border-aldebaran-gold`}
 />
 {erros.nome_projeto && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{erros.nome_projeto}</p>}
 </div>

 {/* Cliente */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Cliente *</label>
 <input 
 type="text"
 name="cliente"
 value={form.cliente}
 onChange={handleInputChange}
 placeholder="ex: Exbel"
 className={`w-full p-2.5 bg-aldebaran-dark border ${erros.cliente ? 'border-rose-500' : 'border-aldebaran-border'} rounded-none text-sm placeholder-slate-600 focus:outline-none focus:border-aldebaran-gold`}
 />
 {erros.cliente && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{erros.cliente}</p>}
 </div>

 {/* Empresa */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Empresa Executor *</label>
 <input 
 type="text"
 name="empresa"
 value={form.empresa}
 onChange={handleInputChange}
 className={`w-full p-2.5 bg-aldebaran-dark border ${erros.empresa ? 'border-rose-500' : 'border-aldebaran-border'} rounded-none text-sm focus:outline-none focus:border-aldebaran-gold`}
 />
 {erros.empresa && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{erros.empresa}</p>}
 </div>

 {/* Diretor do Projeto */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Diretor do Projeto *</label>
 <select 
 name="diretor_projeto"
 value={form.diretor_projeto}
 onChange={handleInputChange}
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm focus:outline-none focus:border-aldebaran-gold cursor-pointer"
 >
 {diretores.length > 0 ? (
 diretores.map(d => (
 <option key={d.id} value={d.nome} className="bg-aldebaran-dark">{d.nome}</option>
 ))
 ) : (
 responsaveis.map(r => (
 <option key={r.id} value={r.nome} className="bg-aldebaran-dark">{r.nome} ({r.cargo})</option>
 ))
 )}
 </select>
 </div>

 {/* Área de Atuação */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Área de Atuação *</label>
 <select 
 name="area_id"
 value={form.area_id}
 onChange={handleInputChange}
 className={`w-full p-2.5 bg-aldebaran-dark border ${erros.area_id ? 'border-rose-500' : 'border-aldebaran-border'} rounded-none text-sm focus:outline-none focus:border-aldebaran-gold cursor-pointer`}
 >
 {areas.length > 0 ? (
   areas.map(a => (
     <option key={a.id} value={a.id} className="bg-aldebaran-dark">{a.nome}</option>
   ))
 ) : (
   <option value="" disabled className="bg-aldebaran-dark">Nenhuma área cadastrada</option>
 )}
 </select>
 {erros.area_id && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{erros.area_id}</p>}
 </div>

 {/* Diretos Minerários */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Direitos Minerários</label>
 <input 
 type="text"
 name="direitos_minerarios"
 value={form.direitos_minerarios}
 onChange={handleInputChange}
 placeholder="ex: 831.199/2025"
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm placeholder-slate-600 focus:outline-none focus:border-aldebaran-gold font-mono"
 />
 </div>

 {/* Dias de Campo Total */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Previsão total de dias em campo</label>
 <input 
 type="number"
 name="dias_campo_total"
 value={form.dias_campo_total}
 onChange={handleInputChange}
 min="0"
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm focus:outline-none focus:border-aldebaran-gold"
 />
 </div>

 {/* Valor Total do Contrato */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Valor Total do Contrato (R$)</label>
 <input 
 type="number"
 name="valor_total"
 value={form.valor_total}
 onChange={handleInputChange}
 min="0"
 step="0.01"
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm focus:outline-none focus:border-aldebaran-gold"
 placeholder="ex: 150000.00"
 />
 </div>

 {/* Data Início */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Data de Início do Contrato</label>
 <div className="relative">
 <input 
 type="date"
 name="data_inicio"
 value={form.data_inicio}
 onChange={handleInputChange}
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm focus:outline-none focus:border-aldebaran-gold"
 />
 </div>
 </div>

 {/* Data Entrega Final */}
 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Data de Entrega Final</label>
 <div className="relative">
 <input 
 type="date"
 name="data_entrega_final"
 value={form.data_entrega_final}
 onChange={handleInputChange}
 className={`w-full p-2.5 bg-aldebaran-dark border ${erros.data_entrega_final ? 'border-rose-500' : 'border-aldebaran-border'} rounded-none text-sm focus:outline-none focus:border-aldebaran-gold`}
 />
 {erros.data_entrega_final && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{erros.data_entrega_final}</p>}
 </div>
 </div>

 {/* Observações */}
 <div className="col-span-1 md:col-span-2">
 <label className="text-xs font-semibold text-theme-weak block mb-1">Observações do Projeto</label>
 <textarea 
 name="observacoes"
 value={form.observacoes}
 onChange={handleInputChange}
 rows="3"
 placeholder="Insira detalhes adicionais do escopo, restrições locais de acesso, etc..."
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm placeholder-slate-600 focus:outline-none focus:border-aldebaran-gold"
 ></textarea>
 </div>
 </div>
 </div>

 {/* SEÇÃO 2 — TEMPLATE DE FASES DO CONTRATO */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-6 rounded-none space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-aldebaran-gold flex items-center gap-2 border-b border-aldebaran-border/60 pb-2">
 <ListPlus className="w-4 h-4" />
 2. Configuração do Cronograma (Template AXION)
 </h3>
 
 <div className="bg-aldebaran-dark/60 p-4 rounded-none border border-aldebaran-border/50 space-y-3">
 <p className="text-xs text-theme-normal leading-relaxed">
 Para otimizar o seu tempo, o contrato será automaticamente inicializado com o **Template Padrão de Prazos da AXION Sistemas**, contendo as seguintes fases de acompanhamento estruturadas:
 </p>
 
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold">
 <div className="p-3 bg-transparent border border-aldebaran-border text-theme-normal rounded-none flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
 Fase 1: Planejamento
 </div>
 <div className="p-3 bg-transparent border border-aldebaran-border text-theme-normal rounded-none flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
 Fase 2: Execução de Campo
 </div>
 <div className="p-3 bg-transparent border border-aldebaran-border text-theme-normal rounded-none flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
 Fase 3: Elaboração de Relatório
 </div>
 </div>

 <p className="text-[10px] text-theme-weak mt-1">
 * Nota: Após o cadastro, você poderá renomear, excluir ou adicionar novas fases e criar quantas tarefas (etapas) precisar diretamente na página de detalhes do contrato.
 </p>
 </div>
 </div>

 {/* SEÇÃO 3 — EQUIPE DISPONÍVEL */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-6 rounded-none space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-aldebaran-gold flex items-center gap-2 border-b border-aldebaran-border/60 pb-2">
 <User className="w-4 h-4" />
 3. Colaboradores Disponíveis para o Projeto
 </h3>
 
 <p className="text-xs text-theme-weak">
 Os seguintes profissionais cadastrados na base de dados estarão aptos a assumir responsabilidades no cronograma deste contrato:
 </p>

 <div className="flex flex-wrap gap-2 pt-1">
 {responsaveis.map((resp) => (
 <div 
 key={resp.id}
 className="px-3 py-1.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-xs flex items-center gap-2 font-medium"
 >
 <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50"></div>
 <div>
 <span className="text-theme-normal block">{resp.nome}</span>
 <span className="text-[10px] text-theme-weak block">{resp.cargo} | {resp.area}</span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* BOTÕES DE SALVAMENTO */}
 <div className="flex items-center justify-end gap-3 pt-2">
 <button 
  type="button"
  onClick={() => navigate('/dashboard')}
  className="px-6 py-[11px] bg-transparent border border-aldebaran-border text-theme-weak hover:text-theme-strong hover:bg-aldebaran-dark font-bold text-sm transition-all whitespace-nowrap"
 >
  Cancelar
 </button>
 
 <button
 type="submit"
 className="px-6 py-2.5 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center gap-1.5"
 >
 <Check className="w-4 h-4" />
 Criar Contrato
 </button>
 </div>

 </form>
 </div>
 );
};

export default NovoContrato;
