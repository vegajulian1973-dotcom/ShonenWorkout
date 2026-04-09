import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Info, Zap, User, Menu, X, Coffee, Mail, Facebook, Instagram, 
  MessageCircle, Code2, ShieldCheck, LogOut, Settings, Activity, Target, ChevronDown,
  Star, Send, MessageSquare
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

  // --- ESTADOS PARA COMENTARIOS ---
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState({ contenido: '', puntuacion: 5, categoria: 'General' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const icons = [<Activity size={16} />, <Zap size={16} />, <User size={16} />, <Target size={16} />];
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

    const cargarComentarios = async () => {
      const { data } = await supabase
        .from('comentarios_sistema')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(6);
      if (data) setComentarios(data);
    };

    cargarDatosUsuario();
    cargarComentarios();

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

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!session) return alert("Debes iniciar sesión para dejar un comentario.");
    setEnviando(true);

    const { error } = await supabase
      .from('comentarios_sistema')
      .insert([
        { 
          id_usuario: session.user.id, 
          contenido: nuevoComentario.contenido, 
          puntuacion_app: nuevoComentario.puntuacion,
          categoria: nuevoComentario.categoria 
        }
      ]);

    if (!error) {
      setNuevoComentario({ contenido: '', puntuacion: 5, categoria: 'General' });
      const { data } = await supabase
        .from('comentarios_sistema')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(6);
      if (data) setComentarios(data);
    }
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green selection:text-black">
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
            <Link to="/sobre-nosotros" className="flex items-center gap-2 text-neon-green font-bold uppercase italic"><Info size={14} /> Sobre Nosotros</Link>
            {session && tienePlan ? (
              <>
                <Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Activity size={14} /> Mi Plan</Link>
                <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic"><Zap size={14} /> Cambiar Plan</Link>
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

          <button className="lg:hidden text-neon-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-black uppercase tracking-[0.3em] italic">
            <Code2 size={14} /> El equipo detrás del código
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-tight tracking-tighter">
            NUESTRA <span className="text-neon-green">HISTORIA</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest italic">
            Nacimos de la pasión por el anime y la necesidad de herramientas tecnológicas reales para el fitness estudiantil.
          </p>
        </div>
      </section>

      {/* SECCIÓN DE LOS DESARROLLADORES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* JULIÁN VEGA */}
          <div className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden hover:border-neon-green/30 transition-all duration-500">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-48 h-48 shrink-0 rounded-[2.5rem] overflow-hidden border-2 border-neon-green/20 rotate-3 group-hover:rotate-0 transition-all duration-500">
                <img src={FotoJulian} alt="Julián" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Julián <span className="text-neon-green">Vega García</span></h2>
                <p className="text-xs font-black text-neon-green uppercase tracking-[0.3em] italic">Full Stack Developer & Founder</p>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">Estudiante de Ingeniería en Entornos Virtuales en la UTL. Especialista en arquitectura de sistemas.</p>
                <div className="flex justify-center md:justify-start gap-4 pt-4 text-gray-500"><Mail size={20}/><Facebook size={20}/><Instagram size={20}/></div>
              </div>
            </div>
          </div>

          {/* ANABEL LÓPEZ */}
          <div className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden hover:border-blue-500/30 transition-all duration-500">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-48 h-48 shrink-0 rounded-[2.5rem] overflow-hidden border-2 border-blue-500/20 -rotate-3 group-hover:rotate-0 transition-all duration-500">
                <img src={FotoAnabel} alt="Anabel" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Anabel <span className="text-blue-500">López Raya</span></h2>
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] italic">Co-Founder & UI/UX Designer</p>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">Diseñadora de experiencias e interfaz de usuario. Enfocada en el impacto visual del entrenamiento.</p>
                <div className="flex justify-center md:justify-start gap-4 pt-4 text-gray-500"><Mail size={20}/><Facebook size={20}/><Instagram size={20}/></div>
              </div>
            </div>
          </div>

          {/* AARÓN DAVID GONZALES RODRIGUEZ */}
          <div className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden hover:border-neon-green/30 transition-all duration-500">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-48 h-48 shrink-0 rounded-[2.5rem] bg-zinc-800 flex items-center justify-center border-2 border-white/5 group-hover:border-neon-green/30 transition-all">
                <User size={64} className="text-zinc-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Aarón David <span className="text-neon-green">Gonzales Rodriguez</span></h2>
                <p className="text-xs font-black text-neon-green uppercase tracking-[0.3em] italic">Desarrollador</p>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">Integrante clave en el desarrollo de funcionalidades del sistema y soporte técnico.</p>
              </div>
            </div>
          </div>

          {/* LEONARDO FERRUSCA MENESES */}
          <div className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden hover:border-neon-green/30 transition-all duration-500">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-48 h-48 shrink-0 rounded-[2.5rem] bg-zinc-800 flex items-center justify-center border-2 border-white/5 group-hover:border-neon-green/30 transition-all">
                <User size={64} className="text-zinc-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Leonardo <span className="text-neon-green">Ferrusca Meneses</span></h2>
                <p className="text-xs font-black text-neon-green uppercase tracking-[0.3em] italic">Desarrollador</p>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">Especialista en integración de módulos y optimización de flujos de trabajo.</p>
              </div>
            </div>
          </div>

          {/* LUIS ANTONIO ROSALES TINAJERO */}
          <div className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden hover:border-neon-green/30 transition-all duration-500 md:col-span-2 max-w-2xl mx-auto w-full">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-48 h-48 shrink-0 rounded-[2.5rem] bg-zinc-800 flex items-center justify-center border-2 border-white/5 group-hover:border-neon-green/30 transition-all">
                <User size={64} className="text-zinc-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Luis Antonio <span className="text-neon-green">Rosales Tinajero</span></h2>
                <p className="text-xs font-black text-neon-green uppercase tracking-[0.3em] italic">Desarrollador</p>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">Focado en el mantenimiento de la base de datos y la estabilidad del servidor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK DEL SISTEMA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-left space-y-4 mb-12">
          <h3 className="text-4xl md:text-5xl font-black italic uppercase flex items-center gap-4">
            <MessageSquare className="text-neon-green" size={40} />
            Feedback del <span className="text-neon-green">Sistema</span>
          </h3>
          <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.4em]">Bitácora de usuarios en el Dojo</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 bg-zinc-900/40 border border-white/10 p-8 rounded-[2.5rem] h-fit">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-neon-green italic">Nueva Entrada</h4>
            <form onSubmit={enviarComentario} className="space-y-6 text-left">
              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-3">Puntuación del Dojo</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNuevoComentario({...nuevoComentario, puntuacion: star})} className={`transition-all ${nuevoComentario.puntuacion >= star ? 'text-yellow-400 scale-110' : 'text-zinc-700 hover:text-zinc-500'}`}><Star size={24} fill={nuevoComentario.puntuacion >= star ? "currentColor" : "none"} /></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-3">Categoría</label>
                <select value={nuevoComentario.categoria} onChange={(e) => setNuevoComentario({...nuevoComentario, categoria: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:border-neon-green outline-none">
                  <option value="General">Reporte General</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Bug">Falla Técnica</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-3">Comentario</label>
                <textarea required value={nuevoComentario.contenido} onChange={(e) => setNuevoComentario({...nuevoComentario, contenido: e.target.value})} placeholder="Escribe tu mensaje aquí guerrero..." className="w-full bg-black border border-white/10 rounded-2xl px-4 py-4 text-xs font-medium min-h-[140px] focus:border-neon-green outline-none resize-none" />
              </div>
              <button disabled={enviando || !session} type="submit" className="w-full bg-neon-green text-black font-black py-5 rounded-2xl uppercase italic text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 hover:shadow-[0_0_25px_#39FF14] disabled:opacity-50">
                {enviando ? 'PROCESANDO...' : session ? <><Send size={18}/> Enviar Reporte</> : 'IDENTIFÍCATE PARA COMENTAR'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {comentarios.length > 0 ? comentarios.map((com) => (
              <div key={com.id_comentario} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2rem] text-left relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[8px] font-black uppercase bg-neon-green/10 text-neon-green px-3 py-1 rounded-full tracking-widest italic border border-neon-green/20">{com.categoria}</span>
                    <div className="flex text-yellow-500 gap-0.5">
                      {Array.from({ length: com.puntuacion_app }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed italic mb-8">"{com.contenido}"</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="bg-white/5 p-2 rounded-full border border-white/10"><User size={14} className="text-zinc-500" /></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">GUERRERO_ID: {com.id_usuario?.substring(0, 8) || 'ANÓNIMO'}</span>
                    <span className="text-[7px] font-bold text-zinc-600 uppercase">REGISTRO: {new Date(com.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 py-20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-30 italic uppercase text-[10px] tracking-widest font-black">
                No hay reportes en la bitácora actual.
              </div>
            )}
          </div>
        </div>
      </section>

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
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase tracking-widest italic">
                <li>React 18 (Vite.js)</li>
                <li>Supabase (Auth & DB)</li>
                <li>Tailwind CSS</li>
                <li>PostgreSQL Architecture</li>
              </ul>
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
          <div className="pt-8 border-t border-white/5 text-[10px] text-gray-800 font-black tracking-[3px] uppercase text-center">
            © 2026 SHONEN WORKOUT. CÓDIGO POR ESTUDIANTES DE TECNOLOGÍA.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SobreNosotros;