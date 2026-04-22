import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import exifr from 'exifr';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'garbage',
    lat: '',
    lng: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    if (file) {
      try {
        const coords = await exifr.gps(file);
        if (coords) {
          setFormData(prev => ({
            ...prev,
            lat: coords.latitude,
            lng: coords.longitude
          }));
        }
      } catch (err) {
        console.error('Failed to extract GPS data:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.lat || !formData.lng) {
      setError('Your photo must contain embedded GPS location data to avoid fake reports. Please ensure location services were on when the photo was taken.');
      setLoading(false);
      return;
    }

    // Because we are uploading an image, we MUST use FormData
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    
    // Send location as stringified JSON because of FormData holding strings
    data.append('location', JSON.stringify({
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0
    }));

    if (image) {
      data.append('image', image);
    }

    try {
      await api.post('/issues', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/dashboard'); // Go back to dashboard on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report the issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Report an Issue</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Issue Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
            placeholder="e.g. Broken Streetlight"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="garbage">Garbage</option>
            <option value="road">Road/Pothole</option>
            <option value="water">Water Leakage</option>
            <option value="electricity">Electricity/Streetlight</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            rows="4" 
            placeholder="Provide details about the issue..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Latitude</label>
            <input 
              type="text" 
              name="lat" 
              value={formData.lat} 
              readOnly 
              placeholder="Captured from photo"
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Longitude</label>
            <input 
              type="text" 
              name="lng" 
              value={formData.lng} 
              readOnly 
              placeholder="Captured from photo"
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Attach Photo (Mandatory for GPS Verification)</label>
          <input 
            type="file" 
            accept="image/*" 
            required
            onChange={handleFileChange} 
            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium shadow-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
