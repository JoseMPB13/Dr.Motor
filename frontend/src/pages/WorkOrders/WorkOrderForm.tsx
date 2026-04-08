import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import workshopService from '../../services/workshopService';
import { useAuth } from '../../hooks/useAuth';
import type { 
  Client, 
  Vehicle, 
  Mechanic, 
  Service, 
  WorkOrderCreate, 
  WorkOrderServiceCreate,
  WorkOrderStatus
} from '../../types';
import { 
  Lock as LockIcon,
  Info,
  Loader2,
  Trash2,
  Save,
  ArrowLeft,
  User,
  Car,
  Wrench,
  AlertCircle
} from 'lucide-react';

interface SelectedService extends WorkOrderServiceCreate {
  name: string;
  price: number;
}

const WorkOrderForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { userId, userRole } = useAuth(); // Agregado userRole

  // Estado de Datos Maestros
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [catalogServices, setCatalogServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de Bloqueo
  const [isLocked, setIsLocked] = useState(false);
  const [manualUnlock, setManualUnlock] = useState(false);

  // Estado del Formulario
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | ''>('');
  const [issueDescription, setIssueDescription] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus>('Pendiente');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      setIsLoading(true);
      try {
        const [c, v, m, s] = await Promise.all([
          workshopService.clients.getAll(),
          workshopService.vehicles.getAll(),
          workshopService.mechanics.getAll(),
          workshopService.services.getAll()
        ]);
        setClients(c);
        setVehicles(v);
        setMechanics(m);
        setCatalogServices(s);

        if (isEdit) {
          const order = await workshopService.workOrders.getById(Number(id));
          setSelectedClientId(order.client_id);
          setSelectedVehicleId(order.vehicle_id);
          setSelectedMechanicId(order.mechanic_id || '');
          setIssueDescription(order.issue_description);
          setStatus(order.status);
          
          // Verificar bloqueo por factura pagada
          const invoices = await workshopService.invoices.getAll();
          const invoice = invoices.find(inv => inv.work_order_id === order.id);
          if (invoice && invoice.payment_status === 'Pagada') {
            setIsLocked(true);
          }

          const mappedServices = order.services_performed.map(sp => {
            const catSrv = s.find(cs => cs.id === sp.service_id);
            return {
              service_id: sp.service_id,
              quantity: sp.quantity,
              notes: sp.notes || '',
              name: catSrv ? catSrv.name : 'Servicio Desconocido',
              price: sp.price_at_time
            };
          });
          setSelectedServices(mappedServices);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMasterData();
  }, [id, isEdit]);

  // Filtrado de vehículos por cliente
  const filteredVehicles = useMemo(() => {
    if (!selectedClientId) return [];
    return vehicles.filter(v => v.client_id === Number(selectedClientId));
  }, [selectedClientId, vehicles]);

  // Cálculo de totales en tiempo real
  const totalAmount = useMemo(() => {
    return selectedServices.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 1)), 0);
  }, [selectedServices]);

  // Determinar si el formulario es editable
  const canEdit = !isLocked || manualUnlock;

  const handleAddService = (serviceId: number) => {
    if (!canEdit) return;
    const service = catalogServices.find(s => s.id === serviceId);
    if (!service) return;

    if (selectedServices.some(s => s.service_id === serviceId)) {
        alert('Este servicio ya ha sido añadido.');
        return;
    }

    setSelectedServices([...selectedServices, {
      service_id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
      notes: ''
    }]);
  };

  const handleRemoveService = (index: number) => {
    if (!canEdit) return;
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleUpdateServiceQuantity = (index: number, quantity: number) => {
    if (!canEdit) return;
    const newServices = [...selectedServices];
    newServices[index].quantity = Math.max(1, quantity);
    setSelectedServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    if (!selectedClientId || !selectedVehicleId || selectedServices.length === 0) {
      alert('Por favor, completa todos los campos requeridos y añade al menos un servicio.');
      return;
    }

    setIsSaving(true);
    try {
      let orderId = Number(id);

      if (isEdit) {
        const updateData: any = {
          mechanic_id: selectedMechanicId ? Number(selectedMechanicId) : null,
          issue_description: issueDescription,
          status: status
        };
        await workshopService.workOrders.update(orderId, updateData);
      } else {
        const createData: WorkOrderCreate = {
          client_id: Number(selectedClientId),
          vehicle_id: Number(selectedVehicleId),
          mechanic_id: selectedMechanicId ? Number(selectedMechanicId) : null,
          issue_description: issueDescription,
          status: 'Pendiente',
          created_by_user_id: userId || 1
        };
        const newOrder = await workshopService.workOrders.create(createData);
        orderId = newOrder.id;

        // Añadir servicios solo en creación inicial
        for (const srv of selectedServices) {
          await workshopService.workOrders.addService(orderId, {
            service_id: srv.service_id,
            quantity: srv.quantity || 1,
            notes: srv.notes || ''
          });
        }
      }

      navigate('/work-orders');
    } catch (error) {
      console.error('Error saving work order:', error);
      alert('Error al guardar la orden de trabajo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Preparando formulario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/work-orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium border border-gray-100 px-4 py-2 rounded-xl bg-white shadow-sm"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isEdit ? `Orden de Trabajo #${id}` : 'Nueva Orden'}
          </h1>
          {isLocked && (
            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-red-100 inline-flex items-center gap-1 mt-1">
              <LockIcon size={10} /> BLOQUEADA POR PAGO
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Información Básica */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner de Bloqueo */}
          {isLocked && !manualUnlock && (
            <div className="p-6 bg-gray-900 text-white rounded-3xl shadow-xl flex items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-2xl">
                    <LockIcon size={24} />
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-widest text-sm text-red-400">Orden Protegida</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
                      Esta orden ha sido facturada y pagada. No se permiten modificaciones para preservar la integridad contable.
                    </p>
                  </div>
               </div>
               {userRole === 'admin' && (
                 <button 
                   type="button"
                   onClick={() => setManualUnlock(true)}
                   className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20 whitespace-nowrap"
                 >
                   Forzar Edición (Admin)
                 </button>
               )}
            </div>
          )}

          <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 transition-all ${!canEdit ? 'opacity-70 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Info size={20} />
              <h2 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Datos de la Orden</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                   Cliente
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    disabled={isEdit || !canEdit}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-60 text-sm font-medium appearance-none"
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(Number(e.target.value));
                      setSelectedVehicleId(''); // Reset vehicle if client changes
                    }}
                  >
                    <option value="">Selecciona un cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                   Vehículo
                </label>
                <div className="relative">
                  <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    disabled={!selectedClientId || isEdit || !canEdit}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-60 text-sm font-medium appearance-none"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                  >
                    <option value="">Selecciona un vehículo...</option>
                    {filteredVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} - [{v.license_plate}]</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                   Mecánico Asignado
                </label>
                <div className="relative">
                  <Wrench size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    disabled={!canEdit}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium appearance-none"
                    value={selectedMechanicId}
                    onChange={(e) => setSelectedMechanicId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Opcional: Asignar más tarde</option>
                    {mechanics.map(m => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción del Fallo</label>
                <textarea
                  required
                  rows={4}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-sm"
                  placeholder="Describe detalladamente lo que el cliente reporta..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              {isEdit && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Estado de la Orden</label>
                  <select
                    disabled={!canEdit}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                  >
                    <option value="Pendiente">Pendiente (Recepción)</option>
                    <option value="En Progreso">En Progreso (Taller)</option>
                    <option value="Completada">Completada (Finalizado)</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Servicios Dinámicos */}
          <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 transition-all ${!canEdit ? 'opacity-70 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Wrench size={20} />
                <h2 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Servicios Realizados</h2>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <select 
                    className="px-3 py-2 bg-blue-50 text-blue-700 border-none rounded-xl text-xs font-black uppercase tracking-tighter outline-none cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddService(Number(e.target.value));
                        e.target.value = ''; // Reset select
                      }
                    }}
                  >
                    <option value="">+ Añadir del catálogo</option>
                    {catalogServices.map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.name} (Bs. {cs.price})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedServices.length > 0 ? (
              <div className="space-y-3">
                {selectedServices.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:border-blue-200 hover:shadow-md">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{srv.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Bs. {srv.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-9 shadow-sm">
                         <button 
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleUpdateServiceQuantity(idx, (srv.quantity || 1) - 1)}
                            className="px-3 hover:bg-gray-50 text-gray-500 border-r border-gray-200 font-bold transition-colors">-</button>
                         <input 
                            type="number"
                            disabled={!canEdit}
                            className="w-10 text-center text-xs font-black bg-transparent outline-none"
                            value={srv.quantity || 1}
                            onChange={(e) => handleUpdateServiceQuantity(idx, Number(e.target.value))}
                         />
                         <button 
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleUpdateServiceQuantity(idx, (srv.quantity || 1) + 1)}
                            className="px-3 hover:bg-gray-50 text-gray-500 border-l border-gray-200 font-bold transition-colors">+</button>
                      </div>
                      {canEdit && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="p-2 text-red-300 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-100 mb-3" />
                    <p className="text-gray-400 font-medium text-sm italic">Define el presupuesto de servicios aquí.</p>
                </div>
            )}
          </div>
        </div>

        {/* Columna Lateral: Resumen y Acciones */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 space-y-8 sticky top-24">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-[11px] border-b border-gray-50 pb-4">Resumen de Liquidación</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Servicios</span>
                <span className="text-gray-900">Bs. {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>IVA (Local)</span>
                <span>0.00</span>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Final</span>
                   <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">BOB</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">Bs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || !canEdit}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 disabled:opacity-50 active:scale-95 group"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                )}
                {isEdit ? 'Actualizar Orden' : 'Confirmar y Guardar'}
              </button>
            </div>
            
            {canEdit ? (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0" />
                <p className="text-[10px] text-blue-700 leading-relaxed font-bold uppercase tracking-tight">
                  Al completar el trabajo, use el botón "Finalizar" en el listado para generar el cobro.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
                <LockIcon size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-[10px] text-red-700 leading-relaxed font-bold uppercase tracking-tight">
                  Esta orden no admite más cambios financieros ni técnicos.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderForm;
