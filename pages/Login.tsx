
import React, { useEffect, useState } from 'react';
import { AppView } from '../types';
import { ArrowLeft, Github, Chrome, ShieldCheck, Mail, Lock, Loader2, User, Key, Eye, EyeOff } from 'lucide-react';
import { subscribeToAuthArray } from '../services/firebase.service';

interface LoginProps {
  setView: (view: AppView) => void;
}

export const Login: React.FC<LoginProps> = ({ setView }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const unsubscribe = subscribeToAuthArray((user) => {
      if (user) {
        setView(AppView.HOME);
      }
    });
    return () => unsubscribe();
  }, [setView]);

  const handleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { loginWithEmail, registerWithEmail, addUserDocument } = await import('../services/firebase.service');

      let user;
      if (isSignUp) {
        if (!firstName || !lastName) {
          throw new Error("Please enter your full name.");
        }
        user = await registerWithEmail(email, password, firstName, lastName);
      } else {
        user = await loginWithEmail(email, password);
      }

      if (user) {
        await addUserDocument(user);
        setView(AppView.HOME);
      }
    } catch (err: any) {
      console.error("Auth failed", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    setError('');
    setIsLoading(true);
    try {
      const { loginWithGoogle, loginWithGithub, addUserDocument } = await import('../services/firebase.service');
      const user = await (provider === 'google' ? loginWithGoogle() : loginWithGithub());

      if (user) {
        await addUserDocument(user);
        setView(AppView.HOME);
      }
    } catch (err: any) {
      console.error("Social login failed", err);
      setError("Social login cancelled or failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 md:p-14 relative z-10 animate-in zoom-in-95 duration-500">
        <button
          onClick={() => setView(AppView.HOME)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 font-bold text-xs uppercase tracking-widest mb-10 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 text-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {isSignUp ? "Start your journey with Convertly today." : "Log in to sync your PDF workspace across devices."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 focus:border-brand-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 focus:border-brand-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 focus:border-brand-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full py-3 pl-10 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 focus:border-brand-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            onClick={handleAuth}
            disabled={isLoading || !email || !password}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-brand-100 dark:shadow-none hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
            <span className="bg-white dark:bg-slate-900 px-4 text-slate-300 dark:text-slate-600">Or Continue With</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            disabled={isLoading}
            onClick={() => socialLogin('google')}
            className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 hover:border-slate-200 dark:hover:border-slate-600 transition-all active:scale-95 group relative overflow-hidden shadow-sm disabled:opacity-70"
          >
            <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-shimmer-premium bg-gradient-to-r from-transparent via-slate-50/50 dark:via-slate-700/50 to-transparent"></div>
            <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">Google</span>
          </button>

          <button
            disabled={isLoading}
            onClick={() => socialLogin('github')}
            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-100 transition-all active:scale-95 shadow-xl disabled:opacity-70"
          >
            <Github className="h-4 w-4" />
            <span className="font-bold text-xs">GitHub</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-600">
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Encryption</span>
        </div>
      </div>
    </div>
  );
};
