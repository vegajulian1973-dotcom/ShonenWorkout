import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Dumbbell, Zap, User, ChevronDown, LogOut, Activity, 
  Save, Edit3, Scale, Ruler, Calendar, Heart, Code2, Camera,
  ShieldCheck, Target, Coffee, Info, Menu, X, Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

const Perfil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [session, setSession] = useState(null);
  const [randomIcon, setRandomIcon] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tienePlan, setTienePlan] = useState(false);

  const [userData, setUserData] = useState({
    nombre: '',
    apodo: '',
    fechaCumple: '', 
    peso: '',
    altura: '',
    genero: '',
    avatar_url: '' 
  });

  const getProfile = useCallback(async (userSession) => {
    try {
      const { data, error } = await supabase
        .from('profiles') 
        .select('*')
        .eq('id', userSession.user.id)
        .single();

      if (data) setUserData(data);

      const { data: planData } = await supabase
        .from('planes_entrenamiento')
        .select('id')
        .eq('user_id', userSession.user.id)
        .maybeSingle();
      
      if (planData) setTienePlan(true);

    } catch (err) {
      console.error("Error al obtener perfil:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const icons = [<Activity key="1" size={16} />, <Zap key="2" size={16} />, <User key="3" size={16} />, <Target key="4" size={16} />];
    setRandomIcon(icons[Math.floor(Math.random() * icons.length)]);

    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        getProfile(currentSession);
      } else {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate, getProfile]);

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatar_profile').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatar_profile').getPublicUrl(fileName);
      setUserData({ ...userData, avatar_url: publicUrl });
    } catch (error) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({ id: session.user.id, ...userData });
    if (!error) setEditing(false);
    else alert("Error al sincronizar: " + error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const imc = () => {
    const p = parseFloat(userData.peso);
    const a = parseFloat(userData.altura) / 100;
    return (p > 0 && a > 0) ? (p / (a * a)).toFixed(1) : "--";
  };

  const getImcColor = (valor) => {
    if (valor === "--") return "text-zinc-600";
    const n = parseFloat(valor);
    if (n < 18.5) return "text-blue-400";
    if (n >= 18.5 && n < 25) return "text-neon-green";
    if (n >= 25 && n < 30) return "text-yellow-400";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neon-green font-black uppercase tracking-[0.4em] text-[10px]">Accediendo a Protocolos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-green">
      
      {/* --- NAVBAR ACTUALIZADA --- */}
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

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link to="/sobre-nosotros" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic">
              <Info size={14} /> Sobre Nosotros
            </Link>
            
            {tienePlan ? (
              <>
                <Link to="/mi-plan" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic">
                  <Activity size={14} /> Mi Plan
                </Link>
                <Link to="/planes" className="flex items-center gap-2 hover:text-neon-green transition-colors font-bold uppercase italic">
                  <Zap size={14} /> Cambiar Plan
                </Link>
              </>
            ) : (
              <Link to="/planes" className="flex items-center gap-2 text-neon-green font-bold uppercase italic">
                <Zap size={14} /> Crea tu Plan
              </Link>
            )}

            <Link to="/donaciones" className="flex items-center gap-2 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg bg-yellow-400/5 hover:bg-yellow-400/10 transition-all font-black italic">
              <Coffee size={14} /> APOYAR PROYECTO
            </Link>
            
            {session && (
              <div className="relative group py-4">
                <div className="flex items-center gap-3 bg-white/5 border border-neon-green/50 px-5 py-2 rounded-full cursor-pointer">
                  <div className="text-neon-green">{randomIcon}</div>
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-white">
                    {userData.apodo || 'ATLETA_ACTIVO'}
                  </span>
                  <ChevronDown size={14} className="text-zinc-500" />
                </div>
                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 group-hover:opacity-100 transition-all z-[110] pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4 text-left">
                    <div className="pb-3 border-b border-white/5">
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Identidad Digital</p>
                      <p className="text-[10px] font-bold text-white truncate">{session.user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[9px] font-black uppercase italic text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center gap-3 transition-colors">
                      <LogOut size={14} /> Cerrar Protocolo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="lg:hidden text-neon-green z-[200]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* --- NUEVO MENÚ MÓVIL (SÓLIDO Y FUNCIONAL) --- */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black z-[150] flex flex-col h-screen w-screen overflow-y-auto pt-32 px-8 pb-10">
            <div className="flex flex-col space-y-8 relative z-[160] bg-black">
              <Link to="/sobre-nosotros" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-white font-black italic uppercase text-2xl tracking-tighter">
                <Info className="text-neon-green" size={28} /> SOBRE NOSOTROS
              </Link>
              
              {tienePlan ? (
                <>
                  <Link to="/mi-plan" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-white font-black italic uppercase text-2xl tracking-tighter">
                    <Activity className="text-neon-green" size={28} /> MI PLAN
                  </Link>
                  <Link to="/planes" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-white font-black italic uppercase text-2xl tracking-tighter">
                    <Zap className="text-neon-green" size={28} /> CAMBIAR PLAN
                  </Link>
                </>
              ) : (
                <Link to="/planes" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-neon-green font-black italic uppercase text-2xl tracking-tighter">
                  <Zap size={28} /> CREA TU PLAN
                </Link>
              )}

              <Link to="/donaciones" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-yellow-400 font-black italic uppercase text-2xl tracking-tighter">
                <Coffee size={28} /> APOYAR PROYECTO
              </Link>

              <div className="h-px bg-white/10 my-4" />

              {session && (
                <div className="space-y-6">
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-neon-green/30">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-2 text-left">Atleta Activo</p>
                    <p className="text-lg font-black italic uppercase text-white text-left">{userData.apodo || 'GUERRERO_Z'}</p>
                    <p className="text-[10px] text-zinc-600 truncate text-left mt-1">{session.user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-4 text-red-500 font-black italic uppercase text-2xl tracking-tighter w-full text-left">
                    <LogOut size={28} /> CERRAR PROTOCOLO
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        <div className="bg-zinc-900/40 border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-10 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><User size={250}/></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
            <div onClick={() => editing && fileInputRef.current.click()} className={`w-40 h-40 bg-neon-green rounded-[2rem] flex items-center justify-center text-black rotate-3 shadow-[0_0_40px_rgba(57,255,20,0.4)] overflow-hidden relative ${editing ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}>
              {userData.avatar_url ? <img src={userData.avatar_url} alt="Perfil" className="w-full h-full object-cover -rotate-3 scale-110" /> : <User size={80} className="-rotate-3" />}
              {editing && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white backdrop-blur-[2px]"><Camera size={32} /></div>}
              {uploading && <div className="absolute inset-0 bg-neon-green flex items-center justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <div className="flex-1 space-y-4">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">{userData.apodo || "@GUERRERO_Z"}</h1>
              <p className="text-neon-green font-bold uppercase text-[10px] tracking-[0.4em] italic">FICHA TÉCNICA DEL ATLETA</p>
              <button onClick={() => editing ? handleUpdate() : setEditing(true)} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${editing ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-neon-green'}`}>
                {editing ? <><Save size={18}/> Guardar Protocolo</> : <><Edit3 size={18}/> Editar Ficha</>}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 bg-zinc-900/60 p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
            <Activity className="text-neon-green animate-pulse mb-4" size={30} />
            <span className={`text-8xl font-black italic ${getImcColor(imc())}`}>{imc()}</span>
            <p className="text-zinc-500 font-black uppercase text-[9px] tracking-widest mt-2 italic text-center">IMC CALCULADO</p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nombre Real', key: 'nombre', icon: <User size={16}/> },
              { label: 'Peso (kg)', key: 'peso', icon: <Scale size={16}/> },
              { label: 'Estatura (cm)', key: 'altura', icon: <Ruler size={16}/> },
              { label: 'Fecha Nacimiento', key: 'fechaCumple', icon: <Calendar size={16}/>, type: 'date' },
              { label: 'Género', key: 'genero', icon: <Heart size={16}/> }
            ].map((item) => (
              <div key={item.key} className="bg-white/5 border border-white/5 p-6 rounded-3xl text-left">
                <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[8px] tracking-[0.2em] mb-3 italic">{item.icon} {item.label}</div>
                {editing ? (
                  <input 
                    type={item.type || "text"} 
                    value={userData[item.key] || ''} 
                    onChange={(e) => setUserData({...userData, [item.key]: e.target.value})} 
                    className="bg-black/60 border border-neon-green/40 rounded-xl px-4 py-2 text-neon-green font-black italic text-lg w-full focus:outline-none" 
                  />
                ) : (
                  <div className="text-xl font-black italic uppercase text-white truncate">
                    {userData[item.key] || '---'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- FOOTER ACTUALIZADO --- */}
      <footer className="bg-black border-t border-neon-green/10 pt-20 pb-10 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-neon-green p-1.5 rounded-md"><Dumbbell className="text-black" size={20} /></div>
                <span className="text-xl font-black italic uppercase text-white tracking-tighter">SHONEN<span className="text-neon-green">WORKOUT</span></span>
              </div>
              <p className="text-gray-500 text-[11px] font-bold italic uppercase leading-relaxed">Plataforma de código abierto dedicada al alto rendimiento físico.</p>
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
              <ul className="text-gray-500 text-[10px] space-y-3 font-bold uppercase italic">
                <li>Aviso de Salud</li>
                <li>Transparencia TSU</li>
              </ul>
            </div>
            <div className="md:text-right text-left">
              <h4 className="text-white font-bold text-xs uppercase mb-6 tracking-[0.2em]">Soporte</h4>
              <p className="text-[10px] text-neon-green font-black uppercase">vegajulian1973@gmail.com</p>
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

export default Perfil;