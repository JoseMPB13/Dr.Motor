import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { userEmail, userRole, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-end sticky top-0 z-40">
      <div className="flex items-center gap-6">

        <div className="h-8 w-px bg-gray-100"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">{userEmail?.split('@')[0]}</p>
            <p className="text-xs font-medium text-gray-500 mt-1 capitalize">{userRole}</p>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ring-4 ring-blue-50">
            <User className="h-5 w-5" />
          </div>

          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors group"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
