import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Package, 
  CheckCircle, 
  Settings,
  RefreshCw,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import LoadingSpinner from '../components/LoadingSpinner';

// Import smaller components
import DashboardStats from '../components/admin/DashboardStats';
import RecentActivity from '../components/admin/RecentActivity';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import UsersTab from '../components/admin/UsersTab';
import ItemsTab from '../components/admin/ItemsTab';
import ClaimsTab from '../components/admin/ClaimsTab';
import SystemTab from '../components/admin/SystemTab';
import ClaimDetailsModal from '../components/admin/ClaimDetailsModal';
import UserMessagesTab from '../components/admin/UserMessagesTab';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    // State
    stats,
    analytics,
    users,
    claims,
    items,
    loading,
    searchTerm,
    setSearchTerm,
    selectedClaim,
    setSelectedClaim,
    filters,
    
    // Functions
    fetchDashboardData,
    fetchUsers,
    fetchClaims,
    fetchItems,
    handleDeleteUser,
    handlePromoteUser,
    handleBanUser,
    handleUnbanUser,
    handleDeleteItem,
    handleApproveClaim,
    handleRejectClaim,
    viewClaimDetails,
    exportData,
    handleFilterChange,
    handleSearch,
    handleAnalyticsPeriodChange
  } = useAdmin();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'claims', label: 'Claims', icon: CheckCircle },
    { id: 'messages', label: 'User Messages', icon: Mail },
    { id: 'system', label: 'System', icon: Settings }
  ];

  // Handler functions for child components
  const handleUserFilterChange = (key, value) => {
    handleFilterChange('users', key, value);
    fetchUsers(1, searchTerm, key === 'role' ? value : filters.users.role, key === 'status' ? value : filters.users.status);
  };

  const handleItemFilterChange = (key, value) => {
    handleFilterChange('items', key, value);
    fetchItems(1, key === 'type' ? value : filters.items.type, key === 'status' ? value : filters.items.status);
  };

  const handleClaimFilterChange = (key, value) => {
    handleFilterChange('claims', key, value);
    fetchClaims(1, value);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Manage users, items, and claims with advanced analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <DashboardStats stats={stats} />
            {stats.recentActivity && (
              <RecentActivity recentActivity={stats.recentActivity} />
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            analytics={analytics} 
            onPeriodChange={handleAnalyticsPeriodChange}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters.users}
            onSearch={handleSearch}
            onFilterChange={handleUserFilterChange}
            onExport={exportData}
            onBan={handleBanUser}
            onUnban={handleUnbanUser}
            onDelete={handleDeleteUser}
          />
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <ItemsTab
            items={items}
            filters={filters.items}
            onFilterChange={handleItemFilterChange}
            onExport={exportData}
            onDelete={handleDeleteItem}
          />
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <ClaimsTab
            claims={claims}
            filters={filters.claims}
            onFilterChange={handleClaimFilterChange}
            onExport={exportData}
            onViewDetails={viewClaimDetails}
            onApprove={handleApproveClaim}
            onReject={handleRejectClaim}
          />
        )}

        {/* User Messages Tab */}
        {activeTab === 'messages' && (
          <UserMessagesTab />
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <SystemTab />
        )}

        {/* Claim Details Modal */}
        <ClaimDetailsModal
          selectedClaim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onApprove={handleApproveClaim}
          onReject={handleRejectClaim}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;