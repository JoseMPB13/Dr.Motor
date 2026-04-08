import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { Vehicle, VehicleCreate, Client } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  Car,
  Search,
  Plus,
  User,
  Calendar,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';

// ─── Modal ───────────────────────────────────────────────────────────────────
interface VehicleModalProps {
  vehicle?: Vehicle | null;
  clients: Client[];
  onClose: () => void;
  onSaved: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, clients, onClose, onSaved }) => {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<VehicleCreate>({
    client_id: vehicle?.client_id ?? (clients[0]?.id ?? 0),
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    license_plate: vehicle?.license_plate ?? '',
    vin: vehicle?.vin ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'client_id' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (isEdit && vehicle) {
        await workshopService.vehicles.update(vehicle.id, form);
      } else {
        await workshopService.vehicles.create(form);
      }
      onSaved();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al guardar el vehículo. Verifica los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? `Editar Vehículo #${vehicle!.id}` : 'Registrar Vehículo'}
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
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Propietario *</label>
            <select
              required
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">Selecciona un cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Marca *</label>
              <input
                required
                name="make"
                value={form.make}
                onChange={handleChange}
                placeholder="Toyota"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Modelo *</label>
              <input
                required
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Corolla"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Año *</label>
              <input
                required
                name="year"
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa *</label>
              <input
                required
                name="license_plate"
                value={form.license_plate}
                onChange={handleChange}
                placeholder="ABC-123"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">VIN (Opcional)</label>
            <input
              name="vin"
              value={form.vin ?? ''}
              onChange={handleChange}
              placeholder="17 caracteres alfanuméricos"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none font-mono"
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
              {isEdit ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Lista Principal ──────────────────────────────────────────────────────────
const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [v, c] = await Promise.all([
        workshopService.vehicles.getAll(),
        workshopService.clients.getAll()
      ]);
      setVehicles(v);
      setClients(c);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getClientName = (id: number) => {
    const client = clients.find(c => c.id === id);
    return client ? `${client.first_name} ${client.last_name}` : 'Desconocido';
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingVehicle(null);
    fetchData();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return;
    try {
      await workshopService.vehicles.delete(id);
      fetchData();
    } catch {
      alert('Error al eliminar el vehículo.');
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.license_plate.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
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
        <VehicleModal
          vehicle={editingVehicle}
          clients={clients}
          onClose={() => { setShowModal(false); setEditingVehicle(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Car className="text-blue-600" /> Gestión de Vehículos
            </h1>
            <p className="text-gray-500 text-sm mt-1">Directorio de vehículos registrados.</p>
          </div>
          <button
            onClick={() => { setEditingVehicle(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus size={20} />
            Nuevo Vehículo
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por placa, marca o modelo..."
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Vehículo</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Placa</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Propietario</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{vehicle.make} {vehicle.model}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                        <Calendar size={12} /> Año: {vehicle.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded font-black text-xs border border-gray-200 uppercase tracking-widest">
                        {vehicle.license_plate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <User size={14} className="text-gray-400" /> {getClientName(vehicle.client_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
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
                      <p className="font-medium">No se encontraron vehículos.</p>
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

export default VehicleList;
