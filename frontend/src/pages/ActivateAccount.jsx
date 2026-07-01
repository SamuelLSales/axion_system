// frontend/src/pages/ActivateAccount.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { activateUser } from '../services/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const requestSent = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token de ativação ausente. Por favor, verifique o link recebido.');
      return;
    }

    if (requestSent.current) return;
    requestSent.current = true;

    const realizarAtivacao = async () => {
      try {
        const response = await activateUser(token);
        setStatus('success');
        setMessage(response.message || 'Sua conta foi ativada com sucesso! Você já pode fazer login.');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Este token de ativação é inválido ou já expirou.');
      }
    };

    realizarAtivacao();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 selection:bg-amber-500/20 selection:text-amber-500">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      {/* Glow decorativo no fundo */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0D9488]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0D9488]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111317] border border-slate-200 p-8 md:p-10 relative overflow-hidden text-center z-10">
        
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-4 justify-center">
              <span className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#34d399]">
                GEOGEST
              </span>
            </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase block mt-1">
            Gestão Inteligente de Contratos
          </span>
        </div>

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="py-6 flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="w-12 h-12 text-[#0D9488] animate-spin mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Verificando Token</h3>
            <p className="text-slate-400 text-sm">Aguarde enquanto ativamos o seu acesso...</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="py-6 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-[#0D9488]/10 rounded-full flex items-center justify-center text-[#0D9488] mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conta Ativada!</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 px-2">{message}</p>
            
            <Link 
              to="/login"
              className="w-full bg-[#0D9488] hover:bg-teal-500 text-white font-bold text-sm tracking-wider uppercase py-3.5 transition-colors shadow-lg block text-center"
            >
              Fazer Login
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="py-6 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Falha na Ativação</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 px-2">{message}</p>
            
            <div className="space-y-3 w-full">
              <Link 
                to="/cadastro"
                className="w-full bg-[#0D9488] hover:bg-blue-700 text-white font-bold text-sm tracking-wider uppercase py-3.5 transition-colors shadow-lg block text-center"
              >
                Voltar para o Cadastro
              </Link>
              <Link 
                to="/login"
                className="w-full bg-transparent hover:bg-white/5 border border-slate-200 text-slate-300 font-bold text-sm tracking-wider uppercase py-3 transition-colors block text-center"
              >
                Ir para o Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}



