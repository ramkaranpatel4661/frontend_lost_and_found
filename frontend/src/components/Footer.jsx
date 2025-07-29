import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import axios from 'axios';

const Footer = () => {
  const { user } = useAuth ? useAuth() : { user: null };
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const openModal = (type) => {
    setModal(type);
    setFeedback('');
    if (type === 'contact' && user) {
      setForm({ name: user.name, email: user.email, message: '' });
    } else if (type === 'contact') {
      setForm({ name: '', email: '', message: '' });
    }
  };
  const closeModal = () => {
    setModal(null);
    setFeedback('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + '/contact',
        form
      );
      setFeedback(res.data.message || 'Message sent!');
      setForm({ ...form, message: '' });
    } catch (err) {
      setFeedback(
        err.response?.data?.message || 'Failed to send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Lost & Found</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Helping people reunite with their lost belongings and find their way back to what matters most.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/post" className="text-gray-300 hover:text-white transition-colors">
                  Post Item
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => openModal('contact')} className="text-gray-300 hover:text-white transition-colors w-full text-left">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => openModal('privacy')} className="text-gray-300 hover:text-white transition-colors w-full text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => openModal('terms')} className="text-gray-300 hover:text-white transition-colors w-full text-left">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Lost & Found. All rights reserved.
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
            <p className="mb-4">Have a question or issue? Send us a message and our admin team will respond as soon as possible.</p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                  disabled={!!user}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                  disabled={!!user}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={submitting || !form.name || !form.email || !form.message}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
              {feedback && (
                <div className={`mt-2 text-center text-sm ${feedback.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>
              )}
            </form>
          </div>
        </div>
      )}
      {modal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-2xl font-bold mb-2">Privacy Policy</h2>
            <p className="mb-2">Your privacy is important to us. All user data and documentation submitted to Lost & Found are kept secure and are never shared with third parties without your consent.</p>
            <p>We use your information only to help you recover lost items and to improve our services. Your documentation is safe and protected by industry-standard security measures.</p>
          </div>
        </div>
      )}
      {modal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-2xl font-bold mb-2">Terms of Service</h2>
            <p className="mb-2">Lost & Found is designed to help users report, search, and recover lost or found items in a safe and efficient manner.</p>
            <ul className="list-disc pl-5 mb-2">
              <li>Users can post details of lost or found items.</li>
              <li>All information provided should be accurate and truthful.</li>
              <li>We facilitate communication between item owners and finders/claimants.</li>
              <li>We do not guarantee the recovery of all items, but strive to provide the best possible service.</li>
            </ul>
            <p>By using this platform, you agree to use it responsibly and respect other users.</p>
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer