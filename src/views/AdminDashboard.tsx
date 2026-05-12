/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, Report, AppLog, GeneratorItem, ImportedCareer, CommunityTip, LibraryIdea, OfficialChallenge, PromoCode } from '../types';
import { INITIAL_GEN_LISTS } from '../data/generatorData';
import { storage } from '../store';
import { 
  Users, AlertTriangle, FileText, Settings, Shield, 
  ChevronLeft, Ban, Check, X, ShieldAlert, Plus, Search,
  Trash2, ArrowUpCircle, ArrowDownCircle, Info, Briefcase, Globe2, 
  MessageSquare, Edit3, Save, Eye, Crown, Zap, Flame, LayoutDashboard,
  ShieldCheck, Terminal, ToggleRight, History, Bell, Activity, MousePointer2,
  LogOut, Download, Upload, User as UserIcon, List, Trophy, Gamepad2,
  RefreshCw, Target, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CAREER_CATEGORIES, GAMES, COUNTRIES, TEAM_SIZES, GEN_TYPES, DIFFICULTIES } from '../constants';
import { sounds } from '../utils/sounds';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

export default function AdminDashboard({ user, onBack }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [activePanel, setActivePanel] = useState<'dashboard' | 'users' | 'reports' | 'tips' | 'careers' | 'library' | 'system' | 'geral' | 'codes' | 'events' | 'halloffame' | 'logs'>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [genLists, setGenLists] = useState<GeneratorItem[]>([]);
  const [careers, setCareers] = useState<ImportedCareer[]>([]);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [library, setLibrary] = useState<LibraryIdea[]>([]);
  const [saves, setSaves] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<OfficialChallenge[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [weeklyEvents, setWeeklyEvents] = useState<any[]>([]);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [promoEmail, setPromoEmail] = useState('');

  const [appSettings, setAppSettings] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [managedEras, setManagedEras] = useState<string[]>([]);
  const [managedGames, setManagedGames] = useState<string[]>([]);
  const [managedDifficulties, setManagedDifficulties] = useState<string[]>([]);

  useEffect(() => {
    if (appSettings) {
      setManagedEras(appSettings.managedEras && appSettings.managedEras.length > 0 ? appSettings.managedEras : CAREER_CATEGORIES);
      setManagedGames(appSettings.managedGames && appSettings.managedGames.length > 0 ? appSettings.managedGames : GAMES);
      setManagedDifficulties(appSettings.managedDifficulties && appSettings.managedDifficulties.length > 0 ? appSettings.managedDifficulties : DIFFICULTIES);
    }
  }, [appSettings]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const settings = await storage.getAppSettings();
        setAppSettings(settings);
        await refreshData();
      } catch (err) {
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshData = async () => {
    setError(null);
    try {
      const [u, r, l, g, c, t, lib, s, ch, set, codes, events, hof] = await Promise.all([
        storage.getUsers(),
        storage.getReports(),
        storage.getLogs(),
        storage.getGenLists(),
        storage.getImportedCareers(),
        storage.getCommunityTips(),
        storage.getLibraryIdeas(),
        storage.getSaves(),
        storage.getOfficialChallenges(),
        storage.getAppSettings(),
        storage.getCodes(),
        storage.getWeeklyEvents(),
        storage.getHallOfFame()
      ]);
      setUsers(u);
      setReports(r);
      setLogs(l);
      setGenLists(g);
      setCareers(c);
      setTips(t);
      setLibrary(lib);
      setSaves(s);
      setChallenges(ch);
      setAppSettings(set);
      setPromoCodes(codes);
      setWeeklyEvents(events);
      setHallOfFame(hof);
    } catch (e) {
      console.error("Error refreshing admin data:", e);
      setError("Não foi possível carregar os dados.");
      throw e;
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    let badges = users.find(u => u.id === userId)?.badges || [];
    if (role === UserRole.ADM && !badges.includes('ADM Fox')) badges.push('ADM Fox');
    if (role === UserRole.USER) badges = badges.filter(b => b !== 'ADM Fox');
    
    await storage.updateUser(userId, { role, badges });
    refreshData();
  };

  const handleUpdateUserFull = async (userId: string, updates: Partial<User>) => {
    await storage.updateUser(userId, updates);
    refreshData();
    setEditingItem(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Deseja realmente REMOVER este Manager?')) return;
    await storage.deleteUser(userId);
    const remaining = users.filter(u => u.id !== userId);
    setUsers(remaining);
  };

  const handleResetLevel = async (userId: string) => {
    if (!confirm('Deseja realmente RESETAR o nível deste Manager para 1?')) return;
    await storage.updateUser(userId, { level: 1 });
    refreshData();
    alert('Nível resetado com sucesso!');
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      const updated = { ...appSettings, ...newSettings };
      setAppSettings(updated);
      await storage.setAppSettings(updated);
      sounds.success();
    } catch (e) {
      console.error("Error updating settings:", e);
      sounds.error();
      alert("Erro ao salvar configurações.");
    }
  };

  const handleAdminPromotion = async () => {
    if (!promoEmail) return;
    const userToPromote = users.find(u => u.email.toLowerCase() === promoEmail.toLowerCase());
    
    if (userToPromote) {
      if (userToPromote.role === UserRole.CEO) {
        alert('Este usuário já é CEO.');
        return;
      }
      const badges = [...userToPromote.badges];
      if (!badges.includes('ADM Fox')) badges.push('ADM Fox');
      await storage.updateUser(userToPromote.id, { role: UserRole.ADM, badges });
      setPromoEmail('');
      refreshData();
      alert(`Usuário ${userToPromote.name} promovido a ADM!`);
    } else {
      alert('Usuário não encontrado.');
    }
  };

  const handleDeleteItem = async (id: string, type: 'save' | 'tip' | 'idea' | 'challenge' | 'career' | 'genlist' | 'event' | 'hof' | 'report') => {
    if (!confirm('Você tem certeza que deseja apagar permanentemente este item?')) return;
    
    try {
      if (type === 'save') await storage.deleteSave(id);
      else if (type === 'tip') await storage.deleteCommunityTip(id);
      else if (type === 'idea') {
        const remaining = library.filter(i => i.id !== id);
        await storage.setLibraryIdeas(remaining);
      }
      else if (type === 'challenge') {
        const remaining = challenges.filter(c => c.id !== id);
        await storage.setOfficialChallenges(remaining);
      }
      else if (type === 'career') await storage.deleteImportedCareer(id);
      else if (type === 'genlist') {
        const remaining = genLists.filter(g => g.id !== id);
        await storage.setGenLists(remaining);
      }
      else if (type === 'event') await storage.deleteWeeklyEvent(id);
      else if (type === 'hof') await storage.deleteFromHallOfFame(id);
      else if (type === 'report') await storage.deleteReport(id);
      refreshData();
      alert('Item removido com sucesso.');
    } catch (e) {
      alert('Erro ao remover item.');
    }
  };

  const handleLogin = () => {
    sounds.click();
    const normalizedName = nameInput.toLowerCase().trim();
    const isSpecialUser = normalizedName === 'joaopedroo' || normalizedName === 'admuser' || normalizedName === 'foxmanager';
    const isCeoOrAdm = user.role === UserRole.CEO || user.role === UserRole.ADM;

    // Se o usuário já tiver o cargo no sistema, o nome é secundário se a senha estiver correta
    if ((isCeoOrAdm || isSpecialUser) && passInput === '12345678910haha@') {
      setIsAuthenticated(true);
      sounds.success();
    } else {
      sounds.error();
      alert('Acesso Negado. Verifique o Nome e a Senha digitados.');
    }
  };

  if (!isAuthenticated && (user.role === UserRole.CEO || user.role === UserRole.ADM)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A1A1A] border border-[#2D2D2D] p-10 rounded-[40px] w-full max-w-sm space-y-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-[#7B2CBF]/10 rounded-full flex items-center justify-center mx-auto border border-[#7B2CBF33]">
             <Shield size={40} className="text-[#7B2CBF]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic text-white tracking-widest">Área Restrita</h3>
            <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.2em]">Insira a chave mestra Fox</p>
          </div>
          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-[#444] ml-2">Identificação CEO</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="NOME"
                className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-center text-sm focus:border-[#7B2CBF] outline-none text-white font-black tracking-widest"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-[#444] ml-2">Código de Acesso</label>
              <input 
                type="password" 
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                placeholder="SENHA"
                className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-center text-sm focus:border-[#7B2CBF] outline-none text-white font-black tracking-[0.5em]"
              />
            </div>
            <div className="flex gap-3 pt-4">
               <button onClick={onBack} className="flex-1 bg-white/5 py-4 rounded-2xl text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Voltar</button>
               <button onClick={handleLogin} className="flex-[2] bg-[#7B2CBF] py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-[#7B2CBF33]">Acessar</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 space-y-6">
        <RefreshCw size={40} className="text-[#7B2CBF] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-[#A0A0A0]">Carregando dados do gerador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 space-y-6 text-center">
        <AlertTriangle size={40} className="text-red-500" />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-white">{error}</p>
          <p className="text-[10px] text-[#A0A0A0] uppercase font-bold">Verifique sua conexão ou permissões</p>
        </div>
        <button onClick={() => refreshData()} className="bg-[#7B2CBF] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#7B2CBF33]">
           Tentar novamente
        </button>
      </div>
    );
  }

  const handleExportData = async (type?: 'all' | 'careers' | 'generator') => {
    let data: any = {};
    let filename = `fox_backup_${new Date().toISOString().split('T')[0]}.json`;

    if (type === 'careers') {
      data = { careers: await storage.getImportedCareers() };
      filename = `fox_careers_${Date.now()}.json`;
    } else if (type === 'generator') {
      data = { 
        challenges: await storage.getOfficialChallenges(),
        genLists: await storage.getGenLists()
      };
      filename = `fox_generator_${Date.now()}.json`;
    } else {
      data = {
        tips: await storage.getCommunityTips(),
        ideas: await storage.getLibraryIdeas(),
        challenges: await storage.getOfficialChallenges(),
        careers: await storage.getImportedCareers(),
        genLists: await storage.getGenLists(),
        settings: await storage.getAppSettings()
      };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let importedCount = 0;

        if (data.tips) { await storage.setCommunityTips(data.tips); importedCount++; }
        if (data.ideas) { await storage.setLibraryIdeas(data.ideas); importedCount++; }
        if (data.challenges) { await storage.setOfficialChallenges(data.challenges); importedCount++; }
        if (data.careers) { await storage.setImportedCareers(data.careers); importedCount++; }
        if (data.genLists) { await storage.setGenLists(data.genLists); importedCount++; }
        if (data.settings) { await storage.setAppSettings(data.settings); importedCount++; }
        
        await refreshData();
        alert(`Sucesso! ${importedCount} categorias de dados foram atualizadas.`);
      } catch (err) {
        alert('Erro ao processar arquivo JSON. Verifique a estrutura.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const moderateTip = async (tipId: string, status: 'approved' | 'rejected') => {
    const updatedTips = tips.map(t => t.id === tipId ? { ...t, status, moderatedBy: user.name } : t);
    await storage.setCommunityTips(updatedTips);
    setTips(updatedTips);
  };

  const promoteToOfficial = async (tip: CommunityTip) => {
    const newIdea: LibraryIdea = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'community',
      title: tip.title,
      content: tip.content,
      authorName: tip.authorName
    };
    
    const updatedLibrary = [...library, newIdea];
    await storage.setLibraryIdeas(updatedLibrary);
    setLibrary(updatedLibrary);
    await moderateTip(tip.id, 'approved');
  };

  const recentActivity = [
    { text: 'João criou um novo save', icon: <Save size={10}/>, time: '2 min atrás' },
    { text: 'Nova denúncia enviada', icon: <AlertTriangle size={10} className="text-red-500"/>, time: '15 min atrás' },
    { text: 'Novo log v3.0 publicado', icon: <Terminal size={10}/>, time: '1h atrás' },
    { text: 'Ricardo tornou-se ADM', icon: <Shield size={10}/>, time: '3h atrás' }
  ];

  return (
    <div className="space-y-8 pb-32 px-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-all"><ChevronLeft size={20} /></button>
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Painel CEO</h2>
            <div className="flex items-center gap-2">
               <ShieldCheck size={12} className="text-[#7B2CBF]" />
               <span className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-[0.2em]">CEO ACCESS</span>
            </div>
          </div>
        </div>
        <div className="bg-[#7B2CBF]/10 border border-[#7B2CBF33] p-3 rounded-2xl">
           <Zap size={24} className="text-[#7B2CBF]" />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
        <TabBtn active={activePanel === 'dashboard'} onClick={() => setActivePanel('dashboard')} icon={<LayoutDashboard size={12}/>}>Resumo</TabBtn>
        <TabBtn active={activePanel === 'users'} onClick={() => setActivePanel('users')} icon={<Users size={12}/>}>Managers</TabBtn>
        <TabBtn active={activePanel === 'careers'} onClick={() => setActivePanel('careers')} icon={<Globe2 size={12}/>}>Carreiras</TabBtn>
        <TabBtn active={activePanel === 'library'} onClick={() => setActivePanel('library')} icon={<Zap size={12}/>}>Gerador</TabBtn>
        <TabBtn active={activePanel === 'tips'} onClick={() => setActivePanel('tips')} icon={<MessageSquare size={12}/>}>Moderação</TabBtn>
        <TabBtn active={activePanel === 'geral'} onClick={() => setActivePanel('geral')} icon={<Settings size={12}/>}>Geral</TabBtn>
        <TabBtn active={activePanel === 'events'} onClick={() => setActivePanel('events')} icon={<Flame size={12}/>}>Eventos</TabBtn>
        <TabBtn active={activePanel === 'halloffame'} onClick={() => setActivePanel('halloffame')} icon={<Trophy size={12}/>}>Lendas</TabBtn>
        <TabBtn active={activePanel === 'codes'} onClick={() => setActivePanel('codes')} icon={<Ticket size={12}/>}>Códigos</TabBtn>
        <TabBtn active={activePanel === 'system'} onClick={() => setActivePanel('system')} icon={<Save size={12}/>}>Backup</TabBtn>
        <TabBtn active={activePanel === 'reports'} onClick={() => setActivePanel('reports')} icon={<ShieldAlert size={12}/>}>Reports</TabBtn>
        <TabBtn active={activePanel === 'logs'} onClick={() => setActivePanel('logs')} icon={<Terminal size={12}/>}>Auditoria</TabBtn>
      </div>

      {/* Panel Content Rendering */}
      <div className="space-y-6">
        {activePanel === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <StatsOverviewCard icon={<Users size={18}/>} label="Usuários" val={users.length} desc="Total Registrados" color="text-blue-500" onClick={() => setActivePanel('users')} />
              <StatsOverviewCard icon={<AlertTriangle size={18}/>} label="Denúncias" val={reports.filter(r => r.status === 'pendente' || r.status === 'pending').length} color="text-red-500" desc="Pendentes" alert={reports.filter(r => r.status === 'pendente' || r.status === 'pending').length > 0} onClick={() => setActivePanel('reports')} />
              <StatsOverviewCard icon={<Save size={18}/>} label="Saves" val={saves.length} desc="Exploração" color="text-green-500" />
              <StatsOverviewCard icon={<Globe2 size={18}/>} label="Carreiras" val={careers.length} desc="Importadas" color="text-yellow-500" onClick={() => setActivePanel('careers')} />
              <StatsOverviewCard icon={<Trophy size={18}/>} label="Ideias" val={library.length} desc="Na Biblioteca" color="text-[#7B2CBF]" onClick={() => setActivePanel('library')} />
              <StatsOverviewCard icon={<Terminal size={18}/>} label="Logs" val={logs.length} desc="Audit Logs" color="text-white/50" onClick={() => setActivePanel('logs')} />
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#A0A0A0] flex items-center gap-2">
                    <Activity size={14} className="text-[#7B2CBF]" /> Atividade Recente
                  </h3>
               </div>
               <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[32px] overflow-hidden">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-5 border-b border-[#2D2D2D] last:border-0 hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="p-2 bg-black/40 rounded-xl">{act.icon}</div>
                          <p className="text-xs font-bold text-white uppercase italic">{act.text}</p>
                       </div>
                       <span className="text-[8px] font-black text-[#666] uppercase">{act.time}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                  <Settings size={14} className="text-[#7B2CBF]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#A0A0A0]">Configurações Rápidas</h3>
               </div>
               <div className="grid grid-cols-2 gap-3">
                {appSettings && (
                  <>
                    <QuickToggle label="Gerador Ativo" active={appSettings.generatorActive} onToggle={() => handleUpdateSettings({ generatorActive: !appSettings.generatorActive })} />
                    <QuickToggle label="Uploads Permitidos" active={appSettings.uploadsAllowed} onToggle={() => handleUpdateSettings({ uploadsAllowed: !appSettings.uploadsAllowed })} />
                  </>
                )}
              </div>
            </div>

            <div className="pt-6 space-y-3">
               <div className="flex gap-2">
                  <button onClick={() => { sounds.click(); refreshData(); }} className="flex-1 bg-white/5 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-[#7B2CBF] hover:bg-[#7B2CBF]/10 transition-all">
                     <RefreshCw size={14}/> Sincronizar
                  </button>
                  <button onClick={() => {
                     sounds.click();
                     const data = { genLists, challenges, tips, importedCareers: careers, appSettings };
                     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `fox-backup-${new Date().toISOString().split('T')[0]}.json`;
                     a.click();
                  }} className="flex-1 bg-white/5 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-green-500 hover:bg-green-500/10 transition-all">
                     <Download size={14}/> Exportar
                  </button>
                  <button onClick={() => {
                     sounds.click();
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = 'application/json';
                     input.onchange = async (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                           const reader = new FileReader();
                           reader.onload = async (re: any) => {
                              try {
                                 const data = JSON.parse(re.target.result);
                                 if (data.genLists) await storage.setGenLists(data.genLists);
                                 if (data.importedCareers) await storage.setImportedCareers(data.importedCareers);
                                 if (data.appSettings) await storage.setAppSettings(data.appSettings);
                                 alert('Dados importados com sucesso!');
                                 refreshData();
                              } catch (err) {
                                 alert('Erro ao importar arquivo.');
                              }
                           };
                           reader.readAsText(file);
                        }
                     };
                     input.click();
                  }} className="flex-1 bg-white/5 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-blue-500 hover:bg-blue-500/10 transition-all">
                     <Upload size={14}/> Importar
                  </button>
               </div>
               <p className="text-[8px] text-center text-[#444] font-bold uppercase tracking-wider">Fox Cloud Sync v2.4 • Base Protegida</p>
            </div>
          </motion.div>
        )}

        {activePanel === 'users' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col gap-4 px-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-[#A0A0A0]">Listagem de Managers</h3>
                   <span className="text-[9px] font-black text-[#7B2CBF]">{users.length} Registros</span>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 relative">
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Procurar manager..." className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-10 py-4 text-[10px] text-white outline-none focus:border-[#7B2CBF] uppercase font-black" />
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
                   </div>
                   <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-2xl px-4 text-[10px] text-white font-black uppercase">
                      <option value="all">TODOS</option>
                      <option value={UserRole.USER}>MEMBER</option>
                      <option value={UserRole.ADM}>ADM</option>
                      <option value={UserRole.CEO}>CEO</option>
                   </select>
                </div>
             </div>

             <div className="space-y-3">
                {users
                  .filter(u => (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) && (filterRole === 'all' || u.role === filterRole))
                  .map(u => (
                  <div key={u.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-4 group">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5">
                              {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : <UserIcon className="m-auto text-white/10" />}
                           </div>
                           <div className="space-y-0.5">
                              <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{u.name}</h4>
                              <p className="text-[9px] text-[#444] font-bold uppercase">{u.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setEditingItem({ ...u, _type: 'user' })} className="p-2 bg-white/5 text-[#A0A0A0] hover:text-[#7B2CBF] rounded-lg transition-all"><Edit3 size={14} /></button>
                           <span className={`text-[7px] font-black px-2 py-0.5 rounded-lg border ${u.role === UserRole.CEO ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-white/5 text-[#A0A0A0] border-white/10'}`}>{u.role}</span>
                        </div>
                     </div>
                     {u.role !== UserRole.CEO && (
                       <div className="flex gap-2 pt-2">
                          <button onClick={() => handleUpdateUserRole(u.id, u.role === UserRole.USER ? UserRole.ADM : UserRole.USER)} className="flex-1 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-[#7B2CBF]/10 hover:text-[#7B2CBF] transition-all">
                             {u.role === UserRole.USER ? 'Dar ADM' : 'Remover ADM'}
                          </button>
                          <button onClick={async () => {
                             if(confirm(`Deseja enviar um e-mail de redefinição de senha para ${u.email}?`)) {
                               const res = await storage.resetPassword(u.email);
                               alert(res.message);
                             }
                           }} className="flex-1 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-500/10 hover:text-yellow-500 transition-all">
                             Reset Password
                          </button>
                          <button onClick={() => handleResetLevel(u.id)} className="flex-1 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white/10 transition-all">
                             Resetar Nível
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-3 bg-red-500/5 text-red-500/30 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                             <Trash2 size={14} />
                          </button>
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        )}

        {activePanel === 'careers' && (
           <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between px-2">
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Base de Carreiras</h3>
                    <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest">Gestão de Curadoria CEO</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => { setIsAddingNew(true); setEditingItem({ id: '', team: '', country: '', league: '', objective: '', rules: '', style: '', difficulty: 'Médio', game: managedGames[0], type: 'Official', authorName: 'Fox Team', status: 'approved', _type: 'career' }); }} className="flex items-center gap-2 px-4 py-2 bg-[#7B2CBF] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all">
                      <Plus size={14}/> Novo Item
                    </button>
                    <button onClick={() => handleExportData('careers')} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#A0A0A0] hover:text-white transition-all"><Download size={14}/></button>
                 </div>
              </div>

              <div className="space-y-4">
                 {careers.length === 0 && (
                   <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-10 rounded-[40px] text-center space-y-2">
                      <Globe2 size={40} className="mx-auto text-[#2D2D2D]" />
                      <p className="text-[10px] font-black text-[#444] uppercase">Nenhuma carreira oficial cadastrada</p>
                   </div>
                 )}
                 {careers.map(career => (
                    <div key={career.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4 hover:border-[#7B2CBF44] transition-all group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-[#7B2CBF] border border-white/5">
                                <Zap size={20} />
                             </div>
                             <div className="space-y-0.5">
                                <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{career.team}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-black uppercase text-[#7B2CBF] px-2 py-0.5 bg-[#7B2CBF]/10 rounded-lg">{career.game}</span>
                                  <span className="text-[8px] font-black uppercase text-yellow-500 px-2 py-0.5 bg-yellow-500/10 rounded-lg">{career.type}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => setEditingItem({ ...career, _type: 'career' })} className="p-3 bg-white/5 text-[#A0A0A0] hover:text-[#7B2CBF] rounded-xl transition-all"><Edit3 size={16} /></button>
                             <button onClick={() => handleDeleteItem(career.id, 'career')} className="p-3 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </div>
                       </div>
                       <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-[#A0A0A0] italic leading-relaxed">"{career.objective}"</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activePanel === 'library' && (
          <div className="space-y-12 animate-fade-in pb-20">
            {/* Header Tools */}
            <div className="bg-gradient-to-br from-[#7B2CBF]/20 via-transparent to-transparent border border-[#7B2CBF33] p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Zap size={200} className="text-[#7B2CBF]" />
               </div>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Painel Gerador</h3>
                     <p className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-widest">Controle de Algoritmos & Curadoria</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleExportData('generator')} className="p-4 bg-[#7B2CBF]/10 text-[#7B2CBF] rounded-2xl hover:bg-[#7B2CBF] hover:text-white transition-all shadow-lg active:scale-95">
                        <Download size={18}/>
                     </button>
                     <label className="p-4 bg-white/5 text-[#A0A0A0] rounded-2xl hover:text-white transition-all cursor-pointer">
                        <Upload size={18}/>
                        <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                     </label>
                  </div>
               </div>
               
                  <div className="flex gap-2">
                     <button onClick={async () => {
                        if(confirm('ATENÇÃO: Isso irá substituir TODAS as listas do gerador pelos dados originais do sistema. Continuar?')) {
                           sounds.click();
                           try {
                              await storage.setGenLists(INITIAL_GEN_LISTS);
                              alert('Gerador reiniciado com sucesso!');
                              refreshData();
                           } catch (e) {
                              alert('Erro ao reiniciar gerador.');
                           }
                        }
                     }} className="bg-red-500/10 text-red-500 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all">
                        <RefreshCw size={14}/> Reiniciar
                     </button>
                     <button onClick={() => { 
                       sounds.click();
                       setIsAddingNew(true); 
                       setEditingItem({ 
                          id: '', 
                          team: '', 
                          objective: '', 
                          rules: '', 
                          style: '', 
                          difficulty: managedDifficulties[0] || 'Médio', 
                          game: managedGames[0] || 'Football Manager', 
                          type: 'Official', 
                          authorName: 'Fox Team', 
                          status: 'approved', 
                          _type: 'career' 
                       }); 
                     }} className="flex-1 bg-[#7B2CBF] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all">
                        <Plus size={14}/> Carreira
                     </button>
                     <button onClick={() => { 
                       sounds.click();
                       setIsAddingNew(true); 
                       setEditingItem({ 
                          id: '', 
                          title: '', 
                          content: '', 
                          game: managedGames[0] || 'Football Manager', 
                          category: managedEras[0] || 'Rebuild', 
                          status: 'approved', 
                          publishedToCommunity: true, 
                          _type: 'tip' 
                       }); 
                     }} className="flex-1 bg-white/5 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#7B2CBF]/10 border border-white/5 active:scale-95 transition-all">
                        <MessageSquare size={14}/> Dica
                     </button>
                  </div>
            </div>

            {/* Section 1: Carreiras Oficiais */}
            <section className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-4 bg-[#7B2CBF] rounded-full shadow-[0_0_10px_#7B2CBF]"></div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Listas do Gerador (Offline)</h4>
                  </div>
                  <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full text-[#666] uppercase">{genLists.length} Jogos Ativos</span>
               </div>

               <div className="space-y-4 px-2">
                  {genLists.length === 0 && (
                    <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-12 rounded-[40px] text-center space-y-3">
                       <LayoutDashboard size={40} className="mx-auto text-[#2D2D2D]" />
                       <p className="text-[10px] font-black text-[#555] uppercase tracking-widest">Nenhuma lista global configurada</p>
                    </div>
                  )}
                  {genLists.map(list => (
                    <div key={list.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[36px] space-y-6 hover:border-[#7B2CBF44] transition-all relative group shadow-xl">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-[#7B2CBF] border border-white/5 shadow-inner">
                                <Gamepad2 size={24} />
                             </div>
                             <div className="space-y-0.5">
                                <h5 className="text-[14px] font-black uppercase text-white tracking-tighter italic">{list.game}</h5>
                                <p className="text-[9px] font-black text-[#7B2CBF] uppercase tracking-widest">Dataset do Gerador</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => setEditingItem({ ...list, _type: 'genlist' })} className="p-3 bg-white/5 text-[#A0A0A0] hover:text-[#7B2CBF] rounded-xl transition-all"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeleteItem(list.id, 'genlist')} className="p-3 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <ListStatItem label="Times" count={list.teams.length} icon={<Users size={10}/>} />
                          <ListStatItem label="Objetivos" count={list.objectives.length} icon={<Target size={10}/>} />
                          <ListStatItem label="Regras" count={list.rules.length} icon={<Shield size={10}/>} />
                          <ListStatItem label="Estilos" count={list.styles.length} icon={<Flame size={10}/>} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Section 2: Dicas do Gerador */}
            <section className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-4 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Dicas do Gerador</h4>
                  </div>
                  <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full text-[#666] uppercase">{tips.length} Cadastradas</span>
               </div>

               <div className="space-y-3 px-2">
                  {tips.length === 0 && (
                    <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-10 rounded-[40px] text-center">
                       <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Sem dicas catalogadas</p>
                    </div>
                  )}
                  {tips.map(tip => (
                    <div key={tip.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[28px] flex items-center justify-between hover:bg-white/5 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner ${tip.status === 'approved' ? 'text-green-500 bg-green-500/5' : 'text-yellow-500 bg-yellow-500/5'}`}>
                             <MessageSquare size={16} />
                          </div>
                          <div className="space-y-0.5">
                             <h6 className="text-[10px] font-black uppercase text-white tracking-widest truncate max-w-[150px]">{tip.title}</h6>
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-[#A0A0A0] uppercase italic">{tip.game}</span>
                                <span className="text-[7px] font-black text-[#555] uppercase tracking-widest border border-white/5 px-1.5 rounded-lg">{tip.category}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditingItem({ ...tip, _type: 'tip' })} className="p-2 bg-white/5 text-[#A0A0A0] hover:text-[#7B2CBF] rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>
                          <button onClick={() => handleDeleteItem(tip.id, 'tip')} className="p-2 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Section 3: Configurações Globais */}
            <section className="space-y-4">
               <div className="flex items-center gap-3 px-4">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A0A0A0]">Listas Globais</h4>
               </div>
               
               <div className="grid grid-cols-1 gap-3 px-2">
                  <GlobalListCard 
                    title="Dificuldades" 
                    items={managedDifficulties} 
                    onAdd={(n: string) => {
                      const updated = [...managedDifficulties, n];
                      setManagedDifficulties(updated);
                      handleUpdateSettings({ managedDifficulties: updated });
                    }}
                    onRemove={(idx: number) => {
                      const updated = managedDifficulties.filter((_, i) => i !== idx);
                      setManagedDifficulties(updated);
                      handleUpdateSettings({ managedDifficulties: updated });
                    }}
                    onEdit={(idx: number, n: string) => {
                      const updated = [...managedDifficulties];
                      updated[idx] = n;
                      setManagedDifficulties(updated);
                      handleUpdateSettings({ managedDifficulties: updated });
                    }}
                  />
                  <GlobalListCard 
                    title="Jogos Ativos" 
                    items={managedGames} 
                    onAdd={(n: string) => {
                      const updated = [...managedGames, n];
                      setManagedGames(updated);
                      handleUpdateSettings({ managedGames: updated });
                    }}
                    onRemove={(idx: number) => {
                      const updated = managedGames.filter((_, i) => i !== idx);
                      setManagedGames(updated);
                      handleUpdateSettings({ managedGames: updated });
                    }}
                    onEdit={(idx: number, n: string) => {
                      const updated = [...managedGames];
                      updated[idx] = n;
                      setManagedGames(updated);
                      handleUpdateSettings({ managedGames: updated });
                    }}
                  />
                  <div className="flex justify-start px-2">
                     <button 
                       onClick={() => {
                          if(confirm('Aplicar novos jogos padrão do sistema?')) {
                             setManagedGames(GAMES);
                             handleUpdateSettings({ managedGames: GAMES });
                          }
                       }}
                       className="text-[9px] font-black uppercase text-[#7B2CBF] hover:text-white transition-all px-3 py-1.5 border border-[#7B2CBF33] rounded-lg"
                     >
                       Sincronizar Novos Padrões
                     </button>
                  </div>
                  <GlobalListCard 
                    title="Eras / Categorias" 
                    items={managedEras} 
                    onAdd={(n: string) => {
                      const updated = [...managedEras, n];
                      setManagedEras(updated);
                      handleUpdateSettings({ managedEras: updated });
                    }}
                    onRemove={(idx: number) => {
                      const updated = managedEras.filter((_, i) => i !== idx);
                      setManagedEras(updated);
                      handleUpdateSettings({ managedEras: updated });
                    }}
                    onEdit={(idx: number, n: string) => {
                      const updated = [...managedEras];
                      updated[idx] = n;
                      setManagedEras(updated);
                      handleUpdateSettings({ managedEras: updated });
                    }}
                  />
               </div>
               
               <div className="px-2 pt-4">
                  <button 
                    onClick={() => { 
                       sounds.click();
                       setIsAddingNew(true); 
                       setEditingItem({ 
                         id: '', 
                         game: managedGames[0] || 'Football Manager', 
                         teams: [], 
                         objectives: [], 
                         rules: [], 
                         styles: [], 
                         _type: 'genlist' 
                       }); 
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#2D2D2D] py-6 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-[#7B2CBF] hover:bg-[#7B2CBF]/10 hover:border-[#7B2CBF44] transition-all flex items-center justify-center gap-3"
                  >
                     <Plus size={18} /> Adicionar Dataset por Jogo
                  </button>
               </div>
            </section>
          </div>
        )}

        {activePanel === 'geral' && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-gradient-to-br from-[#7B2CBF]/20 to-transparent p-8 rounded-[40px] border border-[#7B2CBF33] text-center space-y-2">
                <Crown size={32} className="mx-auto text-[#7B2CBF] mb-2" />
                <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Configurações Gerais</h3>
                <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-widest">Controle total do ecossistema Fox Manager</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-[#7B2CBF] tracking-widest px-1">Limites & Acessos</h4>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                         <span className="text-[9px] font-black text-[#A0A0A0] uppercase">Saves Diários / User</span>
                         <input 
                           type="number" 
                           value={appSettings?.dailySaveLimit || 1} 
                           onChange={e => handleUpdateSettings({ dailySaveLimit: parseInt(e.target.value) || 1 })}
                           className="w-12 bg-transparent text-right text-white font-black outline-none border-b border-[#7B2CBF]"
                         />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                         <span className="text-[9px] font-black text-[#A0A0A0] uppercase">Gerações Diárias / User</span>
                         <input 
                           type="number" 
                           value={appSettings?.dailyGenLimit || 10} 
                           onChange={e => handleUpdateSettings({ dailyGenLimit: parseInt(e.target.value) || 10 })}
                           className="w-12 bg-transparent text-right text-white font-black outline-none border-b border-[#7B2CBF]"
                         />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                         <span className="text-[9px] font-black text-[#A0A0A0] uppercase">Logs Públicos</span>
                         <QuickToggle active={appSettings?.logsPublic} onToggle={() => handleUpdateSettings({ logsPublic: !appSettings?.logsPublic })} label="" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                         <span className="text-[9px] font-black text-[#A0A0A0] uppercase">Reporting Ativo</span>
                         <QuickToggle active={appSettings?.reportsEnabled} onToggle={() => handleUpdateSettings({ reportsEnabled: !appSettings?.reportsEnabled })} label="" />
                      </div>
                   </div>
                </div>

                <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-[#7B2CBF] tracking-widest px-1">Estado do Aplicativo</h4>
                   <div className="space-y-3">
                      <QuickToggle label="Gerador Fox Ativo" active={appSettings?.generatorActive} onToggle={() => handleUpdateSettings({ generatorActive: !appSettings?.generatorActive })} />
                      <QuickToggle label="Uploads de Imagens" active={appSettings?.uploadsAllowed} onToggle={() => handleUpdateSettings({ uploadsAllowed: !appSettings?.uploadsAllowed })} />
                      <QuickToggle label="Modo Economia Global" active={appSettings?.economyMode} onToggle={() => handleUpdateSettings({ economyMode: !appSettings?.economyMode })} />
                   </div>
                </div>
             </div>

             <div className="space-y-6 px-1">
                <GlobalListCard 
                  title="Eras & Estilos de Carreira" 
                  items={managedEras} 
                  onAdd={(n: string) => {
                    const updated = [...managedEras, n];
                    setManagedEras(updated);
                    handleUpdateSettings({ managedEras: updated });
                  }}
                  onRemove={(idx: number) => {
                    const updated = managedEras.filter((_, i) => i !== idx);
                    setManagedEras(updated);
                    handleUpdateSettings({ managedEras: updated });
                  }}
                  onEdit={(idx: number, n: string) => {
                    const updated = [...managedEras];
                    updated[idx] = n;
                    setManagedEras(updated);
                    handleUpdateSettings({ managedEras: updated });
                  }}
                />

                <GlobalListCard 
                  title="Jogos Ativos no App" 
                  items={managedGames} 
                  onAdd={(n: string) => {
                    const updated = [...managedGames, n];
                    setManagedGames(updated);
                    handleUpdateSettings({ managedGames: updated });
                  }}
                  onRemove={(idx: number) => {
                    const updated = managedGames.filter((_, i) => i !== idx);
                    setManagedGames(updated);
                    handleUpdateSettings({ managedGames: updated });
                  }}
                  onEdit={(idx: number, n: string) => {
                    const updated = [...managedGames];
                    updated[idx] = n;
                    setManagedGames(updated);
                    handleUpdateSettings({ managedGames: updated });
                  }}
                />
                <div className="flex justify-start px-2">
                   <button 
                     onClick={() => {
                        if(confirm('Aplicar novos jogos padrão do sistema?')) {
                           setManagedGames(GAMES);
                           handleUpdateSettings({ managedGames: GAMES });
                        }
                     }}
                     className="text-[9px] font-black uppercase text-[#7B2CBF] hover:text-white transition-all px-3 py-1.5 border border-[#7B2CBF33] rounded-lg"
                   >
                     Sincronizar Novos Padrões
                   </button>
                </div>

                <GlobalListCard 
                  title="Dificuldades Oficiais" 
                  items={managedDifficulties} 
                  onAdd={(n: string) => {
                    const updated = [...managedDifficulties, n];
                    setManagedDifficulties(updated);
                    handleUpdateSettings({ managedDifficulties: updated });
                  }}
                  onRemove={(idx: number) => {
                    const updated = managedDifficulties.filter((_, i) => i !== idx);
                    setManagedDifficulties(updated);
                    handleUpdateSettings({ managedDifficulties: updated });
                  }}
                  onEdit={(idx: number, n: string) => {
                    const updated = [...managedDifficulties];
                    updated[idx] = n;
                    setManagedDifficulties(updated);
                    handleUpdateSettings({ managedDifficulties: updated });
                  }}
                />
             </div>

             <div className="px-2">
                <button onClick={async () => {
                   sounds.click();
                   try {
                     await handleUpdateSettings({
                       managedEras,
                       managedGames,
                       managedDifficulties
                     });
                     alert('Todas as definições gerais foram sincronizadas!');
                   } catch (e) {
                     alert('Erro ao salvar no Geral.');
                   }
                }} className="w-full bg-[#7B2CBF] text-white py-6 rounded-[32px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all flex items-center justify-center gap-3">
                   <Save size={18} /> Consolidar e Salvar no Geral
                </button>
             </div>
          </div>
        )}

        {activePanel === 'system' && (
           <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#7B2CBF]/10 to-transparent border border-[#7B2CBF33] p-8 rounded-[40px] flex flex-col items-center gap-6">
                 <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase italic text-white italic">Backup de Sistema</h3>
                    <p className="text-[10px] text-[#A0A0A0] font-black uppercase">Segurança e migração de dados</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <button onClick={() => handleExportData()} className="bg-white/5 border border-white/5 py-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-[#7B2CBF]/10 transition-all font-black text-[10px] uppercase">
                       <Download size={20} className="text-[#7B2CBF]" /> Exportar Tudo
                    </button>
                    <label className="bg-white/5 border border-white/5 py-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-[#7B2CBF]/10 transition-all font-black text-[10px] uppercase cursor-pointer">
                       <Upload size={20} className="text-[#7B2CBF]" /> Importar Tudo
                       <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>
                 </div>
              </div>
           </div>
        )}

        {activePanel === 'codes' && (
          <div className="space-y-6 animate-fade-in pb-20">
             <div className="bg-gradient-to-br from-[#7B2CBF]/20 via-transparent to-transparent border border-[#7B2CBF33] p-8 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.1] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Ticket size={120} className="text-[#7B2CBF]" />
               </div>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Códigos Promocionais</h3>
                     <p className="text-[10px] text-[#7B2CBF] font-black uppercase tracking-widest">Geração e Controle de Recompensas</p>
                  </div>
                  <button 
                    onClick={() => { 
                      sounds.click();
                      setIsAddingNew(true); 
                      setEditingItem({ 
                        id: '', 
                        type: 'badge',
                        value: '',
                        uses: 0,
                        maxUses: 100,
                        createdBy: user.name,
                        createdAt: Date.now(),
                        _type: 'code'
                      }); 
                    }}
                    className="bg-[#7B2CBF] text-white p-4 rounded-2xl shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all"
                  >
                     <Plus size={20}/>
                  </button>
               </div>
             </div>

             <div className="space-y-4 px-2">
                {promoCodes.length === 0 && (
                  <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-12 rounded-[40px] text-center space-y-3">
                     <Ticket size={40} className="mx-auto text-[#2D2D2D]" />
                     <p className="text-[10px] font-black text-[#555] uppercase tracking-widest">Nenhum código ativo no sistema</p>
                  </div>
                )}
                {promoCodes.map(code => (
                  <div key={code.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[36px] space-y-4 hover:border-[#7B2CBF44] transition-all relative group shadow-xl">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-[#7B2CBF] border border-white/5 shadow-inner">
                              <Ticket size={24} />
                           </div>
                           <div className="space-y-0.5">
                              <h5 className="text-[16px] font-black uppercase text-white tracking-tighter italic">{code.id}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase text-[#7B2CBF] px-2 py-0.5 bg-[#7B2CBF]/10 rounded-lg">{code.type}</span>
                                <span className="text-[8px] font-black uppercase text-yellow-500 px-2 py-0.5 bg-yellow-500/10 rounded-lg">{code.value}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={async () => {
                             if(confirm('Deseja excluir este código?')) {
                               await storage.deleteCode(code.id);
                               refreshData();
                             }
                           }} className="p-3 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 border border-white/5 p-3 rounded-2xl">
                           <p className="text-[7px] font-black text-[#444] uppercase mb-1">Usos / Limite</p>
                           <p className="text-[10px] font-black text-white italic">{code.uses} / {code.maxUses}</p>
                        </div>
                        <div className="bg-black/20 border border-white/5 p-3 rounded-2xl">
                           <p className="text-[7px] font-black text-[#444] uppercase mb-1">Criado por</p>
                           <p className="text-[10px] font-black text-white italic">{code.createdBy}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activePanel === 'events' && (
          <div className="space-y-6 animate-fade-in pb-20">
             <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Eventos Semanais</h3>
                   <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest">Controle de Desafios Globais</p>
                </div>
                <button 
                  onClick={() => { 
                    setIsAddingNew(true); 
                    setEditingItem({ 
                      id: '', 
                      title: '', 
                      description: '', 
                      startDate: Date.now(), 
                      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, 
                      type: 'challenge', 
                      reward: 'Badge de Honra', 
                      _type: 'event' 
                    }); 
                  }} 
                  className="bg-[#7B2CBF] text-white p-3 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={18}/>
                </button>
             </div>

             <div className="space-y-4">
                {weeklyEvents.length === 0 && (
                  <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-10 rounded-[40px] text-center">
                     <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Nenhum evento ativo</p>
                  </div>
                )}
                {weeklyEvents.map(event => (
                  <div key={event.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] flex items-center justify-between hover:bg-white/5 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#7B2CBF]/10 rounded-xl flex items-center justify-center text-[#7B2CBF] border border-[#7B2CBF33]">
                           <Flame size={18} />
                        </div>
                        <div className="space-y-0.5">
                           <h6 className="text-[10px] font-black uppercase text-white tracking-widest">{event.title}</h6>
                           <p className="text-[8px] text-[#A0A0A0] uppercase font-bold">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setEditingItem({ ...event, _type: 'event' })} className="p-2 bg-white/5 text-[#A0A0A0] hover:text-[#7B2CBF] rounded-lg transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => handleDeleteItem(event.id, 'event')} className="p-2 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activePanel === 'halloffame' && (
          <div className="space-y-6 animate-fade-in pb-20">
             <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Lendas do Hall of Fame</h3>
                   <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest">Imortalização de Carreiras</p>
                </div>
             </div>

             <div className="space-y-3">
                {hallOfFame.length === 0 && (
                  <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-10 rounded-[40px] text-center">
                     <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">Nenhuma lenda no sistema</p>
                  </div>
                )}
                {hallOfFame.map(entry => (
                  <div key={entry.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/33">
                           <Trophy size={18} />
                        </div>
                        <div className="space-y-0.5">
                           <h6 className="text-[10px] font-black uppercase text-white tracking-widest">{entry.team} ({entry.userName})</h6>
                           <p className="text-[8px] text-[#A0A0A0] uppercase font-bold">{entry.titles} Títulos • {entry.seasons} Temporadas</p>
                        </div>
                     </div>
                     <button onClick={() => handleDeleteItem(entry.id, 'hof')} className="p-2 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activePanel === 'reports' && (
          <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between px-2">
               <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Denúncias & Feedback</h3>
                  <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest">Monitoramento de Segurança</p>
               </div>
               <span className="text-[10px] font-black text-red-500">{reports.length} Reports</span>
            </div>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-[#2D2D2D] border-dashed p-12 rounded-[40px] text-center space-y-3">
                   <ShieldCheck size={40} className="mx-auto text-[#2D2D2D]" />
                   <p className="text-[10px] font-black text-[#555] uppercase tracking-widest">Nenhuma denúncia no momento</p>
                </div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="bg-[#1A1A1A] border border-[#2D2D2D] p-6 rounded-[32px] space-y-4 hover:border-red-500/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-white uppercase">{report.type}</h4>
                          <p className="text-[8px] text-[#A0A0A0] font-black uppercase">Por: {report.authorName || 'Anônimo'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        report.status === 'resolvido' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-white/80 italic">"{report.content}"</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           if(confirm('Marcar como resolvido?')) {
                             storage.addReport({...report, status: 'resolvido'});
                             refreshData();
                           }
                         }}
                         className="flex-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase py-3 rounded-xl hover:bg-green-500 transition-all hover:text-white"
                       >
                         Resolver
                       </button>
                       <button 
                         onClick={() => handleDeleteItem(report.id, 'report')}
                         className="p-3 bg-red-500/5 text-red-500/30 hover:text-red-500 border border-red-500/5 rounded-xl transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePanel === 'logs' && (
          <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between px-2">
               <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Auditoria de Sistema</h3>
                  <p className="text-[9px] text-[#A0A0A0] uppercase font-black tracking-widest">Logs em Tempo Real & Erros</p>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => {
                     if(confirm('Limpar todos os logs? Estar ação é irreversível.')) {
                        storage.setLogs([]);
                        refreshData();
                     }
                   }}
                   className="text-[9px] font-black uppercase text-red-500/50 hover:text-red-500 px-3 py-1.5 border border-red-500/10 rounded-lg transition-all"
                 >
                   Limpar
                 </button>
                 <button onClick={refreshData} className="p-2 text-[#7B2CBF] bg-[#7B2CBF]/10 rounded-xl"><RefreshCw size={14} /></button>
               </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[40px] overflow-hidden">
               <div className="p-4 bg-black/40 border-b border-[#2D2D2D] flex items-center gap-3">
                  <Terminal size={14} className="text-[#666]" />
                  <span className="text-[9px] font-black uppercase text-[#444] tracking-widest italic font-mono">system@foxmanager:~$ cat audit.log</span>
               </div>
               <div className="max-h-[600px] overflow-y-auto p-4 space-y-2 font-mono scrollbar-thin scrollbar-thumb-[#7B2CBF33]">
                  {logs.length === 0 ? (
                    <div className="py-20 text-center space-y-3 opacity-20">
                       <Terminal size={40} className="mx-auto" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
                    </div>
                  ) : (
                    [...logs].reverse().map((log, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${
                        log.type === 'error' ? 'bg-red-500/5 border-red-500/10 text-red-400' :
                        log.type === 'admin' ? 'bg-[#7B2CBF]/5 border-[#7B2CBF]/10 text-[#7B2CBF]' :
                        'bg-white/2 border-white/5 text-[#A0A0A0]'
                      }`}>
                         <div className="flex justify-between items-start mb-1">
                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                              log.type === 'error' ? 'bg-red-500/20' : 
                              log.type === 'admin' ? 'bg-[#7B2CBF]/20 text-white' : 
                              'bg-white/10 text-white'
                            }`}>
                               {log.type}
                            </span>
                            <span className="text-[8px] font-medium opacity-50">{new Date(log.timestamp).toLocaleString()}</span>
                         </div>
                         <p className="text-[10px] font-medium leading-relaxed break-words">
                            <span className="text-white/40 mr-2">[{log.user}]</span>
                            {log.text}
                            {log.details && (
                              <div className="mt-2 text-[9px] bg-black/40 p-2 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap">
                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                              </div>
                            )}
                         </p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Editing Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic text-[#7B2CBF]">{isAddingNew ? 'Novo Item' : 'Editar Item'}</h3>
                <button onClick={() => { setEditingItem(null); setIsAddingNew(false); }} className="text-[#A0A0A0]"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                {editingItem._type === 'user' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Nome</label>
                      <input 
                        value={editingItem.name || ''} 
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-[#444] ml-2">Nível</label>
                        <input 
                          type="number"
                          value={editingItem.level || 1} 
                          onChange={e => setEditingItem({...editingItem, level: parseInt(e.target.value) || 1})}
                          className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white font-black outline-none focus:border-[#7B2CBF]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-[#444] ml-2">Role</label>
                        <select 
                          value={editingItem.role}
                          onChange={e => setEditingItem({...editingItem, role: e.target.value as UserRole})}
                          className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                        >
                          <option value="USER">USER</option>
                          <option value="MOD">MOD</option>
                          <option value="ADM">ADM</option>
                          <option value="CEO">CEO</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : editingItem._type === 'career' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Time / Clube</label>
                      <input 
                        value={editingItem.team || ''} 
                        onChange={e => setEditingItem({...editingItem, team: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Jogo</label>
                          <select 
                            value={editingItem.game}
                            onChange={e => setEditingItem({...editingItem, game: e.target.value})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                          >
                            {managedGames.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Tipo</label>
                          <select 
                            value={editingItem.type}
                            onChange={e => setEditingItem({...editingItem, type: e.target.value})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                          >
                            <option value="Official">Oficial</option>
                            <option value="Special">Especial</option>
                            <option value="Community">Community</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Missão / Objetivo</label>
                      <textarea 
                        value={editingItem.objective || ''} 
                        onChange={e => setEditingItem({...editingItem, objective: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[80px] outline-none focus:border-[#7B2CBF]"
                        placeholder="Ex: Vencer a Champions com jogadores da base"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Regras (separadas por vírgula)</label>
                      <input 
                        value={editingItem.rules || ''} 
                        onChange={e => setEditingItem({...editingItem, rules: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white outline-none focus:border-[#7B2CBF]"
                        placeholder="Sem contratar, Apenas base..."
                      />
                    </div>
                  </>
                ) : editingItem._type === 'genlist' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Nome do Jogo</label>
                      <input 
                        value={editingItem.game || ''} 
                        onChange={e => setEditingItem({...editingItem, game: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Times (separados por vírgula)</label>
                      <textarea 
                        value={Array.isArray(editingItem.teams) ? editingItem.teams.join(', ') : ''} 
                        onChange={e => setEditingItem({...editingItem, teams: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[60px] outline-none focus:border-[#7B2CBF]"
                        placeholder="Time|País|Tamanho|Estilo, ..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Objetivos (separados por vírgula)</label>
                      <textarea 
                        value={Array.isArray(editingItem.objectives) ? editingItem.objectives.join(', ') : ''} 
                        onChange={e => setEditingItem({...editingItem, objectives: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[60px] outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Regras (separadas por vírgula)</label>
                      <textarea 
                        value={Array.isArray(editingItem.rules) ? editingItem.rules.join(', ') : ''} 
                        onChange={e => setEditingItem({...editingItem, rules: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[60px] outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                  </>
                ) : editingItem._type === 'tip' ? (
                   <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Título da Dica</label>
                      <input 
                        value={editingItem.title || ''} 
                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Jogo</label>
                          <select 
                            value={editingItem.game}
                            onChange={e => setEditingItem({...editingItem, game: e.target.value})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                          >
                            {managedGames.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Categoria</label>
                          <select 
                            value={editingItem.category}
                            onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                          >
                            {managedEras.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Conteúdo da Dica</label>
                      <textarea 
                        value={editingItem.content || ''} 
                        onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[100px] outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                  </>
                ) : editingItem._type === 'code' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Código (ID)</label>
                      <input 
                        value={editingItem.id || ''} 
                        onChange={e => setEditingItem({...editingItem, id: e.target.value.toUpperCase().replace(/\s/g, '')})}
                        placeholder="EX: FOXVIP2024"
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Tipo de Benefício</label>
                          <select 
                            value={editingItem.type}
                            onChange={e => setEditingItem({...editingItem, type: e.target.value})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                          >
                            <option value="badge">Badge</option>
                            <option value="role">Role (Cargo)</option>
                            <option value="level">Nível (XP)</option>
                            <option value="status">Status Especial</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#444] ml-2">Usos Máximos</label>
                          <input 
                            type="number"
                            value={editingItem.maxUses || 100} 
                            onChange={e => setEditingItem({...editingItem, maxUses: parseInt(e.target.value) || 100})}
                            className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white font-black outline-none focus:border-[#7B2CBF]"
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Valor da Recompensa</label>
                      <input 
                        value={editingItem.value || ''} 
                        onChange={e => setEditingItem({...editingItem, value: e.target.value})}
                        placeholder="Nome da Badge, ADM, ou +5"
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                  </>
                ) : editingItem._type === 'event' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Título do Evento</label>
                      <input 
                        value={editingItem.title || ''} 
                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Tipo</label>
                      <select 
                        value={editingItem.type}
                        onChange={e => setEditingItem({...editingItem, type: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-[#7B2CBF]"
                      >
                        <option value="challenge">Desafio</option>
                        <option value="boost">Boost Global</option>
                        <option value="announcement">Anúncio</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Descrição / Regras</label>
                      <textarea 
                        value={editingItem.description || ''} 
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-[10px] text-white min-h-[100px] outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Título</label>
                      <input 
                        value={editingItem.title || editingItem.name || ''} 
                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white uppercase font-black outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[#444] ml-2">Conteúdo / Descrição</label>
                      <textarea 
                        value={editingItem.content || editingItem.description || ''} 
                        onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                        className="w-full bg-black/40 border border-[#2D2D2D] rounded-2xl px-6 py-4 text-xs text-white min-h-[100px] font-medium outline-none focus:border-[#7B2CBF]"
                      />
                    </div>
                  </>
                )}
                
                <button 
                  onClick={async () => {
                    try {
                      if (editingItem._type === 'user') {
                        const { _type, ...userData } = editingItem;
                        await handleUpdateUserFull(editingItem.id, userData);
                      } else if (editingItem.id) {
                        // UPDATE EXISTING
                        if (editingItem._type === 'tip') {
                          const updated = tips.map(t => t.id === editingItem.id ? editingItem : t);
                          await storage.setCommunityTips(updated);
                        } else if (editingItem._type === 'career') {
                          await storage.updateImportedCareer(editingItem.id, editingItem);
                        } else if (editingItem._type === 'genlist') {
                          const updated = genLists.map(g => g.id === editingItem.id ? editingItem : g);
                          await storage.setGenLists(updated);
                        } else if (editingItem._type === 'code') {
                          await storage.addCode(editingItem);
                        } else if (editingItem._type === 'event') {
                          await storage.addWeeklyEvent(editingItem);
                        } else {
                          // Generic library idea or challenge
                          if (activePanel === 'library') {
                            await storage.setOfficialChallenges(challenges.map(c => c.id === editingItem.id ? editingItem : c));
                          }
                        }
                      } else {
                        // CREATE NEW
                        const newId = Math.random().toString(36).substr(2, 9);
                        const itemWithId = { ...editingItem, id: editingItem._type === 'code' ? editingItem.id : newId };
                        delete itemWithId._type;

                        if (editingItem._type === 'career') {
                          await storage.addImportedCareer(itemWithId);
                        } else if (editingItem._type === 'tip') {
                          const userToUse = user;
                          await storage.setCommunityTips([...tips, { ...itemWithId, authorId: userToUse.id, authorName: userToUse.name, createdAt: Date.now(), status: 'approved', publishedToCommunity: true }]);
                        } else if (editingItem._type === 'genlist') {
                          await storage.setGenLists([...genLists, itemWithId]);
                        } else if (editingItem._type === 'code') {
                          if (!itemWithId.id) {
                            alert('Erro: O código precisa de um nome/ID.');
                            return;
                          }
                          await storage.addCode(itemWithId);
                        } else if (editingItem._type === 'event') {
                          await storage.addWeeklyEvent(itemWithId);
                        } else {
                          if (activePanel === 'library') await storage.setOfficialChallenges([...challenges, itemWithId]);
                        }
                      }
                      
                      setEditingItem(null);
                      setIsAddingNew(false);
                      refreshData();
                      alert('Alteração processada com sucesso!');
                    } catch (e) {
                      console.error(e);
                      alert('Erro ao salvar item.');
                    }
                  }}
                  className="w-full bg-[#7B2CBF] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all"
                >
                  Confirmar Salve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function StatsOverviewCard({ icon, label, val, desc, color, alert }: any) {
  return (
    <div className={`bg-[#1A1A1A] border ${alert ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[#2D2D2D]'} p-6 rounded-[32px] space-y-2 group transition-all hover:border-[#7B2CBF44]`}>
      <div className={`flex justify-between items-center ${color || 'text-[#7B2CBF]'}`}>
         <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
         {desc && <span className="text-[7px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">{desc}</span>}
      </div>
      <div className="space-y-0.5">
        <p className="text-3xl font-black text-white italic">{val}</p>
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#A0A0A0]">{label}</span>
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 shrink-0 ${active ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF33] translate-y-[-2px]' : 'bg-[#1A1A1A] border-[#2D2D2D] text-[#A0A0A0] opacity-60 hover:opacity-100'}`}
    >
      {icon} {children}
    </button>
  );
}

function QuickToggle({ label, active, onToggle }: any) {
  return (
    <button 
      onClick={onToggle}
      className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-3xl flex justify-between items-center transition-all hover:border-[#7B2CBF33] text-left group"
    >
      <span className="text-[9px] font-black uppercase tracking-widest text-[#A0A0A0] group-hover:text-white transition-colors">{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-[#7B2CBF]' : 'bg-[#2D2D2D]'}`}>
         <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? 'left-6' : 'left-1'}`}></div>
      </div>
    </button>
  );
}

function ListStatItem({ label, count, icon }: any) {
  return (
    <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
       <div className="flex items-center gap-2">
          <div className="text-[#666]">{icon}</div>
          <span className="text-[8px] font-bold text-[#A0A0A0] uppercase">{label}</span>
       </div>
       <span className="text-[10px] font-black text-white">{count}</span>
    </div>
  );
}

function GlobalListCard({ title, items, onAdd, onRemove, onEdit }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!newValue.trim()) {
      setIsAdding(false);
      setEditingIdx(null);
      return;
    }
    
    if (editingIdx !== null) {
      onEdit(editingIdx, newValue.trim());
    } else {
      onAdd(newValue.trim());
    }
    
    setNewValue('');
    setIsAdding(false);
    setEditingIdx(null);
    sounds.success();
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-[32px] space-y-4">
       <div className="flex justify-between items-center px-1">
          <h5 className="text-[10px] font-black uppercase text-[#7B2CBF] tracking-widest">{title}</h5>
          {!isAdding && editingIdx === null && (
            <button 
              onClick={() => { sounds.click(); setIsAdding(true); setNewValue(''); }} 
              className="p-2.5 bg-[#7B2CBF] text-white rounded-xl shadow-lg shadow-[#7B2CBF33] active:scale-95 transition-all"
            >
              <Plus size={16}/>
            </button>
          )}
       </div>

       {(isAdding || editingIdx !== null) && (
         <div className="flex gap-2 p-2 bg-black/20 rounded-2xl border border-[#7B2CBF33]">
           <input 
             autoFocus
             value={newValue}
             onChange={e => setNewValue(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSubmit()}
             placeholder={isAdding ? "Novo item..." : "Editar item..."}
             className="flex-1 bg-transparent border-none outline-none text-[10px] text-white px-2 uppercase font-black"
           />
           <button onClick={handleSubmit} className="p-2 bg-[#7B2CBF] text-white rounded-lg"><Check size={12}/></button>
           <button onClick={() => { setIsAdding(false); setEditingIdx(null); }} className="p-2 bg-white/5 text-[#666] rounded-lg"><X size={12}/></button>
         </div>
       )}

       <div className="flex flex-wrap gap-2">
          {items.map((item: string, i: number) => (
             <div key={i} className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-2 rounded-xl group transition-all hover:border-[#7B2CBF33]">
                <span className="text-[9px] font-bold text-white uppercase italic">{item}</span>
                <div className="flex items-center gap-1.5 ml-1">
                   <button 
                     onClick={() => { 
                       sounds.click(); 
                       setEditingIdx(i); 
                       setNewValue(item);
                       setIsAdding(false);
                     }} 
                     className="text-[#666] hover:text-[#7B2CBF] transition-colors p-1.5 bg-white/5 rounded-lg"
                   >
                     <Edit3 size={10}/>
                   </button>
                   <button onClick={() => { sounds.click(); onRemove(i); }} className="text-[#666] hover:text-red-500 transition-colors p-1.5 bg-white/5 rounded-lg"><X size={10}/></button>
                </div>
             </div>
          ))}
          {items.length === 0 && !isAdding && <span className="text-[8px] text-[#444] font-black uppercase italic ml-1">Vazio</span>}
       </div>
    </div>
  );
}
