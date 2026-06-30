import React from 'react';

const ProgressBar = ({ value, showText = true }) => {
 // Garantir que o valor seja numérico e esteja entre 0 e 100
 const cleanValue = Math.min(Math.max(Math.round(value), 0), 100);

 // Definir cor baseada no progresso para enriquecer o visual
  let progressColor = 'bg-blue-500';
  if (cleanValue >= 80) {
    progressColor = 'bg-emerald-500';
  } else if (cleanValue >= 30) {
    progressColor = 'bg-amber-500';
  } else {
    progressColor = 'bg-rose-500';
  }

 return (
 <div className="w-full flex items-center gap-3">
 <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-slate-200">
 <div 
 className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${progressColor}`}
 style={{ width: `${cleanValue}%` }}
 ></div>
 </div>
 {showText && (
 <span className="text-xs font-mono font-bold text-slate-400 min-w-[32px] text-right">
 {cleanValue}%
 </span>
 )}
 </div>
 );
};

export default ProgressBar;

