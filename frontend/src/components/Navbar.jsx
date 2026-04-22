import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LogOut, Building2, User, ShieldCheck, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout, issues } = useContext(AppContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [lastRead, setLastRead] = useState(() => {
    return user ? localStorage.getItem(`lastReadNotif_${user.id}`) : null;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    if (!user || user.role !== 'Citizen' || !issues) return [];
    
    let notifs = [];
    issues.filter(i => i.citizenId === user.id).forEach(issue => {
      const updates = issue.history.filter(h => h.remark !== 'Report submitted.');
      updates.forEach(u => {
        notifs.push({
          issueId: issue.id,
          status: u.status,
          remark: u.remark,
          timestamp: u.timestamp
        });
      });
    });
    
    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  }, [issues, user]);

  const hasUnread = useMemo(() => {
    if (notifications.length === 0) return false;
    if (!lastRead) return true;
    return new Date(notifications[0].timestamp) > new Date(lastRead);
  }, [notifications, lastRead]);

  const handleBellClick = () => {
    if (!showNotifications) {
      const now = new Date().toISOString();
      localStorage.setItem(`lastReadNotif_${user.id}`, now);
      setLastRead(now);
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="bg-bg-secondary border-b border-theme-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#F59E0B" opacity="0.15"/>
              <rect x="6" y="14" width="4" height="8" rx="1" fill="#F59E0B"/>
              <rect x="12" y="10" width="4" height="12" rx="1" fill="#F59E0B"/>
              <rect x="18" y="12" width="4" height="10" rx="1" fill="#F59E0B"/>
              <rect x="4" y="22" width="20" height="1.5" rx="1" fill="#F59E0B" opacity="0.5"/>
            </svg>
            <span className="font-heading font-bold tracking-tight" style={{ fontSize: '18px', color: '#F1F5F9' }}>
              Nagar<span style={{ color: '#F59E0B' }}>Seva</span>
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4 sm:space-x-6">
              
              {user.role === 'Citizen' && (
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={handleBellClick}
                    className="p-2 text-text-secondary hover:text-accent transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                      <span className="absolute top-1.5 right-2 h-2 w-2 bg-danger rounded-full ring-2 ring-bg-secondary"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-theme-border rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-theme-border flex justify-between items-center">
                        <h3 className="font-heading font-bold text-text-primary text-sm">Notifications</h3>
                        <span className="text-xs bg-bg-tertiary px-2 py-0.5 rounded text-text-muted">{notifications.length} New</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-text-muted">No new notifications.</div>
                        ) : (
                          notifications.map((n, idx) => (
                            <div key={idx} className="px-4 py-3 border-b border-theme-border hover:bg-bg-tertiary transition-colors last:border-0 cursor-pointer">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-accent">{n.issueId}</span>
                                <span className="text-[10px] text-text-muted">
                                  {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-sm text-text-primary font-medium">Status changed to <span className="text-text-primary">{n.status}</span></p>
                              <p className="text-xs text-text-secondary mt-0.5 leading-snug">{n.remark}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 bg-bg-tertiary px-3 py-1.5 rounded-full border border-theme-border">
                <div className="bg-bg-secondary p-1 rounded-full">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight text-text-primary">{user.name}</span>
                  <span className="text-[11px] uppercase tracking-wide bg-accent-glow text-accent px-1.5 py-0.5 rounded-md mt-0.5 font-semibold w-fit leading-none">{user.role}</span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 border border-theme-border px-3 py-1.5 rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
