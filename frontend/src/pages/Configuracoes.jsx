import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Building, 
  Save, 
  AlertCircle, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { 
  updateProfile, 
  changePassword, 
  getCompanyDetails, 
  updateCompanyDetails 
} from '../services/api';

const Configuracoes = () => {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'seguranca' | 'empresa'
  
  // Profile State
  const [profileName, setProfileName] = useState(user?.nome || '');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Company State
  const [companyForm, setCompanyForm] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: ''
  });
  const [companyMessage, setCompanyMessage] = useState({ type: '', text: '' });
  const [companyLoading, setCompanyLoading] = useState(false);

  // Sync profile name when user context loads
  useEffect(() => {
    if (user) {
      setProfileName(user.nome);
    }
  }, [user]);

  // Load company details on tab switch
  useEffect(() => {
    if (activeTab === 'empresa' && user?.role === 'admin') {
      const fetchCompany = async () => {
        try {
          const data = await getCompanyDetails();
          setCompanyForm({
            nome_fantasia: data.nome_fantasia || '',
            razao_social: data.razao_social || '',
            cnpj: data.cnpj || ''
          });
        } catch (err) {
          console.error("Erro ao buscar dados da empresa:", err);
          setCompanyMessage({
            type: 'error',
            text: err.response?.data?.detail || 'Erro ao carregar dados da empresa.'
          });
        }
      };
      fetchCompany();
    }
  }, [activeTab, user]);

  // Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    
    if (!profileName.trim()) {
      setProfileMessage({ type: 'error', text: 'O nome não pode estar em branco.' });
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({ nome: profileName });
      await checkAuth(); // Refresh user info in context
      setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Erro ao atualizar perfil.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Preencha todos os campos de senha.' });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Erro ao alterar a senha.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setCompanyMessage({ type: '', text: '' });

    if (!companyForm.nome_fantasia.trim()) {
      setCompanyMessage({ type: 'error', text: 'O Nome Fantasia é obrigatório.' });
      return;
    }

    setCompanyLoading(true);
    try {
      const updated = await updateCompanyDetails({
        nome_fantasia: companyForm.nome_fantasia,
        razao_social: companyForm.razao_social || null,
        cnpj: companyForm.cnpj || null
      });
      setCompanyForm({
        nome_fantasia: updated.nome_fantasia || '',
        razao_social: updated.razao_social || '',
        cnpj: updated.cnpj || ''
      });
      setCompanyMessage({ type: 'success', text: 'Configurações da empresa atualizadas com sucesso!' });
    } catch (err) {
      setCompanyMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Erro ao atualizar dados da empresa.'
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-aldebaran-border pb-4">
        <h1 className="text-2xl font-extrabold text-theme-strong">Configurações</h1>
        <p className="text-theme-weak text-sm">Gerencie suas preferências de perfil, segurança e dados corporativos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side Tab Navigation */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border ${
              activeTab === 'perfil'
                ? 'bg-[#F8F9FA] text-slate-900 border-aldebaran-border border-l-4 border-l-teal-600 shadow-sm'
                : 'text-theme-weak border-transparent hover:bg-[#F8F9FA] hover:text-theme-normal'
            }`}
          >
            <User className="w-4 h-4 shrink-0 text-teal-600" />
            Minha Conta
          </button>
          
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border ${
              activeTab === 'seguranca'
                ? 'bg-[#F8F9FA] text-slate-900 border-aldebaran-border border-l-4 border-l-teal-600 shadow-sm'
                : 'text-theme-weak border-transparent hover:bg-[#F8F9FA] hover:text-theme-normal'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0 text-teal-600" />
            Segurança
          </button>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('empresa')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border ${
                activeTab === 'empresa'
                  ? 'bg-[#F8F9FA] text-slate-900 border-aldebaran-border border-l-4 border-l-teal-600 shadow-sm'
                  : 'text-theme-weak border-transparent hover:bg-[#F8F9FA] hover:text-theme-normal'
              }`}
            >
              <Building className="w-4 h-4 shrink-0 text-teal-600" />
              Dados da Empresa
            </button>
          )}
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-9 bg-white border border-aldebaran-border p-6 shadow-sm">
          
          {/* TAB 1: PERFIL */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-theme-strong mb-1">Informações Pessoais</h2>
                <p className="text-theme-weak text-xs">Atualize os dados básicos da sua conta de acesso.</p>
              </div>

              {profileMessage.text && (
                <div className={`p-4 text-xs font-bold flex items-center gap-2 border ${
                  profileMessage.type === 'success' 
                    ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Nome Completo</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600 placeholder-slate-400"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">E-mail (Username)</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-weak opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Nível de Acesso</label>
                  <span className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-weak opacity-60 block capitalize">
                    {user?.role === 'admin' ? 'Administrador' : 'Visualizador'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-aldebaran-border flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SEGURANÇA */}
          {activeTab === 'seguranca' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-theme-strong mb-1">Segurança da Conta</h2>
                <p className="text-theme-weak text-xs">Mantenha sua conta protegida alterando sua senha regularmente.</p>
              </div>

              {passwordMessage.text && (
                <div className={`p-4 text-xs font-bold flex items-center gap-2 border ${
                  passwordMessage.type === 'success' 
                    ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Senha Atual</label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="Sua senha atual"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="No mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-aldebaran-border flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DADOS DA EMPRESA (ADMIN ONLY) */}
          {activeTab === 'empresa' && user?.role === 'admin' && (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-theme-strong mb-1">Informações Corporativas</h2>
                <p className="text-theme-weak text-xs">Atualize os dados institucionais do seu tenant de empresa.</p>
              </div>

              {companyMessage.text && (
                <div className={`p-4 text-xs font-bold flex items-center gap-2 border ${
                  companyMessage.type === 'success' 
                    ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {companyMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {companyMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-theme-normal uppercase">Nome Fantasia / Nome Comercial</label>
                  <input
                    type="text"
                    value={companyForm.nome_fantasia}
                    onChange={(e) => setCompanyForm({ ...companyForm, nome_fantasia: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="Ex: Minha Empresa Ltda"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">Razão Social</label>
                  <input
                    type="text"
                    value={companyForm.razao_social}
                    onChange={(e) => setCompanyForm({ ...companyForm, razao_social: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="Razão Social completa"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-normal uppercase">CNPJ</label>
                  <input
                    type="text"
                    value={companyForm.cnpj}
                    onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border border-aldebaran-border text-sm text-theme-strong focus:outline-none focus:border-teal-600"
                    placeholder="Apenas números ou CNPJ formatado"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Atenção Administrativa</p>
                  <p className="mt-0.5 text-theme-weak leading-relaxed">As alterações nesta seção afetarão a identificação da empresa em todos os contratos, relatórios e dashboards operacionais dos demais usuários vinculados a este tenant.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-aldebaran-border flex justify-end">
                <button
                  type="submit"
                  disabled={companyLoading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  {companyLoading ? 'Salvando...' : 'Salvar Dados da Empresa'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
      
    </div>
  );
};

export default Configuracoes;
