"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/home');
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: fullName,
            username: username,
          }
        }
      });
      if (error) throw error;
      router.push('/setup-profile');
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
        setAuthError('This email is already registered. Please log in instead.');
        setIsLogin(true);
      } else if (error.message?.toLowerCase().includes('username')) {
        setAuthError('This username is already taken. Please choose another one.');
      } else {
        setAuthError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        setAuthError('Error signing in with Google. Please try again.');
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col md:flex-row w-full text-on-surface bg-[#FFF8F2] overflow-hidden">
      {/* Left Side: Branding & Hero - Static */}
      <section className="hidden md:flex md:w-1/2 campfire-gradient flex-col items-center justify-center p-xl relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7KQQicPKIY1_Kk-NobfIaLkJfmfprRzbd1DxEuj4bV1I7clkWkkVoZQ8LTK9X-aPfDs8QIjgwblhWmk4XKQ4uGd2D7g3El4H2zoEc4YC_TeTm9fKw4buqaQh9wx9lcdWE7wpMvkDUfnTdM_q2wTZRWASXJ072tpdpMOIttkYHJEqV1ntnqVYwXYJKE-0zueWPjiKFH9IyuqaHTSzrYNeFgPN2f1yn7RCNBuZ3HIYG0CT3owXkx1yRE2k7sVw91LnZFIUtE6k7WUc')" }}></div>
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
          <span className="material-symbols-outlined text-[500px] text-white mb-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <h1 className="text-white text-5xl font-nunito font-extrabold mb-md tracking-tight">
            Gather around.
          </h1>
          <p className="text-white/90 text-3xl font-nunito font-bold max-w-[450px]">
            Your people are here.
          </p>
        </div>

        {/* Decorative Embers */}
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/20 rounded-full blur-md"></div>
        <div className="absolute bottom-40 right-40 w-3 h-3 bg-white/60 rounded-full blur-xs"></div>
      </section>

      {/* Right Side: Auth Form - Scrollable */}
      <section className="w-full md:w-1/2 flex flex-col p-md sm:p-xl bg-[#FFF8F2] overflow-y-auto h-full scroll-smooth custom-scrollbar">
        <div className="w-full max-w-[330px] space-y-[30px] z-10 py-10 my-auto mx-auto">

          {/* Wordmark */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-primary-container font-h2 text-h2 tracking-tight flex items-center gap-xs">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-2xl font-extrabold font-h1 tracking-tighter text-primary-container">CampFire</span>
            </span>
            <p className="text-on-surface-variant font-body text-sm transition-all duration-300">
              {isLogin ? "Welcome back to the clearing." : "Join the clearing."}
            </p>
          </div>

          {/* Toggle Tabs - Width matches input boxes */}
          <div className="relative flex bg-surface-container-highest/50 p-1 rounded-full w-full">
            {/* Animated Pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary-container rounded-full shadow-md transition-transform duration-300 ease-in-out ember-glow"
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)', left: '4px' }}
            />

            <button
              onClick={() => { setIsLogin(true); setAuthError(''); }}
              className={`relative z-10 flex-1 py-2.5 text-center text-[12px] font-bold uppercase tracking-wider rounded-full transition-colors duration-300 ${isLogin ? 'text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setAuthError(''); }}
              className={`relative z-10 flex-1 py-2.5 text-center text-[12px] font-bold uppercase tracking-wider rounded-full transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form and Error Group */}
          <div className="flex flex-col space-y-4">
            {authError && (
              <div className="bg-[#FFEFEF] border border-[#FFD6D6] text-[#D84C4C] text-[11px] font-semibold p-3 rounded-xl animate-fade-in flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Form Container with dynamic height for smooth spacing */}
            <div className={`relative transition-all duration-500 ease-in-out ${isLogin ? 'h-[275px]' : 'h-[385px]'}`}>
            {/* Login Form */}
            {isLogin && (
              <form className="space-y-6 animate-fade-in absolute w-full top-0 left-0" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Email Address</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                      placeholder="you@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Password</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                      placeholder="Minimum 8 characters"
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-[#F4845F] hover:text-primary transition-colors">Forgot Password?</button>
                </div>

                <button disabled={isLoading} className="w-full h-[50px] bg-primary-container text-white rounded-xl font-button text-sm ember-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70" type="submit">
                  {isLoading ? 'Logging In...' : 'Log In'}
                </button>
              </form>
            )}

            {/* Registration Form */}
            {!isLogin && (
              <form className="space-y-6 animate-fade-in absolute w-full top-0 left-0" onSubmit={handleSignup}>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                      placeholder="e.g. John Smith"
                      type="text"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Username</label>
                    <div className="relative">
                      <span className="absolute left-lg top-1/2 -translate-y-1/2 text-stone-400 text-sm">@</span>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full h-[50px] pl-xl pr-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                        placeholder="   e.g. wanderer_42"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Email Address</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                      placeholder="you@example.com"
                      type="email"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Password</label>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                        placeholder="8+ characters"
                        type="password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Confirm</label>
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface"
                        placeholder="Repeat password"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                <button disabled={isLoading} className="w-full h-[50px] bg-primary-container text-white rounded-xl font-button text-sm ember-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70" type="submit">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>

          {/* Social & Footer Section - Flowing naturally below with consistent spacing */}
          <div className="flex flex-col space-y-[30px]">
            {/* OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-[50px] flex items-center justify-center gap-md rounded-xl border border-[#EDE0D4] bg-white hover:bg-surface-container-lowest transition-all text-on-surface font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center font-body text-xs text-[#6B6056]">
              {isLogin ? "New to CampFire? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary-container font-bold ml-xs hover:underline decoration-2 underline-offset-4">
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Floating Atmosphere Elements */}
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, rgba(255,107,43,0.15) 0%, transparent 70%)" }}>
      </div>

      {/* App Identity Anchors */}
      <footer className="fixed bottom-8 left-8 hidden lg:block opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-sm text-white/80 font-caption">
          <span>© 2026 CampFire Social</span>
          <span className="w-1 h-1 rounded-full bg-white/40"></span>
          <Link href="#" className="hover:text-white underline decoration-white/20 underline-offset-4">Privacy</Link>
          <span className="w-1 h-1 rounded-full bg-white/40"></span>
          <Link href="#" className="hover:text-white underline decoration-white/20 underline-offset-4">Terms</Link>
        </div>
      </footer>
    </main>
  );
}

