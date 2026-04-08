import React, { useEffect, useState } from 'react';
import workshopService from '../../services/workshopService';
import type { AuditLog, User } from '../../types';
import SkeletonTable from '../../components/UI/SkeletonTable';
import {
  ShieldCheck,
  History,
  User as UserIcon,
  Database,
  Calendar,
  AlertCircle,
  Activity
} from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [l, u] = await Promise.all([
          workshopService.auditLogs.getAll(0, 100), // Aumentamos el límite
          workshopService.users.getAll()
        ]);
        // Ordenar por fecha descendente
        setLogs(l.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setUsers(u);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('No se pudieron cargar los registros de auditoría.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserEmail = (id: number | null | undefined) => {
    if (!id) return 'Sistema';
    const user = users.find(u => u.id === id);
    return user ? user.email : `Usuario #${id}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      'INSERT': 'bg-green-50 text-green-700 ring-green-200',
      'UPDATE': 'bg-blue-50 text-blue-700 ring-blue-200',
      'DELETE': 'bg-red-50 text-red-700 ring-red-200'
    };
    const labels: Record<string, string> = {
      'INSERT': 'CREACIÓN',
      'UPDATE': 'MODIFICACIÓN',
      'DELETE': 'ELIMINACIÓN'
    };
    const color = colors[action.toUpperCase()] || 'bg-gray-50 text-gray-700 ring-gray-200';
    const label = labels[action.toUpperCase()] || action;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ring-1 ${color}`}>
        {label}
      </span>
    );
  };

  const renderDetails = (log: AuditLog) => {
    try {
      if (log.operation_type === 'UPDATE') {
        const oldData = log.old_value ? JSON.parse(log.old_value) : {};
        const newData = log.new_value ? JSON.parse(log.new_value) : {};
        const changes = Object.keys(newData).map(key => (
          <span key={key} className="block">
            <span className="font-bold text-gray-600">{key}:</span> {String(oldData[key] ?? 'null')} → <span className="text-blue-600">{String(newData[key])}</span>
          </span>
        ));
        return <div className="text-[10px] space-y-0.5">{changes.length > 0 ? changes : 'Sin cambios detectados'}</div>;
      }

      if (log.operation_type === 'INSERT') {
        return <span className="text-[10px] text-gray-500 italic">Registro inicial creado.</span>;
      }

      if (log.operation_type === 'DELETE') {
        return <span className="text-[10px] text-red-400 italic">Registro eliminado del sistema.</span>;
      }
    } catch (e) {
      return <span className="text-[10px] text-gray-400 italic font-mono truncate">{log.new_value || log.old_value || '-'}</span>;
    }
    return '-';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        <SkeletonTable rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Logs de Auditoría</h1>
            <p className="text-gray-500 text-sm mt-1">Historial completo de cambios en la base de datos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 shadow-sm">
          <Activity size={14} className="text-emerald-500" />
          MONITOREO EN TIEMPO REAL
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 shadow-sm">
          <AlertCircle size={24} />
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"><Calendar size={14} className="inline mr-2" /> Fecha y Hora</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"><UserIcon size={14} className="inline mr-2" /> Usuario</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center"><History size={14} className="inline mr-2" /> Operación</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100"><Database size={14} className="inline mr-2" /> Recurso (ID)</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Detalles del Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{formatDate(log.timestamp)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">{getUserEmail(log.changed_by_user_id)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getActionBadge(log.operation_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-800 uppercase">{log.table_name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: #{log.record_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderDetails(log)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      No hay registros de auditoría disponibles en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
