import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    no_prazo: {
      label: 'No prazo',
      classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold',
      dot: 'bg-emerald-500'
    },
    atencao: {
      label: 'Atenção',
      classes: 'bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-semibold',
      dot: 'bg-amber-500'
    },
    atrasado: {
      label: 'Atrasado',
      classes: 'bg-rose-50 text-rose-800 border border-rose-200/60 text-xs font-semibold',
      dot: 'bg-rose-500'
    },
    concluido: {
      label: 'Concluído',
      classes: 'bg-sky-50 text-sky-800 border border-sky-200/60 text-xs font-semibold',
      dot: 'bg-sky-500'
    }
  };

 const current = config[status] || {
 label: status,
 classes: 'bg-slate-100/60 text-slate-400 border border-slate-500/20',
 dot: 'bg-slate-400'
 };

 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider ${current.classes}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
 {current.label}
 </span>
 );
};

export default StatusBadge;

