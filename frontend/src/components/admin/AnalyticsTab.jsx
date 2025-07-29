import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Package, CheckCircle, Calendar } from 'lucide-react';

const AnalyticsTab = ({ analytics, onPeriodChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(analytics?.period || '30d');

  React.useEffect(() => {
    if (analytics?.period && analytics.period !== selectedPeriod) {
      setSelectedPeriod(analytics.period);
    }
  }, [analytics?.period]);

  if (!analytics) return null;

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    onPeriodChange(period);
  };

  const getGrowthIcon = (growth) => {
    return growth > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map(period => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">New Users</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.users.new}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(analytics.users.growth)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.users.growth)}`}>
                    {analytics.users.growth}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">New Items</p>
                <p className="text-2xl font-bold text-green-900">{analytics.items.new}</p>
                <p className="text-sm text-green-700 mt-1">Posted in {analytics.period}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.claims.successRate}%</p>
                <p className="text-sm text-purple-700 mt-1">Claims resolved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">New Claims</p>
                <p className="text-2xl font-bold text-yellow-900">{analytics.claims.new}</p>
                <p className="text-sm text-yellow-700 mt-1">In {analytics.period}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items by Type</h3>
          <div className="space-y-3">
            {analytics.items.byType?.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    type._id === 'found' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {type._id}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">{type.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Claims by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims by Status</h3>
          <div className="space-y-3">
            {analytics.claims.byStatus?.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status._id === 'pending' ? 'bg-yellow-500' :
                    status._id === 'approved' ? 'bg-green-500' :
                    status._id === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status._id}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart visualization would be implemented here</p>
            <p className="text-sm text-gray-400">Using libraries like Chart.js or Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;