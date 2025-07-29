import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/admin/contact-messages',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        setError('Failed to load user messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Messages / Contact Queries</h2>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No user messages yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <tr key={msg._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{msg.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-700 underline"><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                  <td className="px-6 py-4 whitespace-pre-line text-gray-700 max-w-xs break-words">{msg.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(msg.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserMessagesTab;