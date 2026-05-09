/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type Language = 'pt' | 'en' | 'es';

const translations = {
  pt: {
    welcome: "Fox Managers",
    subtitle: "Sua carreira de elite começa aqui",
    login: "Entrar",
    signup: "Registrar",
    email: "E-mail / Gmail",
    password: "Senha",
    confirm_password: "Confirmar Senha",
    name: "Seu Nome de Manager",
    forgot_password: "Esqueci minha senha",
    login_button: "Acessar Painel",
    signup_button: "Começar Jornada",
    or_continue_with: "Ou entrar com",
    error_required: "E-mail e senha são obrigatórios.",
    error_signup_required: "Preencha todos os campos obrigatórios.",
    error_pass_mismatch: "As senhas não coincidem!",
    error_pass_short: "A senha deve ter pelo menos 6 caracteres.",
    error_invalid_creds: "E-mail ou senha incorretos.",
    reset_pass_title: "Recuperar Senha",
    reset_pass_link: "Verifique seu e-mail agora!",
    back_to_login: "Voltar para Login",
    ceo_panel: "Painel CEO",
    system_logs: "Logs do Sistema",
    preferences: "Preferências",
    logout: "Sair da Fox",
    loading: "Carregando...",
    success_updated: "Atualizado com sucesso!"
  },
  en: {
    welcome: "Fox Managers",
    subtitle: "Your elite career starts here",
    login: "Login",
    signup: "Register",
    email: "Email / Gmail",
    password: "Password",
    confirm_password: "Confirm Password",
    name: "Your Manager Name",
    forgot_password: "Forgot my password",
    login_button: "Access Dashboard",
    signup_button: "Start Journey",
    or_continue_with: "Or continue with",
    error_required: "Email and password are required.",
    error_signup_required: "Fill in all required fields.",
    error_pass_mismatch: "Passwords do not match!",
    error_pass_short: "Password must be at least 6 characters.",
    error_invalid_creds: "Incorrect email or password.",
    reset_pass_title: "Recover Password",
    reset_pass_link: "Check your email now!",
    back_to_login: "Back to Login",
    ceo_panel: "CEO Panel",
    system_logs: "System Logs",
    preferences: "Preferences",
    logout: "Logout",
    loading: "Loading...",
    success_updated: "Updated successfully!"
  },
  es: {
    welcome: "Fox Managers",
    subtitle: "Tu carrera de élite comienza aquí",
    login: "Entrar",
    signup: "Registrarse",
    email: "Correo / Gmail",
    password: "Contraseña",
    confirm_password: "Confirmar Contraseña",
    name: "Tu Nombre de Manager",
    forgot_password: "Olvidé mi contraseña",
    login_button: "Acceder al Panel",
    signup_button: "Empezar Jornada",
    or_continue_with: "O continuar con",
    error_required: "Correo y contraseña son obligatorios.",
    error_signup_required: "Complete todos los campos obligatorios.",
    error_pass_mismatch: "¡As senhas não coincidem!",
    error_pass_short: "La contraseña debe tener al menos 6 caracteres.",
    error_invalid_creds: "Correo o contraseña incorrectos.",
    reset_pass_title: "Recuperar Contraseña",
    reset_pass_link: "¡Revise su correo ahora!",
    back_to_login: "Volver al Login",
    ceo_panel: "Panel CEO",
    system_logs: "Logs del Sistema",
    preferences: "Preferencias",
    logout: "Cerrar Sesión",
    loading: "Cargando...",
    success_updated: "¡Actualizado con éxito!"
  }
};

let currentLang: Language = (localStorage.getItem('fox_app_language') as Language) || 'pt';

export const setLanguage = (lang: Language) => {
  currentLang = lang;
  localStorage.setItem('fox_app_language', lang);
};

export const getLanguage = (): Language => currentLang;

export const t = (key: keyof typeof translations['pt']) => {
  return translations[currentLang][key] || translations['pt'][key] || key;
};
