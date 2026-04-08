import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  isLoading = false
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
          <div className="w-16 h-4 bg-gray-100 rounded"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border transition-colors group-hover:scale-110 duration-200 ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
