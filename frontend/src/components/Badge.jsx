import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

const Badge = ({ status, className }) => {
  const getStatusConfig = (s) => {
    switch (s) {
      // Issue Status
      case 'Pending':
        return 'bg-[rgba(245,158,11,0.15)] text-warning border-transparent'; // --warning
      case 'Assigned':
        return 'bg-[rgba(59,130,246,0.15)] text-info border-transparent'; // --info
      case 'In Progress':
        return 'bg-[rgba(249,115,22,0.15)] text-in-progress border-transparent'; // --in-progress
      case 'Resolved':
        return 'bg-[rgba(16,185,129,0.15)] text-success border-transparent'; // --success
      case 'Rejected':
        return 'bg-[rgba(239,68,68,0.15)] text-danger border-transparent'; // --danger
      
      // Priority badge cases
      case 'Low':
        return 'bg-bg-tertiary text-text-secondary border-theme-border';
      case 'Medium':
        return 'bg-[rgba(245,158,11,0.15)] text-warning border-transparent';
      case 'High':
        return 'bg-[rgba(239,68,68,0.15)] text-danger border-transparent';
      
      // Worker Status
      case 'Available':
      case 'Active':
        return 'bg-[rgba(16,185,129,0.15)] text-success border-transparent';
      case 'Off-Duty':
        return 'bg-bg-tertiary text-text-muted border-theme-border';
      
      default:
        return 'bg-bg-tertiary text-text-secondary border-theme-border';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      getStatusConfig(status),
      className
    )}>
      {status}
    </span>
  );
};

export default Badge;
