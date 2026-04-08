import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { User, UserCreate, UserUpdate } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  Users,
  Plus,
  Shield,
  Mail,
  Key,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';

// ─── Modal de Creación / Edición ────────────────────────────────────────────
interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'recepcionista',
    is_active: user?.is_active ?? true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (isEdit && user) {
        const updateData: UserUpdate = {
          email: form.email,
          role: form.role,
          is_active: form.is_active
        };
        await workshopService.users.update(user.id, updateData);
      } else {
        if (!form.password) throw new Error('La contraseña es requerida para nuevos usuarios');
        await workshopService.users.create(form as UserCreate);
      }
      onSaved();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      setError(typeof detail === 'string' ? detail : 'Error al procesar la solicitud.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {isEdit ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-green-500" />}
            {isEdit ? `Editar Usuario` : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Acceso</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="empleado@taller.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña Inicial</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rol</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as any })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="recepcionista">Recepcionista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Estado</label>
              <div className="flex items-center gap-2 h-[42px]">
                 <button
                   type="button"
                   onClick={() => setForm({ ...form, is_active: !form.is_active })}
                   className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                     form.is_active 
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' 
                      : 'bg-gray-50 text-gray-400 ring-1 ring-gray-200'
                   }`}
                 >
                   {form.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                   {form.is_active ? 'Activo' : 'Inactivo'}
                 </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal de Reset Password ───────────────────────────────────────────────
interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onSaved }) => {
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setError('Ingresa la nueva contraseña');
    setIsSaving(true);
    try {
      await workshopService.users.update(user.id, { password });
      onSaved();
    } catch (err: any) {
      setError('Error al resetear la contraseña.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Key size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Resetear Contraseña</h3>
            <p className="text-sm text-gray-500 mt-1">Usuario: <span className="font-bold text-gray-700">{user.email}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input
                required
                autoFocus
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingresa la nueva clave"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-500 font-bold text-sm bg-gray-50 rounded-xl hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Componente Principal ───────────────────────────────────────────────────
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await workshopService.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    setShowResetModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estas seguro de eliminar este usuario? Perderá el acceso permanentemente.')) return;
    try {
      await workshopService.users.delete(id);
      fetchUsers();
    } catch (err) {
      alert('Error al eliminar el usuario.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-14 w-14 bg-gray-100 rounded-2xl animate-pulse"></div>
           <div className="space-y-2">
             <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
             <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse"></div>
           </div>
        </div>
        <SkeletonTable rows={6} columns={4} />
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => { setShowModal(false); setSelectedUser(null); }}
          onSaved={handleSaved}
        />
      )}

      {showResetModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => { setShowResetModal(false); setSelectedUser(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Personal</h1>
              <p className="text-gray-500 text-sm mt-1">Control de accesos, roles y seguridad del sistema.</p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedUser(null); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Usuario
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Usuario</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Rol</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Estado</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {user.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.email}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        user.is_active 
                          ? 'text-emerald-600 bg-emerald-50 content-[""] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full' 
                          : 'text-gray-400 bg-gray-100 content-[""] before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-2.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                          title="Resetear Contraseña"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                          title="Editar Rol/Estado"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Eliminar Permanente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-start gap-4">
             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <ShieldAlert size={20} />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800">Control de Seguridad</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Solo los administradores pueden crear o modificar usuarios. Recuerde que el borrado de usuarios es irreversible y afectará los logs de auditoría históricos donde el usuario haya participado.
                </p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
