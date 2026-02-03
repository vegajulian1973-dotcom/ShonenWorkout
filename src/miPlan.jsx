import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { 
  Dumbbell, Utensils, Zap, Quote, Flame, 
  Settings, LogOut, ChevronDown, Activity, User, Target, Code2, ShieldCheck, Coffee, Info, Menu, X 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MiPlan = () => {
  const [datosDb, setDatosDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [randomIcon, setRandomIcon] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  useEffect(() => {
    const icons = [
      <Activity key="icon-act" size={16} />,
      <Zap key="icon-zap" size={16} />,
      <User key="icon-usr" size={16} />,
      <Target key="icon-trg" size={16} />
    ];
    setRandomIcon(icons[Math.floor(Math.random() * icons.length)]);
    obtenerDatosCompletos();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const obtenerDatosCompletos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setSession({ user });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);

      const { data: planData, error } = await supabase
        .from('planes_entrenamiento')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && planData) {
        setDatosDb(planData);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const ordenarPorDia = (objeto) => {
    if (!objeto) return [];
    return Object.entries(objeto).sort((a, b) => {
      return ordenDias.indexOf(a[0]) - ordenDias.indexOf(b[0]);
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="text-neon-green text-3xl font-black animate-pulse uppercase italic tracking-widest text-center px-4">SINCRONIZANDO ADN...</div>
      <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-neon-green animate-[progress_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );

  const plan = datosDb?.plan_completo;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full border-b border-neon-green/20 bg-black/95 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-neon-green p-2 rounded-lg group-hover:shadow-[0_0_20px_#39FF14] transition-all">
              <Dumbbell className="text-black" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">SHONEN<span className="text-neon-green">WORKOUT</span></span>
          </Link>

          {/* MENÚ DESKTOP */}
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link to="/sobre-nosotros" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Info size={14} /> Sobre Nosotros</Link>
            <Link to="/mi-plan" className="flex items-center gap-2 text-white border-b border-neon-green pb-1 font-bold uppercase italic"><Activity size={14} className="text-neon-green" /> Mi Plan</Link>
            <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link>
            <Link to="/donaciones" className="flex items-center gap-2 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg bg-yellow-400/5 hover:bg-yellow-400/10 transition-all font-black italic"><Coffee size={14} /> APOYAR PROYECTO</Link>
            {session && (
              <div className="relative group py-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full hover:border-neon-green/50 transition-all cursor-pointer">
                  <div className="text-neon-green">{randomIcon}</div>
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-white">{userProfile?.apodo || 'ATLETA_ACTIVO'}</span>
                  <ChevronDown size={14} className="text-zinc-500 group-hover:rotate-180 transition-transform" />
                </div>
                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto z-[110]">
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4">
                    <div className="pb-3 border-b border-white/5 space-y-1 text-left">
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Identificación</p>
                      <p className="text-[10px] font-bold text-white uppercase truncate text-left">{session.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link to="/perfil" className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic hover:bg-neon-green hover:text-black rounded-xl flex items-center gap-3 transition-colors text-left"><Settings size={14} /> Ver Ficha Técnica</Link>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center gap-3 transition-colors text-left"><LogOut size={14} /> Cerrar Protocolo</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTÓN HAMBURGUESA MÓVIL */}
          <button className="lg:hidden text-neon-green z-[200] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* MENÚ MÓVIL REFORMADO - FONDO TOTALMENTE NEGRO */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black z-[150] flex flex-col h-screen w-screen overflow-y-auto pt-24 px-8 pb-10 animate-in fade-in duration-300">
            <div className="flex flex-col space-y-8">
              <Link onClick={() => setIsMenuOpen(false)} to="/sobre-nosotros" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                <Info size={28} /> Sobre Nosotros
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/mi-plan" className="text-2xl font-black uppercase italic flex items-center gap-4 text-neon-green">
                <Activity size={28} /> Mi Plan
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/planes" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                <Zap size={28} /> Cambiar Plan
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/donaciones" className="text-2xl font-black uppercase italic text-yellow-400 flex items-center gap-4">
                <Coffee size={28} /> Apoyar Proyecto
              </Link>
              
              <div className="pt-8 border-t border-white/10 space-y-6">
                {session ? (
                  <>
                    <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-white/5">
                      <div className="text-neon-green p-2 bg-white/5 rounded-full">{randomIcon}</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Atleta Activo</span>
                        <span className="font-black italic uppercase text-lg text-white">{userProfile?.apodo || 'GUERRERO'}</span>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <Link onClick={() => setIsMenuOpen(false)} to="/perfil" className="flex items-center gap-4 text-lg font-black uppercase italic text-white/80">
                        <Settings size={22} /> Perfil Técnico
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-4 text-lg font-black uppercase italic text-red-500">
                        <LogOut size={22} /> Cerrar Protocolo
                      </button>
                    </div>
                  </>
                ) : (
                  <Link onClick={() => setIsMenuOpen(false)} to="/login" className="flex items-center justify-center gap-4 border-2 border-neon-green text-neon-green p-5 rounded-2xl text-xl font-black uppercase italic">
                    <User size={24} /> Acceso Guerrero
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="pt-32 pb-20 px-8">
        {!plan ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <Zap size={64} className="text-zinc-800 mb-6" />
            <p className="mb-6 text-zinc-400 font-bold uppercase tracking-widest text-sm">Aún no has forjado tu destino.</p>
            <Link to="/planes" className="bg-neon-green text-black px-8 py-4 rounded-full font-black uppercase italic hover:scale-105 transition-transform">FORJAR MI PLAN</Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto text-left">
            <header className="relative border-b-4 border-neon-green pb-10 mb-16">
              <h1 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">{plan.nombre_plan || "PROTOCOLO S-RANK"}</h1>
              <div className="flex items-start gap-4 text-zinc-400 max-w-3xl">
                <Quote className="text-neon-green shrink-0 mt-1" size={32} />
                <p className="text-xl md:text-3xl font-medium italic leading-tight text-white/90 uppercase tracking-tight">{plan.frase_motivacional}</p>
              </div>
              <Flame className="absolute -top-12 right-0 text-neon-green opacity-5" size={180} />
            </header>

            <div className="grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                <h2 className="flex items-center gap-4 text-4xl font-black text-white uppercase italic tracking-tighter">
                  <Dumbbell size={40} className="text-neon-green" /> Rutina del Cazador
                </h2>
                <div className="grid gap-10">
                  {ordenarPorDia(plan.rutina).map(([dia, ejercicios]) => (
                    <div key={dia} className="bg-zinc-900/30 p-10 rounded-[2rem] border border-zinc-800/50 hover:border-neon-green/40 transition-all shadow-2xl relative group">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-neon-green font-black text-3xl uppercase italic tracking-widest">{dia}</span>
                        <div className="bg-neon-green/10 px-4 py-1 rounded-full border border-neon-green/20">
                          <span className="text-[10px] text-neon-green font-black uppercase tracking-widest animate-pulse">Misión Activa</span>
                        </div>
                      </div>
                      <ul className="space-y-6">
                        {typeof ejercicios === 'string' ? (
                          ejercicios.split(',').map((ej, i) => {
                            const textoLimpio = ej.trim();
                            if (!textoLimpio) return null;
                            return (
                              <li key={i} className="flex items-start gap-6 group/item">
                                <span className="text-neon-green font-black italic text-xl min-w-[30px] opacity-40 group-hover/item:opacity-100 transition-opacity">
                                  {(i + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="w-full">
                                  <p className="text-zinc-100 font-black uppercase italic text-lg tracking-tight border-b border-zinc-800 pb-3 group-hover/item:border-neon-green/50 transition-all">
                                    {textoLimpio.replace(/^\d+\.\s*/, '')}
                                  </p>
                                </div>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-zinc-500 italic uppercase">Esperando órdenes del Sistema...</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-12">
                <h2 className="flex items-center gap-4 text-4xl font-black text-white uppercase italic tracking-tighter">
                  <Utensils size={40} className="text-neon-green" /> Nutrición
                </h2>
                <div className="grid gap-6">
                  {plan.dieta_semanal ? ordenarPorDia(plan.dieta_semanal).map(([dia, menu]) => (
                    <div key={dia} className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl hover:bg-zinc-800/40 transition-all">
                      <span className="text-neon-green font-black uppercase text-xs tracking-[0.2em] mb-3 block italic">{dia}</span>
                      <p className="text-[13px] text-zinc-300 font-bold italic leading-relaxed uppercase">{menu}</p>
                    </div>
                  )) : (
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-red-500/20 text-center">
                      <p className="text-zinc-500 font-black uppercase text-xs italic">Sincronización de dieta incompleta.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-neon-green/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-neon-green p-1.5 rounded-md"><Dumbbell className="text-black" size={20} /></div>
                <span className="text-xl font-black italic uppercase tracking-tighter text-white">SHONEN<span className="text-neon-green">WORKOUT</span></span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed uppercase tracking-wider font-bold italic">Plataforma de código abierto dedicada al alto rendimiento físico.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2"><Code2 size={16} className="text-neon-green" /> Infraestructura</h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-widest italic"><li>React 18 (Vite.js)</li><li>Supabase (Auth & DB)</li><li>Tailwind CSS</li><li>PostgreSQL Architecture</li><li>Vercel Deployment</li></ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2"><ShieldCheck size={16} className="text-red-500" /> Ética</h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-wider italic"><li>Aviso de Salud</li><li>Transparencia TSU</li></ul>
            </div>
            <div className="md:text-right">
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em]">Soporte</h4>
              <p className="text-[10px] text-neon-green font-black uppercase tracking-tighter">vegajulian1973@gmail.com</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Guanajuato, México</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-[10px] text-gray-800 font-black tracking-[3px] uppercase text-center">© 2026 SHONEN WORKOUT. CÓDIGO POR ESTUDIANTES DE TECNOLOGÍA.</div>
        </div>
      </footer>
    </div>
  );
};

export default MiPlan;