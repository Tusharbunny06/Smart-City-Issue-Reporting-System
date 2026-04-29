import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, ClipboardList, Users, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Search, Filter, ChevronRight, X, MapPin
} from 'lucide-react';
import Badge from '../components/Badge';
import { format } from 'date-fns';
import LiveMap from '../components/LiveMap';

const AdminDashboard = () => {
  const { issues, workers, updateIssueStatus } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, issues, workers
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Issue Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updateRemark, setUpdateRemark] = useState('');
  const [manualWorkerId, setManualWorkerId] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Derived Stats ---
  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter(i => i.status === 'Pending').length;
    const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    
    const activeWorkers = workers.filter(w => w.status === 'Active' || w.status === 'Assigned').length;
    const utilization = activeWorkers > 0 ? Math.round((workers.filter(w => w.status === 'Assigned').length / activeWorkers) * 100) : 0;

    return { total, pending, inProgress, resolved, utilization, activeWorkers };
  }, [issues, workers]);

  // --- Filtered Issues ---
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            issue.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchTerm, statusFilter]);

  // --- Handlers ---
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!statusUpdate) return;

    try {
      updateIssueStatus(selectedIssue.id, statusUpdate, updateRemark, statusUpdate === 'Assigned' ? manualWorkerId : null);
      showToast(`Issue ${selectedIssue.id} updated successfully!`);
      setSelectedIssue(null);
      setStatusUpdate('');
      setUpdateRemark('');
      setManualWorkerId('');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className={`mx-auto flex flex-col md:flex-row ${activeTab === 'map' ? 'w-full h-[calc(100vh-64px)]' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8 gap-8'}`}>
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 border-l-4 shadow-xl px-4 py-3 rounded-lg flex items-center space-x-3 z-[9999] toast-enter bg-bg-secondary ${
          toast.type === 'error' ? 'border-l-danger' : 'border-l-success'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="h-5 w-5 text-danger" /> : <CheckCircle className="h-5 w-5 text-success" />}
          <div className="flex flex-col">
            <span className="text-text-primary font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</span>
            <span className="text-text-secondary text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Sidebar Tab Nav */}
      <div className={`md:w-64 shrink-0 border-r border-theme-border pr-4 ${activeTab === 'map' ? 'py-8 pl-8' : ''} h-fit sticky top-24`}>
        <h1 className="text-2xl font-heading text-text-primary mb-6 pl-2">Admin Panel</h1>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'issues' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>Issue Management</span>
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'workers' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Workers Panel</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'map' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span>City Map</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab !== 'map' && (
      <div className="flex-1 max-w-[calc(100vw-300px)] overflow-x-hidden">

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-bg-secondary p-6 rounded-2xl border border-theme-border hover:border-accent hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-secondary text-sm font-medium mb-1 font-sans">Total Pending</p>
                    <h3 className="text-3xl font-heading font-bold text-text-primary">{stats.pending}</h3>
                  </div>
                  <div className="bg-bg-tertiary p-3 rounded-xl group-hover:bg-accent-glow transition-colors">
                    <AlertTriangle className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary p-6 rounded-2xl border border-theme-border hover:border-accent hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-secondary text-sm font-medium mb-1 font-sans">In Progress</p>
                    <h3 className="text-3xl font-heading font-bold text-text-primary">{stats.inProgress}</h3>
                  </div>
                  <div className="bg-bg-tertiary p-3 rounded-xl group-hover:bg-[rgba(249,115,22,0.15)] transition-colors">
                    <Clock className="h-6 w-6 text-in-progress" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary p-6 rounded-2xl border border-theme-border hover:border-success hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-secondary text-sm font-medium mb-1 font-sans">Resolved</p>
                    <h3 className="text-3xl font-heading font-bold text-text-primary">{stats.resolved}</h3>
                  </div>
                  <div className="bg-bg-tertiary p-3 rounded-xl group-hover:bg-[rgba(16,185,129,0.15)] transition-colors">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary p-6 rounded-2xl border border-theme-border hover:border-info hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-secondary text-sm font-medium mb-1 font-sans">Worker Utilization</p>
                    <h3 className="text-3xl font-heading font-bold text-text-primary">{stats.utilization}%</h3>
                  </div>
                  <div className="bg-bg-tertiary p-3 rounded-xl group-hover:bg-[rgba(59,130,246,0.15)] transition-colors">
                    <TrendingUp className="h-6 w-6 text-info" />
                  </div>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2 mt-4 overflow-hidden border border-theme-border">
                  <div className="bg-info h-2 rounded-full" style={{ width: `${stats.utilization}%` }}></div>
                </div>
              </div>

            </div>

            <div className="card p-6">
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {issues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl border border-theme-border">
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">{issue.type} reported by {issue.citizenName}</span>
                      <span className="text-sm text-text-secondary mt-1">{issue.location} • {format(new Date(issue.submittedAt), 'MMM dd, HH:mm')}</span>
                    </div>
                    <Badge status={issue.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ISSUES TAB --- */}
        {activeTab === 'issues' && (
          <div className="card flex flex-col h-[calc(100vh-10rem)]">
            {/* Filter Bar */}
            <div className="p-4 border-b border-theme-border bg-bg-secondary flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <input 
                  type="text"
                  placeholder="Search by ID, type, or location..."
                  className="input-field pl-9 h-10 py-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-text-muted" />
                <select 
                  className="input-field h-10 py-1 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Issues Table */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-bg-tertiary border-b border-theme-border sticky top-0 z-10">
                  <tr>
                    <th className="table-th">Issue ID</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Priority</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Submitted</th>
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filteredIssues.map(issue => (
                    <tr key={issue.id} className="hover:bg-bg-tertiary transition-colors group cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                      <td className="px-6 py-4 font-medium text-text-primary text-sm">{issue.id}</td>
                      <td className="px-6 py-4 text-text-secondary text-sm">{issue.type}</td>
                      <td className="px-6 py-4"><Badge status={issue.priority} /></td>
                      <td className="px-6 py-4"><Badge status={issue.status} /></td>
                      <td className="px-6 py-4 text-text-secondary text-sm">{format(new Date(issue.submittedAt), 'MMM dd')}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-text-muted group-hover:text-accent transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-text-muted">No issues found matching your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- WORKERS TAB --- */}
        {activeTab === 'workers' && (
          <div className="card flex flex-col h-[calc(100vh-10rem)]">
            <div className="p-5 border-b border-theme-border bg-bg-secondary flex justify-between items-center shrink-0">
              <h2 className="text-lg font-heading font-bold text-text-primary">Field Workers Directory</h2>
              <div className="bg-bg-tertiary border border-theme-border px-3 py-1.5 rounded-lg text-sm text-text-secondary font-medium">
                <span className="text-success">{stats.activeWorkers}</span> Active Workers
              </div>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-bg-tertiary border-b border-theme-border sticky top-0 z-10">
                  <tr>
                    <th className="table-th">Worker ID</th>
                    <th className="table-th">Name</th>
                    <th className="table-th">Role (Department)</th>
                    <th className="table-th">Shift</th>
                    <th className="table-th">Current Task</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {workers.map(worker => {
                    const activeTask = issues.find(i => (i.assignedWorker === worker.id || i.assignedWorker === worker.employeeId) && ['Assigned', 'Accepted', 'In Progress', 'On Hold'].includes(i.status));
                    const isOffShift = worker.status === 'Off-Duty';
                    let workerStatus = worker.status;
                    if (isOffShift) workerStatus = 'Off-Duty';
                    else if (activeTask) workerStatus = 'On Task';
                    
                    return (
                      <tr key={worker.id} className="hover:bg-bg-tertiary transition-colors">
                        <td className="px-6 py-4 font-medium text-text-primary text-sm">{worker.id}</td>
                        <td className="px-6 py-4 text-text-secondary text-sm">{worker.name}</td>
                        <td className="px-6 py-4 text-text-secondary text-sm">{worker.role}</td>
                        <td className="px-6 py-4 text-text-secondary text-sm">{worker.shift}</td>
                        <td className="px-6 py-4 text-text-secondary text-sm">{activeTask ? <span className="text-accent font-medium">{activeTask.id}</span> : 'Available'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                            workerStatus === 'Off-Duty' ? 'bg-bg-tertiary text-text-muted border border-theme-border' :
                            workerStatus === 'On Task' ? 'bg-[rgba(59,130,246,0.15)] text-info border border-[rgba(59,130,246,0.3)]' :
                            workerStatus === 'Assigned' ? 'bg-[rgba(59,130,246,0.15)] text-info border border-[rgba(59,130,246,0.3)]' :
                            'bg-[rgba(16,185,129,0.15)] text-success border border-[rgba(16,185,129,0.3)]'
                          }`}>
                            {workerStatus === 'Assigned' ? 'On Task' : workerStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      )}

      {activeTab === 'map' && (
        <div className="flex-1">
          <LiveMap issues={issues} isAdmin={true} workers={workers} />
        </div>
      )}

      {/* --- ISSUE DETAIL SLIDE-OVER MODAL --- */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(0,0,0,0.7)] backdrop-blur-sm transition-opacity">
          <div className="bg-bg-secondary w-full max-w-md h-full flex flex-col border-l-[3px] border-l-accent shadow-[-10px_0_40px_rgba(0,0,0,0.5)] animate-slideInRight">
            
            <div className="px-6 py-5 border-b border-theme-border flex justify-between items-center bg-bg-tertiary">
              <h3 className="text-lg font-bold text-text-primary font-heading">Issue: <span className="text-accent font-sans">{selectedIssue.id}</span></h3>
              <button onClick={() => { setSelectedIssue(null); setStatusUpdate(''); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              <div>
                <img src={selectedIssue.image || "https://via.placeholder.com/400x200?text=No+Image"} alt="Issue" className="w-full h-48 object-cover rounded-xl border border-theme-border shadow-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-tertiary p-3 rounded-lg border border-theme-border">
                  <span className="form-label text-[11px]">Reporter</span>
                  <span className="text-text-primary text-sm font-medium">{selectedIssue.citizenName}</span>
                </div>
                <div className="bg-bg-tertiary p-3 rounded-lg border border-theme-border">
                  <span className="form-label text-[11px]">Type</span>
                  <span className="text-text-primary text-sm font-medium">{selectedIssue.type}</span>
                </div>
                <div className="bg-bg-tertiary p-3 rounded-lg border border-theme-border">
                  <span className="form-label text-[11px]">Priority</span>
                  <Badge status={selectedIssue.priority} className="mt-1" />
                </div>
                <div className="bg-bg-tertiary p-3 rounded-lg border border-theme-border">
                  <span className="form-label text-[11px]">Current Status</span>
                  <Badge status={selectedIssue.status} className="mt-1" />
                </div>
              </div>

              <div>
                <span className="form-label">Location</span>
                <p className="text-text-primary text-sm">{selectedIssue.location}</p>
              </div>

              <div>
                <span className="form-label">Description</span>
                <p className="text-text-secondary text-sm leading-relaxed">{selectedIssue.description}</p>
              </div>

              {selectedIssue.status === 'Resolved' && selectedIssue.resolutionPhoto && (
                <div className="border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] rounded-xl p-4">
                  <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">✅ Resolution Proof</h4>
                  <img src={selectedIssue.resolutionPhoto} alt="Resolution Proof" className="w-full rounded-lg mb-4 object-cover max-h-48 border border-theme-border" />
                  
                  <div className="text-sm text-text-secondary space-y-2">
                    <p>Resolved by: <span className="text-text-primary font-medium">{selectedIssue.resolvedBy || 'Worker'}</span></p>
                    <p>Resolved on: <span className="text-text-primary">{format(new Date(selectedIssue.resolvedAt || selectedIssue.submittedAt), 'MMM dd, yyyy HH:mm')}</span></p>
                    {selectedIssue.resolutionNotes && (
                      <div className="mt-3 bg-bg-secondary p-3 rounded-lg border border-theme-border">
                        <p className="font-medium text-text-primary mb-1">Work Done:</p>
                        <p className="italic">"{selectedIssue.resolutionNotes}"</p>
                      </div>
                    )}
                    <div className="flex gap-6 mt-4">
                      <p>Time Taken: <span className="text-text-primary font-medium">{selectedIssue.timeTaken || 'N/A'}</span></p>
                      <p>Materials: <span className="text-text-primary font-medium">{selectedIssue.materialsUsed || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Form */}
              <div className="border-t border-theme-border pt-6">
                <h4 className="font-heading font-bold text-text-primary mb-4">Update Status</h4>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="form-label">New Status</label>
                    <select 
                      className="input-field"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      required
                    >
                      <option value="" className="bg-bg-secondary">Select status...</option>
                      {['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                        <option key={s} value={s} disabled={s === selectedIssue.status} className="bg-bg-secondary">{s}</option>
                      ))}
                    </select>
                  </div>

                  {statusUpdate === 'Assigned' && (
                    <div className="bg-[rgba(245,158,11,0.05)] border border-accent rounded-lg p-3">
                      <label className="form-label text-accent">Manual Worker Assignment (Optional)</label>
                      <select 
                        className="input-field mt-1"
                        value={manualWorkerId}
                        onChange={(e) => setManualWorkerId(e.target.value)}
                      >
                        <option value="" className="bg-bg-secondary">Auto-assign based on role & shift...</option>
                        {workers.filter(w => w.status === 'Active' || w.status === 'Available').map(w => (
                          <option key={w.id} value={w.id} className="bg-bg-secondary">{w.name} ({w.role} - {w.shift})</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-text-secondary mt-2 leading-tight">If left blank, the system will automatically assign an available worker from the correct department.</p>
                    </div>
                  )}

                  <div>
                    <label className="form-label">Admin Remarks</label>
                    <textarea 
                      className="input-field min-h-[80px]"
                      placeholder="Add an official remark for the timeline..."
                      value={updateRemark}
                      onChange={(e) => setUpdateRemark(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={!statusUpdate}>
                    Save Changes
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
