import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Info, Zap, User, Menu, X, Coffee, ShieldCheck,
  Target, Cpu, Code2, Award, ChevronLeft,
  ChevronRight, AlertTriangle, CheckCircle2, LogOut, Settings, Activity, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showHealthModal, setShowHealthModal] = useState(true);

  // --- ESTADOS DE SESIÓN Y PLAN ---
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tienePlan, setTienePlan] = useState(false);
  const [randomIcon, setRandomIcon] = useState(null);

  const slides = [
    {
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1470",
      title: "Alto Rendimiento",
      desc: "Algoritmos diseñados para la evolución física."
    },
    {
      url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1469",
      title: "Dojo Digital",
      desc: "Entrenamiento libre de barreras económicas."
    },
    {
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1470",
      title: "Tecnología TSU",
      desc: "Ingeniería aplicada al bienestar humano."
    }
  ];

  useEffect(() => {
    const icons = [
      <Activity key="icon-act" size={16} />,
      <Zap key="icon-zap" size={16} />,
      <User key="icon-usr" size={16} />,
      <Target key="icon-trg" size={16} />
    ];
    setRandomIcon(icons[Math.floor(Math.random() * icons.length)]);

    const cargarDatosUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: plan } = await supabase
          .from('planes_entrenamiento')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setTienePlan(!!plan);

        const { data: profile } = await supabase
          .from('profiles')
          .select('apodo')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    };

    cargarDatosUsuario();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarDatosUsuario();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green selection:text-black">
      
      {/* MODAL DE AVISO DE SALUD */}
      {showHealthModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <div className="relative bg-zinc-900 border border-red-500/30 w-full max-w-xl rounded-[2rem] p-8 md:p-12 shadow-[0_0_100px_rgba(255,49,49,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <ShieldCheck size={180} className="text-red-500" />
            </div>
            <div className="relative z-10 space-y-8 text-left">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/20 p-3 rounded-2xl">
                  <AlertTriangle size={36} className="text-red-500" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                  Protocolo de <br />
                  <span className="text-red-500 uppercase">Responsabilidad</span>
                </h2>
              </div>
              <div className="space-y-6 text-gray-400 text-sm md:text-base leading-relaxed">
                <p className="font-bold text-white italic border-l-4 border-red-500 pl-4 uppercase tracking-widest text-xs text-left">¡Aviso obligatorio!</p>
                <p>Las rutinas y dietas generadas son producto de un sistema algorítmico experimental. <span className="text-white font-bold text-left">No poseemos certificación médica ni nutricional clínica.</span> El uso de esta plataforma es bajo riesgo del usuario.</p>
                <div className="grid gap-4">
                  <div className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <CheckCircle2 size={20} className="text-neon-green shrink-0 mt-0.5" />
                    <p className="text-xs uppercase font-bold tracking-tight">Si presentas condiciones cardíacas, lesiones previas o patologías crónicas, el acceso está restringido sin aval médico.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowHealthModal(false)} className="w-full bg-red-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                ENTRAR AL DOJO - ACEPTO TÉRMINOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full border-b border-neon-green/20 bg-black/95 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-neon-green p-2 rounded-lg group-hover:shadow-[0_0_20px_#39FF14] transition-all">
              <Dumbbell className="text-black" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">
              SHONEN<span className="text-neon-green">WORKOUT</span>
            </span>
          </Link>

          {/* MENÚ DESKTOP */}
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link to="/sobre-nosotros" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Info size={14} /> Sobre Nosotros</Link>
            {session && tienePlan ? (
              <>
                <Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Activity size={14} /> Mi Plan</Link>
                <Link to="/planes" className="flex items-center gap-2 text-neon-green font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link>
              </>
            ) : (
              <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Crea tu Plan</Link>
            )}
            <Link to="/donaciones" className="flex items-center gap-2 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg bg-yellow-400/5 hover:bg-yellow-400/10 transition-all font-bold uppercase italic"><Coffee size={14} /> Apoyar Proyecto</Link>
            {session ? (
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
                      <p className="text-[10px] font-bold text-white uppercase truncate">{session.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link to="/perfil" className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic hover:bg-neon-green hover:text-black rounded-xl flex items-center gap-3 transition-colors"><Settings size={14} /> Ver Ficha Técnica</Link>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center gap-3 transition-colors"><LogOut size={14} /> Cerrar Protocolo</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 border border-neon-green text-neon-green px-5 py-2 rounded-full font-bold hover:bg-neon-green hover:text-black transition-all uppercase italic"><User size={16} /> Acceso</Link>
            )}
          </div>

          {/* BOTÓN HAMBURGUESA (MÓVIL) */}
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
              
              {session && tienePlan ? (
                <>
                  <Link onClick={() => setIsMenuOpen(false)} to="/mi-plan" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                    <Activity size={28} /> Mi Plan
                  </Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/planes" className="text-2xl font-black uppercase italic text-neon-green flex items-center gap-4">
                    <Zap size={28} /> Cambiar Plan
                  </Link>
                </>
              ) : (
                <Link onClick={() => setIsMenuOpen(false)} to="/planes" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                  <Zap size={28} /> Crea tu Plan
                </Link>
              )}
              
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
      <main className="pt-48 pb-20 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-7xl md:text-9xl font-black italic uppercase leading-none">
          SUPERA TU <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-blue-400 drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]">POTENCIAL</span>
        </h2>
        <p className="mt-6 text-gray-500 tracking-[0.5em] uppercase text-sm font-bold">Ingeniería Fitness de Grado Estudiantil</p>
      </main>

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        <div className="border-2 border-red-500/50 bg-red-500/5 rounded-2xl p-8 backdrop-blur-sm text-left">
          <h3 className="text-red-500 font-black uppercase tracking-tighter text-xl mb-4 flex items-center gap-2">
            <ShieldCheck /> Protocolo de Seguridad Física y Técnica
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Shonen Workout constituye un entorno de prueba para algoritmos de entrenamiento. <span className="text-white font-bold text-left">No reemplaza el diagnóstico médico.</span>
          </p>
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest leading-loose">
            Toda la información proporcionada por el sistema debe ser validada por un profesional certificado. Al utilizar esta herramienta, el usuario asume la total responsabilidad por la ejecución técnica de los movimientos y las modificaciones dietéticas. El proyecto se deslinda de lesiones resultantes por negligencia o falta de supervisión profesional.
          </p>
        </div>

        {/* CARRUSEL */}
        <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-3xl border border-white/10 group">
          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-10 left-10 z-20 text-left">
                <h4 className="text-4xl font-black italic uppercase text-neon-green">{slide.title}</h4>
                <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">{slide.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full border border-white/10 hover:border-neon-green text-white transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full border border-white/10 hover:border-neon-green text-white transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
        </div>

        {/* MISIÓN Y VISIÓN */}
        <div className="grid md:grid-cols-2 gap-12 pt-10">
          <div className="group p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all text-left">
            <h3 className="text-3xl font-black italic uppercase text-purple-500 flex items-center gap-3 mb-6"><Target size={30} /> Nuestra Misión</h3>
            <p className="text-gray-400 leading-relaxed text-sm italic border-l-2 border-purple-500 pl-6">
              Brindar una alternativa tecnológica de alta calidad para el acondicionamiento físico, democratizando el acceso a planes estructurados. Buscamos erradicar las barreras económicas que impiden a los jóvenes alcanzar su máximo potencial mediante el uso de arquitectura de software moderna y gratuita.
            </p>
          </div>
          <div className="group p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all text-left">
            <h3 className="text-3xl font-black italic uppercase text-blue-500 flex items-center gap-3 mb-6"><Cpu size={30} /> Nuestra Visión</h3>
            <p className="text-gray-400 leading-relaxed text-sm italic border-l-2 border-blue-500 pl-6">
              Convertirnos en la plataforma de referencia para la comunidad fitness hispanohablante, demostrando que el talento de los estudiantes de TSU puede generar soluciones de impacto social. Aspiramos a integrar tecnologías de análisis de datos para personalizar la evolución de cada "Guerrero" de forma precisa.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2 text-left"><Code2 size={16} className="text-neon-green" /> Infraestructura</h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-widest italic text-left">
                <li>React 18 (Vite.js)</li>
                <li>Supabase (Auth & DB)</li>
                <li>Tailwind CSS</li>
                <li>PostgreSQL Architecture</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2 text-left"><ShieldCheck size={16} className="text-red-500" /> Ética</h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-wider italic text-left"><li>Aviso de Salud</li><li>Transparencia TSU</li></ul>
            </div>
            <div className="md:text-right text-left">
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em]">Soporte</h4>
              <p className="text-[10px] text-neon-green font-black uppercase tracking-tighter">vegajulian1973@gmail.com</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Guanajuato, México</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-[10px] text-gray-800 font-black tracking-[3px] uppercase text-center">
            © 2026 SHONEN WORKOUT. CÓDIGO POR ESTUDIANTES DE TECNOLOGÍA.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;