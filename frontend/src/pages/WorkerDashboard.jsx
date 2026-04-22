import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { HardHat, LogOut, MapPin, CheckCircle, Clock, Camera, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const WorkerDashboard = () => {
  const { user, issues, updateIssueStatus, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  // Filter issues for this worker
  const workerIssues = issues.filter(issue => issue.assignedWorker === user.employeeId);
  const activeIssues = workerIssues.filter(i => ['Assigned', 'Accepted', 'In Progress', 'On Hold'].includes(i.status));
  const completedIssues = workerIssues.filter(i => i.status === 'Resolved');
  
  // Dummy shift logic
  const currentHour = new Date().getHours();
  // Let's assume Morning shift is 6-14, Afternoon 14-22, Night 22-6
  let shiftStart = 6, shiftEnd = 14;
  if(user.shift === 'Afternoon') { shiftStart = 14; shiftEnd = 22; }
  else if (user.shift === 'Night') { shiftStart = 22; shiftEnd = 6; }
  
  const isOnShift = (shiftStart < shiftEnd) 
    ? (currentHour >= shiftStart && currentHour < shiftEnd)
    : (currentHour >= shiftStart || currentHour < shiftEnd);

  const getRoleBadgeColor = (team) => {
    switch(team) {
      case 'Road Repair': return 'bg-orange-500/20 text-orange-400';
      case 'Electrical': return 'bg-blue-500/20 text-blue-400';
      case 'Sanitation': return 'bg-emerald-500/20 text-emerald-400';
      case 'Plumbing': return 'bg-purple-500/20 text-purple-400';
      case 'Supervisor': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleStatusUpdate = (status) => {
    if (!isOnShift) return;
    if (selectedIssue) {
      // Create a mock image if marked resolved
      let resolutionImageData = null;
      if (status === 'Resolved') {
         resolutionImageData = 'mock_resolution_image_url'; // In a real app, from file input
      }
      
      let remark = `Updated to ${status} by Worker`;
      if (status === 'Needs Escalation') remark = `Escalated: ${escalateReason}`;

      updateIssueStatus(selectedIssue.id, status, remark, resolutionImageData);
      setShowStatusModal(false);
      setIsEscalating(false);
      setEscalateReason('');
      setSelectedIssue(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-20">
      {/* Dark Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-lg">
            <HardHat size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{user.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.team)}`}>
               {user.team}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Shift Pill */}
          <div className="flex items-center gap-1.5 text-xs bg-gray-700/50 rounded-full px-2 py-1 border border-gray-600">
             <span className={`w-2 h-2 rounded-full ${isOnShift ? 'bg-green-500' : 'bg-gray-400'}`}></span>
             <span className="text-gray-300">{isOnShift ? 'On Shift' : 'Off Duty'}</span>
          </div>
          <button onClick={logout} className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Off-shift Banner */}
      {!isOnShift && (
        <div className="bg-amber-900/20 border-l-4 border-amber-500 p-3 mx-4 mt-4 rounded-r-md flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            You are currently off shift. Your next shift is {user.shift} ({shiftStart}:00). You can view tasks but actions are disabled.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 mx-auto max-w-md space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'tasks' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            My Tasks
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            Profile
          </button>
        </div>

        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Assigned</p>
                <p className="text-xl font-bold text-blue-400">{activeIssues.length}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Completed</p>
                <p className="text-xl font-bold text-emerald-400">{completedIssues.length}</p>
              </div>
            </div>

            {/* Active Task (If any) */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Active Tasks</h2>
              {activeIssues.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 border-dashed rounded-xl p-6 text-center">
                  <CheckCircle className="mx-auto text-gray-600 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">No active tasks right now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeIssues.map(issue => (
                    <div key={issue.id} className="bg-gray-800 rounded-xl border-l-4 border-l-amber-500 overflow-hidden shadow-lg border border-gray-700">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold bg-gray-700 text-amber-400 px-2 py-1 rounded">
                            {issue.id} · {issue.status}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            2h ago
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{issue.type}</h3>
                        <p className="text-sm text-gray-300 flex items-start gap-1 mb-3">
                          <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
                          <span>{issue.location}</span>
                        </p>
                        
                        <div className="bg-gray-900/50 p-3 rounded-lg text-sm text-gray-400 mb-4">
                          <p><span className="text-gray-500">Citizen:</span> {issue.citizenName}</p>
                          <p className="mt-1"><span className="text-gray-500">Desc:</span> {issue.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button 
                            disabled={!isOnShift}
                            onClick={() => { setSelectedIssue(issue); setShowStatusModal(true); setIsEscalating(false); }}
                            className="bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Update Status
                          </button>
                          <a 
                            href={`https://maps.google.com/?q=${issue.coordinates.lat},${issue.coordinates.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-gray-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <MapPin size={14} /> Map
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task History */}
            {completedIssues.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Task History</h2>
                <div className="space-y-3">
                  {completedIssues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-gray-200">{issue.type}</p>
                        <p className="text-xs text-gray-400 mt-1">{issue.id} · {issue.location}</p>
                      </div>
                      {issue.resolutionPhoto && (
                        <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden flex items-center justify-center shrink-0">
                          <ImageIcon size={16} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 text-2xl font-bold mx-auto mb-4 border-2 border-amber-500/30">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.employeeId}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${getRoleBadgeColor(user.team)}`}>{user.team}</span>
                  <span className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded-full border border-gray-600">Shift: {user.shift}</span>
                </div>
             </div>

             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
               <h3 className="font-bold text-gray-200 mb-4 text-sm uppercase tracking-wider">Performance Stats</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                   <span className="text-gray-400 text-sm">Total Resolved</span>
                   <span className="font-bold text-emerald-400">{completedIssues.length}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                   <span className="text-gray-400 text-sm">Rating</span>
                   <span className="font-bold text-amber-400 flex items-center gap-1">⭐ 4.8 / 5.0</span>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* Status Update Bottom Sheet Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden border border-gray-700 animate-in slide-in-from-bottom-8 duration-200">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
              <h3 className="font-bold text-white">Update Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-white pb-1">✕</button>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-400 mb-2">Issue: {selectedIssue.id}</p>
              
              {!isEscalating ? (
                <>
                  <button onClick={() => handleStatusUpdate('Accepted')} className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-600/50">
                    🟢 Accepted (Heading to location)
                  </button>
                  <button onClick={() => handleStatusUpdate('In Progress')} className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-600/50">
                    🟡 In Progress (Currently working)
                  </button>
                  <button onClick={() => handleStatusUpdate('On Hold')} className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-600/50">
                    🟠 On Hold (Needs materials)
                  </button>
                  <button onClick={() => handleStatusUpdate('Resolved')} className="w-full text-left px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold transition-colors border border-emerald-500/20 flex items-center justify-between">
                    <span>✅ Resolved</span>
                    <Camera size={16} />
                  </button>
                  <div className="pt-2">
                    <button onClick={() => setIsEscalating(true)} className="w-full text-center px-4 py-2 text-red-400 rounded-lg text-sm hover:underline">
                      Need to Escalate?
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">Why are you escalating this issue?</p>
                  <textarea 
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-white resize-none h-24 focus:border-amber-500 focus:outline-none"
                    placeholder="Enter reason for escalation..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsEscalating(false)} className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm">Cancel</button>
                    <button 
                      disabled={!escalateReason.trim()}
                      onClick={() => handleStatusUpdate('Needs Escalation')} 
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      Escalate Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;