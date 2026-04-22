import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        const { data } = await api.post('/auth/register', formData);
        localStorage.setItem('user', JSON.stringify(data));
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Register As</label>
              <select name="role" value={formData.role || 'citizen'} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500">
                <option value="citizen">Citizen</option>
                <option value="worker">Field Worker</option>
              </select>
            </div>
          )}
          {!isLogin && formData.role === 'worker' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Specialty</label>
                <select name="specialty" value={formData.specialty || 'garbage'} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500">
                  <option value="garbage">Garbage</option>
                  <option value="road">Road</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">Shift Start (Hour)</label>
                  <input type="number" min="0" max="23" name="shiftStart" placeholder="9" onChange={handleInputChange} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">Shift End (Hour)</label>
                  <input type="number" min="0" max="23" name="shiftEnd" placeholder="17" onChange={handleInputChange} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 mt-4">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:underline">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
