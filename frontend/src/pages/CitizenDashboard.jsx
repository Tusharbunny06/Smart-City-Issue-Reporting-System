import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { MapPin, UploadCloud, AlertCircle, CheckCircle, FileText, List, Eye, Lock, X } from 'lucide-react';
import Badge from '../components/Badge';
import { issueTypes } from '../data/mockData';
import { format } from 'date-fns';
import LiveMap from '../components/LiveMap';

const CitizenDashboard = () => {
  const { user, issues, reportIssue, workers } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('report'); 
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    priority: 'Medium',
    image: null,
    coordinates: null
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const myIssues = issues.filter(i => i.citizenId === user.id);
  const totalPages = Math.ceil(myIssues.length / itemsPerPage);
  const paginatedIssues = myIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (activeTab === 'report' && !formData.coordinates && !locError) {
      getLocation();
    }
  }, [activeTab]);

  const getLocation = () => {
    setIsLocating(true);
    setLocError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }
          }));
          setIsLocating(false);
        },
        (error) => {
          setLocError('Location access denied. Cannot report issue.');
          setIsLocating(false);
        }
      );
    } else {
      setLocError('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, image: url });
      
      const newErrors = { ...formErrors };
      delete newErrors.image;
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.type) errors.type = 'Please select an issue type.';
    if (formData.description.length < 20) errors.description = 'Description must be at least 20 characters.';
    if (!formData.location) errors.location = 'Please provide a location address.';
    if (!formData.image) errors.image = 'An image of the issue is required.';
    if (!formData.coordinates) errors.coordinates = 'GPS coordinates are required. Please allow location access.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field) => {
    validateForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const issueId = reportIssue(formData);
      setToast(`Issue reported successfully! ID: ${issueId}`);
      setTimeout(() => setToast(null), 4000);
      
      setFormData({
        type: '',
        description: '',
        location: '',
        priority: 'Medium',
        image: null,
        coordinates: null 
      });
      setActiveTab('my-reports');
      getLocation(); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Toast Notification (Top Right) */}
      {toast && (
        <div className="fixed top-20 right-4 bg-bg-secondary border-l-4 border-l-success shadow-xl px-4 py-3 rounded-lg flex items-center space-x-3 z-[9999] toast-enter">
          <CheckCircle className="h-5 w-5 text-success" />
          <div className="flex flex-col">
            <span className="text-text-primary font-bold text-sm">Success</span>
            <span className="text-text-secondary text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* Sidebar Tab Nav */}
      <div className="md:w-64 shrink-0 border-r border-theme-border pr-4 h-fit sticky top-24">
        <h1 className="text-2xl font-heading text-text-primary mb-6 pl-2">Dashboard</h1>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'report' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>Report an Issue</span>
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'my-reports' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <List className="h-5 w-5" />
            <span>My Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'map' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'report' && (
          <div className="card p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center font-heading">
              <FileText className="mr-2 h-5 w-5 text-accent" />
              Submit a New Issue
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Issue Type</label>
                  <div className="relative">
                    <select 
                      className={`input-field appearance-none ${formErrors.type ? 'border-danger' : ''}`}
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      onBlur={() => handleBlur('type')}
                    >
                      <option value="" className="bg-bg-secondary text-text-secondary">Select an issue type...</option>
                      {issueTypes.map(type => (
                        <option key={type} value={type} className="bg-bg-secondary text-text-primary">{type}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  {formErrors.type && <p className="text-danger text-xs mt-1">{formErrors.type}</p>}
                </div>

                <div>
                  <label className="form-label">Priority</label>
                  <div className="flex space-x-3 mt-1">
                    {['Low', 'Medium', 'High'].map(p => {
                      const isSelected = formData.priority === p;
                      return (
                        <label key={p} className="flex-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="priority" 
                            value={p}
                            checked={isSelected}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            className="hidden"
                          />
                          <div className={`text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                            isSelected ? 'bg-accent text-[#0A0E1A] border-accent' : 'bg-bg-tertiary text-text-secondary border-theme-border hover:border-accent hover:text-text-primary'
                          }`}>
                            {p}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea 
                  className={`input-field min-h-[100px] ${formErrors.description ? 'border-danger' : ''}`}
                  placeholder="Describe the issue in detail (min 20 characters)..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  onBlur={() => handleBlur('description')}
                />
                {formErrors.description && <p className="text-danger text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="form-label">Location Address</label>
                <input 
                  type="text" 
                  className={`input-field ${formErrors.location ? 'border-danger' : ''}`}
                  placeholder="e.g., 123 Main St, near Central Park"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  onBlur={() => handleBlur('location')}
                />
                {formErrors.location && <p className="text-danger text-xs mt-1">{formErrors.location}</p>}
              </div>

              <div>
                <label className="form-label flex items-center justify-between">
                  <span>GPS Coordinates</span>
                  <span className="bg-accent-glow text-accent text-[10px] px-2 py-0.5 rounded-full lowercase tracking-wider">Auto-captured</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly
                    className="input-field bg-bg-tertiary text-text-muted cursor-not-allowed pl-10"
                    value={formData.coordinates ? `Lat: ${formData.coordinates.lat.toFixed(6)}, Lng: ${formData.coordinates.lng.toFixed(6)}` : ''}
                    placeholder={isLocating ? "Fetching location..." : "Location not captured"}
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  {isLocating && (
                    <div className="absolute right-3 top-2.5">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                    </div>
                  )}
                </div>
                {locError && <p className="text-danger text-xs mt-1">{locError}</p>}
                {formErrors.coordinates && !locError && <p className="text-danger text-xs mt-1">{formErrors.coordinates}</p>}
              </div>

              <div>
                <label className="form-label">Upload Image</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors group ${
                  formErrors.image ? 'border-danger bg-[rgba(239,68,68,0.05)]' : 'border-theme-border bg-bg-tertiary hover:border-accent hover:bg-accent-glow'
                }`}>
                  {formData.image ? (
                    <div className="flex flex-col items-center relative">
                      <img src={formData.image} alt="Preview" className="h-40 object-cover rounded-lg shadow-md border border-theme-border" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, image: null})} 
                        className="absolute -top-3 -right-3 bg-bg-secondary border border-theme-border p-1 rounded-full text-text-secondary hover:text-danger hover:border-danger transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center relative">
                      <UploadCloud className="h-10 w-10 text-text-muted mb-2 group-hover:text-accent transition-colors" />
                      <p className="text-sm text-text-secondary mb-3">Drag and drop or click to upload</p>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="btn-secondary cursor-pointer py-1.5 px-4 text-sm rounded-lg hover:border-accent hover:text-accent">
                        Select File
                      </label>
                    </div>
                  )}
                </div>
                {formErrors.image && <p className="text-danger text-xs mt-1">{formErrors.image}</p>}
              </div>

              <div className="pt-4 border-t border-theme-border">
                 <button 
                  type="submit" 
                  className="btn-primary w-full h-12 flex justify-center items-center font-heading text-[15px]"
                  disabled={isLocating || !!locError || Object.keys(formErrors).length > 0}
                 >
                   Submit Report
                 </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'my-reports' && (
          <div className="card overflow-hidden">
            {myIssues.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center">
                 <AlertCircle className="h-12 w-12 text-text-muted mb-4" />
                 <h3 className="text-lg font-heading text-text-primary">No issues reported yet</h3>
                 <p className="text-text-secondary mt-1">When you report an issue, it will appear here.</p>
                 <button onClick={() => setActiveTab('report')} className="mt-6 btn-primary">Report an Issue</button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-bg-tertiary border-b border-theme-border">
                      <tr>
                        <th className="table-th">Issue ID</th>
                        <th className="table-th">Type</th>
                        <th className="table-th">Submitted Date</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Assigned Worker</th>
                        <th className="table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {paginatedIssues.map(issue => (
                        <tr key={issue.id} className="hover:bg-bg-tertiary transition-colors">
                          <td className="px-6 py-4 font-medium text-text-primary text-sm">{issue.id}</td>
                          <td className="px-6 py-4 text-text-secondary text-sm">{issue.type}</td>
                          <td className="px-6 py-4 text-text-secondary text-sm">{format(new Date(issue.submittedAt), 'MMM dd, yyyy HH:mm')}</td>
                          <td className="px-6 py-4"><Badge status={issue.status} /></td>
                          <td className="px-6 py-4 text-text-secondary text-sm">{issue.assignedWorker || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedIssue(issue)}
                              className="text-accent hover:text-accent-hover p-1.5 bg-accent-glow rounded-lg inline-flex items-center text-sm font-medium transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-theme-border flex items-center justify-between bg-bg-secondary">
                    <span className="text-sm text-text-secondary">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, myIssues.length)} of {myIssues.length} entries
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-theme-border rounded-lg bg-bg-tertiary text-text-primary disabled:opacity-40 hover:bg-theme-border transition-colors text-sm"
                      >
                        Prev
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-theme-border rounded-lg bg-bg-tertiary text-text-primary disabled:opacity-40 hover:bg-theme-border transition-colors text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'map' && (
          <LiveMap issues={myIssues} isAdmin={false} workers={workers} />
        )}
      </div>

      {/* Issue Detail Modal (Dark Theme Overhaul) */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm overflow-y-auto">
          <div className="bg-bg-secondary border border-theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto relative">
            
            <div className="px-6 py-5 border-b border-theme-border flex justify-between items-center bg-bg-tertiary rounded-t-2xl">
              <h3 className="text-lg font-bold text-text-primary font-heading">Issue Details: <span className="text-accent font-sans">{selectedIssue.id}</span></h3>
              <button onClick={() => setSelectedIssue(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/2 space-y-5">
                  <div>
                    <span className="form-label">Type</span>
                    <span className="text-text-primary font-medium text-sm">{selectedIssue.type}</span>
                  </div>
                  <div>
                    <span className="form-label">Status & Priority</span>
                    <div className="mt-1.5 space-x-2">
                      <Badge status={selectedIssue.status} />
                      <Badge status={selectedIssue.priority} />
                    </div>
                  </div>
                  <div>
                    <span className="form-label">Location</span>
                    <span className="text-text-primary text-sm leading-relaxed block">{selectedIssue.location}</span>
                    {selectedIssue.coordinates && (
                      <span className="block text-xs text-text-muted mt-1 font-mono">
                        Lat: {selectedIssue.coordinates.lat.toFixed(5)}, Lng: {selectedIssue.coordinates.lng.toFixed(5)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="form-label">Description</span>
                    <p className="text-text-secondary text-sm mt-1.5 bg-bg-tertiary p-3 rounded-lg border border-theme-border leading-relaxed">{selectedIssue.description}</p>
                  </div>
                </div>
                <div className="md:w-1/2">
                   <span className="form-label mb-2">Attached Image</span>
                   {selectedIssue.image ? (
                     <img src={selectedIssue.image} alt="Issue" className="w-full rounded-xl shadow-lg border border-theme-border object-cover max-h-64" />
                   ) : (
                     <div className="w-full h-40 bg-bg-tertiary rounded-xl flex items-center justify-center text-text-muted text-sm border border-theme-border">No image attached</div>
                   )}
                </div>
              </div>

              <div className="border-t border-theme-border pt-8">
                <h4 className="font-semibold text-text-primary mb-6 font-heading text-lg">Status Timeline</h4>
                <div className="space-y-0 pl-3">
                  {selectedIssue.history.map((hist, idx) => {
                    const isLast = idx === selectedIssue.history.length - 1;
                    return (
                      <div key={idx} className="relative pl-6 pb-6 border-l-2 border-theme-border last:border-transparent last:pb-0">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ${isLast ? 'bg-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-text-muted'}`}></div>
                        
                        <div className={`bg-bg-tertiary p-4 rounded-xl border ${isLast ? 'border-accent border-opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-theme-border'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge status={hist.status} />
                            <time className="text-xs text-text-muted font-medium">{format(new Date(hist.timestamp), 'MMM dd, HH:mm')}</time>
                          </div>
                          <div className="text-sm text-text-secondary">{hist.remark}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-theme-border bg-bg-tertiary rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedIssue(null)} className="btn-secondary hover:text-text-primary">Close Details</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CitizenDashboard;
