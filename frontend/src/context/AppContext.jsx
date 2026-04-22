import React, { createContext, useState, useEffect } from 'react';
import { initialWorkers, initialIssues } from '../data/mockData';
import { assignWorkerToIssue, getActiveShift } from '../utils/assignmentLogic';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartcity_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Issues State
  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem('smartcity_issues');
    return saved ? JSON.parse(saved) : initialIssues;
  });

  // Workers State
  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('smartcity_workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('smartcity_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smartcity_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('smartcity_workers', JSON.stringify(workers));
  }, [workers]);

  // Actions
  const login = (email, password, role) => {
    // Mock login logic
    if (role === 'Citizen' && password === 'citizen123') {
      const name = email.split('@')[0];
      setUser({ id: email, name: name.charAt(0).toUpperCase() + name.slice(1), role: 'Citizen' });
      return true;
    } else if (role === 'Admin' && email === 'admin@city.in' && password === 'admin123') {
      setUser({ id: 'admin@city.in', name: 'Admin User', role: 'Admin' });
      return true;
    } else if (role === 'Worker' && password === 'worker123') {
      const match = workers.find(w => w.employeeId === email);
      if (match) {
        setUser({ ...match, role: 'Worker' });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const reportIssue = (newIssue) => {
    // Generate CIT-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayIssues = issues.filter(i => i.id.includes(dateStr));
    const nextNum = (todayIssues.length + 1).toString().padStart(4, '0');
    const id = `CIT-${dateStr}-${nextNum}`;

    const submittedAt = new Date().toISOString();

    const autoAssignedWorkerId = assignWorkerToIssue(newIssue.type, workers, submittedAt);
    const initialStatus = autoAssignedWorkerId ? 'Assigned' : 'Pending';

    const issue = {
      ...newIssue,
      id,
      status: initialStatus,
      submittedAt: submittedAt,
      citizenId: user.id,
      citizenName: user.name,
      assignedWorker: autoAssignedWorkerId,
      history: [
        { status: 'Pending', timestamp: new Date().toISOString(), remark: 'Report submitted.' },
        ...(autoAssignedWorkerId ? [{ status: 'Assigned', timestamp: new Date().toISOString(), remark: `System auto-assigned to worker ${autoAssignedWorkerId} based on active shift.` }] : [])
      ]
    };

    setIssues([issue, ...issues]);
    
    if (autoAssignedWorkerId) {
      setWorkers(workers.map(w => w.id === autoAssignedWorkerId ? { ...w, status: 'Assigned' } : w));
    }
    
    return id;
  };

  const updateIssueStatus = (issueId, newStatus, remark = '', manualWorkerId = null, extraProps = {}) => {
    let assignedWorkerId = null;
    let workerUpdated = false;
    let updatedWorkers = [...workers];

    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        let finalWorker = issue.assignedWorker;
        
        // Handle Assignment Logic
        if (newStatus === 'Assigned' && issue.status !== 'Assigned') {
          if (manualWorkerId) {
            finalWorker = manualWorkerId;
          } else {
            finalWorker = assignWorkerToIssue(issue.type, workers, issue.submittedAt);
          }

          if (finalWorker) {
             assignedWorkerId = finalWorker;
             // Update worker status
             updatedWorkers = updatedWorkers.map(w => w.id === finalWorker ? { ...w, status: 'Assigned' } : w);
             workerUpdated = true;
          } else {
             // If we couldn't auto-assign, keep it pending and throw an alert
             throw new Error('No available workers for this shift. Assign manually.');
          }
        }

        // Handle Un-assignment on Resolved/Rejected
        if ((newStatus === 'Resolved' || newStatus === 'Rejected') && issue.assignedWorker) {
           updatedWorkers = updatedWorkers.map(w => w.id === issue.assignedWorker ? { ...w, status: 'Available' } : w);
           workerUpdated = true;
        }

        return {
          ...issue,
          ...extraProps,
          status: newStatus,
          assignedWorker: finalWorker,
          history: [
            ...issue.history,
            { status: newStatus, timestamp: new Date().toISOString(), remark: remark || `Status changed to ${newStatus}` }
          ]
        };
      }
      return issue;
    }));

    if (workerUpdated) {
      setWorkers(updatedWorkers);
    }
  };

  const escalateIssue = (issueId) => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          priority: 'High',
          history: [
            ...issue.history,
            { status: issue.status, timestamp: new Date().toISOString(), remark: `Escalated by citizen via chatbot.` }
          ]
        };
      }
      return issue;
    }));
  };

  const rateIssue = (issueId, rating) => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, rating: rating };
      }
      return issue;
    }));
  };

  const getDerivedWorkers = () => {
    const currentShift = getActiveShift();
    return workers.map(w => {
      let effectiveStatus = w.status;
      if (w.status === 'Available' && w.shift !== currentShift) {
        effectiveStatus = 'Off-Duty';
      }
      return { ...w, status: effectiveStatus };
    });
  };

  const derivedWorkers = getDerivedWorkers();

  return (
    <AppContext.Provider value={{
      user, login, logout,
      issues, reportIssue, updateIssueStatus, escalateIssue, rateIssue,
      workers: derivedWorkers
    }}>
      {children}
    </AppContext.Provider>
  );
};
