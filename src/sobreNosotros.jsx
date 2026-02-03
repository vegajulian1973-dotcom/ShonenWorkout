import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Info, Zap, User, Menu, X, Coffee, Mail, Facebook, Instagram, 
  MessageCircle, Code2, ShieldCheck, LogOut, Settings, Activity, Target, ChevronDown 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

// IMPORTACIONES CRÍTICAS
import FotoJulian from './assets/julian.jpeg'; 
import FotoAnabel from './assets/anabel.jpeg';

const SobreNosotros = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- LÓGICA DE ESTADO DE SESIÓN Y PLAN ---
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tienePlan, setTienePlan] = useState(false);
  const [randomIcon, setRandomIcon] = useState(null);

  useEffect(() => {
    // Icono aleatorio para el perfil
    const icons = [<Activity size={16} />, <Zap size={16} />, <User size={16} />, <Target size={16} />];
    setRandomIcon(icons[Math.floor(Math.random() * icons.length)]);

    const cargarDatosUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Verificar si tiene plan
        const { data: plan } = await supabase
          .from('planes_entrenamiento')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setTienePlan(!!plan);

        // Obtener perfil para el apodo
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const integrantes = [
    {
      nombre: "Julián Vega García",
      roles: ["Diseñador UX/UI", "Dev Fullstack", "Creador Principal"],
      foto: FotoJulian,
      redes: { fb: "https://www.facebook.com/julian.vegagracia/?locale=es_LA", ig: "https://www.instagram.com/julianvega.garcia/", wa: "https://wa.me/5660243865", mail: "mailto:vegajulian1973@gmail.com" }
    },
    {
      nombre: "Anabel López Raya",
      roles: ["Diseñadora UX/UI", "Tester"],
      foto: FotoAnabel,
      redes: { fb: "#", ig: "#", wa: "https://wa.me/4661479613", mail: "mailto:4ni.lopez@gmail.com" }
    },
    {
      nombre: "Aarón David Gonzales Rodríguez",
      roles: ["Diseñador UX/UI", "QA Engineer", "Technical Writer"],
      foto: null,
      redes: { wa: "#", mail: "#" }
    },
    {
      nombre: "Luis Antonio Rosales Tinajero",
      roles: ["QA Engineer", "Technical Writer"],
      foto: null,
      redes: { fb: "#", ig: "#", wa: "#", mail: "#" }
    },
    {
      nombre: "Leonardo Ferrusca Meneses",
      roles: ["QA Engineer", "Technical Writer", "Tester"],
      foto: null,
      redes: { fb: "#", ig: "#", wa: "#", mail: "#" }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green">
      
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

          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link to="/sobre-nosotros" className="flex items-center gap-2 text-neon-green font-bold uppercase italic">
              <Info size={14} /> Sobre Nosotros
            </Link>
            
            {session && tienePlan ? (
              <>
                <Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Activity size={14} /> Mi Plan</Link>
                <Link to="/planes" className="flex items-center gap-2 text-neon-green font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link>
              </>
            ) : (
              <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Crea tu Plan</Link>
            )}

            <Link to="/donaciones" className="flex items-center gap-2 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg bg-yellow-400/5 hover:bg-yellow-400/10 transition-all font-bold uppercase italic">
              <Coffee size={14} /> Apoyar Proyecto
            </Link>
            
            {session ? (
              <div className="relative group py-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full hover:border-neon-green/50 transition-all cursor-pointer">
                  <div className="text-neon-green">{randomIcon}</div>
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-white">
                    {userProfile?.apodo || 'ATLETA_ACTIVO'}
                  </span>
                  <ChevronDown size={14} className="text-zinc-500 group-hover:rotate-180 transition-transform" />
                </div>
                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none group-hover:pointer-events-auto z-[110]">
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4">
                    <div className="pb-3 border-b border-white/5 space-y-1 text-left">
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Identificación</p>
                      <p className="text-[10px] font-bold text-white uppercase truncate">{session.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link to="/perfil" className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic hover:bg-neon-green hover:text-black rounded-xl flex items-center gap-3 transition-colors">
                        <Settings size={14} /> Ver Ficha Técnica
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center gap-3 transition-colors">
                        <LogOut size={14} /> Cerrar Protocolo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 border border-neon-green text-neon-green px-5 py-2 rounded-full font-bold hover:bg-neon-green hover:text-black transition-all uppercase italic">
                <User size={16} /> Acceso
              </Link>
            )}
          </div>

          <button className="lg:hidden text-neon-green z-[200] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* MENÚ MÓVIL - NEGRO SÓLIDO */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black z-[150] flex flex-col h-screen w-screen overflow-y-auto pt-24 px-8 pb-10">
            <div className="flex flex-col space-y-8">
              <Link onClick={() => setIsMenuOpen(false)} to="/sobre-nosotros" className="text-2xl font-black uppercase italic flex items-center gap-4 text-neon-green">
                <Info size={28} /> Sobre Nosotros
              </Link>
              
              {session && tienePlan ? (
                <>
                  <Link onClick={() => setIsMenuOpen(false)} to="/mi-plan" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                    <Activity size={28} /> Mi Plan
                  </Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/planes" className="text-2xl font-black uppercase italic flex items-center gap-4 text-neon-green">
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
                      <div className="flex flex-col text-left">
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
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <section className="text-center mb-24 space-y-6">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase text-center">
            Los <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-400">Arquitectos</span> del Dojo
          </h2>
          <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm text-left">
            <p className="text-gray-400 text-lg leading-relaxed italic">
              Somos un equipo de estudiantes finalizando la carrera de <span className="text-white font-bold italic">Técnico Superior Universitario</span>. 
              Buscamos resolver el sedentarismo mediante software accesible y entornos gratuitos con mucha pasión.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrantes.map((persona, index) => (
            <div key={index} className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-neon-green/50 transition-all group relative overflow-hidden text-left">
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-neon-green/30 p-1 mb-6 overflow-hidden bg-gray-800 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
                  {persona.foto ? (
                    <img src={persona.foto} alt={persona.nombre} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User size={64} className="text-gray-600" />
                  )}
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2 tracking-tight group-hover:text-neon-green transition-colors">{persona.nombre}</h3>
                <div className="flex flex-wrap justify-center gap-2 mb-8 h-12">
                  {persona.roles.map((rol, i) => (
                    <span key={i} className="text-[9px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-500 uppercase font-bold self-center shadow-sm">{rol}</span>
                  ))}
                </div>
                <div className="flex gap-4">
                  {persona.redes.wa && <a href={persona.redes.wa} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#25D366] transition-all hover:scale-110"><MessageCircle size={20} /></a>}
                  {persona.redes.fb && <a href={persona.redes.fb} className="text-gray-500 hover:text-[#1877F2] transition-all hover:scale-110"><Facebook size={20} /></a>}
                  {persona.redes.ig && <a href={persona.redes.ig} className="text-gray-500 hover:text-[#E4405F] transition-all hover:scale-110"><Instagram size={20} /></a>}
                  {persona.redes.mail && <a href={persona.redes.mail} className="text-gray-500 hover:text-red-500 transition-all hover:scale-110"><Mail size={20} /></a>}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-neon-green/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
            <div className="space-y-6 text-left">
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
                <li>Vercel Deployment</li>
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
};

export default SobreNosotros;