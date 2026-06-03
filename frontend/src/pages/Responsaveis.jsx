import React, { useState, useEffect } from 'react';
import { 
 Users, 
 Plus, 
 Edit3, 
 Trash2, 
 UserCheck, 
 UserX,
 Briefcase, 
 ShieldAlert,
 Save, 
 X,
 Layers,
 MapPin,
 FileText
} from 'lucide-react';
import { 
 getResponsaveis, 
 createResponsavel, 
 updateResponsavel, 
 deleteResponsavel, 
 getContratos 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const Responsaveis = () => {
 const { user } = useAuth();
 const [responsaveis, setResponsaveis] = useState([]);
 const [contratos, setContratos] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 
 // Estados do Modal
 const [modalAberto, setModalAberto] = useState(false);
 const [editandoId, setEditandoId] = useState(null);
 
 // Estado do Formulário
 const [form, setForm] = useState({
 nome: '',
 cargo: 'Campo',
 area: 'Topografia'
 });
 
 const [erroForm, setErroForm] = useState('');

 const carregarDados = async () => {
 try {
 setLoading(true);
 const [listaResponsaveis, listaContratos] = await Promise.all([
 getResponsaveis(),
 getContratos()
 ]);
 setResponsaveis(listaResponsaveis);
 setContratos(listaContratos);
 setError(null);
 } catch (err) {
 console.error('Erro ao carregar colaboradores:', err);
 setError('Erro ao se conectar com o servidor local.');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 carregarDados();
 }, []);

 // Avatar com iniciais
 const obterIniciais = (nome) => {
 if (!nome) return 'U';
 const partes = nome.split(' ');
 if (partes.length > 1) {
 return (partes[0][0] + partes[1][0]).toUpperCase();
 }
 return nome.slice(0, 2).toUpperCase();
 };

 // --- ESTATÍSTICAS E CONSOLIDADOS ---
 
 // Contratos Ativos de um Responsável
 const obterContratosAtivosCount = (nomeResponsavel) => {
 // Retorna a quantidade de contratos em andamento onde este colaborador é Diretor
 // ou possui pelo menos uma etapa pendente (progresso < 100%)
 const contratosEnvolvidos = contratos.filter(c => {
 if (c.status === 'concluido') return false;
 
 const ehDiretor = c.diretor_projeto === nomeResponsavel;
 
 const possuiEtapaPendente = c.fases?.some(f => 
 f.etapas?.some(e => e.responsavel === nomeResponsavel && e.progresso < 1.0)
 );

 return ehDiretor || possuiEtapaPendente;
 });

 return contratosEnvolvidos.length;
 };

 // Contagem de Etapas Vinculadas (Total para o alerta de exclusão)
 const obterEtapasVinculadasCount = (nomeResponsavel) => {
 let totalEtapas = 0;
 contratos.forEach(c => {
 c.fases?.forEach(f => {
 f.etapas?.forEach(e => {
 if (e.responsavel === nomeResponsavel) {
 totalEtapas++;
 }
 });
 });
 });
 return totalEtapas;
 };

 // Estatísticas de Contagem por Área
 const totalTopografia = responsaveis.filter(r => r.area === 'Topografia' || r.area === 'Todas').length;
 const totalGeologia = responsaveis.filter(r => r.area === 'Geologia' || r.area === 'Todas').length;
 const totalAdministrativo = responsaveis.filter(r => r.area === 'Administrativo' || r.area === 'Todas').length;

 // --- OPERAÇÕES ---

 // Abrir Criar
 const abrirCriarModal = () => {
 setEditandoId(null);
 setForm({ nome: '', cargo: 'Campo', area: 'Topografia' });
 setErroForm('');
 setModalAberto(true);
 };

 // Abrir Editar
 const abrirEditarModal = (colaborador) => {
 setEditandoId(colaborador.id);
 setForm({
 nome: colaborador.nome,
 cargo: colaborador.cargo,
 area: colaborador.area
 });
 setErroForm('');
 setModalAberto(true);
 };

 // Salvar Formulário (Criar ou Editar)
 const handleSalvar = async (e) => {
 e.preventDefault();
 setErroForm('');

 if (!form.nome.trim()) {
 setErroForm('O nome do colaborador é obrigatório.');
 return;
 }

 try {
 if (editandoId) {
 // Editar colaborador existente
 await updateResponsavel(editandoId, form);
 } else {
 // Criar novo
 await createResponsavel(form);
 }
 setModalAberto(false);
 carregarDados();
 } catch (err) {
 console.error('Erro ao salvar colaborador:', err);
 if (err.response && err.response.data && err.response.data.detail) {
 setErroForm(err.response.data.detail);
 } else {
 setErroForm('Erro ao salvar colaborador. Verifique a conexão.');
 }
 }
 };

 // Excluir Colaborador
 const handleExcluir = async (colaborador) => {
 const etapasVinculadas = obterEtapasVinculadasCount(colaborador.nome);
 
 let mensagemConfirmacao = `Deseja realmente remover o colaborador "${colaborador.nome}" da equipe?`;
 
 if (etapasVinculadas > 0) {
 mensagemConfirmacao = `ATENÇÃO: Este responsável está vinculado a ${etapasVinculadas} etapa(s) de contratos ativos!\nRemovê-lo fará com que essas etapas percam a associação com seu nome.\nDeseja realmente continuar?`;
 }

 if (window.confirm(mensagemConfirmacao)) {
 try {
 await deleteResponsavel(colaborador.id);
 carregarDados();
 } catch (err) {
 console.error('Erro ao excluir colaborador:', err);
 alert('Erro ao excluir o colaborador da equipe.');
 }
 }
 };

 if (loading && responsaveis.length === 0) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-aldebaran-dark text-theme-strong">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-aldebaran-gold border-t-transparent rounded-full animate-spin"></div>
 <p className="text-theme-weak font-medium">Carregando quadro de colaboradores...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-fade-in text-theme-strong">
 
 {/* CABEÇALHO */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aldebaran-border pb-4">
 <div>
 <h1 className="text-2xl font-extrabold flex items-center gap-3">
 <Users className="text-aldebaran-goldDark w-8 h-8" />
 Gerenciamento de Equipe
 </h1>
 <p className="text-theme-weak text-xs mt-1">
 Cadastre e gerencie a lista de colaboradores qualificados para as atividades de campo e escritório
 </p>
 </div>

 {user?.role === 'admin' && (
 <button
 onClick={abrirCriarModal}
 className="px-4 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center gap-2 self-start sm:self-auto"
 >
 <Plus className="w-4 h-4" />
 Novo Responsável
 </button>
 )}
 </div>

 {/* ERROS DE CONEXÃO */}
 {error && (
 <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-4 flex items-start gap-3">
 <ShieldAlert className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
 <p className="text-rose-300 text-xs">{error}</p>
 </div>
 )}

 {/* CARDS DE RESUMO POR ÁREA */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 
 {/* Topografia */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-5 rounded-none flex items-center justify-between shadow-sm">
 <div>
 <span className="text-xs font-semibold uppercase text-theme-weak tracking-wider">Equipe Topografia</span>
 <h2 className="text-3xl font-extrabold text-aldebaran-gold mt-1">{totalTopografia}</h2>
 </div>
 <div className="p-3 bg-aldebaran-gold/10 rounded-none text-aldebaran-gold">
 <MapPin className="w-5 h-5" />
 </div>
 </div>

 {/* Geologia */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-5 rounded-none flex items-center justify-between shadow-sm">
 <div>
 <span className="text-xs font-semibold uppercase text-theme-weak tracking-wider">Equipe Geologia</span>
 <h2 className="text-3xl font-extrabold text-yellow-400 mt-1">{totalGeologia}</h2>
 </div>
 <div className="p-3 bg-transparent text-yellow-500 rounded-none text-yellow-400">
 <Layers className="w-5 h-5" />
 </div>
 </div>

 {/* Administrativo */}
 <div className="bg-aldebaran-gray border border-aldebaran-border p-5 rounded-none flex items-center justify-between shadow-sm">
 <div>
 <span className="text-xs font-semibold uppercase text-theme-weak tracking-wider">Administrativo / Outros</span>
 <h2 className="text-3xl font-extrabold text-emerald-400 mt-1">{totalAdministrativo}</h2>
 </div>
 <div className="p-3 bg-transparent text-emerald-500 rounded-none text-emerald-400">
 <FileText className="w-5 h-5" />
 </div>
 </div>

 </div>

 {/* LISTA DE RESPONSÁVEIS */}
 <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 {responsaveis.length > 0 ? (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-aldebaran-dark/40 border-b border-aldebaran-border text-xs font-semibold uppercase tracking-wider text-theme-weak">
 <th className="py-4 px-5">Colaborador</th>
 <th className="py-4 px-5">Cargo / Função</th>
 <th className="py-4 px-5">Área de Atuação</th>
 <th className="py-4 px-5 text-center">Contratos Ativos</th>
 {user?.role === 'admin' && <th className="py-4 px-5 text-center">Ações</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-sm">
 {responsaveis.map((resp) => {
 const contratosAtivos = obterContratosAtivosCount(resp.nome);
 return (
 <tr key={resp.id} className="hover:bg-aldebaran-gray/20 transition-colors">
 
 {/* Avatar e Nome */}
 <td className="py-4 px-5">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-aldebaran-gold text-white border border-aldebaran-border flex items-center justify-center font-bold text-xs select-none">
 {obterIniciais(resp.nome)}
 </div>
 <span className="font-bold text-theme-strong text-base">{resp.nome}</span>
 </div>
 </td>

 {/* Cargo */}
 <td className="py-4 px-5">
 <span className="text-theme-normal font-semibold">{resp.cargo}</span>
 </td>

 {/* Área */}
 <td className="py-4 px-5">
 <span className={`px-2 py-0.5 rounded-none text-xs font-bold ${
 resp.area === 'Topografia' 
 ? 'bg-aldebaran-gold/10 text-aldebaran-gold' 
 : resp.area === 'Geologia'
 ? 'bg-transparent text-yellow-500 text-yellow-400'
 : resp.area === 'Administrativo'
 ? 'bg-transparent text-emerald-500 text-emerald-400'
 : 'bg-aldebaran-dark0/10 text-theme-weak'
 }`}>
 {resp.area}
 </span>
 </td>

 {/* Contratos Ativos */}
 <td className="py-4 px-5 text-center font-mono">
 {contratosAtivos > 0 ? (
 <span className="px-2 py-0.5 text-aldebaran-gold text-xs font-semibold rounded-none font-bold">
 {contratosAtivos} ativo(s)
 </span>
 ) : (
 <span className="text-theme-weak italic text-xs">Sem projetos</span>
 )}
 </td>

 {/* Ações */}
 {user?.role === 'admin' && (
 <td className="py-4 px-5">
 <div className="flex items-center justify-center gap-2">
 <button
 onClick={() => abrirEditarModal(resp)}
 className="p-2 hover:bg-aldebaran-gray text-theme-weak hover:text-theme-normal rounded-none transition"
 title="Editar Dados"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 
 {/* Impede a exclusão do "Robson Ribeiro" padrão se desejado, ou deixa livre com aviso */}
 <button
 onClick={() => handleExcluir(resp)}
 className="p-2 hover:bg-transparent text-rose-500 text-theme-weak hover:text-rose-400 rounded-none transition"
 title="Remover Colaborador"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 )}

 </tr>
 );
 })}
 </tbody>
 </table>
 ) : (
 <div className="py-12 flex flex-col items-center justify-center text-theme-weak gap-3">
 <UserX className="w-12 h-12 text-theme-normal " />
 <p className="text-sm font-medium">Nenhum colaborador cadastrado. Clique em "+ Novo Responsável".</p>
 </div>
 )}
 </div>
 </div>

 {/* ======================================================== */}
 {/* 🛡️ MODAL ADICIONAR / EDITAR RESPONSÁVEL */}
 {modalAberto && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
 <div className="bg-aldebaran-gray border border-aldebaran-border rounded-none w-full max-w-md overflow-hidden shadow-md">
 <div className="p-5 border-b border-aldebaran-border flex justify-between items-center bg-aldebaran-dark/40">
 <h3 className="text-base font-bold text-theme-strong flex items-center gap-2">
 {editandoId ? <Edit3 className="w-5 h-5 text-aldebaran-goldDark" /> : <Plus className="w-5 h-5 text-aldebaran-goldDark" />}
 {editandoId ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
 </h3>
 <button 
 onClick={() => setModalAberto(false)}
 className="text-theme-weak hover:text-theme-strong transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSalvar} className="p-5 space-y-4">
 
 {erroForm && (
 <div className="bg-transparent text-rose-500 border border-rose-500/20 rounded-none p-3 flex items-start gap-2 text-rose-400 text-xs">
 <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
 <p>{erroForm}</p>
 </div>
 )}

 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Nome Completo *</label>
 <input 
 type="text" 
 required
 placeholder="ex: Robson Ribeiro"
 value={form.nome}
 onChange={(e) => setForm({...form, nome: e.target.value})}
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold"
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Cargo / Função *</label>
 <select 
 value={form.cargo}
 onChange={(e) => setForm({...form, cargo: e.target.value})}
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold cursor-pointer"
 >
 <option value="Diretor" className="bg-aldebaran-dark">Diretor</option>
 <option value="Coordenador" className="bg-aldebaran-dark">Coordenador</option>
 <option value="Campo" className="bg-aldebaran-dark">Técnico de Campo</option>
 <option value="Financeiro" className="bg-aldebaran-dark">Financeiro</option>
 <option value="Outro" className="bg-aldebaran-dark">Outro</option>
 </select>
 </div>

 <div>
 <label className="text-xs font-semibold text-theme-weak block mb-1">Área Principal *</label>
 <select 
 value={form.area}
 onChange={(e) => setForm({...form, area: e.target.value})}
 className="w-full p-2.5 bg-aldebaran-dark border border-aldebaran-border rounded-none text-sm text-theme-strong focus:outline-none focus:border-aldebaran-gold cursor-pointer"
 >
 <option value="Topografia" className="bg-aldebaran-dark">Topografia</option>
 <option value="Geologia" className="bg-aldebaran-dark">Geologia</option>
 <option value="Administrativo" className="bg-aldebaran-dark">Administrativo</option>
 <option value="Todas" className="bg-aldebaran-dark">Todas as áreas</option>
 </select>
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t border-aldebaran-border">
 <button 
 type="button" 
 onClick={() => setModalAberto(false)}
 className="px-4 py-2 bg-transparent border border-aldebaran-border hover:bg-aldebaran-dark text-theme-normal rounded-none text-xs font-bold transition"
 >
 Cancelar
 </button>
 <button 
 type="submit" 
 className="px-4 py-2 bg-aldebaran-gold hover:opacity-90 text-white font-bold rounded-none text-xs transition flex items-center gap-1.5"
 >
 <Save className="w-3.5 h-3.5" />
 {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 </div>
 );
};

export default Responsaveis;
