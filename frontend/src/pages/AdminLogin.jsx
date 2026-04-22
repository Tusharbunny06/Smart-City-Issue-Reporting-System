import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', formData);
      if (data.role !== 'admin') {
        setError('Unauthorized: Activity logged. This account is not an administrator.');
        return;
      }
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-8 border-red-600">
        <div className="flex justify-center mb-4">
            <ShieldAlert size={48} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Admin Portal
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Authorized Personnel Only</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Administrator Email</label>
            <input type="email" name="email" onChange={handleInputChange} required autoFocus className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Clearance Password</label>
            <input type="password" name="password" onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors duration-300 mt-4 shadow-lg shadow-red-200">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
