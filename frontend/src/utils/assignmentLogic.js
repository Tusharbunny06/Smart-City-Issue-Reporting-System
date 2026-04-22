// src/utils/assignmentLogic.js

export const getActiveShift = (timeString) => {
  const date = timeString ? new Date(timeString) : new Date();
  const currentHour = date.getHours();
  if (currentHour >= 8 && currentHour < 14) {
    return 'Morning Shift';
  } else if (currentHour >= 14 && currentHour < 19) {
    return 'Afternoon Shift';
  } else {
    return 'Night Shift';
  }
};

const getRoleForIssueType = (issueType) => {
  switch (issueType) {
    case 'Pothole':
    case 'Broken Footpath':
      return 'Road Repair Crew';
    case 'Streetlight Failure':
      return 'Electrical Team';
    case 'Garbage Overflow':
    case 'Illegal Dumping':
      return 'Sanitation Team';
    case 'Water Leakage':
    case 'Sewage Blockage':
      return 'Plumbing Team';
    case 'Other':
      return 'General Maintenance';
    default:
      return 'General Maintenance';
  }
};

export const assignWorkerToIssue = (issueType, workers, issueTime) => {
  const activeShift = getActiveShift(issueTime);
  const targetRole = getRoleForIssueType(issueType);

  // 1. Try to find an available worker with exact role in the current shift
  let availableWorker = workers.find(
    (w) => w.role === targetRole && w.shift === activeShift && w.status === 'Available'
  );

  // 2. Fallback to an available Supervisor in the current shift
  if (!availableWorker) {
    availableWorker = workers.find(
      (w) => w.role === 'Supervisor' && w.shift === activeShift && w.status === 'Available'
    );
  }

  // 3. (Optional) extreme fallback: any available worker in current shift
  // We'll just stick to the rules and return null if no exact or supervisor is found.

  return availableWorker ? availableWorker.id : null;
};
