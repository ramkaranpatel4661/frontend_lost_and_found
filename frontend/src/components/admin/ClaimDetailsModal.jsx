import React, { useState } from 'react';
import { X, Eye, Download, CheckCircle, AlertTriangle, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const ClaimDetailsModal = ({ selectedClaim, onClose, onApprove, onReject }) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!selectedClaim) return null;

  const handleApprove = () => {
    onApprove(selectedClaim._id, notes);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(selectedClaim._id, rejectionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Item Information */}
            <div className="space-y-6">
              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Item Information
                </h3>
                <div className="space-y-2">
                  <p><strong>Title:</strong> {selectedClaim.item.title}</p>
                  <p><strong>Type:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedClaim.item.type === 'found' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedClaim.item.type}
                    </span>
                  </p>
                  <p><strong>Category:</strong> {selectedClaim.item.category}</p>
                  <p><strong>Location:</strong> {typeof selectedClaim.item.location === 'object' && selectedClaim.item.location !== null
                    ? `${selectedClaim.item.location.address || ''}${selectedClaim.item.location.city ? ', ' + selectedClaim.item.location.city : ''}`
                    : selectedClaim.item.location}
                  </p>
                  <p><strong>Description:</strong> {selectedClaim.item.description}</p>
                </div>
              </div>

              {/* Item Images */}
              {selectedClaim.item.imageUrls && selectedClaim.item.imageUrls.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Item Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClaim.item.imageUrls.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL || 'https://backend-lost-found.onrender.com'}${image}`}
                          alt={`Item ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <a
                          href={`${import.meta.env.VITE_BASE_URL || 'https://backend-lost-found.onrender.com'}${image}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                        >
                          <Eye className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Claimant Information */}
            <div className="space-y-6">
              {/* Claimant Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Claimant Information
                </h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedClaim.claimant.name}</p>
                  <p><strong>Email:</strong> {selectedClaim.claimant.email}</p>
                  {selectedClaim.claimant.phone && (
                    <p><strong>Phone:</strong> {selectedClaim.claimant.phone}</p>
                  )}
                </div>
              </div>

              {/* Sensitive Information */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3 flex items-center">
                  🔒 Sensitive Information (Admin Only)
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Full Name:</strong> {selectedClaim.verificationDetails.fullName}</p>
                  <p><strong>Phone:</strong> {selectedClaim.verificationDetails.phone}</p>
                  <p><strong>ID Type:</strong> {selectedClaim.verificationDetails.idType}</p>
                  <p><strong>ID Number:</strong> {selectedClaim.verificationDetails.idNumber}</p>
                  <p><strong>IP Address:</strong> {selectedClaim.ipAddress}</p>
                </div>
              </div>

              {/* Ownership Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Ownership Description</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                  {selectedClaim.verificationDetails.description}
                </p>
              </div>

              {/* Additional Proof */}
              {selectedClaim.verificationDetails.additionalProof && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Proof</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                    {selectedClaim.verificationDetails.additionalProof}
                  </p>
                </div>
              )}

              {/* Proof Documents */}
              {selectedClaim.proofDocuments && selectedClaim.proofDocuments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Proof Documents</h4>
                  <div className="space-y-2">
                    {selectedClaim.proofDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm text-gray-700">{doc.originalName || `Document ${index + 1}`}</span>
                        <a
                          href={`${import.meta.env.VITE_BASE_URL || 'https://backend-lost-found.onrender.com'}/uploads/${doc.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {doc.originalName || 'View'}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claim Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Claim Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Submitted:</strong> {new Date(selectedClaim.createdAt).toLocaleString()}</p>
                  {selectedClaim.updatedAt && (
                    <p><strong>Last Updated:</strong> {new Date(selectedClaim.updatedAt).toLocaleString()}</p>
                  )}
                  {selectedClaim.approvedAt && (
                    <p><strong>Approved:</strong> {new Date(selectedClaim.approvedAt).toLocaleString()}</p>
                  )}
                  {selectedClaim.rejectedAt && (
                    <p><strong>Rejected:</strong> {new Date(selectedClaim.rejectedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedClaim.status === 'pending' && (
            <div className="mt-8 space-y-4">
              {/* Approval Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Claim
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add approval notes (optional)..."
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                />
                <button
                  onClick={handleApprove}
                  className="mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Claim
                </button>
              </div>

              {/* Rejection Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reject Claim
                </h4>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide rejection reason (required)..."
                  className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  required
                />
                <button
                  onClick={handleReject}
                  className="mt-3 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reject Claim
                </button>
              </div>
            </div>
          )}

          {/* Status Display for Non-Pending Claims */}
          {selectedClaim.status !== 'pending' && (
            <div className="mt-8">
              <div className={`p-4 rounded-lg ${
                selectedClaim.status === 'approved' ? 'bg-green-50 border border-green-200' :
                selectedClaim.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <h4 className="font-medium mb-2">Claim Status: {selectedClaim.status}</h4>
                {selectedClaim.adminNotes && (
                  <p><strong>Admin Notes:</strong> {selectedClaim.adminNotes}</p>
                )}
                {selectedClaim.rejectionReason && (
                  <p><strong>Rejection Reason:</strong> {selectedClaim.rejectionReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsModal;