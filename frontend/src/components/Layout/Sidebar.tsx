import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRole } = useAuth();

  const menuItems = [
    { name: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Clientes', icon: Users, path: '/clients' },
    { name: 'Vehículos', icon: Car, path: '/vehicles' },
    { name: 'Usuarios', icon: Shield, path: '/users', roles: ['admin'] },
    { name: 'Mecánicos', icon: Wrench, path: '/mechanics', roles: ['admin'] },
    { name: 'Servicios', icon: ClipboardList, path: '/services', roles: ['admin'] },
    { name: 'Órdenes', icon: ClipboardList, path: '/work-orders' },
    { name: 'Auditoría', icon: ShieldCheck, path: '/audit-logs', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        {!isCollapsed && (
          <span className="text-xl font-bold text-blue-600 tracking-tight italic">Dr. Motor</span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={22} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
