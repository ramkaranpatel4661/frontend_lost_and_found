import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, FileText, Database, Server, Cpu, HardDrive } from 'lucide-react';
import { adminApi } from '../../utils/api';
import toast from 'react-hot-toast';

const SystemTab = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSystemStats();
      setSystemStats(response.data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast.error('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setLoading(true);
      await adminApi.clearCache();
      toast.success('Cache cleared successfully');
      fetchSystemStats(); // Refresh stats
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdminLogs({ limit: 50 });
      setLogs(response.data.logs || []);
      toast.success('Logs loaded successfully');
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await adminApi.exportData('system-report', 'csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-report-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('System report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
          <button
            onClick={fetchSystemStats}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {systemStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Server className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Uptime</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {formatUptime(systemStats.uptime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Cpu className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Node Version</p>
                  <p className="text-lg font-semibold text-green-900">
                    {systemStats.nodeVersion}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <HardDrive className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Platform</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {systemStats.platform}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Memory Usage</p>
                  <p className="text-lg font-semibold text-yellow-900">
                    {formatMemory(systemStats.memory.heapUsed)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading system information...</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="flex items-center p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Clear Cache</p>
              <p className="text-sm text-gray-500">Free up memory and refresh data</p>
            </div>
          </button>

          <button
            onClick={handleViewLogs}
            disabled={loading}
            className="flex items-center p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Activity className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Logs</p>
              <p className="text-sm text-gray-500">Check system activity logs</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Logs</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500">{log.level}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Usage Details */}
      {systemStats?.memory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Heap Used</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatMemory(systemStats.memory.heapUsed)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Heap Total</p>
              <p className="text-lg font-semibold text-green-600">
                {formatMemory(systemStats.memory.heapTotal)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">External</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatMemory(systemStats.memory.external)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemTab;