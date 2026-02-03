import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Info, Zap, User, Menu, X, Coffee, ShieldCheck, 
  Globe, Code2, Heart, Smartphone, CreditCard, ChevronRight,
  LogOut, Settings, Activity, Target, ChevronDown 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

const Donaciones = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- LÓGICA DE ESTADO DE SESIÓN Y PLAN ---
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tienePlan, setTienePlan] = useState(false);
  const [randomIcon, setRandomIcon] = useState(null);

  useEffect(() => {
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

  // --- DATOS DE MÉTODOS CON LINKS DE STRIPE ---
  const metodos = [
    {
      titulo: "Donativo Café",
      monto: "$50 MXN",
      desc: "Cubre el mantenimiento básico de la base de datos por un día.",
      icono: <Coffee className="text-yellow-400" size={32} />,
      color: "border-yellow-400/20",
      link: "https://buy.stripe.com/5kQ8wP1Gkdub0NGbbNf7i01"
    },
    {
      titulo: "Nodo Estudiante",
      monto: "$200 MXN",
      desc: "Apoya el despliegue de nuevos algoritmos de IA para rutinas.",
      icono: <Zap className="text-neon-blue" size={32} />,
      color: "border-neon-blue/20",
      link: "https://buy.stripe.com/cNiaEXbgU9dVbsk2Fhf7i00"
    },
    {
      titulo: "Patrocinador Dojo",
      monto: "Libre",
      desc: "Asegura la infraestructura del servidor por meses completos.",
      icono: <Heart className="text-neon-red" size={32} />,
      color: "border-neon-red/20",
      link: "https://buy.stripe.com/9B66oH84I0Hpaog0x9f7i02"
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
            <Link to="/sobre-nosotros" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic">
              <Info size={14} /> Sobre Nosotros
            </Link>
            
            {session && tienePlan ? (
              <>
                <Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Activity size={14} /> Mi Plan</Link>
                <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link>
              </>
            ) : (
              <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Crea tu Plan</Link>
            )}

            <Link to="/donaciones" className="flex items-center gap-2 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg bg-yellow-400/5 transition-all font-black italic">
              <Coffee size={14} /> APOYAR PROYECTO
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
              <Link onClick={() => setIsMenuOpen(false)} to="/sobre-nosotros" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                <Info size={28} /> Sobre Nosotros
              </Link>
              
              {session && tienePlan ? (
                <>
                  <Link onClick={() => setIsMenuOpen(false)} to="/mi-plan" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
                    <Activity size={28} /> Mi Plan
                  </Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/planes" className="text-2xl font-black uppercase italic flex items-center gap-4 text-white">
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
        <section className="text-center mb-20 space-y-6">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-tight">
            Mantén el <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Servidor</span> Encendido
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 uppercase tracking-[0.3em] text-[10px] font-bold italic">
            Proyecto TSU libre de publicidad y suscripciones obligatorias
          </p>
        </section>

        {/* TARJETAS DE DONACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {metodos.map((item, index) => (
            <div key={index} className={`bg-zinc-900/50 border ${item.color} rounded-3xl p-10 hover:bg-zinc-900 transition-all group flex flex-col justify-between text-left`}>
              <div>
                <div className="mb-6">{item.icono}</div>
                <h3 className="text-2xl font-black italic uppercase mb-2">{item.titulo}</h3>
                <span className="text-3xl font-mono text-white block mb-4">{item.monto}</span>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 italic">
                  {item.desc}
                </p>
              </div>
              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-black transition-all uppercase text-xs tracking-widest"
              >
                Seleccionar <ChevronRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* INFO DE TRANSPARENCIA */}
        <div className="bg-gradient-to-r from-zinc-900 to-black border border-white/5 rounded-[2.5rem] p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-left">
              <h3 className="text-3xl font-black italic uppercase flex items-center gap-3">
                <span className="w-2 h-8 bg-neon-green"></span>
                ¿A dónde va tu apoyo?
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex gap-4">
                  <div className="text-neon-green"><Smartphone size={24} /></div>
                  <p className="text-gray-400 text-sm italic">Pago de dominios (.com) y hosting especializado para aplicaciones web de alto tráfico.</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-neon-green"><Code2 size={24} /></div>
                  <p className="text-gray-400 text-sm italic">Tokens de Inteligencia Artificial para la generación de rutinas personalizadas.</p>
                </div>
              </div>
            </div>
            <div className="bg-black/50 p-8 rounded-3xl border border-neon-green/20 text-left">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Método de Transferencia</h4>
              <div className="flex items-center gap-4 text-gray-300 mb-6">
                <CreditCard size={40} className="text-neon-green" />
                <div>
                  <p className="text-xs uppercase font-bold text-left">Pago Seguro vía Stripe</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter text-left">Encriptación AES-256 bits</p>
                </div>
              </div>
              <p className="text-[9px] text-gray-600 uppercase leading-loose italic">
                Al ser un proyecto estudiantil, todas las donaciones se consideran apoyo voluntario a la investigación tecnológica.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-neon-green/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-neon-green p-1.5 rounded-md"><Dumbbell className="text-black" size={20} /></div>
                <span className="text-xl font-black italic uppercase tracking-tighter text-white">SHONEN<span className="text-neon-green">WORKOUT</span></span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed uppercase tracking-wider font-bold italic">
                Plataforma de código abierto dedicada al alto rendimiento físico.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2 text-left">
                <Code2 size={16} className="text-neon-green" /> Infraestructura
              </h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-widest italic text-left">
                <li>React 18 (Vite.js)</li>
                <li>Supabase (Auth & DB)</li>
                <li>Tailwind CSS</li>
                <li>PostgreSQL Architecture</li>
                <li>Vercel Deployment</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em] flex items-center gap-2 text-left">
                <ShieldCheck size={16} className="text-red-500" /> Ética
              </h4>
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-wider italic text-left">
                <li>Aviso de Salud</li>
                <li>Transparencia TSU</li>
              </ul>
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

export default Donaciones;