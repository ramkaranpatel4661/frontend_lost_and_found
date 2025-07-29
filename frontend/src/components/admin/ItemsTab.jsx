import React from 'react';
import { Download, Package, Trash2 } from 'lucide-react';

const ItemsTab = ({ 
  items, 
  filters, 
  setFilters, 
  onFilterChange, 
  onExport, 
  onDelete 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Items Management</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              <option value="found">Found</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button
            onClick={() => onExport('items')}
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="border border-gray-200 rounded-lg p-4">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${item.imageUrls[0]}`}
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">{item.category}</span>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-gray-600">By: {item.postedBy?.name || 'Unknown'}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onDelete(item._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsTab;