import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Plus, 
  Trash2, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { getAreasAtuacao, createAreaAtuacao, deleteAreaAtuacao } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatArea = (nome) => {
  if (!nome) return '';
  return nome.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const AreasAtuacao = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ nome: '', cor_visual: '#3b82f6' }); // Blue default

  const carregarAreas = async () => {
    try {
      setLoading(true);
      const data = await getAreasAtuacao();
      setAreas(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar áreas:', err);
      setError('Não foi possível conectar à API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAreas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    
    try {
      await createAreaAtuacao(form);
      setForm({ nome: '', cor_visual: '#3b82f6' });
      carregarAreas();
    } catch (err) {
      console.error('Erro ao criar área:', err);
      alert('Erro ao cadastrar a área. Verifique se já não existe.');
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Deseja remover a área "${nome}"? Contratos já associados não perderão o vínculo imediatamente no banco (a constraint impede se houver CASCADE ou SetNull, mas a API backend foi configurada para OnDelete). Confirma?`)) {
      try {
        await deleteAreaAtuacao(id);
        carregarAreas();
      } catch (err) {
        console.error('Erro ao excluir área:', err);
        alert('Não é possível excluir esta área pois existem contratos associados a ela.');
      }
    }
  };

  if (loading && areas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto animate-fade-in text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 font-title">
            <Settings className="text-[#0D9488] w-8 h-8" />
            Configuração de Áreas
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Gerencie as áreas de atuação para categorização dos contratos.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-transparent text-rose-500 border border-rose-500/20 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {user?.role === 'admin' && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-5 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nome da Nova Área *</label>
            <input 
              type="text"
              required
              placeholder="Ex: Geofísica"
              value={form.nome}
              onChange={(e) => setForm({...form, nome: e.target.value})}
              className="w-full p-2.5 bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Cor Visual</label>
            <input 
              type="color"
              value={form.cor_visual}
              onChange={(e) => setForm({...form, cor_visual: e.target.value})}
              className="w-12 h-[42px] p-1 bg-white border border-slate-200 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-[11px] bg-[#0D9488] hover:bg-[#0b7c71] text-white font-bold text-sm transition-all shadow-sm whitespace-nowrap"
          >
            Adicionar Área
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {areas.length > 0 ? (
          areas.map(area => (
            <div key={area.id} className="bg-white border border-slate-200 p-4 flex items-center justify-between hover:border-[#0D9488]/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: area.cor_visual }}></div>
                <span className="font-bold text-sm text-slate-900">{formatArea(area.nome)}</span>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(area.id, area.nome)}
                  className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
                  title="Excluir Área"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200">
            <FolderOpen className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhuma área cadastrada no sistema.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AreasAtuacao;



