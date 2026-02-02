import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; 

const AdminCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    objetivo: '',
    min_imc: 0,
    max_imc: 0,
    image_url: ''
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('min_imc', { ascending: true });
    if (!error) setCharacters(data);
  };

  const handleUploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('characters')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('characters')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      alert("¡Imagen cargada!");
    } catch (error) {
      alert("Error Storage: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (char) => {
    setEditingId(char.id);
    setFormData({
      nombre: char.nombre || '',
      objetivo: char.objetivo || '',
      min_imc: char.min_imc || 0,
      max_imc: char.max_imc || 0,
      image_url: char.image_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.image_url) {
      return alert("El nombre y la imagen son obligatorios");
    }

    // Solo enviamos los campos que existen en tu tabla
    const dataToSave = {
      nombre: formData.nombre,
      objetivo: formData.objetivo,
      min_imc: formData.min_imc,
      max_imc: formData.max_imc,
      image_url: formData.image_url
    };

    if (editingId) {
      const { error } = await supabase
        .from('characters')
        .update(dataToSave)
        .eq('id', editingId);

      if (!error) {
        alert("¡Guerrero actualizado!");
        resetForm();
        fetchCharacters();
      }
    } else {
      const { error } = await supabase.from('characters').insert([dataToSave]);
      if (!error) {
        alert("¡Guerrero creado!");
        resetForm();
        fetchCharacters();
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', objetivo: '', min_imc: 0, max_imc: 0, image_url: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este personaje?")) {
      const { error } = await supabase.from('characters').delete().eq('id', id);
      if (!error) fetchCharacters();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black italic uppercase text-neon-green mb-8 border-b-2 border-neon-green pb-2 tracking-tighter">
            ADMIN: GESTIÓN DE PERSONAJES
        </h1>

        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sector Imagen */}
            <div className="flex flex-col items-center border-2 border-dashed border-zinc-800 p-4 rounded-2xl bg-black/30">
              <div className="w-40 h-40 bg-zinc-800 rounded-xl mb-4 overflow-hidden border border-zinc-700">
                {formData.image_url && <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />}
              </div>
              <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase italic hover:bg-neon-green transition-all shadow-md">
                {uploading ? 'Cargando...' : 'Cambiar Imagen'}
                <input type="file" accept="image/*" onChange={handleUploadImage} hidden disabled={uploading} />
              </label>
            </div>

            {/* Sector Datos (Sin descripción) */}
            <div className="md:col-span-2 grid grid-cols-1 gap-5">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Nombre</label>
                <input className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-neon-green outline-none" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Objetivo</label>
                <input className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-neon-green outline-none" value={formData.objetivo} onChange={(e) => setFormData({...formData, objetivo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Min IMC</label>
                    <input type="number" step="0.1" className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-neon-green outline-none" value={formData.min_imc} onChange={(e) => setFormData({...formData, min_imc: parseFloat(e.target.value)})} />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Max IMC</label>
                    <input type="number" step="0.1" className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-neon-green outline-none" value={formData.max_imc} onChange={(e) => setFormData({...formData, max_imc: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button onClick={handleSave} className="bg-neon-green text-black px-12 py-4 font-black uppercase italic hover:bg-white transition-all transform active:scale-95 shadow-lg">
              {editingId ? "Guardar Cambios" : "Añadir Guerrero"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="bg-zinc-800 text-white px-8 py-4 font-black uppercase italic">
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Listado */}
        <div className="space-y-4">
          {characters.map(char => (
            <div key={char.id} className="bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-6 border border-zinc-800 hover:border-neon-green/30 transition-all">
              <img src={char.image_url} className="w-16 h-16 object-cover rounded-lg" alt="" />
              <div className="flex-grow">
                <h4 className="font-black italic uppercase text-lg">{char.nombre}</h4>
                <p className="text-xs text-neon-green uppercase font-bold">{char.min_imc} - {char.max_imc} IMC</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleEdit(char)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-colors">Editar</button>
                <button onClick={() => handleDelete(char.id)} className="text-[10px] font-black uppercase text-red-600 hover:text-red-400 transition-colors">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCharacters;