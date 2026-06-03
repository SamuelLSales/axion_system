const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'DetalheContrato.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '{/* LISTA DE ETAPAS DA FASE */}';
const endMarker = 'Sem etapas adicionadas a esta fase';

const startIndex = content.indexOf(startMarker);
// Find the closing div of the `Sem etapas` block.
// Let's just find the end of the `) : (` block which goes up to `</div>\n  )}`
// An easier way is to use regex with capturing groups, or string replacement between indices.

const newContent = `  {/* LISTA DE ETAPAS DA FASE (Layout em Linha/Compacto) */}
  <div className="flex flex-col gap-2 ml-2">
  {fase.etapas && fase.etapas.length > 0 ? (
  fase.etapas.map((etapa) => {
  const progressoCem = Math.round(etapa.progresso * 100);
  return (
  <div 
  key={etapa.id} 
  className={\`bg-[#2C2C2C] border border-[#3A3A3A] rounded-md p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:border-[#DA9223]/50 transition-all \${
  progressoCem === 100 ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : ''
  }\`}
  >
  {/* Lado Esquerdo: Nome, Observação, Responsável, Datas */}
  <div className="flex-1 flex flex-col gap-1 min-w-0">
  <div className="flex items-center gap-2">
  <h4 className={\`text-sm font-bold text-white truncate \${progressoCem === 100 ? 'text-slate-300' : ''}\`}>
  {etapa.nome_tarefa}
  </h4>
  {etapa.observacoes && (
  <span className="text-[10px] text-slate-500 italic truncate hidden sm:block">
  - {etapa.observacoes}
  </span>
  )}
  </div>
  
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
  <div className="flex items-center gap-1 font-semibold">
  <div className="w-4 h-4 rounded bg-[#F2AF47] flex items-center justify-center text-[#1F1F1F] font-bold text-[8px]">
  {obterIniciais(etapa.responsavel)}
  </div>
  <span className="text-slate-300">{etapa.responsavel}</span>
  </div>
  <div className="flex items-center gap-1">
  <Calendar className="w-3.5 h-3.5 text-slate-500" />
  <span>{formatarData(etapa.data_inicio)} → {formatarData(etapa.data_termino)}</span>
  </div>
  <div className="font-semibold text-slate-500">
  ({etapa.dias_previstos} dias)
  </div>
  </div>
  </div>

  {/* Lado Direito: Progresso e Ações */}
  <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0 border-t xl:border-t-0 border-[#3A3A3A] pt-3 xl:pt-0">
  
  {/* Slider de Progresso Compacto */}
  <div className="flex items-center gap-3 w-48 sm:w-64">
  <span className="text-xs font-bold font-mono text-slate-300 w-9 text-right">{progressoCem}%</span>
  <input 
  type="range" 
  min="0" 
  max="100" 
  step="5"
  value={progressoCem}
  onChange={(e) => handleProgressoSlider(etapa, parseFloat(e.target.value) / 100)}
  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#F2AF47] focus:outline-none"
  />
  {progressoCem < 100 && (
  <button
  onClick={() => handleConcluirEtapa(etapa)}
  className="p-1 text-slate-500 hover:text-emerald-400 transition"
  title="Marcar como 100% Concluída"
  >
  <Check className="w-4 h-4" />
  </button>
  )}
  </div>

  {/* Ações */}
  <div className="flex items-center gap-1 pl-3 border-l border-[#3A3A3A]">
  <button
  onClick={() => abrirModalEditarEtapa(etapa)}
  className="p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded transition"
  title="Editar"
  >
  <Edit3 className="w-4 h-4" />
  </button>
  <button
  onClick={() => handleExcluirEtapa(etapa.id, etapa.nome_tarefa)}
  className="p-1 hover:bg-transparent text-slate-500 hover:text-rose-500 rounded transition"
  title="Remover"
  >
  <Trash2 className="w-4 h-4" />
  </button>
  </div>

  </div>
  </div>
  );
  })
  ) : (
  <div className="py-4 border border-dashed border-[#3A3A3A] rounded-md flex items-center justify-center text-xs text-slate-500 italic">
  Sem etapas adicionadas a esta fase. Clique em "+ Adicionar Etapa".
  </div>
  )}
  </div>`;

// Manual replacement using indices
const endIndexStr = 'Sem etapas adicionadas a esta fase. Clique em "+ Adicionar Etapa".\n  </div>\n  )}';
const endIndex = content.indexOf(endIndexStr) + endIndexStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newContent + content.substring(endIndex + 10);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Could not find markers');
}
