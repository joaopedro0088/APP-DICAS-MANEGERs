/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Sparkles, Trophy, Rocket, Shield, Lock, History } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPDATES = [
  {
    version: 'V1.5 beta (Atual)',
    date: 'Maio 2026',
    icon: <Sparkles size={16} className="text-yellow-500" />,
    items: [
      'Reinicialização do Gerador (Reset Admin)',
      'Atualização Massiva: +2000 Novos Times',
      'Correção Crítica: BloomFilter & Sync Auth',
      'Estabilidade no Modo Lendário 🔱'
    ]
  },
  {
    version: 'V1.4 beta',
    date: 'Abril 2026',
    icon: <Rocket size={16} className="text-[#7B2CBF]" />,
    items: [
      'Interface Fox Lendário (Novo Visual)',
      'Interações Inteligentes via Fox Bot',
      'Regras Dinâmicas de Dificuldade Realista',
      'Novos Filtros no Discovery de Carreiras'
    ]
  },
  {
    version: 'V1.3 beta',
    date: 'Março 2026',
    icon: <History size={16} className="text-blue-500" />,
    items: [
      'Exportação PDF Pro: Relatórios Completos',
      'Ranking Global de Managers',
      'Timeline detalhada para cada Save',
      'Otimização de Performance nos Modos Offline'
    ]
  },
  {
    version: 'V1.2 beta',
    date: 'Fevereiro 2026',
    icon: <Zap size={16} className="text-orange-500" />,
    items: [
      'Sistema de XP e Evolução de Níveis',
      'Medalhas (Badges) e Conquistas Raras',
      'Personalização de Banners e Fotos de Perfil',
      'Interface renovada para Gerenciamento de Saves'
    ]
  },
  {
    version: 'V1.1 beta',
    date: 'Janeiro 2026',
    icon: <Lock size={16} className="text-green-500" />,
    items: [
      'Integração Completa Cloud Saves (Firebase)',
      'Login Google Seguro & Verificado',
      'Layout Ultra Responsive para iPad e Mobile',
      'Sistema de Segurança e Logs CEO'
    ]
  },
  {
    version: 'V1.0 beta',
    date: 'Dezembro 2025',
    icon: <Trophy size={16} className="text-[#A0A0A0]" />,
    items: [
      'Lançamento Oficial: Fox Managers Beta',
      'Algoritmo Base do Gerador de Desafios V1',
      'Biblioteca de Ideias e Sugestões da Comunidade',
      'Suporte para FM, FIFA/FC e Soccer Manager'
    ]
  }
];

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-6 right-6 top-[10%] bottom-[10%] bg-[#1A1A1A] border border-white/5 rounded-[48px] z-[101] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <History size={16} className="text-[#7B2CBF]" />
                     <h3 className="text-lg font-black uppercase italic text-white tracking-tighter">Histórico de Updates</h3>
                  </div>
                  <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest">Evolução do Fox Managers</p>
               </div>
               <button 
                 onClick={onClose}
                 className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
               {UPDATES.map((update, idx) => (
                 <div key={update.version} className="relative pl-10 border-l border-white/5 pb-2">
                    {/* Timeline Dot */}
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[#1A1A1A] border-4 border-[#7B2CBF] shadow-[0_0_10px_rgba(123,44,191,0.5)] z-10" />
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-white/5 rounded-xl">
                                {update.icon}
                             </div>
                             <h4 className="text-sm font-black text-white uppercase italic">{update.version}</h4>
                          </div>
                          <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">{update.date}</span>
                       </div>
                       
                       <ul className="space-y-2.5">
                          {update.items.map((item, i) => (
                             <li key={i} className="flex gap-3 text-[11px] text-[#A0A0A0] leading-relaxed italic">
                                <div className="w-1 h-1 bg-[#7B2CBF] rounded-full mt-1.5 shrink-0" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5">
               <button 
                 onClick={onClose}
                 className="w-full bg-[#7B2CBF] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all"
               >
                 Entendido, Jogo On!
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
