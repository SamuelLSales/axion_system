import React, { useState, useEffect } from 'react';
import { criarCheckoutTransparente, obterStatusAssinatura } from '../services/api';
import { QrCode, CreditCard, Copy, CheckCircle2, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutTransparente({ plano, onBack }) {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState('PIX'); // PIX ou CREDIT_CARD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // PIX state
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);

  // Cartão state
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });
  const [holderData, setHolderData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    phone: ''
  });

  // Efeito de Polling para PIX
  useEffect(() => {
    let interval;
    if (pixData && !paymentApproved) {
      interval = setInterval(async () => {
        try {
          const statusRes = await obterStatusAssinatura();
          if (statusRes.status_pagamento === 'ativo') {
            setPaymentApproved(true);
            clearInterval(interval);
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } catch (e) {
          console.error("Erro no polling", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [pixData, paymentApproved, navigate]);

  const handleGeneratePix = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await criarCheckoutTransparente({
        plano: plano.id,
        metodo_pagamento: 'PIX'
      });
      if (data.pix) {
        setPixData(data.pix);
      } else {
        setError('Não foi possível gerar o QR Code.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao gerar PIX.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCreditCard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        plano: plano.id,
        metodo_pagamento: 'CREDIT_CARD',
        creditCard: cardData,
        creditCardHolderInfo: holderData
      };
      await criarCheckoutTransparente(payload);
      setPaymentApproved(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar cartão.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (paymentApproved) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-100 mb-2">Pagamento Aprovado!</h3>
        <p className="text-slate-400">Sua assinatura está ativa. Redirecionando para o sistema...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#111827] border border-slate-200 rounded-lg shadow-xl shadow-black/20 overflow-hidden">
      {/* Header do Checkout */}
      <div className="bg-[#1f2937] px-6 py-4 border-b border-slate-200 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-white">Finalizar Assinatura</h3>
          <p className="text-xs text-slate-400">Plano {plano.label} — R$ {plano.preco.toFixed(2).replace('.', ',')} / mês</p>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Seleção de Método */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMetodo('PIX')}
            className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              metodo === 'PIX' ? 'border-emerald-500 bg-emerald-50/60 text-emerald-400' : 'border-slate-200 text-slate-400 hover:bg-[#1f2937]'
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span className="font-bold text-sm">PIX</span>
          </button>
          
          <button
            onClick={() => setMetodo('CREDIT_CARD')}
            className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              metodo === 'CREDIT_CARD' ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]' : 'border-slate-200 text-slate-400 hover:bg-[#1f2937]'
            }`}
          >
            <CreditCard className="w-6 h-6" />
            <span className="font-bold text-sm">Cartão de Crédito</span>
          </button>
        </div>

        {/* Render PIX */}
        {metodo === 'PIX' && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            {!pixData ? (
              <div className="py-8">
                <p className="text-slate-400 mb-6 max-w-sm">Gere o QR Code para pagamento. A liberação é imediata após a confirmação pelo banco.</p>
                <button
                  onClick={handleGeneratePix}
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                  Gerar QR Code PIX
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center py-4">
                <div className="bg-white p-4 rounded-xl mb-6 shadow-lg">
                  <img src={`data:image/jpeg;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48" />
                </div>
                
                <p className="text-sm text-slate-400 mb-4">Aguardando pagamento... (Essa tela atualizará sozinha)</p>
                
                <div className="w-full max-w-sm flex items-center bg-[#1f2937] p-1 rounded-lg border border-slate-200">
                  <input 
                    type="text" 
                    readOnly 
                    value={pixData.payload} 
                    className="flex-1 bg-transparent text-xs text-slate-300 px-3 outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                  <button 
                    onClick={handleCopyPix}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#374151] hover:bg-[#4b5563] text-white text-xs font-bold rounded-md transition-colors shrink-0"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Render Credit Card */}
        {metodo === 'CREDIT_CARD' && (
          <form onSubmit={handlePayCreditCard} className="animate-fade-in space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0D9488]" /> Dados do Cartão
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nome no Cartão</label>
                  <input required type="text" value={cardData.holderName} onChange={e => setCardData({...cardData, holderName: e.target.value})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="Como impresso no cartão" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Número do Cartão</label>
                  <input required type="text" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '')})} maxLength="16" className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="0000 0000 0000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Mês (MM) / Ano (AAAA)</label>
                  <div className="flex gap-2">
                    <input required type="text" value={cardData.expiryMonth} onChange={e => setCardData({...cardData, expiryMonth: e.target.value.replace(/\D/g, '')})} maxLength="2" className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none text-center" placeholder="MM" />
                    <input required type="text" value={cardData.expiryYear} onChange={e => setCardData({...cardData, expiryYear: e.target.value.replace(/\D/g, '')})} maxLength="4" className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none text-center" placeholder="AAAA" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Cód. Segurança (CVV)</label>
                  <input required type="text" value={cardData.ccv} onChange={e => setCardData({...cardData, ccv: e.target.value.replace(/\D/g, '')})} maxLength="4" className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="123" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm font-bold text-slate-300 mb-4">Dados do Titular</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo</label>
                  <input required type="text" value={holderData.name} onChange={e => setHolderData({...holderData, name: e.target.value})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="Nome do titular" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">CPF ou CNPJ</label>
                  <input required type="text" value={holderData.cpfCnpj} onChange={e => setHolderData({...holderData, cpfCnpj: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="Somente números" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Celular (com DDD)</label>
                  <input required type="text" value={holderData.phone} onChange={e => setHolderData({...holderData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="Ex: 31999999999" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">E-mail</label>
                  <input required type="email" value={holderData.email} onChange={e => setHolderData({...holderData, email: e.target.value})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">CEP</label>
                  <input required type="text" value={holderData.postalCode} onChange={e => setHolderData({...holderData, postalCode: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="00000000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Número</label>
                  <input required type="text" value={holderData.addressNumber} onChange={e => setHolderData({...holderData, addressNumber: e.target.value})} className="w-full bg-[#1f2937] border border-slate-200 rounded-lg px-4 py-2 text-sm text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 focus:outline-none" placeholder="Ex: 123" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm tracking-wider uppercase transition-all rounded-lg shadow-lg mt-6
                ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#0D9488] hover:bg-amber-500 text-white'}`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando Pagamento...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Pagar R$ {plano.preco.toFixed(2).replace('.', ',')}</>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Transação 100% criptografada e segura
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

