import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SobreNosotros from './sobreNosotros' 
import Donaciones from './donaciones'
import Login from './login'
import Perfil from './perfil'
import CreaTuPlan from './creaTuPlan'
import MiPlan from './miPlan'
import './index.css'
import AdminCharacters from './adminCharacters'
const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-3xl font-black italic uppercase text-neon-green">
        {title} - Próximamente
      </h1>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/donaciones" element={<Donaciones />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mi-plan" element={<MiPlan/>}/>
        <Route path="/admin-db-shonen" element={<AdminCharacters />} />
        {/* Usamos la ruta /planes como acordamos */}
        <Route path="/planes" element={<CreaTuPlan/>}/>
        
        <Route path="/perfil" element={<Perfil />} />
        
        {/* Rutas con el componente Placeholder */}
        <Route path="/mi-rutina" element={<Placeholder title="Tu Plan" />} />
        <Route path="/mi-dieta" element={<Placeholder title="Tu Alimentación" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)