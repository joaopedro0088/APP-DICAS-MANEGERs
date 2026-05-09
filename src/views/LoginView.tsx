/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Mail, Lock, LogIn, Shield, User as UserIcon, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { storage } from '../store';
import { UserRole, User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const CEOs_EMAILS = [
  'joaopedroalvesbarbosa08@gmail.com',
  'joaopedroalvesbarbbosa08@gmail.com',
  'andreiaalvesbarbosa06@gmail.com',
  'admuser'
];

import { t } from '../i18n';
import { sounds } from '../utils/sounds';

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'newPassword'>('request');
  const [resendTimer, setResendTimer] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const switchMode = (signup: boolean) => {
    sounds.click();
    setIsSignup(signup);
    setIsResetPassword(false);
    setResetStep('request');
    setError('');
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
    setShowPassword(false);
    setResendTimer(0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    if (!cleanEmail || !cleanPassword) {
      setError(t('error_required'));
      sounds.error();
      return;
    }

    // Special Admin Login Bypass
    if (cleanEmail === 'admuser' && cleanPassword === '12345678910haha@') {
      setLoading(true);
      const adminUser: User = {
        id: 'admuser_fox_master',
        email: 'admuser',
        name: 'FOX CEO MASTER',
        role: UserRole.CEO,
        createdAt: Date.now(),
        favoriteGames: [],
        level: 999,
        badges: ['FUNDADOR', 'FOX MASTER', 'ADMIN'],
        favorites: { challenges: [], ideas: [], teams: [], careers: [], tips: [] },
      };
      await storage.setCurrentUser(adminUser);
      sounds.success();
      proceedWithLogin(adminUser);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;
      
      const userData = await storage.getUser(firebaseUser.uid);
      if (userData) {
        sounds.success();
        proceedWithLogin(userData);
      } else {
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || email.split('@')[0],
          role: UserRole.USER,
          createdAt: Date.now(),
          favoriteGames: [],
          level: 1,
          badges: [],
          favorites: { challenges: [], ideas: [], teams: [], careers: [], tips: [] },
        };
        await storage.setCurrentUser(newUser);
        sounds.success();
        proceedWithLogin(newUser);
      }
    } catch (err: any) {
      sounds.error();
      setError(err.code === 'auth/invalid-credential' ? t('error_invalid_creds') : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      setError(t('error_signup_required'));
      sounds.error();
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      setError(t('error_pass_mismatch'));
      sounds.error();
      return;
    }
    if (cleanPassword.length < 6) {
      setError(t('error_pass_short'));
      sounds.error();
      return;
    }
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: cleanName,
        role: UserRole.USER,
        createdAt: Date.now(),
        favoriteGames: [],
        level: 1,
        badges: [],
        favorites: { challenges: [], ideas: [], teams: [], careers: [], tips: [] },
      };
      
      await storage.setCurrentUser(user);
      sounds.success();
      proceedWithLogin(user);
    } catch (err: any) {
      sounds.error();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sounds.click();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Insira seu e-mail primeiro.');
      sounds.error();
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetStep('verify');
      setPassword('');
      setConfirmPassword('');
      setResendTimer(60);
      sounds.success();
      setError(t('reset_pass_link'));
    } catch (err: any) {
      sounds.error();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    setError('O Firebase envia um link direto. Clique no link no seu e-mail!');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    setError('Acesse o link enviado ao seu e-mail para trocar a senha.');
  };

  const proceedWithLogin = (user: User) => {
    if (CEOs_EMAILS.includes(user.email.toLowerCase()) && user.role !== UserRole.CEO) {
      user.role = UserRole.CEO;
      storage.setCurrentUser(user);
    }
    onLogin(user);
  };

  const handleGoogleLogin = async () => {
    sounds.click();
    setError('Iniciando Google Auth...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userData = await storage.getUser(firebaseUser.uid);
      if (userData) {
        sounds.success();
        proceedWithLogin(userData);
      } else {
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'Manager',
          role: UserRole.USER,
          createdAt: Date.now(),
          favoriteGames: [],
          level: 1,
          badges: [],
          favorites: { challenges: [], ideas: [], teams: [], careers: [], tips: [] },
        };
        await storage.setCurrentUser(newUser);
        sounds.success();
        proceedWithLogin(newUser);
      }
    } catch (err: any) {
      sounds.error();
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login com Google não está ativado no Firebase Console.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6 bg-[dashed-grid]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#7B2CBF] rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#7B2CBF44]">
            <Zap size={32} fill="white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">{t('welcome')}</h1>
            <p className="text-[10px] text-[#A0A0A0] font-black uppercase tracking-[0.3em]">{t('subtitle')}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-8 rounded-[40px] shadow-2xl space-y-6">
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => switchMode(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(!isSignup && !isResetPassword) ? 'bg-[#7B2CBF] text-white shadow-lg' : 'text-[#A0A0A0]'}`}
            >
              {t('login')}
            </button>
            <button 
              onClick={() => switchMode(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSignup ? 'bg-[#7B2CBF] text-white shadow-lg' : 'text-[#A0A0A0]'}`}
            >
              {t('signup')}
            </button>
          </div>

          <form 
            onSubmit={
              isResetPassword 
                ? (resetStep === 'request' ? handleResetPassword : (resetStep === 'verify' ? handleVerifyOtp : handleUpdatePassword))
                : (isSignup ? handleSignup : handleLogin)
            } 
            className="space-y-4"
          >
            {(isSignup || (isResetPassword && resetStep === 'newPassword')) && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[#444] ml-2 tracking-widest">
                  {isSignup ? t('name') : 'Nova Senha'}
                </label>
                {!isSignup ? (
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-12 py-4 text-xs text-white focus:border-[#7B2CBF] outline-none transition-all group-hover:border-[#3D3D3D]"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-hover:text-[#666] transition-colors"><Lock size={16}/></div>
                    <button 
                      type="button"
                      onClick={() => { sounds.click(); setShowPassword(!showPassword); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Manager_Elite"
                      className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-12 py-4 text-xs text-white focus:border-[#7B2CBF] outline-none transition-all group-hover:border-[#3D3D3D]"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-hover:text-[#666] transition-colors"><UserIcon size={16}/></div>
                  </div>
                )}
              </div>
            )}
            
            {(isResetPassword && resetStep === 'verify') && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black uppercase text-[#444] tracking-widest">Aguardando Link</label>
                  <span className="text-[8px] font-black uppercase text-[#7B2CBF] animate-pulse">Email: {email}</span>
                </div>
                
                <div className="bg-black/20 border border-white/5 p-4 rounded-2xl mb-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-[#7B2CBF]/10 text-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Mail size={20} />
                  </div>
                  <p className="text-[10px] text-white font-black uppercase">Clique no link que enviamos!</p>
                  <p className="text-[8px] text-[#A0A0A0] leading-relaxed">
                    Verifique também a aba <b>Social</b>, <b>Promoções</b> e <b>SPAM</b>.
                  </p>
                </div>
              </div>
            )}
            
            {(resetStep === 'request' || !isResetPassword) && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[#444] ml-2 tracking-widest">{t('email')}</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="manager@fox.com"
                    className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-12 py-4 text-xs text-white focus:border-[#7B2CBF] outline-none transition-all group-hover:border-[#3D3D3D]"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-hover:text-[#666] transition-colors"><Mail size={16}/></div>
                </div>
              </div>
            )}

            {!isResetPassword && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black uppercase text-[#444] tracking-widest">{t('password')}</label>
                  {!isSignup && (
                    <button 
                      type="button"
                      onClick={() => { sounds.click(); setIsResetPassword(true); setResetStep('request'); setError(''); }}
                      className="text-[8px] font-black uppercase text-[#7B2CBF] hover:underline"
                    >
                      {t('forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-12 py-4 text-xs text-white focus:border-[#7B2CBF] outline-none transition-all group-hover:border-[#3D3D3D]"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-hover:text-[#666] transition-colors"><Lock size={16}/></div>
                  <button 
                    type="button"
                    onClick={() => { sounds.click(); setShowPassword(!showPassword); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {(isSignup || (isResetPassword && resetStep === 'newPassword')) && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-[#444] ml-2 tracking-widest">{t('confirm_password')}</label>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-[#2D2D2D] rounded-2xl px-12 py-4 text-xs text-white focus:border-[#7B2CBF] outline-none transition-all group-hover:border-[#3D3D3D]"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] group-hover:text-[#666] transition-colors"><Shield size={16}/></div>
                </div>
              </div>
            )}

            {error && <p className={`text-[9px] font-black uppercase tracking-widest text-center ${error.includes('sucesso') || error.includes('Redirecionando') || error.includes('enviado') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B2CBF] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#7B2CBF33] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignup ? <Zap size={18} /> : <LogIn size={18} />} 
                  {isResetPassword 
                    ? (resetStep === 'request' ? 'Enviar Link' : (resetStep === 'verify' ? 'Confirmar' : 'Alterar Senha')) 
                    : (isSignup ? t('signup_button') : t('login_button'))}
                </>
              )}
            </button>

            {!isResetPassword && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2D2D2D]"></div>
                  </div>
                  <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest">
                    <span className="bg-[#1A1A1A] px-4 text-[#444]">{t('or_continue_with')}</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </>
            )}

            {isResetPassword && (
              <button 
                type="button"
                onClick={() => { 
                  sounds.click();
                  if (resetStep === 'verify') setResetStep('request');
                  else if (resetStep === 'newPassword') setResetStep('verify');
                  else {
                    setIsResetPassword(false); 
                    setResetStep('request'); 
                  }
                  setError(''); 
                }}
                className="w-full text-[9px] font-black uppercase text-[#444] tracking-widest hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={10} />
                {resetStep === 'request' ? t('back_to_login') : 'Voltar Passo'}
              </button>
            )}
          </form>
        </div>

        <div className="text-center opacity-20 hover:opacity-50 transition-opacity">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Fox Managers v3.0 Production</p>
        </div>
      </motion.div>
    </div>
  );
}

