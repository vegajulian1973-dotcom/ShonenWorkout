import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 
import { Mail, Lock, Eye, EyeOff, ArrowRight, Dumbbell, ShieldCheck, Code2, User, Calendar, Ruler, Weight, Loader2, Image as ImageIcon, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // Estado para la imagen
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    nickname: '',
    birthDate: '',
    height: '',
    weight: '',
    gender: '' // Nuevo campo: Género
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/'); 
      } else {
        // 1. Registro en Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          let imageUrl = null;

          // 2. Subir imagen a Storage (si existe)
          if (profileImage) {
            const fileExt = profileImage.name.split('.').pop();
            const fileName = `${authData.user.id}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('avatars') // Asegúrate de tener un bucket llamado 'avatars' en Supabase
              .upload(fileName, profileImage);
            
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
              imageUrl = publicUrlData.publicUrl;
            }
          }

          const heightMeters = formData.height / 100;
          const calculatedIMC = (formData.weight / (heightMeters * heightMeters)).toFixed(2);

          // 3. Insertar en tabla Profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                nombre: formData.fullName,
                apodo: formData.nickname,
                fechaCumple: formData.birthDate,
                altura: parseFloat(formData.height),
                peso: parseFloat(formData.weight),
                imc: parseFloat(calculatedIMC),
                genero: formData.gender, // Guardamos género
                avatar_url: imageUrl   // Guardamos URL de la foto
              },
            ]);

          if (profileError) throw profileError;
          
          alert(`¡REGISTRO EXITOSO, ATLETA!`);
          navigate('/');
        }
      }
    } catch (error) {
      alert("ERROR EN EL PROTOCOLO: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center p-0 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex w-full max-w-6xl min-h-[750px] bg-zinc-900/20 backdrop-blur-sm border border-white/5 md:rounded-[3rem] overflow-hidden shadow-2xl mx-4 my-8 transition-all duration-500 relative z-10">
          
          <div className="hidden md:flex md:w-5/12 relative group">
            <img 
              src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" 
              alt="Shonen Performance" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute bottom-12 left-12 z-20">
              <span className="bg-neon-green text-black px-3 py-1 text-[10px] font-black uppercase italic mb-4 inline-block shadow-[0_0_15px_rgba(57,255,20,0.4)]">
                Protocolo Shonen Activo
              </span>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                FORJA TU <br /> 
                <span className="text-neon-green">LEYENDA</span>
              </h1>
            </div>
          </div>

          <div className="w-full md:w-7/12 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-y-auto max-h-[90vh]">
            <div className="w-full max-w-md z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                  {isLogin ? 'Acceso al Dojo' : 'Nuevo Registro'}
                </h2>
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.4em]">
                  {isLogin ? 'Autenticación de Atleta' : 'Ficha Técnica de Aspirante'}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* FOTO DE PERFIL */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Foto de Perfil</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input name="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-[10px] font-bold text-zinc-400 file:hidden cursor-pointer" />
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Nombre Completo *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input name="fullName" type="text" required onChange={handleChange} placeholder="JUAN PÉREZ" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white placeholder:text-zinc-700" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Apodo</label>
                      <input name="nickname" type="text" onChange={handleChange} placeholder="SHONEN_01" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white placeholder:text-zinc-700" />
                    </div>

                    {/* GÉNERO */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Género *</label>
                      <div className="relative">
                        <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <select name="gender" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white appearance-none">
                          <option value="" className="bg-zinc-900 italic">Elegir...</option>
                          <option value="Masculino" className="bg-zinc-900">Masculino</option>
                          <option value="Femenino" className="bg-zinc-900">Femenino</option>
                          <option value="Otro" className="bg-zinc-900">Otro / Guerrero Z</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Nacimiento *</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input name="birthDate" type="date" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Altura (cm) *</label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input name="height" type="number" required onChange={handleChange} placeholder="175" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white" />
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Peso (kg) *</label>
                      <div className="relative">
                        <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input name="weight" type="number" required onChange={handleChange} placeholder="70" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* EMAIL Y CONTRASEÑA SE MANTIENEN IGUAL */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-green transition-colors" size={18} />
                      <input name="email" type="email" required onChange={handleChange} placeholder="CORREO@EJEMPLO.COM" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-4 outline-none focus:border-neon-green/50 transition-all text-xs font-bold text-white placeholder:text-zinc-700" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-500 ml-2 tracking-widest">Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-green transition-colors" size={18} />
                      <input name="password" type={showPassword ? "text" : "password"} required onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-12 outline-none focus:border-neon-green/50 transition-all text-xs tracking-[0.3em] text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-neon-green text-black font-black uppercase italic py-4 rounded-xl hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 tracking-widest text-sm mt-4 disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Establecer Conexión' : 'Generar Registro'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                  {isLogin ? "¿Aún no eres parte?" : "¿Ya tienes credenciales?"}
                </p>
                <button onClick={() => setIsLogin(!isLogin)} className="text-neon-green font-black uppercase italic text-xs hover:underline underline-offset-4 transition-all">
                  {isLogin ? 'REGÍSTRATE AQUÍ' : 'INICIA SESIÓN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black border-t border-white/5 pt-16 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-neon-green p-1.5 rounded-md">
              <Dumbbell className="text-black" size={20} />
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter text-white">
              SHONEN<span className="text-neon-green">WORKOUT</span>
            </span>
          </div>
          <p className="text-gray-800 text-[9px] font-black tracking-[5px] uppercase">
            © 2026 SHONEN WORKOUT GLOBAL. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;