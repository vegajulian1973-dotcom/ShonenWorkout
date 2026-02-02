import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Dumbbell, Info, Zap, User, Menu, X, Coffee, ShieldCheck, 
  LogOut, Settings, Activity, Target, ChevronDown, Code2, Home, Building2 
} from 'lucide-react';
import { supabase } from "./supabaseClient";
import { generarPlanIntegral } from "./geminiService";
// IMPORTANTE: Instala esto con: npm install @stripe/stripe-js
import { loadStripe } from '@stripe/stripe-js';

// Inicializamos Stripe con tu llave pública de entorno
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CreaTuPlan = () => {
  const [loading, setLoading] = useState(true);
  const [forjando, setForjando] = useState(false); 
  const [characters, setCharacters] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [randomIcon, setRandomIcon] = useState(null);
  const [tienePlan, setTienePlan] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [selectedChar, setSelectedChar] = useState(null);
  const [step, setStep] = useState('list'); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const icons = [
      <Activity key="icon-act" size={16} />,
      <Zap key="icon-zap" size={16} />,
      <User key="icon-usr" size={16} />,
      <Target key="icon-trg" size={16} />
    ];
    setRandomIcon(icons[Math.floor(Math.random() * icons.length)]);

    const cargarDatosUsuario = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      setUserProfile(profile);

      const { data: planExistente } = await supabase
        .from('planes_entrenamiento')
        .select('id')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();
      
      if (planExistente) setTienePlan(true);

      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .lte('min_imc', profile?.imc || 0)
        .gte('max_imc', profile?.imc || 0);

      if (chars) setCharacters(chars);
      setLoading(false);
    };

    cargarDatosUsuario();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarDatosUsuario();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCharClick = (char) => {
    setSelectedChar(char);
    setStep('location');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSelection = async (location) => {
    setForjando(true); 
    
    try {
      // 1. PROCESO DE PAGO CON STRIPE
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const { id: sessionId } = await response.json();
      const stripe = await stripePromise;

      // Redirigir a la pasarela de Stripe
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) throw new Error(result.error.message);

      // 2. GENERACIÓN DEL PLAN (Prompt Reforzado)
      const datosParaIA = {
        nombre: userProfile?.apodo || "Guerrero",
        objetivo: selectedChar?.objetivo || userProfile?.objetivo || "Aumento de fuerza",
        lugarEntrenamiento: location,
        imc: userProfile?.imc || "Rango E",
        estilo: "Solo Leveling / Cazador S-Rank",
        instrucciones_formato: `
          REGLAS CRÍTICAS DE SALIDA (SISTEMA DE RANGO S):
          1. ESTRUCTURA JSON: Devuelve un objeto con las llaves "nombre_plan", "frase_motivacional", "rutina" (objeto con días) y "dieta_semanal" (objeto con días).
          2. RUTINA OBLIGATORIA: Cada día (Lunes a Domingo) DEBE tener una cadena de texto con EXACTAMENTE 7 ejercicios numerados, separados por comas. 
             Ejemplo: "01. Calentamiento (2x10), 02. Ejercicio (3x12), 03. Ejercicio (3x12), 04. Ejercicio (3x12), 05. Ejercicio (3x12), 06. Ejercicio (3x12), 07. Finisher (1xMax)".
          3. DIETA OBLIGATORIA: Cada día de "dieta_semanal" DEBE tener un menú diferente con Desayuno, Comida y Cena.
          4. No resumas. No uses "Repetir lo del Lunes". Si no generas 7 ejercicios por día, el sistema fallará.
        `
      };
      
      const planIA = await generarPlanIntegral(datosParaIA);
      if (!planIA) throw new Error("Plan nulo");

      const { error: errorPlan } = await supabase
        .from('planes_entrenamiento')
        .upsert(
          { 
            user_id: session.user.id, 
            plan_completo: planIA 
          }, 
          { onConflict: 'user_id' }
        );

      if (errorPlan) throw errorPlan;

      await supabase
        .from('profiles')
        .update({ selected_character_id: selectedChar.id })
        .eq('id', session.user.id);

      navigate('/mi-plan'); 
    } catch (err) {
      console.error("ERROR EN EL SISTEMA:", err);
      alert("Error en la conexión con el Gremio. Verifica tu token o conexión.");
      setForjando(false); 
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="text-neon-green text-3xl font-black animate-pulse uppercase italic tracking-widest text-shadow-neon">SINCRONIZANDO ADN...</div>
      <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-neon-green animate-[progress_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );

  if (forjando) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 fixed inset-0 z-[200]">
      <div className="relative">
        <div className="absolute inset-0 bg-neon-green/20 blur-3xl animate-pulse"></div>
        <div className="text-neon-green text-4xl font-black animate-bounce uppercase italic tracking-widest text-center px-4 relative z-10">FORJANDO DESTINO</div>
      </div>
      <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-neon-green animate-[progress_3s_ease-in-out_infinite]"></div>
      </div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Generando Misiones de Rango S</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green">
      <nav className="fixed top-0 w-full border-b border-neon-green/20 bg-black/90 backdrop-blur-md z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-neon-green p-2 rounded-lg group-hover:shadow-[0_0_20px_#39FF14] transition-all">
              <Dumbbell className="text-black" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">
              SHONEN<span className="text-neon-green">WORKOUT</span>
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link to="/sobre-nosotros" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Info size={14} /> Sobre Nosotros</Link>
            {session && tienePlan ? (
              <><Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Activity size={14} /> Mi Plan</Link>
              <Link to="/planes" className="flex items-center gap-2 text-neon-green font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link></>
            ) : (<Link to="/planes" className="flex items-center gap-2 text-neon-green font-bold uppercase italic"><Zap size={14} /> Crea tu Plan</Link>)}
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
          <button className="lg:hidden text-neon-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={32} /> : <Menu size={32} />}</button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          {step === 'list' ? (
            <>
              <header className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">Selecciona tu <span className="text-neon-green">Guerrero</span></h1>
                <p className="text-neon-green font-bold uppercase tracking-[0.3em] text-xs">Análisis de Potencial: Nivel {userProfile?.imc}</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {characters.map((char) => (
                  <div key={char.id} className="group relative bg-zinc-950 border border-zinc-800 hover:border-neon-green rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                    <div className="h-[500px] overflow-hidden relative">
                      <img src={char.image_url || 'https://via.placeholder.com/500x700'} alt={char.nombre} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-10 text-left">
                        <span className="bg-neon-green text-black text-[10px] font-black px-3 py-1 uppercase italic rounded-sm mb-4 inline-block">{char.objetivo}</span>
                        <h2 className="text-4xl font-black uppercase italic mb-6 leading-none">{char.nombre}</h2>
                        <button onClick={() => handleCharClick(char)} className="w-full py-4 bg-white text-black font-black uppercase italic hover:bg-neon-green transition-all transform hover:-translate-y-1 shadow-xl">Despertar Poder</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 text-center">
              <button onClick={() => setStep('list')} className="mb-8 text-zinc-500 hover:text-white uppercase font-black text-xs flex items-center gap-2 mx-auto"><X size={16}/> Volver a Selección</button>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-12 leading-tight">¿Campo de entrenamiento para <br/><span className="text-neon-green">{userProfile?.apodo || 'el Guerrero'}?</span></h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <button onClick={() => handleFinalSelection('Casa')} className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-neon-green p-12 rounded-[2.5rem] transition-all overflow-hidden shadow-2xl">
                  <Home size={60} className="mx-auto mb-6 text-zinc-700 group-hover:text-neon-green transition-colors group-hover:scale-110 duration-500" />
                  <h3 className="text-3xl font-black uppercase italic mb-2">Refugio Social</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Peso corporal y entorno</p>
                  <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={() => handleFinalSelection('Gimnasio')} className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-neon-green p-12 rounded-[2.5rem] transition-all overflow-hidden shadow-2xl">
                  <Building2 size={60} className="mx-auto mb-6 text-zinc-700 group-hover:text-neon-green transition-colors group-hover:scale-110 duration-500" />
                  <h3 className="text-3xl font-black uppercase italic mb-2">Mazmorra de Hierro</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Equipo de alta gama</p>
                  <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              {/* BANNER DE PAGO SEGURO */}
              <div className="mt-12 p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl inline-flex items-center gap-4">
                <ShieldCheck className="text-neon-green" size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Transacción Segura vía Stripe (Rango S Encryption)</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black border-t border-neon-green/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
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

export default CreaTuPlan;