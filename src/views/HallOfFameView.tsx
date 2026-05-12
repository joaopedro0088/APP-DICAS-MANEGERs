/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Medal, User, Calendar, ExternalLink, Flame, Shield, History } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../store';
import { HallOfFameEntry } from '../types';

export default function HallOfFameView() {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await storage.getHallOfFame();
      setEntries(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-[#7B2CBF] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-yellow-500/20">
             <Crown size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Hall of Fame</h2>
            <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Star size={12} className="text-yellow-500" /> Lendas do Fox Managers
            </p>
          </div>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-white/5 p-12 rounded-[40px] text-center space-y-4">
          <Medal size={48} className="mx-auto text-[#2D2D2D]" />
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest leading-relaxed">
            O Hall da Fama ainda está vazio. <br/> Apenas carreiras lendárias entram aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1A] border border-white/5 p-6 rounded-[32px] relative overflow-hidden group hover:border-yellow-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Crown size={80} className="text-yellow-500" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">#{index + 1} Lenda</span>
                      <span className="text-[8px] font-bold text-[#555]">• {new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">{entry.team}</h3>
                    <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest flex items-center gap-2">
                      <User size={12} className="text-yellow-500" /> {entry.userName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-[#444] uppercase mb-1">Títulos</p>
                    <p className="text-sm font-black text-white italic">{entry.titles}</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-[#444] uppercase mb-1">Temporadas</p>
                    <p className="text-sm font-black text-white italic">{entry.seasons}</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-[#444] uppercase mb-1">Craque</p>
                    <p className="text-sm font-black text-white italic truncate">{entry.bestPlayer}</p>
                  </div>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-3xl">
                   <p className="text-[9px] font-bold text-yellow-500/80 leading-relaxed italic">
                      "{entry.reason}"
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
