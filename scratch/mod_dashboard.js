const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the columns layout: {/* CORPO DE DUAS COLUNAS: GRÁFICOS E METAS */}
const startIdx = content.indexOf('{/* CORPO DE DUAS COLUNAS: GRÁFICOS E METAS */}');

if (startIdx !== -1) {
  const newBottomSection = `{/* PROGRESSO E DISTRIBUIÇÃO */}
  <div className="border border-aldebaran-border rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
  
  {/* Distribuição */}
  <div>
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 block">Distribuição por Área</span>
  <div className="space-y-4 font-mono text-xs">
    {Object.entries(stats.distribuicao_area).map(([area, qtd]) => {
      if (area === 'Outros') return null; // match design
      const percent = stats.total_contratos > 0 ? (qtd / stats.total_contratos) * 100 : 0;
      return (
        <div key={area} className="flex items-center gap-4">
          <span className="text-slate-400 w-24 lowercase">{area}</span>
          <div className="flex-1 h-px bg-aldebaran-border relative">
            <div className="absolute left-0 top-0 h-px bg-emerald-500" style={{ width: \`\${percent}%\` }}></div>
          </div>
          <span className="text-slate-500">{qtd}</span>
        </div>
      );
    })}
    <div className="flex items-center gap-4">
      <span className="text-slate-400 w-24 lowercase">outros</span>
      <div className="flex-1 h-px bg-aldebaran-border relative"></div>
      <span className="text-slate-500">{stats.distribuicao_area['Outros']}</span>
    </div>
  </div>
  </div>

  {/* Progresso Geral */}
  <div className="flex flex-col border-t md:border-t-0 md:border-l border-aldebaran-border md:pl-8 pt-6 md:pt-0">
  <div className="flex items-end gap-3 mb-6">
  <h2 className="text-6xl font-extrabold text-white font-mono leading-none">{stats.progresso_medio_geral.toFixed(1)}</h2>
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pb-1">Progresso Geral</span>
  </div>
  
  <div className="w-full h-px bg-aldebaran-border mb-6 relative">
    <div className="absolute left-0 top-0 h-px bg-white" style={{ width: \`\${stats.progresso_medio_geral}%\` }}></div>
  </div>

  <div className="space-y-3 font-mono text-[10px] lowercase text-slate-400">
    <div className="flex justify-between items-center border-b border-aldebaran-border pb-2">
      <span>concluídos</span>
      <span className="text-slate-300">{stats.contratos_concluidos}</span>
    </div>
    <div className="flex justify-between items-center border-b border-aldebaran-border pb-2">
      <span>dias de campo</span>
      <span className="text-slate-300">{contratos.reduce((acc, c) => acc + (c.dias_campo_total || 0), 0)}</span>
    </div>
    <div className="flex justify-between items-center">
      <span>responsáveis</span>
      <span className="text-slate-300">{new Set(contratos.map(c => c.diretor_projeto).filter(Boolean)).size}</span>
    </div>
  </div>
  </div>

  </div>

  {/* CONTRATOS ATIVOS - TABELA */}
  <div className="mt-8">
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 block">Contratos Ativos</span>
  
  <div className="overflow-x-auto">
  <table className="w-full text-left font-mono text-xs">
  <thead>
  <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-aldebaran-border">
  <th className="font-normal py-3 px-2">Projeto</th>
  <th className="font-normal py-3 px-2">Cliente</th>
  <th className="font-normal py-3 px-2">Área</th>
  <th className="font-normal py-3 px-2">Diretor</th>
  <th className="font-normal py-3 px-2">Entrega</th>
  <th className="font-normal py-3 px-2">Dias</th>
  <th className="font-normal py-3 px-2">Status</th>
  <th className="font-normal py-3 px-2"></th>
  </tr>
  </thead>
  <tbody className="divide-y divide-aldebaran-border/50 text-slate-400">
  {contratos.map(contrato => {
    let statusClass = "text-slate-500 border-slate-700";
    if (contrato.status === 'No Prazo') statusClass = "text-emerald-500 border-emerald-500/30";
    else if (contrato.status === 'Atenção') statusClass = "text-[#F2AF47] border-[#F2AF47]/30";
    else if (contrato.status === 'Atrasado') statusClass = "text-rose-500 border-rose-500/30";

    const dataEntrega = contrato.data_entrega_final ? new Date(contrato.data_entrega_final).toLocaleDateString('pt-BR') : '-';

    return (
    <tr key={contrato.id} className="hover:bg-aldebaran-border/20 transition-colors">
    <td className="py-4 px-2 text-white font-semibold max-w-[200px] truncate lowercase">{contrato.nome_projeto}</td>
    <td className="py-4 px-2 max-w-[100px] truncate lowercase">{contrato.cliente}</td>
    <td className="py-4 px-2">
      <span className="px-2 py-0.5 border border-aldebaran-border rounded text-[10px] lowercase">{contrato.area}</span>
    </td>
    <td className="py-4 px-2 truncate max-w-[100px] lowercase">{contrato.diretor_projeto}</td>
    <td className="py-4 px-2">{dataEntrega}</td>
    <td className="py-4 px-2">
      {contrato.dias_restantes > 0 ? \`+\${contrato.dias_restantes}\` : contrato.dias_restantes}
    </td>
    <td className="py-4 px-2">
      <span className={\`px-2 py-0.5 border rounded text-[10px] lowercase \${statusClass}\`}>
        {contrato.status}
      </span>
    </td>
    <td className="py-4 px-2 text-right">
      <button onClick={() => navigate(\`/contratos/\${contrato.id}\`)} className="text-slate-600 hover:text-white transition-colors uppercase tracking-widest text-[10px]">
        VER →
      </button>
    </td>
    </tr>
  )})}
  </tbody>
  </table>
  {contratos.length === 0 && (
    <div className="text-center py-8 text-slate-600 text-xs italic lowercase">Nenhum contrato ativo.</div>
  )}
  </div>
  </div>

  </div>
  );
};

export default Dashboard;`;

  content = content.substring(0, startIdx) + newBottomSection;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Dashboard updated');
} else {
  console.log('Target not found');
}
