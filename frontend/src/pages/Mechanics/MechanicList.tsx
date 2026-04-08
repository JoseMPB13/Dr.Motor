import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { Mechanic, MechanicCreate } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  Wrench,
  Search,
  Plus,
  Phone,
  Award,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';

// ─── Modal ───────────────────────────────────────────────────────────────────
interface MechanicModalProps {
  mechanic?: Mechanic | null;
  onClose: () => void;
  onSaved: () => void;
}

const MechanicModal: React.FC<MechanicModalProps> = ({ mechanic, onClose, onSaved }) => {
  const isEdit = !!mechanic;
  const [form, setForm] = useState<MechanicCreate>({
    first_name: mechanic?.first_name ?? '',
    last_name: mechanic?.last_name ?? '',
    specialty: mechanic?.specialty ?? '',
    phone_number: mechanic?.phone_number ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (isEdit && mechanic) {
        await workshopService.mechanics.update(mechanic.id, form);
      } else {
        await workshopService.mechanics.create(form);
      }
      onSaved();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al guardar el mecánico.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? `Editar Mecánico #${mechanic!.id}` : 'Nuevo Mecánico'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre *</label>
              <input
                required
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Carlos"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Apellido *</label>
              <input
                required
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="García"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Especialidad</label>
            <input
              name="specialty"
              value={form.specialty ?? ''}
              onChange={handleChange}
              placeholder="Frenos, Motor, Electricidad..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</label>
            <input
              name="phone_number"
              value={form.phone_number ?? ''}
              onChange={handleChange}
              placeholder="0424-0000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
              {isEdit ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Lista Principal ──────────────────────────────────────────────────────────
const MechanicList: React.FC = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const fetchMechanics = async () => {
    setIsLoading(true);
    try {
      const data = await workshopService.mechanics.getAll();
      setMechanics(data);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMechanics(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    setEditingMechanic(null);
    fetchMechanics();
  };

  const handleEdit = (mechanic: Mechanic) => {
    setEditingMechanic(mechanic);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este mecánico del sistema?')) return;
    try {
      await workshopService.mechanics.delete(id);
      fetchMechanics();
    } catch {
      alert('Error al eliminar el mecánico.');
    }
  };

  const filteredMechanics = mechanics.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (m.specialty && m.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse"></div>
        <SkeletonTable rows={5} columns={4} />
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <MechanicModal
          mechanic={editingMechanic}
          onClose={() => { setShowModal(false); setEditingMechanic(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Wrench className="text-blue-600" /> Plantilla de Mecánicos
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gestión del equipo técnico especializado.</p>
          </div>
          <button
            onClick={() => { setEditingMechanic(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus size={20} />
            Nuevo Mecánico
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Mecánico</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Especialidad</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMechanics.length > 0 ? filteredMechanics.map((mechanic) => (
                  <tr key={mechanic.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{mechanic.first_name} {mechanic.last_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: #{mechanic.id}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="flex items-center justify-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-black ring-1 ring-purple-100 uppercase tracking-widest">
                        <Award size={12} /> {mechanic.specialty || 'Generalista'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Phone size={14} className="text-gray-400" /> {mechanic.phone_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(mechanic)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mechanic.id)}
                          className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No hay mecánicos registrados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MechanicList;
