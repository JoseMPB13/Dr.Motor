import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Componente de Layout Principal.
 * 
 * - Estructura de shell con Sidebar (izquierda) y Contenido (derecha).
 * - Navbar superior fija.
 * - Utiliza <Outlet /> para renderizar las sub-rutas dinámicamente.
 */
const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar Fija a la izquierda */}
      <Sidebar />

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 px-8 border-t border-gray-100 bg-white text-center">
            <p className="text-xs text-gray-400">
              © 2026 Sistema Gestión Taller - Calidad y Transparencia
            </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
