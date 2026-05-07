"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SetupProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [marshmallowConsent, setMarshmallowConsent] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signup');
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found. Please log in.");
      }

      let avatar_url = null;

      // 1. Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          // Don't throw, just proceed without avatar or show a warning
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatar_url = publicUrlData.publicUrl;
        }
      }

      // 2. Update Profile
      const updateData: Record<string, string | boolean> = {
        bio,
        marshmallow_consent: marshmallowConsent,
        updated_at: new Date().toISOString(),
      };

      if (dob) {
        updateData.date_of_birth = dob;
      }

      if (avatar_url) {
        updateData.avatar_url = avatar_url;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/home');

    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col md:flex-row w-full text-on-surface bg-[#FFF8F2] overflow-hidden">
      {/* Left Side: Branding & Hero */}
      <section className="hidden md:flex md:w-1/2 campfire-gradient flex-col items-center justify-center p-xl relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7KQQicPKIY1_Kk-NobfIaLkJfmfprRzbd1DxEuj4bV1I7clkWkkVoZQ8LTK9X-aPfDs8QIjgwblhWmk4XKQ4uGd2D7g3El4H2zoEc4YC_TeTm9fKw4buqaQh9wx9lcdWE7wpMvkDUfnTdM_q2wTZRWASXJ072tpdpMOIttkYHJEqV1ntnqVYwXYJKE-0zueWPjiKFH9IyuqaHTSzrYNeFgPN2f1yn7RCNBuZ3HIYG0CT3owXkx1yRE2k7sVw91LnZFIUtE6k7WUc')" }}></div>
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in">
          <span className="material-symbols-outlined text-[300px] text-white/90 mb-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_edit</span>
          <h1 className="text-white text-5xl font-nunito font-extrabold mb-md tracking-tight">
            Make it yours.
          </h1>
          <p className="text-white/90 text-2xl font-nunito font-bold max-w-[450px]">
            Set up your identity in the clearing.
          </p>
        </div>

        {/* Decorative Embers */}
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/20 rounded-full blur-md"></div>
        <div className="absolute bottom-40 right-40 w-3 h-3 bg-white/60 rounded-full blur-xs"></div>
      </section>

      {/* Right Side: Setup Form */}
      <section className="w-full md:w-1/2 flex flex-col p-md sm:p-xl bg-[#FFF8F2] overflow-y-auto h-full scroll-smooth custom-scrollbar">
        <div className="w-full max-w-[400px] space-y-[30px] z-10 py-10 my-auto mx-auto">

          {/* Header */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-primary-container font-h2 text-h2 tracking-tight flex items-center gap-xs">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>camping</span>
              <span className="text-2xl font-extrabold font-h1 tracking-tighter text-primary-container">Profile Setup</span>
            </span>
            <p className="text-on-surface-variant font-body text-sm">
              Let others know who you are.
            </p>
          </div>

          <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#FFEFEF] border border-[#FFD6D6] text-[#D84C4C] text-[11px] font-semibold p-3 rounded-xl flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-highest border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 group-hover:border-primary-container/30">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">person</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface opacity-60">Upload Picture</span>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all placeholder:text-[#6B6056]/30 text-sm text-on-surface resize-none"
                placeholder="Tell the camp about yourself..."
              />
            </div>

            {/* DOB */}
            <div className="space-y-1.5">
              <label className="block font-button text-[10px] uppercase tracking-widest text-on-surface ml-sm opacity-60">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-[50px] px-lg rounded-xl border-[#EDE0D4] bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all text-sm text-on-surface"
              />
            </div>

            {/* Marshmallow AI Consent */}
            <div className="p-4 rounded-xl border border-primary-container/20 bg-primary-container/5 flex items-start gap-3">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  id="marshmallow-consent"
                  checked={marshmallowConsent}
                  onChange={(e) => setMarshmallowConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary-container accent-primary-container"
                />
              </div>
              <label htmlFor="marshmallow-consent" className="flex flex-col cursor-pointer">
                <span className="text-sm font-bold text-primary-container">Enable Marshmallow AI</span>
                <span className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Allow CampFire's RAG AI to index your private posts to provide personalized search and chat experiences. You can change this later.
                </span>
              </label>
            </div>

            <button 
              disabled={isLoading} 
              className="w-full h-[50px] bg-primary-container text-white rounded-xl font-button text-sm ember-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 mt-4 flex items-center justify-center gap-2" 
              type="submit"
            >
              {isLoading ? 'Saving...' : 'Welcome to the Camp'}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="w-full h-[50px] bg-transparent text-on-surface-variant hover:text-on-surface rounded-xl font-button text-sm transition-all"
            >
              Skip for now
            </button>

          </form>
        </div>
      </section>

      {/* Floating Atmosphere Elements */}
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, rgba(255,107,43,0.15) 0%, transparent 70%)" }}>
      </div>
    </main>
  );
}
