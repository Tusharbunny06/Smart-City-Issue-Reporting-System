import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { MapPin, CheckCircle, Clock, Camera, AlertCircle, Image as ImageIcon, ClipboardList, CheckSquare, User as UserIcon, UploadCloud, X } from 'lucide-react';
import { format } from 'date-fns';

const WorkerDashboard = () => {
  const { user, issues, updateIssueStatus } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCannotResolveModal, setShowCannotResolveModal] = useState(false);
  
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Update Status state
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  
  // Resolve Modal state
  const [resolveStep, setResolveStep] = useState(1);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [timeTaken, setTimeTaken] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');

  // Cannot Resolve state
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateDetails, setEscalateDetails] = useState('');

  const [toast, setToast] = useState(null);

  // Filter issues for this worker
  const workerIssues = issues.filter(issue => issue.assignedWorker === user.employeeId || issue.assignedWorker === user.id);
  const activeIssues = workerIssues.filter(i => ['Assigned', 'Accepted', 'In Progress', 'On Hold'].includes(i.status));
  const completedIssues = workerIssues.filter(i => i.status === 'Resolved');
  
  const currentHour = new Date().getHours();
  let shiftStart = 6, shiftEnd = 14;
  if(user.shift === 'Afternoon Shift' || user.shift === 'Afternoon') { shiftStart = 14; shiftEnd = 22; }
  else if (user.shift === 'Night Shift' || user.shift === 'Night') { shiftStart = 22; shiftEnd = 6; }
  
  const isOnShift = (shiftStart < shiftEnd) 
    ? (currentHour >= shiftStart && currentHour < shiftEnd)
    : (currentHour >= shiftStart || currentHour < shiftEnd);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getRoleBadgeColor = (role) => {
    if (!role) return 'bg-slate-500/20 text-slate-400';
    if(role.includes('Road')) return 'bg-orange-500/20 text-orange-400';
    if(role.includes('Elect')) return 'bg-blue-500/20 text-blue-400';
    if(role.includes('Sanit')) return 'bg-emerald-500/20 text-emerald-400';
    if(role.includes('Plumb')) return 'bg-purple-500/20 text-purple-400';
    if(role.includes('Super')) return 'bg-amber-500/20 text-amber-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  const handleUpdateStatus = () => {
    if (!isOnShift || !statusUpdate) return;
    updateIssueStatus(selectedIssue.id, statusUpdate, statusRemark);
    showToast(`Status updated successfully`);
    setShowStatusModal(false);
    setStatusUpdate('');
    setStatusRemark('');
    setSelectedIssue(null);
  };

  const handleResolveSubmit = () => {
    if (!isOnShift) return;
    updateIssueStatus(selectedIssue.id, 'Resolved', resolutionNotes, null, {
      resolutionPhoto,
      resolutionNotes,
      timeTaken,
      materialsUsed,
      resolvedBy: user.name,
      resolvedAt: new Date().toISOString()
    });
    setResolveStep(3); // Show success screen
  };

  const handleCannotResolve = () => {
    if (!isOnShift) return;
    updateIssueStatus(selectedIssue.id, 'Pending', `Escalated: ${escalateReason} - ${escalateDetails}`, null, { priority: 'High', escalated: true });
    showToast(`Issue reported and escalated.`);
    setShowCannotResolveModal(false);
    setEscalateReason('');
    setEscalateDetails('');
    setSelectedIssue(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setResolutionPhoto(url);
    }
  };

  const resetResolveModal = () => {
    setShowResolveModal(false);
    setResolveStep(1);
    setResolutionPhoto(null);
    setResolutionNotes('');
    setTimeTaken('');
    setMaterialsUsed('');
    setSelectedIssue(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 border-l-4 shadow-xl px-4 py-3 rounded-lg flex items-center space-x-3 z-[9999] toast-enter bg-bg-secondary ${
          toast.type === 'error' ? 'border-l-danger' : 'border-l-success'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-danger" /> : <CheckCircle className="h-5 w-5 text-success" />}
          <div className="flex flex-col">
            <span className="text-text-primary font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</span>
            <span className="text-text-secondary text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="md:w-64 shrink-0 border-r border-theme-border pr-4 h-fit sticky top-24">
        <h1 className="text-2xl font-heading text-text-primary mb-6 pl-2">Worker Portal</h1>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'tasks' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>My Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'completed' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span>Completed Work</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 flex items-center space-x-3 rounded-r-lg font-medium transition-colors ${
              activeTab === 'profile' ? 'border-l-[3px] border-accent bg-accent-glow text-accent' : 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        
        {/* Off-shift Banner */}
        {!isOnShift && (
          <div className="mb-6 bg-[rgba(239,68,68,0.1)] border-b border-[rgba(239,68,68,0.2)] p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-danger mt-0.5" />
            <p className="text-sm text-danger font-medium leading-relaxed">
              ⚠️ You are currently off shift. Your shift starts at {String(shiftStart).padStart(2, '0')}:00. <br/>
              Status updates are disabled.
            </p>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-secondary border border-theme-border rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1 font-medium">Assigned to Me</p>
                <p className="text-2xl font-bold text-info">{workerIssues.length}</p>
              </div>
              <div className="bg-bg-secondary border border-theme-border rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-in-progress">{activeIssues.filter(i => i.status === 'In Progress').length}</p>
              </div>
              <div className="bg-bg-secondary border border-theme-border rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1 font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-success">
                  {completedIssues.filter(i => new Date(i.resolvedAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="bg-bg-secondary border border-theme-border rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1 font-medium">Total Resolved</p>
                <p className="text-2xl font-bold text-accent">{completedIssues.length}</p>
              </div>
            </div>

            {/* Active Task Section */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center font-heading">
                Active Task
                <span className="ml-3 relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
              </h2>

              {activeIssues.length === 0 ? (
                <div className="bg-bg-secondary border border-theme-border border-dashed rounded-xl p-10 text-center">
                  <CheckCircle className="mx-auto text-text-muted mb-3 h-10 w-10" />
                  <p className="text-text-secondary">No active tasks right now.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeIssues.map(issue => (
                    <div key={issue.id} className="bg-bg-secondary rounded-xl border-l-[3px] border-l-accent overflow-hidden shadow-lg border border-theme-border">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold bg-bg-tertiary text-accent px-2 py-1 rounded-md flex items-center gap-2">
                            🔶 ACTIVE TASK 
                            {issue.priority === 'High' && <span className="bg-danger text-white px-1.5 py-0.5 rounded text-[10px]">HIGH</span>}
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-1 font-medium">
                            <Clock size={12} />
                            {format(new Date(issue.submittedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-heading font-bold text-text-primary mb-2">{issue.id}</h3>
                        <p className="text-text-secondary text-sm mb-4">Issue Type: <span className="text-text-primary font-medium">{issue.type}</span></p>
                        
                        <div className="bg-bg-tertiary p-4 rounded-xl text-sm text-text-secondary mb-5 space-y-2 border border-theme-border">
                          <p className="flex items-start gap-2">
                            <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                            <span className="text-text-primary">{issue.location}</span>
                          </p>
                          <p>👤 Reported by: <span className="text-text-primary">{issue.citizenName}</span></p>
                        </div>
                        
                        <div className="mb-5">
                          <p className="text-text-secondary text-sm font-medium mb-1">Description:</p>
                          <p className="text-text-primary text-sm leading-relaxed">{issue.description}</p>
                        </div>

                        {issue.image && (
                          <div className="mb-6">
                            <p className="text-text-secondary text-sm font-medium mb-2">Citizen's Photo:</p>
                            <img src={issue.image} alt="Issue" className="h-32 rounded-lg border border-theme-border object-cover" />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-theme-border">
                          <button 
                            disabled={!isOnShift}
                            onClick={() => { setSelectedIssue(issue); setShowStatusModal(true); }}
                            className="bg-bg-tertiary border border-theme-border text-text-primary py-2 px-4 rounded-lg text-sm font-medium hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            title={!isOnShift ? "Only available during your shift" : ""}
                          >
                            <span className="group-hover:text-accent transition-colors">🔄 Update Status</span>
                          </button>
                          
                          <button 
                            disabled={!isOnShift}
                            onClick={() => { setSelectedIssue(issue); setShowResolveModal(true); setResolveStep(1); }}
                            className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-success py-2 px-4 rounded-lg text-sm font-bold hover:bg-success hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!isOnShift ? "Only available during your shift" : ""}
                          >
                            ✅ Mark as Resolved
                          </button>
                          
                          <button 
                            disabled={!isOnShift}
                            onClick={() => { setSelectedIssue(issue); setShowCannotResolveModal(true); }}
                            className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-danger py-2 px-4 rounded-lg text-sm font-medium hover:bg-danger hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!isOnShift ? "Only available during your shift" : ""}
                          >
                            🚨 Cannot Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-text-primary mb-4 font-heading">Completed Work</h2>
            
            {completedIssues.length === 0 ? (
              <div className="bg-bg-secondary border border-theme-border rounded-xl p-10 text-center">
                <CheckSquare className="mx-auto text-text-muted mb-3 h-10 w-10" />
                <p className="text-text-primary font-medium">No completed tasks yet.</p>
                <p className="text-text-secondary text-sm mt-1">Resolved issues will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedIssues.map(issue => (
                  <div key={issue.id} className="bg-bg-secondary p-5 rounded-xl border border-theme-border flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-success text-sm font-bold flex items-center gap-1"><CheckCircle size={14}/> Resolved</span>
                        <span className="text-text-muted text-xs">{format(new Date(issue.resolvedAt || issue.submittedAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <h4 className="font-bold text-text-primary text-md">{issue.id} · <span className="font-normal text-text-secondary">{issue.type}</span></h4>
                      <p className="text-sm text-text-secondary flex items-center gap-1 mt-2">
                        <MapPin size={14} className="text-text-muted" /> {issue.location}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-theme-border flex gap-6 text-sm text-text-secondary">
                        <p>Time taken: <span className="text-text-primary font-medium">{issue.timeTaken || '2 hrs'}</span></p>
                        <p>Citizen rating: <span className="text-accent font-medium">{"⭐".repeat(issue.rating || 5)}</span></p>
                      </div>
                    </div>
                    {issue.resolutionPhoto && (
                      <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-theme-border">
                        <img src={issue.resolutionPhoto} alt="Resolution" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
             <div className="bg-bg-secondary p-8 rounded-xl border border-theme-border text-center">
                <div className="w-24 h-24 bg-[rgba(245,158,11,0.15)] rounded-full flex items-center justify-center text-accent text-3xl font-heading font-bold mx-auto mb-4 border border-[rgba(245,158,11,0.3)]">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h2 className="text-2xl font-heading font-bold text-text-primary">{user.name}</h2>
                <p className="text-text-secondary text-sm mt-1">{user.employeeId}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                  <span className="text-xs px-3 py-1 bg-bg-tertiary text-text-secondary rounded-full border border-theme-border font-medium">Shift: {user.shift}</span>
                </div>
             </div>

             <div className="bg-bg-secondary p-6 rounded-xl border border-theme-border">
               <h3 className="font-heading font-bold text-text-primary mb-5">Performance Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-bg-tertiary p-4 rounded-xl border border-theme-border">
                   <p className="text-text-secondary text-sm mb-1">Total Resolved (All Time)</p>
                   <p className="text-2xl font-bold text-text-primary">{completedIssues.length}</p>
                 </div>
                 <div className="bg-bg-tertiary p-4 rounded-xl border border-theme-border">
                   <p className="text-text-secondary text-sm mb-1">Resolved This Month</p>
                   <p className="text-2xl font-bold text-text-primary">{completedIssues.length}</p>
                 </div>
                 <div className="bg-bg-tertiary p-4 rounded-xl border border-theme-border">
                   <p className="text-text-secondary text-sm mb-1">Average Time Per Task</p>
                   <p className="text-xl font-bold text-text-primary">1.5 hrs</p>
                 </div>
                 <div className="bg-bg-tertiary p-4 rounded-xl border border-theme-border">
                   <p className="text-text-secondary text-sm mb-1">Citizen Satisfaction</p>
                   <p className="text-xl font-bold text-accent">⭐ 4.8 / 5</p>
                 </div>
               </div>
             </div>
             
             <div className="bg-bg-secondary p-6 rounded-xl border border-theme-border">
               <h3 className="font-heading font-bold text-text-primary mb-5">Shift Schedule</h3>
               <div className="space-y-3">
                 <div className={`p-4 rounded-lg flex justify-between items-center border ${user.shift === 'Morning Shift' ? 'border-accent bg-accent-glow' : 'border-theme-border bg-bg-tertiary'}`}>
                   <div>
                     <p className="font-bold text-text-primary text-sm">Morning Shift</p>
                     <p className="text-xs text-text-secondary">06:00 - 14:00</p>
                   </div>
                   {user.shift === 'Morning Shift' && <CheckCircle className="text-accent h-5 w-5" />}
                 </div>
                 <div className={`p-4 rounded-lg flex justify-between items-center border ${user.shift === 'Afternoon Shift' ? 'border-accent bg-accent-glow' : 'border-theme-border bg-bg-tertiary'}`}>
                   <div>
                     <p className="font-bold text-text-primary text-sm">Afternoon Shift</p>
                     <p className="text-xs text-text-secondary">14:00 - 22:00</p>
                   </div>
                   {user.shift === 'Afternoon Shift' && <CheckCircle className="text-accent h-5 w-5" />}
                 </div>
                 <div className={`p-4 rounded-lg flex justify-between items-center border ${user.shift === 'Night Shift' ? 'border-accent bg-accent-glow' : 'border-theme-border bg-bg-tertiary'}`}>
                   <div>
                     <p className="font-bold text-text-primary text-sm">Night Shift</p>
                     <p className="text-xs text-text-secondary">22:00 - 06:00</p>
                   </div>
                   {user.shift === 'Night Shift' && <CheckCircle className="text-accent h-5 w-5" />}
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      
      {/* Update Status Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
          <div className="bg-bg-secondary w-full max-w-sm rounded-2xl overflow-hidden border border-theme-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-theme-border flex justify-between items-center bg-bg-tertiary">
              <h3 className="font-heading font-bold text-text-primary">Update Issue Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-3 border border-theme-border rounded-xl cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input type="radio" name="status" value="Accepted" onChange={(e) => setStatusUpdate(e.target.value)} className="mr-3" />
                  <span className="text-sm text-text-primary font-medium">Accepted — Heading to location</span>
                </label>
                <label className="flex items-center p-3 border border-theme-border rounded-xl cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input type="radio" name="status" value="In Progress" onChange={(e) => setStatusUpdate(e.target.value)} className="mr-3" />
                  <span className="text-sm text-text-primary font-medium">In Progress — Currently working</span>
                </label>
                <label className="flex items-center p-3 border border-theme-border rounded-xl cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input type="radio" name="status" value="On Hold" onChange={(e) => setStatusUpdate(e.target.value)} className="mr-3" />
                  <span className="text-sm text-text-primary font-medium">On Hold — Needs materials/supervisor</span>
                </label>
              </div>
              
              <div className="mb-6">
                <textarea 
                  className="input-field w-full min-h-[80px]"
                  placeholder="Add a note for admin (optional)"
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowStatusModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleUpdateStatus} disabled={!statusUpdate} className="btn-primary flex-1 disabled:opacity-50">Update Status →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark As Resolved Modal */}
      {showResolveModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
          <div className="bg-bg-secondary w-full max-w-md rounded-2xl overflow-hidden border border-theme-border animate-in fade-in zoom-in-95 duration-200">
            {resolveStep < 3 && (
              <div className="p-5 border-b border-theme-border flex justify-between items-center bg-bg-tertiary">
                <h3 className="font-heading font-bold text-text-primary">
                  {resolveStep === 1 ? 'Upload Resolution Photo' : 'Resolution Details'}
                </h3>
                <button onClick={resetResolveModal} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
              </div>
            )}
            
            <div className="p-6">
              {resolveStep === 1 && (
                <div>
                  <p className="text-text-secondary text-sm mb-4">Upload a photo showing the completed work</p>
                  
                  <div className="border-2 border-dashed border-theme-border bg-[#1C2333] rounded-xl p-8 text-center hover:border-accent hover:bg-accent-glow transition-all group relative">
                    {resolutionPhoto ? (
                      <div className="flex flex-col items-center">
                        <img src={resolutionPhoto} alt="Resolution" className="max-h-[200px] rounded-lg mb-4" />
                        <span className="text-text-muted text-xs mb-3">resolution_proof.jpg</span>
                        <button onClick={() => setResolutionPhoto(null)} className="text-danger text-sm hover:underline">✕ Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center cursor-pointer">
                        <Camera className="h-10 w-10 text-accent mb-3" />
                        <p className="text-text-secondary text-sm font-medium mb-1">Click to upload or drag & drop</p>
                        <p className="text-[#475569] text-xs">JPG, PNG up to 5MB</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => setResolveStep(2)} 
                      disabled={!resolutionPhoto} 
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {resolveStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Work Done <span className="text-danger">*</span></label>
                    <textarea 
                      className="input-field w-full min-h-[100px]"
                      placeholder="Describe what work was done..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Time Taken <span className="text-danger">*</span></label>
                    <select className="input-field w-full" value={timeTaken} onChange={(e) => setTimeTaken(e.target.value)}>
                      <option value="">Select time...</option>
                      <option value="Less than 1 hour">Less than 1 hour</option>
                      <option value="1–2 hours">1–2 hours</option>
                      <option value="2–4 hours">2–4 hours</option>
                      <option value="Half day">Half day</option>
                      <option value="Full day">Full day</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Materials Used (Optional)</label>
                    <input 
                      type="text" 
                      className="input-field w-full"
                      placeholder="e.g. Asphalt 20kg, Road paint"
                      value={materialsUsed}
                      onChange={(e) => setMaterialsUsed(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-theme-border">
                    <button onClick={() => setResolveStep(1)} className="btn-secondary flex-1">← Back</button>
                    <button 
                      onClick={handleResolveSubmit} 
                      disabled={resolutionNotes.length < 20 || !timeTaken} 
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Submit Resolution →
                    </button>
                  </div>
                </div>
              )}

              {resolveStep === 3 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-20 h-20 bg-[rgba(16,185,129,0.15)] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-text-primary mb-2">Issue Resolved Successfully!</h3>
                  <p className="text-text-secondary mb-4">Your resolution photo has been submitted.</p>
                  <p className="text-accent font-bold mb-8">{selectedIssue.id}</p>
                  <button onClick={resetResolveModal} className="btn-secondary w-full">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cannot Resolve Modal */}
      {showCannotResolveModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
          <div className="bg-bg-secondary w-full max-w-md rounded-2xl overflow-hidden border border-theme-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-theme-border flex justify-between items-center bg-bg-tertiary">
              <h3 className="font-heading font-bold text-text-primary">Report Issue</h3>
              <button onClick={() => setShowCannotResolveModal(false)} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">Reason <span className="text-danger">*</span></label>
                <select className="input-field w-full" value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)}>
                  <option value="">Select reason...</option>
                  <option value="Location not found">Location not found</option>
                  <option value="Access blocked">Access blocked</option>
                  <option value="Needs heavy equipment">Needs heavy equipment</option>
                  <option value="Safety hazard">Safety hazard</option>
                  <option value="Duplicate issue">Duplicate issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Details <span className="text-danger">*</span></label>
                <textarea 
                  className="input-field w-full min-h-[100px]"
                  placeholder="Explain why this cannot be resolved..."
                  value={escalateDetails}
                  onChange={(e) => setEscalateDetails(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-theme-border">
                <button onClick={() => setShowCannotResolveModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button 
                  onClick={handleCannotResolve} 
                  disabled={!escalateReason || escalateDetails.length < 30} 
                  className="bg-danger hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex-1 disabled:opacity-50 transition-colors"
                >
                  Submit Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;