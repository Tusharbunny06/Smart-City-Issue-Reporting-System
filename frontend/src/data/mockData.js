// src/data/mockData.js
import { subDays, subHours } from 'date-fns';

export const issueTypes = [
  'Pothole',
  'Streetlight Failure',
  'Garbage Overflow',
  'Water Leakage',
  'Broken Footpath',
  'Sewage Blockage',
  'Illegal Dumping',
  'Other'
];

export const roles = [
  'Road Repair Crew',
  'Electrical Team',
  'Sanitation Team',
  'Plumbing Team',
  'General Maintenance',
  'Supervisor'
];

export const shifts = ['Morning Shift', 'Afternoon Shift', 'Night Shift'];

// Generate 50 Workers
const generateWorkers = () => {
  const workers = [];
  const distribution = [
    { role: 'Road Repair Crew', count: 10 },
    { role: 'Electrical Team', count: 8 },
    { role: 'Sanitation Team', count: 10 },
    { role: 'Plumbing Team', count: 8 },
    { role: 'General Maintenance', count: 8 },
    { role: 'Supervisor', count: 6 },
  ];

  let idCounter = 1;
  distribution.forEach(({ role, count }) => {
    for (let i = 0; i < count; i++) {
      workers.push({
        id: `WRK-${idCounter.toString().padStart(3, '0')}`,
        employeeId: `WRK-${idCounter.toString().padStart(3, '0')}`,
        name: `${role.split(' ')[0]} Worker ${i + 1}`,
        role,
        shift: shifts[i % 3],
        status: 'Available', // Available, Assigned, Off-Duty
      });
      idCounter++;
    }
  });

  return workers;
};

export const initialWorkers = generateWorkers();

// Generate some mock issues
export const initialIssues = [
  {
    id: 'CIT-20231024-0001',
    type: 'Pothole',
    description: 'Large pothole in the middle of the road causing traffic slowdowns.',
    location: 'Main St & 4th Ave',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
    priority: 'High',
    status: 'In Progress',
    submittedAt: subHours(new Date(), 2).toISOString(),
    citizenId: 'citizen@city.in',
    citizenName: 'John Doe',
    assignedWorker: 'WRK-001',
    history: [
      { status: 'Pending', timestamp: subHours(new Date(), 2).toISOString(), remark: 'Report submitted.' },
      { status: 'Assigned', timestamp: subHours(new Date(), 1.5).toISOString(), remark: 'Assigned to worker.' },
      { status: 'In Progress', timestamp: subHours(new Date(), 1).toISOString(), remark: 'Heading to location.' }
    ]
  },
  {
    id: 'CIT-20231024-0002',
    type: 'Streetlight Failure',
    description: 'Streetlight has been flickering and is now completely off for two days.',
    location: 'Oakwood Drive',
    coordinates: { lat: 18.5214, lng: 73.8577 },
    image: 'https://images.unsplash.com/photo-1494255177615-8af17149f4bf?auto=format&fit=crop&q=80&w=400',
    priority: 'Medium',
    status: 'Resolved',
    submittedAt: subDays(new Date(), 1).toISOString(),
    citizenId: 'citizen@city.in',
    citizenName: 'Jane Smith',
    assignedWorker: 'WRK-001', 
    resolutionPhoto: 'https://images.unsplash.com/photo-1541819385542-a42e5c8e39ad?auto=format&fit=crop&q=80&w=400',
    history: [
      { status: 'Pending', timestamp: subDays(new Date(), 1).toISOString(), remark: 'Report submitted.' },
      { status: 'Assigned', timestamp: subHours(new Date(), 20).toISOString(), remark: 'Assigned to worker.' },
      { status: 'Resolved', timestamp: subHours(new Date(), 5).toISOString(), remark: 'Fixed issue.' }
    ]
  },
  {
    id: 'CIT-20231023-0003',
    type: 'Garbage Overflow',
    description: 'Dumpster is completely full and garbage is spilling onto the street.',
    location: 'Market Square',
    coordinates: { lat: 18.5224, lng: 73.8587 },
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
    priority: 'High',
    status: 'Resolved',
    submittedAt: subDays(new Date(), 2).toISOString(),
    citizenId: 'other@city.in',
    citizenName: 'Jane Smith',
    assignedWorker: 'WRK-001', 
    resolutionPhoto: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400',
    history: [
      { status: 'Pending', timestamp: subDays(new Date(), 2).toISOString(), remark: 'Report submitted.' },
      { status: 'Assigned', timestamp: subDays(new Date(), 1).toISOString(), remark: 'Assigned to worker.' },
      { status: 'Resolved', timestamp: subHours(new Date(), 5).toISOString(), remark: 'Cleaned up area.' }
    ]
  },
  {
    id: 'CIT-20231022-0004',
    type: 'Water Leakage',
    description: 'Pipe busted on the sidewalk, water is flowing into the street.',
    location: 'Elm Street near the park',
    coordinates: { lat: 18.5234, lng: 73.8597 },
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
    priority: 'High',
    status: 'Resolved',
    submittedAt: subDays(new Date(), 3).toISOString(),
    citizenId: 'citizen@city.in',
    citizenName: 'John Doe',
    assignedWorker: 'WRK-029', // Plumbing Team worker
    history: [
      { status: 'Pending', timestamp: subDays(new Date(), 3).toISOString(), remark: 'Report submitted.' },
      { status: 'Assigned', timestamp: subDays(new Date(), 2).toISOString(), remark: 'Assigned to Plumbing Team Worker 1.' },
      { status: 'In Progress', timestamp: subHours(new Date(), 40).toISOString(), remark: 'Fixing the pipe.' },
      { status: 'Resolved', timestamp: subHours(new Date(), 38).toISOString(), remark: 'Pipe fixed and area cleaned.' }
    ]
  },
  {
    id: 'CIT-20231021-0005',
    type: 'Other',
    description: 'Vandalism on the city monument.',
    location: 'City Center Plaza',
    coordinates: { lat: 18.5244, lng: 73.8607 },
    image: null,
    priority: 'Low',
    status: 'Rejected',
    submittedAt: subDays(new Date(), 4).toISOString(),
    citizenId: 'other@city.in',
    citizenName: 'Jane Smith',
    assignedWorker: null,
    history: [
      { status: 'Pending', timestamp: subDays(new Date(), 4).toISOString(), remark: 'Report submitted.' },
      { status: 'Rejected', timestamp: subDays(new Date(), 3).toISOString(), remark: 'Not a city maintenance issue. Forwarded to police.' }
    ]
  }
];
