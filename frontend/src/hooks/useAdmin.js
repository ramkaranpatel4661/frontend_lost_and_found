import { useState, useEffect } from 'react';
import { adminApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [filters, setFilters] = useState({
    users: { role: '', status: '' },
    claims: { status: '' },
    items: { type: '', status: '' }
  });
  const [pagination, setPagination] = useState({
    users: { page: 1, total: 0 },
    claims: { page: 1, total: 0 },
    items: { page: 1, total: 0 }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics('30d')
      ]);

      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data);
      
      // Fetch initial data for each tab
      await Promise.all([
        fetchUsers(),
        fetchClaims(),
        fetchItems()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
    try {
      const params = { page, limit: 20, search, role, status };
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users);
      setPagination(prev => ({ ...prev, users: response.data.pagination }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchClaims = async (page = 1, status = '') => {
    try {
      const params = { page, limit: 20, status };
      const response = await adminApi.getClaims(params);
      setClaims(response.data.claims);
      setPagination(prev => ({ ...prev, claims: response.data.pagination }));
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    }
  };

  const fetchItems = async (page = 1, type = '', status = '') => {
    try {
      const params = { page, limit: 20, type, status };
      const response = await adminApi.getItems(params);
      setItems(response.data.items);
      setPagination(prev => ({ ...prev, items: response.data.pagination }));
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      await adminApi.banUser(userId, reason);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: false, banReason: reason } : u));
      toast.success('User banned successfully');
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminApi.unbanUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: true, banReason: undefined } : u));
      toast.success('User unbanned successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await adminApi.deleteItem(itemId);
      setItems(items.filter(i => i._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleApproveClaim = async (claimId, notes = '') => {
    try {
      await adminApi.approveClaim(claimId, notes);
      setClaims(claims.map(c => c._id === claimId ? { ...c, status: 'approved' } : c));
      toast.success('Claim approved successfully');
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error(error.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId, reason) => {
    try {
      await adminApi.rejectClaim(claimId, reason);
      setClaims(claims.map(c => c._id === claimId ? { ...c, status: 'rejected' } : c));
      toast.success('Claim rejected successfully');
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to reject claim');
    }
  };

  const viewClaimDetails = async (claimId) => {
    try {
      const response = await adminApi.getClaimDetails(claimId);
      setSelectedClaim(response.data);
    } catch (error) {
      console.error('Error fetching claim details:', error);
      toast.error('Failed to load claim details');
    }
  };

  const exportData = async (type, format = 'csv') => {
    try {
      const response = await adminApi.exportData(type, format);
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleFilterChange = (section, key, value) => {
    setFilters(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleSearch = () => {
    fetchUsers(1, searchTerm, filters.users.role, filters.users.status);
  };

  const handleAnalyticsPeriodChange = async (period) => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics(period);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics for period:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return {
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
    pagination,
    
    // Functions
    fetchDashboardData,
    fetchUsers,
    fetchClaims,
    fetchItems,
    handleDeleteUser,
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
  };
};