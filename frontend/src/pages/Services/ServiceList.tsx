import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { Service, ServiceCreate } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  Search,
  Plus,
  Clock,
  Tag,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ServiceModalProps {
  service?: Service | null;
  onClose: () => void;
  onSaved: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSaved }) => {
  const isEdit = !!service;
  const [form, setForm] = useState<ServiceCreate>({
    name: service?.name ?? '',
    description: service?.description ?? '',
    price: service?.price ?? 0,
    estimated_duration_minutes: service?.estimated_duration_minutes ?? undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimated_duration_minutes'
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (isEdit && service) {
        await workshopService.services.update(service.id, form);
      } else {
        await workshopService.services.create(form);
      }
      onSaved();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al guardar el servicio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre del Servicio *</label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Cambio de aceite y filtro"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</label>
            <textarea
              name="description"
              value={form.description ?? ''}
              onChange={handleChange}
              rows={2}
              placeholder="Descripción opcional del servicio..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio Base (Bs.) *</label>
              <input
                required
                name="price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Duración (min)</label>
              <input
                name="estimated_duration_minutes"
                type="number"
                min={0}
                value={form.estimated_duration_minutes ?? ''}
                onChange={handleChange}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
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
              {isEdit ? 'Actualizar' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Lista Principal ──────────────────────────────────────────────────────────
const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await workshopService.services.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    setEditingService(null);
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este servicio del catálogo?')) return;
    try {
      await workshopService.services.delete(id);
      fetchServices();
    } catch {
      alert('Error al eliminar el servicio.');
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse"></div>
        <SkeletonTable rows={10} columns={4} />
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => { setShowModal(false); setEditingService(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Tag className="text-blue-600" /> Catálogo de Servicios
            </h1>
            <p className="text-gray-500 text-sm mt-1">Definición de servicios y precios base.</p>
          </div>
          <button
            onClick={() => { setEditingService(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Servicio</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Precio Base</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Duración Est.</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredServices.length > 0 ? filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{service.description || 'Sin descripción'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-blue-600">Bs. {service.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Clock size={12} /> {service.estimated_duration_minutes ?? 'N/A'} min
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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
                      <p className="font-medium">No hay servicios en el catálogo.</p>
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

export default ServiceList;
