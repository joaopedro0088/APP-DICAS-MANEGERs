/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Calendar, Flame, Zap, Shield, AlertTriangle, MessageSquare, Plus, Clock, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../store';
import { WeeklyEvent } from '../types';

export default function WeeklyEventsView() {
  const [events, setEvents] = useState<WeeklyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await storage.getWeeklyEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'challenge': return '🔥';
      case 'community': return '🌎';
      case 'news': return '📢';
      default: return '⚡';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-[#7B2CBF] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="px-4 space-y-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 glass rounded-[28px] flex items-center justify-center text-[#7B2CBF] shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#7B2CBF]/20 to-transparent opacity-50"></div>
             <Zap size={32} className="relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white font-display">Desafios Lendários</h2>
            <p className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-[0.4em] flex items-center gap-2 font-display">
              <Clock size={12} className="animate-pulse" /> RESET TODA SEGUNDA (100+)
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-4">
        {events.length === 0 ? (
           <div className="glass rounded-[48px] p-16 text-center space-y-6 border-2 border-dashed border-white/5">
              <div className="w-20 h-20 glass-dark rounded-full flex items-center justify-center mx-auto shadow-2xl">
                 <Bot size={40} className="text-[#333]" />
              </div>
              <div className="space-y-2">
                 <p className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-[0.3em] leading-relaxed font-display">
                    Nenhum evento ativo<br/><span className="text-[#333]">Fique de olho nas segundas-feiras</span>
                 </p>
              </div>
           </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-[1px] rounded-[44px] bg-gradient-to-br ${event.type === 'challenge' ? 'from-orange-500/30 to-transparent shadow-xl shadow-orange-500/5' : 'from-[#7B2CBF]/30 to-transparent shadow-xl shadow-[#7B2CBF05]'}`}
            >
              <div className="glass-dark rounded-[43px] p-8 space-y-8 relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none text-white">
                  {event.type === 'challenge' ? <Flame size={120} /> : <Zap size={120} />}
                </div>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl glass flex items-center justify-center ${event.type === 'challenge' ? 'text-orange-500' : 'text-[#7B2CBF]'}`}>
                         {getEmojiForType(event.type)}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-display ${event.type === 'challenge' ? 'text-orange-500' : 'text-[#7B2CBF]'}`}>
                         {event.type === 'challenge' ? 'Challenge Semanal' : 'Destaque Fox'}
                      </span>
                    </div>
                    {!event.isActive && (
                      <span className="glass-dark text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase font-display tracking-widest">Finalizado</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter font-display leading-none">{event.title}</h3>
                    <p className="text-[11px] font-bold text-[#A0A0A0] leading-relaxed italic opacity-80 font-display">
                       "{event.description}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3">
                        <Calendar size={14} className="text-[#444]" />
                        <span className="text-[10px] font-black text-white font-mono tracking-tighter">{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="w-4 h-px bg-white/10"></div>
                      <div className="glass px-4 py-2 rounded-2xl">
                        <span className="text-[10px] font-black text-[#666] font-mono tracking-tighter">{new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {event.rewardIcon && (
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        className="w-14 h-14 glass flex items-center justify-center text-3xl shadow-2xl relative group/reward cursor-help"
                      >
                         <div className="absolute inset-0 bg-yellow-500/10 blur-xl opacity-0 group-hover/reward:opacity-100 transition-opacity"></div>
                         <span className="relative z-10">{event.rewardIcon}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
