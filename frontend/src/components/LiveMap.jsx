import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Filter, Crosshair, Map as MapIcon, Layers } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { issueTypes } from '../data/mockData';

const getStatusColor = (status) => {
  switch(status) {
    case 'Pending': return '#F59E0B'; // Amber
    case 'Assigned': return '#3B82F6'; // Blue
    case 'In Progress': return '#F97316'; // Orange
    case 'Resolved': return '#10B981'; // Green
    case 'Rejected': return '#EF4444'; // Red
    default: return '#94A3B8';
  }
};

const getStatusBadgeHtml = (status) => {
  let color = getStatusColor(status);
  let bg = color + '22';
  return `<span style="display:inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; color: ${color}; background-color: ${bg};">${status}</span>`;
};

// Deterministic pseudo-random number generator based on string hash
const getSeededRandom = (seedStr) => {
  let h = 0;
  for(let i = 0; i < seedStr.length; i++) h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  // returns float between -1 and 1
  return (Math.abs(h % 10000) / 5000) - 1;
};

const LiveMap = ({ issues, isAdmin, workers }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerClusterRef = useRef(null);
  const heatLayerRef = useRef(null);
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('All Time');
  const [viewMode, setViewMode] = useState('markers'); // 'markers' | 'heatmap'

  // Filter Issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filterStatus !== 'All' && issue.status !== filterStatus) return false;
      if (filterType !== 'All' && issue.type !== filterType) return false;
      
      const issueDate = new Date(issue.submittedAt);
      if (filterDate === 'Today' && !isToday(issueDate)) return false;
      if (filterDate === 'This Week' && !isThisWeek(issueDate)) return false;
      if (filterDate === 'This Month' && !isThisMonth(issueDate)) return false;
      
      return true;
    });
  }, [issues, filterStatus, filterType, filterDate]);

  // Compute Stats
  const stats = useMemo(() => {
    return filteredIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, { Pending: 0, Assigned: 0, 'In Progress': 0, Resolved: 0, Rejected: 0 });
  }, [filteredIssues]);

  // Initialize Map
  useEffect(() => {
    if (!window.L || mapInstanceRef.current) return;

    // Center on Chennai
    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([13.0827, 80.2707], 12);
    mapInstanceRef.current = map;

    // Add CartoDB Dark Matter tiles
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Reposition Zoom Control
    window.L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Global popup override CSS is injected via regular styled components or just global css,
    // but since we want to be clean, we let leaflet use default classes and we override them in index.css 
    // or just use inline styles in the popup content.

  }, []);

  // Render Markers/Heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Clear existing layers
    if (markerClusterRef.current) {
      map.removeLayer(markerClusterRef.current);
      markerClusterRef.current = null;
    }
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (viewMode === 'heatmap' && isAdmin) {
      // Heatmap View
      if (!window.L.heatLayer) return; // ensure loaded
      
      const heatData = filteredIssues.map(issue => {
        let lat = 13.0827, lng = 80.2707;
        if (issue.coordinates) {
          lat = issue.coordinates.lat;
          lng = issue.coordinates.lng;
        } else {
          lat += getSeededRandom(issue.id + 'lat') * 0.15;
          lng += getSeededRandom(issue.id + 'lng') * 0.15;
        }
        // Intensity can be based on something, defaults to 1
        return [lat, lng, 1];
      });

      heatLayerRef.current = window.L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 14,
        gradient: {
          0.4: '#3B82F6', // Blue
          0.6: '#F59E0B', // Amber
          1.0: '#EF4444'  // Red
        }
      }).addTo(map);

    } else {
      // Markers View
      if (!window.L.markerClusterGroup) return; // ensure loaded
      
      const markers = window.L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          return window.L.divIcon({ 
            html: `<div style="background-color: #F59E0B; color: #0A0E1A; font-weight: bold; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);">${cluster.getChildCount()}</div>`,
            className: 'custom-cluster-icon', 
            iconSize: window.L.point(30, 30) 
          });
        }
      });

      filteredIssues.forEach(issue => {
        let lat = 13.0827, lng = 80.2707;
        if (issue.coordinates) {
          lat = issue.coordinates.lat;
          lng = issue.coordinates.lng;
        } else {
          // Generate realistic spread for mock data
          lat += getSeededRandom(issue.id + 'lat') * 0.15;
          lng += getSeededRandom(issue.id + 'lng') * 0.15;
        }

        const color = getStatusColor(issue.status);
        
        const customIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${color}; background-color: ${color}40; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                   <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></div>
                 </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        let assignedInfo = 'Not yet assigned';
        if (issue.assignedWorker) {
          const w = workers?.find(work => work.id === issue.assignedWorker);
          assignedInfo = w ? w.name : issue.assignedWorker;
        }

        const popupContent = `
          <div style="background: #111827; border: 1px solid #2A3347; border-radius: 12px; padding: 12px; color: #F1F5F9; font-family: 'DM Sans', sans-serif; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <strong style="color: #F59E0B;">${issue.type}</strong>
              ${getStatusBadgeHtml(issue.status)}
            </div>
            <div style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">ID: <span style="color: #F1F5F9;">${issue.id}</span></div>
            <div style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">📍 <span style="color: #F1F5F9;">${issue.location}</span></div>
            <div style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">👤 Reported by: <span style="color: #F1F5F9;">${issue.citizenName || 'Citizen'}</span></div>
            <div style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;">📅 <span style="color: #F1F5F9;">${format(new Date(issue.submittedAt), 'MMM dd, yyyy')}</span></div>
            <div style="font-size: 12px; color: #94A3B8; margin-bottom: 12px;">👷 Worker: <span style="color: #F1F5F9;">${assignedInfo}</span></div>
            <button style="width: 100%; background: #1C2333; border: 1px solid #2A3347; color: #F59E0B; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;" onclick="alert('In a full app, this would open the detail modal for ${issue.id}')">View Full Details →</button>
          </div>
        `;

        const marker = window.L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-dark-popup' // we will target this in index.css
        });
        
        markers.addLayer(marker);
      });

      map.addLayer(markers);
      markerClusterRef.current = markers;
    }

  }, [filteredIssues, viewMode, isAdmin, workers]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 15);
          
          // Add pulsing dot
          const pulseIcon = window.L.divIcon({
            className: 'pulse-icon',
            html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: #F59E0B; animation: pulseRing 1.5s infinite; border: 2px solid #0A0E1A;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          window.L.marker([latitude, longitude], { icon: pulseIcon }).addTo(map)
            .bindPopup('<div style="color:#0A0E1A; font-weight:bold;">You are here</div>').openPopup();
        }
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#2A3347] bg-[#0A0E1A]" style={{ height: 'calc(100vh - 120px)' }}>
      
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Stats Bar */}
        <div 
          className="absolute z-[999] flex items-center gap-4"
          style={{
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #2A3347',
            borderRadius: '99px',
            padding: '8px 16px',
            whiteSpace: 'nowrap'
          }}
        >
          <div className="text-[#F1F5F9] font-heading font-bold mr-2 text-sm tracking-wide">LIVE STATS</div>
        <div className="flex items-center space-x-2 bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold border border-[#F59E0B]/30">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
          <span>Pending: {stats['Pending']}</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full text-xs font-bold border border-[#3B82F6]/30">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
          <span>Assigned: {stats['Assigned']}</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#F97316]/20 text-[#F97316] px-3 py-1 rounded-full text-xs font-bold border border-[#F97316]/30">
          <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
          <span>In Progress: {stats['In Progress']}</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#10B981]/20 text-[#10B981] px-3 py-1 rounded-full text-xs font-bold border border-[#10B981]/30">
          <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
          <span>Resolved: {stats['Resolved']}</span>
        </div>
      </div>

      {/* Filter Panel */}
        <div 
          className="absolute z-[999] shadow-2xl custom-scrollbar"
          style={{
            top: '16px',
            left: '16px',
            width: '280px',
            maxHeight: 'calc(100% - 32px)',
            overflowY: 'auto',
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #2A3347',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
        <h3 className="font-heading font-bold text-[#F1F5F9] mb-4 flex items-center">
          <Filter className="h-4 w-4 mr-2 text-[#F59E0B]" />
          Map Filters
        </h3>

        {/* Status Filter */}
        <div className="mb-5">
          <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  filterStatus === status 
                    ? 'bg-[#F59E0B] text-[#0A0E1A] border-[#F59E0B]' 
                    : 'bg-[#1C2333] text-[#94A3B8] border-[#2A3347] hover:border-[#F59E0B] hover:text-[#F1F5F9]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-5">
          <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Issue Type</label>
          <select 
            className="w-full bg-[#1C2333] border border-[#2A3347] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm focus:border-[#F59E0B] outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            {issueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="mb-5">
          <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Date Reported</label>
          <select 
            className="w-full bg-[#1C2333] border border-[#2A3347] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm focus:border-[#F59E0B] outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            {['All Time', 'Today', 'This Week', 'This Month'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Admin Heatmap Toggle */}
        {isAdmin && (
          <div className="pt-4 border-t border-[#2A3347]">
             <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3 block">Admin View Mode</label>
             <div className="flex flex-col space-y-2">
               <button 
                 onClick={() => setViewMode('markers')}
                 className={`w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm font-bold rounded-full transition-colors ${viewMode === 'markers' ? 'bg-[#F59E0B] text-[#0A0E1A]' : 'bg-[#1C2333] text-[#94A3B8] border border-[#2A3347] hover:border-[#F59E0B] hover:text-[#F1F5F9]'}`}
               >
                 <MapIcon className="h-4 w-4" />
                 <span>Markers</span>
               </button>
               <button 
                 onClick={() => setViewMode('heatmap')}
                 className={`w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm font-bold rounded-full transition-colors ${viewMode === 'heatmap' ? 'bg-[#F59E0B] text-[#0A0E1A]' : 'bg-[#1C2333] text-[#94A3B8] border border-[#2A3347] hover:border-[#F59E0B] hover:text-[#F1F5F9]'}`}
               >
                 <Layers className="h-4 w-4" />
                 <span>Heatmap</span>
               </button>
             </div>
          </div>
        )}
      </div>

      {/* My Location Button */}
      <button 
        onClick={handleMyLocation}
        className="absolute bottom-6 right-6 z-10 h-12 w-12 bg-[#F59E0B] hover:bg-[#D97706] rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
        title="My Location"
      >
        <Crosshair className="h-5 w-5 text-[#0A0E1A]" />
      </button>

    </div>
  );
};

export default LiveMap;
