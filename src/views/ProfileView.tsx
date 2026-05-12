/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { 
  Settings, Shield, History, LogOut, Award, ChevronRight, 
  User as UserIcon, Edit3, Check, X, Camera, Smile, Star, Trophy,
  Lock, KeyRound, BarChart3, Target, Calendar, Activity, Palette, Instagram, Zap, TrendingUp, Crown, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { BANNERS, BADGES as BADGE_CONSTANTS, AVATARS } from '../constants';

interface ProfileViewProps {
  user: User | null;
  onOpenAdmin: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const ALL_BADGES = [
  "Mestre da Base", "Rei do Rebuild", "Hardcore Manager", "Lenda Fox",
  "Tático de Elite", "Scout de Ouro", "Colecionador de Taças", "Invencível",
  "Mestre das Finanças", "Promessa de Xerém", "Rei da Virada", "Fiel ao Escudo",
  "Olheiro Aguçado", "Eterno Ídolo"
];

const EMOJIS = ["🎮", "⚽", "🏆", "🌟", "🔥", "💎", "🎯", "🧠", "🦁", "🦊", "🤝", "📈"];

import { t } from '../i18n';
import { sounds } from '../utils/sounds';
import { getLevelName, getLevelColor } from '../utils/levelUtils';

export default function ProfileView({ user, onOpenAdmin, onOpenLogs, onOpenSettings, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [userSaves, setUserSaves] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) { // 1MB limit check
       alert('A imagem é muito grande! O limite é 1MB.');
       return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
       setEditForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    photoUrl: user?.photoUrl || '',
    bannerUrl: user?.bannerUrl || BANNERS[0].url
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  const handleRedeemCode = async () => {
    if (!promoCode || promoLoading) return;
    setPromoLoading(true);
    setPromoMessage({ text: '', type: '' });
    sounds.click();
    
    try {
      const result = await storage.redeemCode(user.id, promoCode.trim().toUpperCase());
      if (result.success) {
        sounds.success();
        setPromoMessage({ text: result.message, type: 'success' });
        setPromoCode('');
        // Reload after success to reflect changes
        setTimeout(() => window.location.reload(), 2000);
      } else {
        sounds.error();
        setPromoMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      sounds.error();
      setPromoMessage({ text: 'Falha na conexão', type: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserSaves = async () => {
      try {
        if (user) {
          const saves = await storage.getSaves(user.id);
          setUserSaves(saves);
        }
      } catch (error) {
        console.error("Failed to fetch user saves in profile:", error);
      }
    };
    fetchUserSaves();
  }, [user]);

  if (!user) return null;

  const summaryStats = {
    totalSeasons: userSaves.reduce((acc, s) => acc + (s.stats?.seasonsPlayed || 0), 0),
    totalTitles: userSaves.reduce((acc, s) => acc + (s.stats?.titles || 0), 0),
    totalWins: userSaves.reduce((acc, s) => acc + (s.stats?.wins || 0), 0),
    totalLosses: userSaves.reduce((acc, s) => acc + (s.stats?.losses || 0), 0),
    maxUnbeatenRun: Math.max(...userSaves.map(s => s.stats?.maxUnbeatenRun || 0), 0),
    bestSave: [...userSaves].sort((a, b) => {
       const scoreA = (a.stats?.titles || 0) * 10 + (a.stats?.wins || 0);
       const scoreB = (b.stats?.titles || 0) * 10 + (b.stats?.wins || 0);
       return scoreB - scoreA;
    })[0],
    favoriteGame: user.favoriteGames?.[0] || 'Football Manager 25'
  };

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        photoUrl: user.photoUrl || '',
        bannerUrl: user.bannerUrl || BANNERS[0].url
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    sounds.click();
    setLoading(true);
    try {
      await storage.updateUser(user.id, { ...editForm, updatedAt: Date.now() });
      sounds.success();
      setIsEditing(false);
      // We still need to reload or update parent state
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to update profile:", error);
      sounds.error();
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    if (!newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword) {
      setPwdError('As senhas não coincidem!');
      sounds.error();
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('A senha deve ter pelo menos 6 caracteres.');
      sounds.error();
      return;
    }

    setLoading(true);
    setPwdError('');
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Utilizador não autenticado.');
      
      await updatePassword(currentUser, newPassword);
      
      sounds.success();
      setPwdSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setPwdSuccess(false);
      }, 2000);
    } catch (err: any) {
      sounds.error();
      setPwdError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Profile Card */}
      <section className="glass rounded-[48px] relative overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="h-44 w-full relative group bg-black/40">
           <img 
             src={user.bannerUrl || (BANNERS && BANNERS.length > 0 ? BANNERS[0].url : '')} 
             alt="Profile Banner" 
             className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 brightness-75 group-hover:brightness-100" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/30"></div>
           <button 
             onClick={() => setIsEditing(true)}
             className="absolute top-6 right-6 glass p-3 rounded-2xl text-white hover:text-[#7B2CBF] transition-all shadow-2xl active:scale-95 group/btn"
           >
              <Palette size={20} className="group-hover/btn:rotate-12 transition-transform" />
           </button>
        </div>

        <div className="flex flex-col items-center gap-5 text-center px-8 pb-10 relative z-10 -mt-16">
          <div className="relative">
            <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center p-1.5 border-4 glass-dark ${user.role === UserRole.CEO ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-[#7B2CBF] shadow-2xl'}`}>
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover rounded-[32px]" />
              ) : (
                <div className="w-full h-full bg-[#1A1A1A] rounded-[32px] flex items-center justify-center text-[#444]">
                  <UserIcon size={50} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-6 bg-black border-2 border-[#7B2CBF] text-white text-[11px] font-black px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 font-display">
              <span className="text-[#7B2CBF]">LVL {user.level || 1}</span>
              <span className={`text-[9px] uppercase tracking-tighter opacity-80 ${getLevelColor(user.level || 1)}`}>{getLevelName(user.level || 1)}</span>
            </div>
            <button 
              onClick={() => setIsEditing(true)} 
              className="absolute -top-3 -right-3 p-3 glass-dark border border-white/10 rounded-2xl text-[#7B2CBF] hover:scale-110 transition-all shadow-xl"
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div className="w-full max-w-[220px] space-y-2 mt-2">
             <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-[0.2em] font-display">XP Mastery</span>
                <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest font-mono">{(user.xp || 0) % 1000} <span className="text-[#333]">/ 1000</span></span>
             </div>
             <div className="h-2.5 w-full glass rounded-full overflow-hidden p-[2px] shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((user.xp || 0) % 1000) / 10}%` }}
                  className="h-full bg-gradient-to-r from-[#7B2CBF] via-[#9D4EDD] to-[#E0AAFF] rounded-full shadow-[0_0_15px_rgba(123,44,191,0.6)]"
                />
             </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-3">
               <h2 className="text-3xl font-black uppercase italic tracking-tight font-display">{user.name}</h2>
               {user.role === UserRole.CEO && <Star size={20} fill="#EAB308" className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />}
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                user.role === UserRole.CEO ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                user.role === UserRole.ADM ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                user.role === UserRole.MOD ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                'glass-dark text-[#A0A0A0]'
              }`}>
                {user.role}
              </span>
              <span className="text-[10px] text-[#444] font-black uppercase tracking-widest font-mono select-all">UID: 0{user.id.slice(0, 4)}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md border border-white/5 p-4 rounded-3xl max-w-[90%] mx-auto relative group">
             <Bot size={14} className="absolute -top-2 -left-2 text-[#7B2CBF] opacity-40 group-hover:opacity-100 transition-opacity" />
             <p className="text-[11px] text-[#A0A0A0] font-medium italic leading-relaxed">
                {user.bio || 'Mestre das táticas, ídolo das torcidas. Defina sua biografia em configurações.'}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-2">
             <motion.a 
                href="https://www.instagram.com/jaoxx_99" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-dark p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest group hover:border-red-500/20"
             >
                <Instagram size={18} className="text-red-500 group-hover:scale-110 transition-transform" /> 
                <span className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] bg-clip-text text-transparent font-display">jaoxx_99</span>
             </motion.a>
             <button
                className="glass-dark p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7B2CBF] hover:bg-[#7B2CBF]/10 transition-all"
             >
                <Zap size={18} /> Stats Pro
             </button>
          </div>
        </div>
      </section>

      {/* Global Statistics */}
      <section className="space-y-4 px-2">
         <div className="flex items-center gap-3 px-4">
            <div className="w-2 h-5 bg-[#7B2CBF] rounded-full shadow-[0_0_8px_rgba(123,44,191,0.4)]"></div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-display">Sala de Troféus Global</h3>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="glass-dark p-6 rounded-[40px] space-y-4 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-[#7B2CBF] shadow-lg">
                     <Calendar size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest font-display">Temporadas</span>
               </div>
               <p className="text-3xl font-black text-white relative z-10 font-mono tracking-tighter">{summaryStats.totalSeasons}</p>
               <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] text-white -rotate-12 group-hover:scale-110 transition-transform">
                  <Calendar size={100} />
               </div>
            </div>

            <div className="glass-dark p-6 rounded-[40px] space-y-4 relative overflow-hidden group hover:border-yellow-500/20 transition-all">
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-yellow-500 shadow-lg">
                     <Trophy size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest font-display">Taças Fox</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10">
                  <p className="text-3xl font-black text-white font-mono tracking-tighter">{summaryStats.totalTitles}</p>
                  <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest font-display animate-pulse">RANK S</p>
               </div>
               <div className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] text-yellow-500 -rotate-12 group-hover:scale-110 transition-transform">
                  <Trophy size={100} />
               </div>
            </div>

            <div className="glass-dark p-6 rounded-[40px] space-y-4 relative overflow-hidden group hover:border-green-500/20 transition-all">
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-green-500 shadow-lg">
                     <Activity size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest font-display">Domínio Tático</span>
               </div>
               <div className="flex items-baseline gap-2 relative z-10">
                  <p className="text-2xl font-black text-white font-mono tracking-tighter">{summaryStats.maxUnbeatenRun}</p>
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-tighter font-display">UNBEATEN</p>
               </div>
            </div>

            <motion.button 
               whileHover={{ y: -5 }}
               className="glass-dark p-6 rounded-[40px] space-y-4 border-dashed relative overflow-hidden text-left group"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-blue-400">
                     <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest font-display">Evolução</span>
               </div>
               <div>
                  <p className="text-[11px] font-black text-white uppercase italic truncate font-display">Ver Gráficos Pro</p>
                  <p className="text-[8px] font-black text-[#444] uppercase tracking-tighter mt-1">Análise de Desempenho Fox</p>
               </div>
            </motion.button>
         </div>

         {/* Career Progression Chart Mockup */}
         {userSaves.length > 0 && (
           <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Progressão de Carreira (Temporadas)</span>
                 <TrendingUp size={14} className="text-[#7B2CBF]" />
              </div>
              <div className="h-20 flex items-end gap-2 px-2">
                 {userSaves.slice(-6).map((save, i) => {
                    const height = Math.min((save.stats?.seasonsPlayed || 1) * 10, 100);
                    return (
                       <div key={save.id} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#7B2CBF] text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                             {save.stats?.seasonsPlayed}
                          </div>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className="w-full bg-[#7B2CBF]/20 border-t-2 border-[#7B2CBF] rounded-t-lg group-hover:bg-[#7B2CBF]/40 transition-colors"
                          />
                          <span className="text-[6px] font-black text-[#444] uppercase truncate w-full text-center">{save.team}</span>
                       </div>
                    );
                 })}
              </div>
           </div>
         )}
      </section>

      {/* Badges Achievements */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
             <Trophy size={14} className="text-[#7B2CBF]" />
             <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">Conquistas ({user.badges.length})</h3>
          </div>
          <button className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Ver Tudo</button>
        </div>
        
         <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
           {BADGE_CONSTANTS.map((badge, i) => {
             const hasBadge = user.badges.includes(badge.name);
             return (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                key={badge.id} 
                className={`p-4 rounded-[24px] shrink-0 flex flex-col items-center gap-3 w-28 group transition-all border ${hasBadge ? 'bg-black/20 border-[#7B2CBF33] hover:border-[#7B2CBF66]' : 'bg-black/40 border-[#2D2D2D] opacity-40 grayscale'}`}
                title={badge.description}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${hasBadge ? 'bg-[#7B2CBF]/20 text-yellow-500 group-hover:scale-110 group-hover:rotate-12 shadow-[0_0_15px_rgba(123,44,191,0.2)]' : 'bg-white/5 text-white/20'}`}>
                   {badge.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tight text-center leading-tight line-clamp-2 ${hasBadge ? 'text-white' : 'text-[#444]'}`}>{badge.name}</span>
                {hasBadge && <div className="text-[7px] font-bold text-[#7B2CBF] uppercase tracking-tighter">Desbloqueado</div>}
              </motion.div>
             );
           })}
         </div>
      </section>

      {/* Promo Code Redemption */}
      <section className="px-2 space-y-4">
         <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
            <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">Código de Resgate</h3>
         </div>
         
         <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
               <Zap size={40} className="text-[#7B2CBF]" />
            </div>
            
            <div className="relative z-10 flex gap-2">
               <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="DIGITE SEU CÓDIGO"
                    className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-10 py-4 text-[10px] font-black uppercase tracking-widest focus:border-[#7B2CBF] outline-none text-white placeholder:text-white/20 transition-all"
                  />
                  <Shield size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
               </div>
               <button 
                  onClick={handleRedeemCode}
                  disabled={promoLoading || !promoCode}
                  className="bg-[#7B2CBF] text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
               >
                  {promoLoading ? '...' : 'Ativar'}
               </button>
            </div>
            
            {promoMessage.text && (
               <motion.p 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`text-[8px] font-black uppercase tracking-widest text-center ${promoMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
               >
                  {promoMessage.text}
               </motion.p>
            )}
         </div>
      </section>

      {/* Weekly Legendary Challenge */}
      <section className="space-y-4 px-2">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-4 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
               <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">Desafio Lendário Semanal</h3>
            </div>
            <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-2 py-0.5 rounded-lg border border-yellow-500/20 uppercase italic tracking-widest">Reset Segunda-feira</span>
         </div>
         
         <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 rounded-[40px] p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-yellow-500 group-hover:scale-110 transition-transform -rotate-12">
               <Crown size={120} />
            </div>
            
            <div className="space-y-2 relative z-10">
               <h4 className="text-sm font-black text-white uppercase italic tracking-tight">V1.5 beta: 2000+ Desafios Lendários</h4>
               <p className="text-[10px] text-[#A0A0A0] leading-relaxed italic">"O desafio da semana muda toda segunda-feira. Acumule vitórias lendárias para subir no ranking global de elite."</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl space-y-1">
                  <p className="text-[8px] font-black text-[#7B2CBF] uppercase tracking-tighter">XP Bonus</p>
                  <p className="text-lg font-black text-white">1000 XP</p>
               </div>
               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl space-y-1">
                  <p className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter">Novo Rank</p>
                  <p className="text-lg font-black text-white">Elite Fox</p>
               </div>
            </div>
            
            <button className="w-full bg-yellow-500 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/10 active:scale-95 transition-all">
               Ver Desafio da Semana
            </button>
         </div>
      </section>
      <section className="space-y-4 px-2">
         <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
            <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">Histórico de Manejo</h3>
         </div>
         
         <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[40px] overflow-hidden">
            {userSaves.length === 0 ? (
               <div className="px-8 py-10 text-center space-y-2">
                  <Activity size={24} className="mx-auto text-[#2D2D2D]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#444]">Nenhuma carreira histórica encontrada</p>
               </div>
            ) : (
               userSaves.map((save, idx) => (
                  <div key={save.id} className={`px-8 py-5 flex items-center justify-between group hover:bg-white/5 border-b border-[#2D2D2D]/50 last:border-0 transition-all`}>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#7B2CBF]/10 rounded-xl flex items-center justify-center text-[#7B2CBF] border border-[#7B2CBF22]">
                           <Shield size={18} />
                        </div>
                        <div className="text-left">
                           <h4 className="font-black text-xs uppercase italic tracking-tight text-white group-hover:text-[#7B2CBF] transition-colors">{save.team}</h4>
                           <p className="text-[8px] text-[#A0A0A0] font-black uppercase tracking-widest opacity-60">{save.game} • {save.season}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-white">{save.stats?.titles || 0} 🏆</p>
                           <p className="text-[7px] text-[#555] font-black uppercase">Títulos</p>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
         {userSaves.length > 3 && (
            <p className="text-center text-[8px] font-black uppercase tracking-widest text-[#444] animate-pulse">Exibindo as últimas {userSaves.length} jornadas</p>
         )}
      </section>

      {/* Settings Action List */}
      <section className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[40px] overflow-hidden">
        {(user.role === UserRole.CEO || user.role === UserRole.ADM) && (
          <button 
            onClick={onOpenAdmin}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-[#2D2D2D] group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#7B2CBF]/10 rounded-2xl flex items-center justify-center text-[#7B2CBF] border border-[#7B2CBF33] group-hover:scale-110 transition-all">
                <Shield size={22} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-sm uppercase italic tracking-tight">{t('ceo_panel')}</h4>
                <p className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-widest opacity-60">Segurança & Controle</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
          </button>
        )}

        {(user.role === UserRole.CEO || user.role === UserRole.ADM) && (
          <button 
            onClick={() => { sounds.click(); onOpenLogs(); }}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-[#2D2D2D] group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:scale-110 transition-all">
                <History size={22} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-sm uppercase italic tracking-tight">{t('system_logs')}</h4>
                <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest opacity-60">Debug & Atividade</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
          </button>
        )}

        <button 
          onClick={() => { sounds.click(); setIsChangingPassword(true); }}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-[#2D2D2D] group"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:scale-110 transition-all">
              <KeyRound size={22} />
            </div>
            <div className="text-left">
              <h4 className="font-black text-sm uppercase italic tracking-tight">Alterar Senha</h4>
              <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest opacity-60">Segurança da Conta</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          onClick={() => { sounds.click(); onOpenSettings(); }}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-[#2D2D2D] group"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:scale-110 transition-all">
              <Settings size={22} />
            </div>
            <div className="text-left">
              <h4 className="font-black text-sm uppercase italic tracking-tight">{t('preferences')}</h4>
              <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest opacity-60">Tema & Idioma</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          onClick={() => { sounds.click(); onLogout(); }}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-red-500/5 transition-colors group"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-all">
              <LogOut size={22} />
            </div>
            <div className="text-left">
              <h4 className="font-black text-sm uppercase italic tracking-tight text-red-500">{t('logout')}</h4>
              <p className="text-[10px] text-red-500/50 font-black uppercase tracking-widest">Logout Seguro</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-red-500/20 group-hover:translate-x-1 transition-all" />
        </button>
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F0F0F]/98 z-[200] overflow-y-auto flex items-start justify-center p-4 backdrop-blur-xl scrollbar-hide"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 30 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-6 sm:p-8 space-y-6 my-8 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
             >
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase italic text-[#7B2CBF]">Editar Perfil</h3>
                   <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 rounded-xl text-[#A0A0A0] hover:text-white transition-all"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Nome do Manager</label>
                     <input 
                       type="text" 
                       value={editForm.name}
                       onChange={e => setEditForm({...editForm, name: e.target.value})}
                       className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-sm focus:border-[#7B2CBF] outline-none text-white italic" 
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Sua Biografia</label>
                     <textarea 
                       value={editForm.bio}
                       onChange={e => setEditForm({...editForm, bio: e.target.value})}
                       className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs focus:border-[#7B2CBF] outline-none text-white italic min-h-[100px] resize-none" 
                       placeholder="Conte sua história no futebol..."
                     />
                   </div>

                    <div className="space-y-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <label className="text-[10px] font-black text-[#7B2CBF] uppercase italic ml-1 tracking-[0.2em]">Foto de Perfil</label>
                        
                        <div className="grid grid-cols-4 gap-2">
                           {AVATARS.map((avatar, idx) => (
                             <button
                               key={idx}
                               onClick={() => setEditForm({...editForm, photoUrl: avatar})}
                               className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${editForm.photoUrl === avatar ? 'border-[#7B2CBF] scale-90' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                             </button>
                           ))}
                        </div>

                        <div className="flex gap-2">
                           <div className="flex-1 space-y-2">
                              <p className="text-[8px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Ou link personalizado:</p>
                              <input 
                                type="text" 
                                value={editForm.photoUrl}
                                onChange={e => setEditForm({...editForm, photoUrl: e.target.value})}
                                placeholder="https://..."
                                className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-3 text-[10px] focus:border-[#7B2CBF] outline-none text-white italic" 
                              />
                           </div>
                           <div className="flex flex-col justify-end">
                              <label className="cursor-pointer bg-[#7B2CBF] border border-[#7B2CBF]/30 p-3 rounded-xl hover:bg-[#7B2CBF]/80 transition-all text-white flex flex-col items-center gap-1" title="Upload do seu computador">
                                 <Camera size={18} />
                                 <span className="text-[6px] font-black uppercase">Sua Foto</span>
                                 <input 
                                   type="file" 
                                   accept="image/*" 
                                   className="hidden" 
                                   onChange={(e) => handleFileUpload(e, 'photoUrl')} 
                                 />
                              </label>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <label className="text-[10px] font-black text-[#7B2CBF] uppercase italic ml-1 tracking-[0.2em]">Banner do Perfil</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide p-1">
                           {BANNERS.map(banner => (
                             <button 
                               key={banner.id}
                               onClick={() => setEditForm({...editForm, bannerUrl: banner.url})}
                               className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${editForm.bannerUrl === banner.url ? 'border-[#7B2CBF] scale-95 shadow-lg shadow-[#7B2CBF33]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                                <img src={banner.url} alt={banner.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 py-1 px-2 bg-gradient-to-t from-black/80 to-transparent text-[8px] font-black text-white uppercase">{banner.name}</div>
                                {editForm.bannerUrl === banner.url && <div className="absolute top-1 right-1 bg-[#7B2CBF] text-white p-1 rounded-full"><Check size={8} /></div>}
                             </button>
                           ))}
                        </div>

                        <div className="flex gap-2">
                           <div className="flex-1 space-y-2">
                              <p className="text-[8px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Ou link do banner:</p>
                              <input 
                                type="text" 
                                value={editForm.bannerUrl}
                                onChange={e => setEditForm({...editForm, bannerUrl: e.target.value})}
                                placeholder="https://..."
                                className="w-full bg-black/40 border border-[#2D2D2D] rounded-xl px-4 py-3 text-[10px] focus:border-[#7B2CBF] outline-none text-white italic" 
                              />
                           </div>
                           <div className="flex flex-col justify-end">
                              <label className="cursor-pointer bg-[#7B2CBF] border border-[#7B2CBF]/30 p-3 rounded-xl hover:bg-[#7B2CBF]/80 transition-all text-white flex flex-col items-center gap-1" title="Upload do seu computador">
                                 <Palette size={18} />
                                 <span className="text-[6px] font-black uppercase">Seu Banner</span>
                                 <input 
                                   type="file" 
                                   accept="image/*" 
                                   className="hidden" 
                                   onChange={(e) => handleFileUpload(e, 'bannerUrl')} 
                                 />
                              </label>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Rápido Bio Emojis</label>
                      <div className="grid grid-cols-6 gap-2">
                         {EMOJIS.map(emoji => (
                           <button 
                             key={emoji}
                             onClick={() => setEditForm({...editForm, bio: editForm.bio + ' ' + emoji})}
                             className="bg-white/5 p-2 rounded-xl text-lg hover:bg-white/10 transition-colors"
                           >
                              {emoji}
                           </button>
                         ))}
                      </div>
                   </div>

                   <button 
                     onClick={handleSaveProfile}
                     className="w-full bg-[#7B2CBF] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] flex items-center justify-center gap-3 active:scale-95 transition-all"
                   >
                     <Check size={20} /> Salvar Alterações
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 30 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-8 space-y-6"
             >
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#7B2CBF]/20 rounded-lg flex items-center justify-center text-[#7B2CBF]">
                         <Lock size={18} />
                      </div>
                      <h3 className="text-xl font-black uppercase italic text-[#7B2CBF]">Mudar Senha</h3>
                   </div>
                   <button onClick={() => setIsChangingPassword(false)} className="p-2 bg-white/5 rounded-xl text-[#A0A0A0] hover:text-white transition-all"><X size={20} /></button>
                </div>

                {pwdSuccess ? (
                  <div className="py-10 text-center space-y-4 animate-fade-in">
                     <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                        <Check size={32} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest text-green-500">Senha Alterada com Sucesso!</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Nova Senha</label>
                       <div className="relative">
                         <input 
                           type="password" 
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-12 py-4 text-sm focus:border-[#7B2CBF] outline-none text-white transition-all" 
                           placeholder="••••••••"
                           required
                         />
                         <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#A0A0A0] uppercase italic ml-1 tracking-widest">Confirmar Nova Senha</label>
                       <div className="relative">
                         <input 
                           type="password" 
                           value={confirmNewPassword}
                           onChange={e => setConfirmNewPassword(e.target.value)}
                           className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-12 py-4 text-sm focus:border-[#7B2CBF] outline-none text-white transition-all" 
                           placeholder="••••••••"
                           required
                         />
                         <Check size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
                       </div>
                    </div>

                    {pwdError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center">{pwdError}</p>}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#7B2CBF] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><KeyRound size={20} /> Atualizar Senha</>
                      )}
                    </button>
                  </form>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] text-white font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
           <Shield size={10} /> Fox Managers V1.5 beta (Atual)
        </p>
      </div>
    </div>
  );
}
