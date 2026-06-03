const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'DetalheContrato.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports ChevronDown, ChevronUp
content = content.replace('X\n} from \'lucide-react\';', 'X,\n  ChevronDown,\n  ChevronUp\n} from \'lucide-react\';');

// 2. Add fasesExpandidas state
const statePattern = /const \[modalEtapaAberto, setModalEtapaAberto\] = useState\(false\);/;
content = content.replace(statePattern, 'const [fasesExpandidas, setFasesExpandidas] = useState({});\n  const [modalEtapaAberto, setModalEtapaAberto] = useState(false);');

// 3. Add toggleFase function
const togglePattern = /const calcularProgressoGeral = \(\) => {[\s\S]*?return \(soma \/ todasEtapas.length\) \* 100;\n\s*};/;
content = content.replace(togglePattern, match => match + '\n\n  const toggleFase = (faseId) => {\n    setFasesExpandidas(prev => ({\n      ...prev,\n      [faseId]: prev[faseId] === undefined ? false : !prev[faseId]\n    }));\n  };');

// 4. Update the phase header to be clickable and add chevrons
const phaseHeaderPattern = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900\/40 p-3 rounded-md border border-aldebaran-border\/50">/;
content = content.replace(phaseHeaderPattern, '<div \n    onClick={() => toggleFase(fase.id)}\n    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-md border border-aldebaran-border/50 cursor-pointer hover:border-slate-600 transition-colors"\n  >');

// Add chevrons inside the phase header
const faseNamePattern = /<span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase \${faseEstilo.badge}`}>\n\s*Fase {fase.ordem}\n\s*<\/span>/;
content = content.replace(faseNamePattern, '{fasesExpandidas[fase.id] === false ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}\n  $&');

// 5. Wrap the steps list in the conditional logic
const stepsListPattern = /<div className="flex flex-col gap-2 ml-2">/;
content = content.replace(stepsListPattern, '{fasesExpandidas[fase.id] !== false && (\n   <div className="flex flex-col gap-2 ml-2 animate-fade-in">');

// We need to add the closing brace for the conditional wrap just after the closing div of the steps list
// The steps list ends right before `</div>\n  }) // end map fases`
const endOfPhasePattern = /<\/div>\n\s*\}\)\n\s*\) : \(/;
// But wait, the list is closed by `</div>` and then there's the closing `</div>` of the `.relative.space-y-4` wrapper.
// Let's find exactly the line: `  )}\n  </div>\n      </div>\n    )\n  }) // end map fases`
// Wait, looking at lines 539-550:
// 543:   </div>
// 544:   )}
// 545:   </div>
// 546:       </div>
// 547:     )
// 548:   }) // end map fases
content = content.replace(/  \}\)\n  <\/div>\n      <\/div>\n    \)\n  \}\) \/\/ end map fases/, '  )}\n   </div>\n   )} {/* end condicional fasesExpandidas */}\n   </div>\n  );\n })}');

// 6. Remove the Historic block
// Search for {/* HISTÓRICO DE ALTERAÇÕES DO CONTRATO */} and delete until the start of the Modals
const historyStartPattern = /{\/\* HISTÓRICO DE ALTERAÇÕES DO CONTRATO \*\/}/;
const historyEndPattern = /{\/\* ======================================================== \*\/}/;
const startIdx = content.indexOf('{/* HISTÓRICO DE ALTERAÇÕES DO CONTRATO */}');
const endIdx = content.indexOf('{/* ======================================================== */}');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
