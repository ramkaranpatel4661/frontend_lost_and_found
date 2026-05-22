import React from 'react';
import { Users, Package, CheckCircle, Clock } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500">{stats.bannedUsers} banned</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <Package className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            <p className="text-xs text-gray-500">{stats.activeItems} active</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Claims</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalClaims}</p>
            <p className="text-xs text-gray-500">{stats.successfulReturns} successful</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <Clock className="w-8 h-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Claims</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingClaims}</p>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;