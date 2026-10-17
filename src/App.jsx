import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Film, Search, Bookmark, History, Shield, Play, Globe } from 'lucide-react';

function App() {
  const [lang, setLang] = useState('ar');
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const appTitle = lang === 'ar' ? 'سينما فيو' : 'CinemaView';

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="text-red-600 font-extrabold text-6xl tracking-widest animate-bounce">
          {appTitle}
        </div>
        <p className="text-gray-400 mt-4 text-sm tracking-widest uppercase">
          {lang === 'ar' ? 'منصتك السينمائية الأولى' : 'Ultimate Streaming Experience'}
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-neutral-950 text-white font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-neutral-800">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-3xl font-black text-red-600 tracking-wider">
              {appTitle}
            </Link>
            <div className="hidden md:flex gap-6 text-sm text-neutral-300">
              <Link to="/" className="hover:text-white transition">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
              <Link to="/my-list" className="hover:text-white transition">{lang === 'ar' ? 'قائمتي' : 'My List'}</Link>
              <Link to="/kids" className="hover:text-white transition">{lang === 'ar' ? 'أطفال وعائلي' : 'Kids & Family'}</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 text-xs bg-neutral-800 px-3 py-1.5 rounded-full hover:bg-neutral-700 transition"
            >
              <Globe size={14} />
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>

            {profile?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 text-xs bg-red-600/20 text-red-500 border border-red-600/40 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition">
                <Shield size={14} />
                {lang === 'ar' ? 'الإدارة' : 'Admin'}
              </Link>
            )}

            {user ? (
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-xs bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-700"
              >
                {lang === 'ar' ? 'خروج' : 'Sign Out'}
              </button>
            ) : (
              <Link to="/login" className="text-xs bg-red-600 px-4 py-1.5 rounded-md font-semibold hover:bg-red-700">
                {lang === 'ar' ? 'دخول' : 'Sign In'}
              </Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomeHome lang={lang} />} />
          <Route path="/admin" element={<AdminDashboard lang={lang} profile={profile} />} />
          <Route path="/login" element={<Login lang={lang} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// 1. الصفحة الرئيسية
function HomeHome({ lang }) {
  return (
    <div className="p-8">
      <div className="relative h-96 bg-gradient-to-r from-neutral-900 to-black rounded-2xl flex items-center px-12 overflow-hidden border border-neutral-800">
        <div className="max-w-lg z-10">
          <h1 className="text-4xl font-extrabold mb-4">
            {lang === 'ar' ? 'مرحباً بك في سينما فيو' : 'Welcome to CinemaView'}
          </h1>
          <p className="text-neutral-400 mb-6 text-sm">
            {lang === 'ar' ? 'شاهد أحدث الأفلام والمسلسلات العالمية والعربية بجودة عالية وبث سحابة مباشر.' : 'Watch latest global and Arabic titles with seamless streaming.'}
          </p>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold text-sm transition">
            <Play size={18} />
            {lang === 'ar' ? 'تشغيل العرض الرئيسي' : 'Play Featured'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. لوحة الإدارة (/admin)
function AdminDashboard({ lang, profile }) {
  const navigate = useNavigate();

  if (profile?.role !== 'admin') {
    return (
      <div className="p-12 text-center text-red-500 font-bold">
        {lang === 'ar' ? 'غير مصرح لك بالدخول لهذه الصفحة' : 'Unauthorized Access'}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="text-red-600" />
        {lang === 'ar' ? 'لوحة تحكّم سينما فيو (Admin Dashboard)' : 'CinemaView Control Panel'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">{lang === 'ar' ? 'المشتركين' : 'Users'}</h3>
          <p className="text-3xl font-extrabold text-red-500">1</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">{lang === 'ar' ? 'العروض الخاصة' : 'Custom Banners'}</h3>
          <p className="text-3xl font-extrabold text-emerald-500">0</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">{lang === 'ar' ? 'حالة السيرفر' : 'System Status'}</h3>
          <p className="text-sm text-emerald-400">● Connected (Supabase)</p>
        </div>
      </div>
    </div>
  );
}

// 3. صفحة تسجيل الدخول
function Login({ lang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-neutral-900 border border-neutral-800 rounded-xl">
      <h2 className="text-xl font-bold mb-6 text-center">
        {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
      </h2>
      {error && <div className="bg-red-600/20 text-red-500 p-3 rounded mb-4 text-xs">{error}</div>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 text-sm">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 p-3 rounded text-white outline-none" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 p-3 rounded text-white outline-none" 
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 py-3 rounded font-bold transition">
          {lang === 'ar' ? 'دخول' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default App;
