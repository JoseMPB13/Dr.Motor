import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { Client, ClientCreate } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';

// ─── Modal de Creación / Edición ────────────────────────────────────────────
interface ClientModalProps {
  client?: Client | null;
  onClose: () => void;
  onSaved: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSaved }) => {
  const isEdit = !!client;
  const [form, setForm] = useState<ClientCreate>({
    first_name: client?.first_name ?? '',
    last_name: client?.last_name ?? '',
    phone_number: client?.phone_number ?? '',
    email: client?.email ?? '',
    address: client?.address ?? '',
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
      if (isEdit && client) {
        await workshopService.clients.update(client.id, form);
      } else {
        await workshopService.clients.create(form);
      }
      onSaved();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al guardar el cliente. Verifica los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? `Editar Cliente #${client!.id}` : 'Nuevo Cliente'}
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
                placeholder="Juan"
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
                placeholder="Pérez"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono *</label>
            <input
              required
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="0412-0000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
            <input
              name="email"
              type="email"
              value={form.email ?? ''}
              onChange={handleChange}
              placeholder="juan@email.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Dirección</label>
            <input
              name="address"
              value={form.address ?? ''}
              onChange={handleChange}
              placeholder="Av. Principal, Casa 10"
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
              {isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Lista Principal ─────────────────────────────────────────────────────────
const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await workshopService.clients.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    setEditingClient(null);
    fetchClients();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
    try {
      await workshopService.clients.delete(id);
      fetchClients();
    } catch (err) {
      alert('Error al eliminar el cliente.');
    }
  };

  const filteredClients = clients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    c.phone_number.includes(search)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse"></div>
        <SkeletonTable rows={8} columns={4} />
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => { setShowModal(false); setEditingClient(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="text-blue-600" /> Gestión de Clientes
            </h1>
            <p className="text-gray-500 text-sm mt-1">Directorio completo de clientes del taller.</p>
          </div>
          <button
            onClick={() => { setEditingClient(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Ubicación</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.length > 0 ? filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{client.first_name} {client.last_name}</p>
                      <p className="text-xs text-gray-400">ID: #{client.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={12} className="text-gray-400" /> {client.phone_number}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400" /> {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={12} className="text-gray-400" /> {client.address || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
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
                      <p className="font-medium">No se encontraron clientes.</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-3 text-sm text-blue-600 hover:underline"
                      >
                        + Crear el primero
                      </button>
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

export default ClientList;
