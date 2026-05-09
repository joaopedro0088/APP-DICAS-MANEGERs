/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, Globe, Palette, X, Bell, Volume2, Monitor, Trash2, RotateCcw, ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../store';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

import { setLanguage, t } from '../i18n';
import { sounds } from '../utils/sounds';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        const settings = await storage.getAppSettings();
        setAppSettings(settings);
      };
      fetchSettings();
    }
  }, [isOpen]);

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!appSettings) return;
    sounds.click();
    const updated = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    await storage.setAppSettings(updated);
    
    if (newSettings.theme) {
       document.body.classList.remove('theme-default', 'theme-neon', 'theme-black');
       document.body.classList.add(`theme-${newSettings.theme}`);
    }

    if (newSettings.language) {
      setLanguage(newSettings.language);
      window.location.reload(); // Hard reload to apply all translations
    }
  };

  const clearCache = () => {
    sounds.click();
    if (confirm('Deseja limpar o cache local?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const restoreDefaults = async () => {
    sounds.click();
    if (confirm('Restaurar todas as preferências?')) {
      const defaults: AppSettings = {
        generatorActive: true,
        uploadsAllowed: true,
        logsPublic: true,
        reportsEnabled: true,
        dailySaveLimit: 1,
        dailyGenLimit: 10,
        theme: 'default',
        language: 'pt',
        vibration: true,
        sounds: true,
        animations: true,
        economyMode: false
      };
      setAppSettings(defaults);
      await storage.setAppSettings(defaults);
      setLanguage('pt');
      window.location.reload();
    }
  };

  if (!appSettings) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={appSettings.animations ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={appSettings.animations ? { opacity: 0 } : { opacity: 1 }}
          className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 backdrop-blur-md"
        >
           <motion.div 
             initial={appSettings.animations ? { scale: 0.9, y: 30 } : { scale: 1, y: 0 }}
             animate={{ scale: 1, y: 0 }}
             className="bg-[#0F0F0F] border border-[#2D2D2D] w-full max-w-sm rounded-[40px] p-6 space-y-6 overflow-y-auto max-h-[90vh]"
           >
              <div className="flex justify-between items-center sticky top-0 bg-[#0F0F0F] z-10 pb-2">
                 <div className="flex items-center gap-3">
                    <Settings size={20} className="text-[#7B2CBF]" />
                    <h3 className="text-xl font-black uppercase italic text-white tracking-widest">{t('preferences')}</h3>
                 </div>
                 <button onClick={() => { sounds.click(); onClose(); }} className="p-3 bg-white/5 rounded-2xl text-[#A0A0A0] hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                 {/* Themes */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                       <Palette size={14} className="text-[#7B2CBF]" />
                       <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Tema Visual</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {[
                         { id: 'default', name: 'Padrão', color: 'bg-[#7B2CBF]' },
                         { id: 'neon', name: 'Neon', color: 'bg-[#9D4EDD] shadow-[0_0_10px_#9D4EDD]' },
                         { id: 'black', name: 'Black', color: 'bg-black border border-white/20' }
                       ].map(t => (
                         <button 
                           key={t.id}
                           onClick={() => handleUpdateSettings({ theme: t.id as any })}
                           className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${appSettings.theme === t.id ? 'bg-[#7B2CBF] border-[#7B2CBF] text-white' : 'bg-white/5 border-white/5 text-[#A0A0A0]'}`}
                         >
                            <div className={`w-4 h-4 rounded-full ${t.color}`}></div>
                            <span className="text-[8px] font-black uppercase">{t.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Toggles */}
                 <div className="grid grid-cols-1 gap-3">
                    <PreferenceToggle 
                      icon={<Bell size={14} />} 
                      label="Vibração" 
                      value={appSettings.vibration} 
                      onChange={(v) => handleUpdateSettings({ vibration: v })} 
                    />
                    <PreferenceToggle 
                      icon={<Volume2 size={14} />} 
                      label="Sons" 
                      value={appSettings.sounds} 
                      onChange={(v) => handleUpdateSettings({ sounds: v })} 
                    />
                    <PreferenceToggle 
                      icon={<Monitor size={14} />} 
                      label="Animações" 
                      value={appSettings.animations} 
                      onChange={(v) => handleUpdateSettings({ animations: v })} 
                    />
                    <PreferenceToggle 
                      icon={<ZapOff size={14} />} 
                      label="Modo Economia" 
                      value={appSettings.economyMode} 
                      onChange={(v) => handleUpdateSettings({ economyMode: v })} 
                    />
                 </div>

                 {/* Language */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                       <Globe size={14} className="text-[#7B2CBF]" />
                       <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest">Idioma</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {LANGUAGES.map(lang => (
                         <button 
                           key={lang.code}
                           onClick={() => handleUpdateSettings({ language: lang.code as any })}
                           className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${appSettings.language === lang.code ? 'bg-[#7B2CBF]/10 border-[#7B2CBF] text-white shadow-lg' : 'bg-white/5 border-white/5 text-[#A0A0A0]'}`}
                         >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-[8px] font-black uppercase text-center">{lang.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={clearCache}
                      className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-[#A0A0A0] hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                       <Trash2 size={14} />
                       Limpar Cache
                    </button>
                    <button 
                      onClick={restoreDefaults}
                      className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-[#A0A0A0] hover:text-white transition-all"
                    >
                       <RotateCcw size={14} />
                       Resetar
                    </button>
                 </div>

                 <button 
                   onClick={() => { sounds.click(); onClose(); }}
                   className="w-full bg-[#7B2CBF] text-white py-4 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#7B2CBF44] active:scale-95 transition-all text-xs"
                 >
                   Fechar
                 </button>
              </div>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreferenceToggle({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
       <div className="flex items-center gap-3">
          <div className="text-[#7B2CBF]">{icon}</div>
          <span className="text-[10px] font-black uppercase text-white tracking-widest">{label}</span>
       </div>
       <button 
         onClick={() => { sounds.click(); onChange(!value); }}
         className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-[#7B2CBF]' : 'bg-[#2D2D2D]'}`}
       >
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${value ? 'right-1' : 'left-1'}`} />
       </button>
    </div>
  );
}
