import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, History, CheckCircle2, Star, Clock, 
  Code, Shield, Sparkles, TrendingUp, Cpu,
  Terminal, ShieldAlert, AlertTriangle, RefreshCw, Trash2,
  ChevronRight, Search, FileText
} from 'lucide-react';
import { User, UserRole, AppLog } from '../types';
import { storage } from '../store';

export default function LogsView({ user, onBack }: { user: User; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'changelog' | 'audit'>(user.role === UserRole.CEO || user.role === UserRole.ADM ? 'audit' : 'changelog');
  const [auditLogs, setAuditLogs] = useState<AppLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const isPrivileged = user.role === UserRole.CEO || user.role === UserRole.ADM;

  const fetchAuditLogs = async () => {
    if (!isPrivileged) return;
    setLoading(true);
    try {
      const logs = await storage.getLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const changelogs = [
    {
      version: 'V1.5 beta',
      date: 'Maio 2026',
      status: 'Current',
      description: 'Correções críticas e expansão massiva do banco de dados.',
      changes: [
        'Reset Admin: Nova funcionalidade para reinicializar o gerador pelo painel CEO.',
        'Firebase Cache: Implementação de cache persistente para melhor performance offline.',
        'Correção BloomFilter: Resolvido erro de sincronização do Firestore SDK.',
        '+2000 Times: Banco de dados do gerador expandido para todas as ligas mundiais.'
      ]
    },
    {
      version: 'V1.4 beta',
      date: 'Abril 2026',
      status: 'Legacy',
      description: 'Interface Lendária e integração com Fox Bot.',
      changes: [
        '🔱 Modo Lendário: Nova estética visual com gradientes roxos e dourados.',
        'Fox Bot: Sugestões inteligentes de desafios diários na Home.',
        'Dificuldade Realista: Algoritmo de filtragem por reputação de clube aprimorado.'
      ]
    },
    {
      version: 'V1.3 beta',
      date: 'Março 2026',
      status: 'Legacy',
      description: 'Foco em auditoria e relatórios avançados.',
      changes: [
        'PDF Export: Managers Pro agora podem exportar relatórios detalhados de saves.',
        'Ranking Global: Sistema de pontuação baseado em conquistas e títulos.',
        'Timeline Detail: Visualização histórica de eventos por temporada.'
      ]
    },
    {
      version: 'V1.0-V1.2 beta',
      date: '2025-2026',
      status: 'Legacy',
      description: 'Fundação do Fox Managers e sistemas base de RPG.',
      changes: [
        'XP & Leveling: Sistema de progressão de nível de Manager.',
        'Badges: 50+ Medalhas colecionáveis por feitos na carreira.',
        'Cloud Sync: Autenticação Google e salvamento em nuvem nativo.'
      ]
    }
  ];

  const filteredAudit = auditLogs.filter(log => 
    log.text?.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.toLowerCase().includes(search.toLowerCase()) ||
    log.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      <header className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7B2CBF] to-[#5A189A] rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-[#7B2CBF33]">
                  {activeTab === 'changelog' ? <History size={28} /> : <Terminal size={28} />}
              </div>
              <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                    {activeTab === 'changelog' ? 'Dev Logs' : 'System Audit'}
                  </h2>
                  <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    {activeTab === 'changelog' ? (
                      <><Code size={12} className="text-[#7B2CBF]" /> Evolução do Sistema</>
                    ) : (
                      <><ShieldAlert size={12} className="text-red-500" /> Registros de Baixo Nível</>
                    )}
                  </p>
              </div>
            </div>
            <button 
                onClick={onBack}
                className="w-10 h-10 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl flex items-center justify-center text-[#A0A0A0] hover:text-white"
            >
                <Zap size={18} />
            </button>
        </div>

        {isPrivileged && (
          <div className="flex bg-[#1A1A1A] p-1 rounded-2xl border border-[#2D2D2D]">
            <button 
              onClick={() => setActiveTab('changelog')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'changelog' ? 'bg-[#2D2D2D] text-white shadow-lg' : 'text-[#A0A0A0] hover:text-white'}`}
            >
              <History size={14} /> Changelog
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-red-500/10 text-red-500 shadow-lg border border-red-500/20' : 'text-[#A0A0A0] hover:text-white'}`}
            >
              <Terminal size={14} /> Auditoria
            </button>
          </div>
        )}
      </header>

      <div className="space-y-8 min-h-[400px]">
        {activeTab === 'changelog' ? (
          <div className="space-y-12 relative pt-4">
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#7B2CBF] to-transparent rounded-full opacity-20"></div>

            {changelogs.map((log, logIdx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: logIdx * 0.1 }}
                key={log.version} 
                className="relative pl-16 group"
              >
                <div className="absolute left-[21px] top-2 w-4 h-4 bg-[#7B2CBF] rounded-full border-4 border-[#1A1A1A] shadow-[0_0_15px_rgba(123,44,191,0.5)] z-10 group-hover:scale-125 transition-transform"></div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white italic tracking-tight">{log.version}</h3>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        log.status === 'Stable' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                        'bg-[#2D2D2D]/50 border-white/5 text-[#A0A0A0]'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#A0A0A0]">
                      <Clock size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{log.date}</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-6 group-hover:border-[#7B2CBF44] transition-all relative overflow-hidden">
                    <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed italic">"{log.description}"</p>
                    <div className="space-y-3">
                      {log.changes.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 bg-[#7B2CBF] rounded-full shadow-[0_0_5px_#7B2CBF]"></div>
                          <p className="text-[11px] text-[#A0A0A0] font-medium leading-tight">{change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="flex gap-3">
               <div className="flex-1 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-[#7B2CBF33] transition-all">
                  <Search size={16} className="text-[#444]" />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filtrar eventos..."
                    className="bg-transparent border-none outline-none text-xs text-white uppercase font-black w-full"
                  />
               </div>
               <button 
                 onClick={fetchAuditLogs}
                 className={`w-12 h-12 bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl flex items-center justify-center text-[#7B2CBF] hover:bg-[#7B2CBF]/10 transition-all ${loading ? 'animate-spin' : ''}`}
               >
                 <RefreshCw size={18} />
               </button>
             </div>

             <div className="space-y-4">
                {filteredAudit.length === 0 ? (
                  <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-16 rounded-[40px] text-center space-y-3 opacity-20">
                     <Terminal size={40} className="mx-auto" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Nenhum evento capturado</p>
                  </div>
                ) : (
                  filteredAudit.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={log.id || i}
                      className={`bg-[#1A1A1A] border p-5 rounded-[28px] space-y-3 group ${
                        log.type === 'error' ? 'border-red-500/20' : 'border-[#2D2D2D]'
                      }`}
                    >
                       <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              log.type === 'error' ? 'bg-red-500/10 text-red-500' :
                              log.type === 'admin' ? 'bg-[#7B2CBF]/10 text-[#7B2CBF]' :
                              'bg-white/5 text-[#A0A0A0]'
                            }`}>
                               {log.type === 'error' ? <AlertTriangle size={18} /> : <Terminal size={18} />}
                            </div>
                            <div>
                               <h4 className={`text-[10px] font-black uppercase tracking-tight ${
                                 log.type === 'error' ? 'text-red-500' : 'text-white'
                               }`}>{log.text}</h4>
                               <p className="text-[8px] text-[#666] font-black uppercase tracking-widest">
                                 Manager: {log.user} • {new Date(log.timestamp || log.date).toLocaleString()}
                               </p>
                            </div>
                         </div>
                       </div>

                       {log.details && (
                         <div className="p-3 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
                            <pre className="text-[8px] text-[#A0A0A0] font-mono whitespace-pre-wrap">
                               {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                            </pre>
                         </div>
                       )}
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
