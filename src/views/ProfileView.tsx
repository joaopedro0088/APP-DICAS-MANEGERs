/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { 
  Settings, Shield, History, LogOut, Award, ChevronRight, 
  User as UserIcon, Edit3, Check, X, Camera, Smile, Star, Trophy,
  Lock, KeyRound, BarChart3, Target, Calendar, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';

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

export default function ProfileView({ user, onOpenAdmin, onOpenLogs, onOpenSettings, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [userSaves, setUserSaves] = useState<any[]>([]);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    photoUrl: user?.photoUrl || ''
  });

  useEffect(() => {
    const fetchUserSaves = async () => {
      if (user) {
        const saves = await storage.getSaves(user.id);
        setUserSaves(saves);
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
    bestSave: [...userSaves].sort((a, b) => (b.stats?.titles || 0) - (a.stats?.titles || 0))[0],
    favoriteGame: user.favoriteGames?.[0] || 'Football Manager 25'
  };

  const handleSaveProfile = async () => {
    sounds.click();
    const updatedUser = { ...user, ...editForm };
    await storage.setCurrentUser(updatedUser);
    sounds.success();
    setIsEditing(false);
    window.location.reload(); // Refresh to update all components
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
      <section className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B2CBF] opacity-10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
        
        <div className="flex flex-col items-center gap-4 text-center relative z-10">
          <div className="relative">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center p-1 border-2 ${user.role === UserRole.CEO ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-[#7B2CBF]'}`}>
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full bg-[#2D2D2D] rounded-2xl flex items-center justify-center text-[#A0A0A0]">
                  <UserIcon size={40} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#7B2CBF] text-white text-[10px] font-black px-2 py-1 rounded-lg border-2 border-[#1A1A1A] shadow-lg">
              LVL {user.level}
            </div>
            <button 
              onClick={() => setIsEditing(true)} 
              className="absolute -top-2 -right-2 p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white/40 hover:text-[#7B2CBF] hover:scale-110 transition-all"
            >
              <Edit3 size={14} />
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
               <h2 className="text-2xl font-black uppercase italic tracking-tight">{user.name}</h2>
               {user.role === UserRole.CEO && <Star size={16} fill="#EAB308" className="text-yellow-500 animate-pulse" />}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                user.role === UserRole.CEO ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                user.role === UserRole.ADM ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                user.role === UserRole.MOD ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                'bg-[#2D2D2D]/50 text-[#A0A0A0] border-white/5'
              }`}>
                {user.role}
              </span>
              <span className="text-[10px] text-[#555] font-black uppercase tracking-widest">{user.email}</span>
            </div>
          </div>

          <p className="text-xs text-[#A0A0A0] max-w-[80%] mx-auto font-medium italic opacity-80 leading-relaxed">
             {user.bio || 'Adicione uma bio para seu perfil gamer...'}
          </p>
        </div>
      </section>

      {/* Global Statistics */}
      <section className="space-y-4 px-2">
         <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full"></div>
            <h3 className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">Estatísticas Globais</h3>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-3 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#7B2CBF]/10 flex items-center justify-center text-[#7B2CBF]">
                     <Calendar size={16} />
                  </div>
                  <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-widest">Temporadas</span>
               </div>
               <p className="text-2xl font-black text-white">{summaryStats.totalSeasons}</p>
               <div className="absolute right-[-10px] bottom-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                  <Calendar size={60} />
               </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-3 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                     <Trophy size={16} />
                  </div>
                  <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-widest">Títulos</span>
               </div>
               <p className="text-2xl font-black text-white">{summaryStats.totalTitles}</p>
               <div className="absolute right-[-10px] bottom-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                  <Trophy size={60} />
               </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-3 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                     <BarChart3 size={16} />
                  </div>
                  <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-widest">Vitórias</span>
               </div>
               <p className="text-xl font-black text-white">{summaryStats.totalWins}</p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-3 relative overflow-hidden group hover:border-[#7B2CBF44] transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#7B2CBF]/10 flex items-center justify-center text-[#7B2CBF]">
                     <Target size={16} />
                  </div>
                  <span className="text-[9px] font-black text-[#A0A0A0] uppercase tracking-widest">Melhor</span>
               </div>
               <p className="text-[10px] font-black text-white truncate uppercase">{summaryStats.bestSave?.team || 'Nenhum'}</p>
            </div>
         </div>
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
          {user.badges.map((badge, i) => (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-black/20 border border-white/5 p-4 rounded-[24px] shrink-0 flex flex-col items-center gap-3 w-28 group hover:border-[#7B2CBF33] transition-all"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:scale-110 group-hover:rotate-12 transition-all">
                <Award size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight line-clamp-2">{badge}</span>
            </motion.div>
          ))}
          {user.badges.length === 0 && (
            <div className="w-full text-center py-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
               <p className="text-[10px] font-black text-[#666] uppercase">Inicie sua jornada para ganhar badges</p>
            </div>
          )}
        </div>
      </section>

      {/* Settings Action List */}
      <section className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[40px] overflow-hidden">
        {user.role === UserRole.CEO && (
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

        {user.role === UserRole.CEO && (
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
            className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 30 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-8 space-y-6"
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
           <Shield size={10} /> Fox Managers v3.0 Powered
        </p>
      </div>
    </div>
  );
}
