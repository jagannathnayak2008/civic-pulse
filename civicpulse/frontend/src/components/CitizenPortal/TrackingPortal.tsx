import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { RepairVerifier } from './RepairVerifier';
import { MasterIncident } from '../../types/civicpulse';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building,
  User,
  Film,
  MapPin,
  ExternalLink,
  Flame,
  Filter,
  Lightbulb,
  AlertTriangle,
  Car,
  TrendingUp,
  Users,
  Wrench,
  GraduationCap
} from 'lucide-react';

// Custom Exclamation Marker matching user's screenshot exactly
const createSeverityMarkerIcon = (priority: string, riskScore: number) => {
  const isHigh = priority === 'P1_CRITICAL' || priority === 'P2_HIGH' || riskScore >= 70;
  const isMedium = priority === 'P3_MEDIUM' || (riskScore >= 40 && riskScore < 70);
  const color = isHigh ? '#EF4444' : isMedium ? '#F97316' : '#10B981';

  return L.divIcon({
    html: `
      <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45)); transition: transform 0.15s ease-out;">
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.611 0 0 7.611 0 17C0 28.5 17 44 17 44C17 44 34 28.5 34 17C34 7.611 26.389 0 17 0Z" fill="${color}"/>
          <circle cx="17" cy="16" r="9.5" fill="white"/>
          <line x1="17" y1="10.5" x2="17" y2="16.5" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="17" cy="20" r="1.5" fill="${color}"/>
        </svg>
      </div>
    `,
    className: 'custom-severity-marker',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44]
  });
};

// Custom White Selected Marker Icon (glowing white pin with white radar aura)
const createWhiteSelectedMarkerIcon = (trackingNumber: string) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 44px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <!-- Glowing White Pulse Aura -->
        <div style="position: absolute; top: 12px; left: 6px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.45); animation: whiteMarkerPulse 1.8s infinite ease-out; pointer-events: none;"></div>
        
        <!-- White Badge on Top with Ticket Number -->
        <div style="position: absolute; top: -14px; background: #FFFFFF; color: #0F172A; font-weight: 900; font-family: monospace; font-size: 11px; padding: 2px 7px; border-radius: 9999px; border: 2px solid #0F172A; box-shadow: 0 0 16px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(0,0,0,0.6); white-space: nowrap; z-index: 10;">
          #${trackingNumber}
        </div>

        <!-- Pure White Marker Teardrop Pin -->
        <div style="filter: drop-shadow(0 0 16px rgba(255, 255, 255, 1)) drop-shadow(0 4px 10px rgba(0,0,0,0.7)); transform: scale(1.15);">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.611 0 0 7.611 0 17C0 28.5 17 44 17 44C17 44 34 28.5 34 17C34 7.611 26.389 0 17 0Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
            <circle cx="17" cy="16" r="9.5" fill="#0F172A"/>
            <line x1="17" y1="10.5" x2="17" y2="16.5" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
            <circle cx="17" cy="20" r="1.5" fill="#FFFFFF"/>
          </svg>
        </div>
      </div>
    `,
    className: 'custom-white-selected-marker',
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -56]
  });
};

// Sub-component for individual marker with auto-popup on selection
interface MapIncidentMarkerProps {
  inc: MasterIncident;
  isSelected: boolean;
  onSelect: (tracking: string) => void;
}

const MapIncidentMarker: React.FC<MapIncidentMarkerProps> = ({ inc, isSelected, onSelect }) => {
  const markerRef = React.useRef<L.Marker | null>(null);

  React.useEffect(() => {
    if (isSelected && markerRef.current) {
      // Pop up automatically on map when selected / inspected
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSelected, inc.id]);

  const isHigh = inc.priority === 'P1_CRITICAL' || inc.priority === 'P2_HIGH' || inc.risk_score >= 70;
  const isMedium = inc.priority === 'P3_MEDIUM' || (inc.risk_score >= 40 && inc.risk_score < 70);
  const severityLabel = isHigh ? 'High' : isMedium ? 'Medium' : 'Low';

  return (
    <Marker
      ref={markerRef}
      position={[inc.latitude, inc.longitude]}
      icon={
        isSelected
          ? createWhiteSelectedMarkerIcon(inc.tracking_number)
          : createSeverityMarkerIcon(inc.priority, inc.risk_score)
      }
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(inc.tracking_number)
      }}
    >
      <Popup className="custom-leaflet-popup" autoPan={false}>
        <div className="p-3.5 space-y-2 text-slate-900 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-lg border border-slate-700 shadow-sm">
                #{inc.tracking_number}
              </span>
              {isSelected && (
                <span className="text-[10px] font-bold bg-white text-slate-900 border border-slate-400 px-1.5 py-0.2 rounded-full shadow-sm">
                  ✓ Selected
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isHigh
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : isMedium
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {severityLabel} Severity
            </span>
          </div>
          <h4 className="font-bold text-xs text-slate-900 leading-snug">
            {inc.title}
          </h4>
          <p className="text-[11px] text-slate-600 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{inc.address_display}</span>
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Status: <strong className="text-slate-800 font-semibold">{inc.status.replace('_', ' ')}</strong></span>
            <span>Risk Score: <strong className="text-slate-800 font-semibold">{inc.risk_score}/100</strong></span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(inc.tracking_number)}
            className="w-full mt-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition shadow-sm"
          >
            Viewing Incident #{inc.tracking_number} Details Below
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

// Map Recenter Helper Component with smooth flight to inspected coordinates
function MapRecenterer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [center, map]);
  return null;
}

export const TrackingPortal: React.FC = () => {
  const {
    incidents,
    selectedIncident,
    selectIncidentByTracking
  } = useCivicPulse();

  // Search and view states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showXaiDrawer, setShowXaiDrawer] = useState<boolean>(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);

  // 3 Exact Filters matching user's uploaded images
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterProblem, setFilterProblem] = useState<string>('ALL');

  const incident = selectedIncident || incidents[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      selectIncidentByTracking(searchQuery.trim());
    }
  };

  // 5-Stage Status Mapping
  const stages = [
    { key: 'SUBMITTED', label: '1. Submitted', desc: 'Complaint received & parsed' },
    { key: 'VERIFIED', label: '2. Verified', desc: 'AI authenticity & damage verified' },
    { key: 'ASSIGNED', label: '3. Assigned', desc: 'Routed to Zone & Department' },
    { key: 'IN_PROGRESS', label: '4. In Progress', desc: 'Maintenance mobilized' },
    { key: 'RESOLVED', label: '5. Resolved', desc: 'Before/After closed-loop confirmed' }
  ];

  const getStageIndex = (status: string) => {
    if (status === 'SUBMITTED') return 0;
    if (status === 'VERIFIED') return 1;
    if (status === 'ASSIGNED') return 2;
    if (status === 'IN_PROGRESS' || status === 'AWAITING_CITIZEN_CONFIRMATION') return 3;
    if (status === 'RESOLVED' || status === 'CLOSED') return 4;
    return 3;
  };

  const currentStageIndex = incident ? getStageIndex(incident.status) : 0;

  // Filter incidents according to the 3 criteria
  const filteredIncidents = incidents.filter((inc) => {
    // 1. Status Filter: All, Reported, Assigned, In Progress, Fixed
    if (filterStatus !== 'All') {
      if (filterStatus === 'Reported' && inc.status !== 'SUBMITTED' && inc.status !== 'VERIFIED') return false;
      if (filterStatus === 'Assigned' && inc.status !== 'ASSIGNED') return false;
      if (filterStatus === 'In Progress' && inc.status !== 'IN_PROGRESS' && inc.status !== 'AWAITING_CITIZEN_CONFIRMATION') return false;
      if (filterStatus === 'Fixed' && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED') return false;
    }

    // 2. Severity / Risk Filter: All, High, Medium, Low
    if (filterSeverity !== 'All') {
      const isHigh = inc.priority === 'P1_CRITICAL' || inc.priority === 'P2_HIGH' || inc.risk_score >= 70;
      const isMedium = inc.priority === 'P3_MEDIUM' || (inc.risk_score >= 40 && inc.risk_score < 70);
      const isLow = inc.priority === 'P4_LOW' || inc.risk_score < 40;

      if (filterSeverity === 'High' && !isHigh) return false;
      if (filterSeverity === 'Medium' && !isMedium) return false;
      if (filterSeverity === 'Low' && !isLow) return false;
    }

    // 3. Problem / Category Filter: All Civic Problems + 7 categories
    if (filterProblem !== 'ALL' && inc.category !== filterProblem) {
      return false;
    }

    return true;
  });

  // Ensure the inspected/selected incident is always visible on the map even if a filter was active
  const displayMarkers = React.useMemo(() => {
    if (!incident) return filteredIncidents;
    if (filteredIncidents.some((i) => i.id === incident.id)) {
      return filteredIncidents;
    }
    return [incident, ...filteredIncidents];
  }, [filteredIncidents, incident]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ================= SECTION 1: LIVE MUNICIPAL ROAD DAMAGE MAP (SCREENSHOT MATCH) ================= */}
      <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl space-y-5 shadow-sm">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🗺️</span>
            <h2 className="text-xl font-black text-[#172B3A] tracking-tight">
              Live Municipal Road Damage Map
            </h2>
          </div>
          <p className="text-xs text-[#64748B]">
            Transparent citizen map of reported road defects with AI severity classification.
          </p>
        </div>

        {/* 3 Filters & Color Legend Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* 3 Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
            {/* Filter 1: Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-[#DCE5EE] hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#172B3A] font-semibold focus:outline-none focus:border-[#13B8C5] focus:bg-white transition cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Reported">Reported</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>

            {/* Filter 2: Severity / Risk */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Filter by Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-slate-50 border border-[#DCE5EE] hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#172B3A] font-semibold focus:outline-none focus:border-[#13B8C5] focus:bg-white transition cursor-pointer"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Filter 3: Category / Civic Problems */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Filter by Problem
              </label>
              <select
                value={filterProblem}
                onChange={(e) => setFilterProblem(e.target.value)}
                className="w-full bg-slate-50 border border-[#DCE5EE] hover:border-slate-300 rounded-xl px-3.5 py-2 text-xs text-[#172B3A] font-semibold focus:outline-none focus:border-[#13B8C5] focus:bg-white transition cursor-pointer"
              >
                <option value="ALL">All Civic Problems</option>
                <option value="POTHOLE_ROAD_DAMAGE">Roads &amp; Potholes</option>
                <option value="GARBAGE_OVERFLOW">Recurring Garbage</option>
                <option value="PUBLIC_TOILET_ISSUES">Public Toilets</option>
                <option value="WATERLOGGING">Waterlogging &amp; Flooding</option>
                <option value="DRAINAGE_WATER_LEAKAGE">Drainage &amp; Sewage</option>
                <option value="BROKEN_STREETLIGHT">Streetlights</option>
                <option value="OPEN_MANHOLE_HAZARDS">Open Manhole Hazards</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold self-start lg:self-center bg-slate-50 px-3.5 py-2 rounded-xl border border-[#DCE5EE] text-[#64748B]">
            <span className="flex items-center space-x-1.5 text-[#172B3A] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#DCE5EE] shadow-sm">
              <span className="text-[#10243A]">●</span>
              <span>White: Inspected</span>
            </span>
            <span className="text-[#DCE5EE]">|</span>
            <span className="flex items-center space-x-1 text-[#DC4C4C]">
              <span>●</span>
              <span>Red: High</span>
            </span>
            <span className="text-[#DCE5EE]">|</span>
            <span className="flex items-center space-x-1 text-orange-500">
              <span>●</span>
              <span>Orange: Medium</span>
            </span>
            <span className="text-[#DCE5EE]">|</span>
            <span className="flex items-center space-x-1 text-[#16A36A]">
              <span>●</span>
              <span>Green: Low</span>
            </span>
          </div>
        </div>

        {/* Counter Text */}
        <div className="text-xs text-[#64748B] font-medium">
          Showing <strong className="text-[#172B3A] font-mono">{filteredIncidents.length}</strong> of{' '}
          <strong className="text-[#172B3A] font-mono">{incidents.length}</strong> incident reports.
        </div>

        {/* Interactive Leaflet Map Container */}
        <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-[#DCE5EE] relative shadow-sm bg-[#F4F7FB] z-0 isolate">
          <MapContainer
            center={[20.2961, 85.8245]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {displayMarkers.map((inc) => (
              <MapIncidentMarker
                key={inc.id}
                inc={inc}
                isSelected={incident?.id === inc.id}
                onSelect={(tracking) => selectIncidentByTracking(tracking)}
              />
            ))}

            {incident && (
              <MapRecenterer center={[incident.latitude, incident.longitude]} />
            )}
          </MapContainer>
        </div>
      </div>

      {/* ================= SECTION 2: SEARCH BAR & SELECTED INCIDENT DETAILS ================= */}
      {incident && (
        <div className="space-y-6">
          {/* Quick Select & Search Header */}
          <div className="bg-white border border-[#DCE5EE] p-5 rounded-2xl space-y-3 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Unique Tracking ID (e.g. CP102, CP103)..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#172B3A] font-mono uppercase focus:border-[#13B8C5] focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#10243A] hover:bg-[#172F49] text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Track Incident
              </button>
            </form>

            {/* Quick select pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-[#64748B] font-semibold">Quick Select:</span>
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => {
                    setSearchQuery(inc.tracking_number);
                    selectIncidentByTracking(inc.tracking_number);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                    incident.tracking_number === inc.tracking_number
                      ? 'bg-[#10243A] text-white border-[#10243A] font-bold shadow-sm'
                      : 'bg-slate-50 text-[#64748B] border-[#DCE5EE] hover:text-[#172B3A]'
                  }`}
                >
                  #{inc.tracking_number} ({inc.category.split('_')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Main Incident Overview Card */}
          <div className="bg-white border border-[#DCE5EE] rounded-3xl p-6 space-y-6 shadow-sm">
            {/* Ticket Header & Risk Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5EE] pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-slate-100 text-[#10243A] rounded-full text-xs font-mono font-bold border border-[#DCE5EE]">
                    #{incident.tracking_number}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {incident.zone_name}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#172B3A]">
                  {incident.title}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {incident.address_display}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    incident.priority === 'P1_CRITICAL'
                      ? 'bg-red-50 text-[#DC4C4C] border-red-200 animate-pulse'
                      : 'bg-amber-50 text-[#E9A23B] border border-amber-200'
                  }`}
                >
                  {incident.priority.replace('_', ' ')} · RISK {incident.risk_score}/100
                </span>
                <span className="text-[11px] text-[#64748B] font-mono">
                  Target SLA: {incident.sla_hours}h ({incident.sla_deadline})
                </span>
              </div>
            </div>

            {/* 5-Stage Visual Progress Timeline */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Real-Time Resolution Pipeline (5 Stages)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={stage.key} className="space-y-1.5 text-center">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCompleted
                            ? 'bg-[#16A36A]'
                            : isCurrent
                            ? 'bg-[#13B8C5] shadow-sm animate-pulse'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`text-[11px] font-bold ${
                          isCurrent
                            ? 'text-[#10243A] font-mono'
                            : isCompleted
                            ? 'text-[#16A36A]'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </div>
                      <div className="text-[9px] text-[#64748B] hidden sm:block">
                        {stage.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department & Zone Jurisdictional Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-[#DCE5EE] text-xs">
              <div className="space-y-1">
                <span className="text-[#64748B] block uppercase font-mono text-[10px] font-semibold">Responsible Department</span>
                <span className="font-semibold text-[#172B3A] flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-[#13B8C5]" />
                  <span>{incident.assigned_department}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[#64748B] block uppercase font-mono text-[10px] font-semibold">Municipal Zone</span>
                <span className="font-semibold text-[#172B3A]">{incident.zone_name.split('—')[0]}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#64748B] block uppercase font-mono text-[10px] font-semibold">Citizen Engagement</span>
                <span className="font-semibold text-[#16A36A] font-mono">
                  {incident.report_count} Reports Merged | {incident.community_upvotes} Upvotes
                </span>
              </div>
            </div>

            {/* Simple, Easy-to-Understand AI Explanation Section */}
            <div className="border border-[#DCE5EE] rounded-3xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setShowXaiDrawer(!showXaiDrawer)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#13B8C5] border border-cyan-200 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-[#13B8C5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172B3A] flex items-center space-x-2">
                      <span>Why Was This Prioritized? (Simple AI Explanation)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-50 text-[#13B8C5] border border-cyan-200 font-semibold">
                        Plain English
                      </span>
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Understand how the AI evaluated risk and urgency in simple terms.
                    </p>
                  </div>
                </div>
                {showXaiDrawer ? (
                  <ChevronUp className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                )}
              </button>

              {showXaiDrawer && (
                <div className="p-5 pt-0 space-y-5 text-xs border-t border-[#DCE5EE]">
                  {/* Top Plain-English Summary Box */}
                  <div className="bg-slate-50 border border-[#DCE5EE] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        Plain English AI Summary
                      </span>
                      <p className="text-sm font-medium text-[#172B3A] leading-relaxed">
                        {incident.priority === 'P1_CRITICAL' ? (
                          <>
                            This issue was marked <strong className="text-[#DC4C4C]">🚨 Urgent (P1 Critical)</strong> because it is a severe hazard right near a sensitive public area (school/hospital) on a busy main road that is getting worse.
                          </>
                        ) : incident.priority === 'P2_HIGH' ? (
                          <>
                            This issue was marked <strong className="text-orange-600">⚠️ High Priority</strong> because it poses a significant commuter risk on an active arterial road corridor.
                          </>
                        ) : (
                          <>
                            This issue was marked <strong className="text-[#E9A23B]">📋 Standard Priority</strong> for scheduled municipal maintenance within standard turnaround.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="bg-white border border-[#DCE5EE] px-4 py-2.5 rounded-xl text-center self-start sm:self-center flex-shrink-0 shadow-sm">
                      <span className="text-[10px] text-[#64748B] block font-medium">Total AI Risk</span>
                      <span className={`text-xl font-black font-mono ${
                        incident.risk_score >= 85 ? 'text-[#DC4C4C]' : incident.risk_score >= 60 ? 'text-orange-600' : 'text-[#E9A23B]'
                      }`}>
                        {incident.risk_score} <span className="text-xs text-[#64748B]">/ 100</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Clear Reasons with Icons */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#172B3A] block">
                      The 4 Reasons Behind the Priority Score:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Reason 1: Defect Size */}
                      <div className="p-3.5 bg-white rounded-2xl border border-[#DCE5EE] space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-cyan-50 text-[#13B8C5] border border-cyan-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold text-[#13B8C5]">
                            +{incident.xai.base_severity} pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#172B3A]">Hazard Size</h4>
                        <p className="text-[11px] text-[#64748B] leading-snug">
                          {incident.xai.base_severity >= 30
                            ? 'Large void or deep defect threatening vehicles & pedestrians.'
                            : 'Surface level defect detected by camera inspection.'}
                        </p>
                      </div>

                      {/* Reason 2: School/Hospital Proximity */}
                      <div className="p-3.5 bg-white rounded-2xl border border-[#DCE5EE] space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-amber-50 text-[#E9A23B] border border-amber-200">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold text-[#E9A23B]">
                            +{incident.xai.proximity_penalty} pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#172B3A]">Near School / Hospital</h4>
                        <p className="text-[11px] text-[#64748B] leading-snug">
                          {incident.xai.proximity_penalty > 0
                            ? 'Located within 200m of a school or hospital safety buffer.'
                            : 'Standard residential or commercial area.'}
                        </p>
                      </div>

                      {/* Reason 3: Road Traffic */}
                      <div className="p-3.5 bg-white rounded-2xl border border-[#DCE5EE] space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-blue-50 text-[#3B82F6] border border-blue-200">
                            <Car className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold text-[#3B82F6]">
                            +{incident.xai.traffic_importance} pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#172B3A]">Road Traffic Flow</h4>
                        <p className="text-[11px] text-[#64748B] leading-snug">
                          {incident.xai.traffic_importance >= 15
                            ? 'High-density arterial road with heavy daily traffic.'
                            : 'Standard local road with moderate traffic flow.'}
                        </p>
                      </div>

                      {/* Reason 4: Worsening Trend */}
                      <div className="p-3.5 bg-white rounded-2xl border border-[#DCE5EE] space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-red-50 text-[#DC4C4C] border border-red-200">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold text-[#DC4C4C]">
                            +{incident.xai.worsening_trend} pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#172B3A]">Getting Worse?</h4>
                        <p className="text-[11px] text-[#64748B] leading-snug">
                          {incident.xai.worsening_trend > 0
                            ? 'Multiple citizen reports confirm damage is actively spreading.'
                            : 'First report logged at this exact location.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2 Simple Citizen Q&A Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Q1: Duplicates */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-[#DCE5EE] space-y-1">
                      <span className="text-[11px] font-bold text-[#172B3A] flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-[#13B8C5]" />
                        <span>Did other citizens report this?</span>
                      </span>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        {incident.reports.length > 1 ? (
                          <>
                            <strong className="text-[#172B3A]">Yes:</strong> {incident.reports.length} nearby citizens reported this same hazard within 14 meters. The AI merged them into this master ticket so municipal workers aren't flooded with duplicates.
                          </>
                        ) : (
                          <>
                            <strong className="text-[#172B3A]">Single Report:</strong> You or another citizen are the first to report this issue at these coordinates.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Q2: Department */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-[#DCE5EE] space-y-1">
                      <span className="text-[11px] font-bold text-[#172B3A] flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-[#13B8C5]" />
                        <span>Who is responsible for fixing it?</span>
                      </span>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Automatically dispatched to <strong className="text-[#172B3A]">{incident.assigned_department}</strong> ({incident.zone_name.split('—')[0] || 'Zone 3'}) with a target SLA of <strong className="text-[#172B3A]">{incident.sla_hours} hours</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Optional Technical AI Drawer for Developers & Judges */}
                  <div className="pt-2 border-t border-[#DCE5EE]">
                    <button
                      type="button"
                      onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                      className="text-[11px] font-mono text-[#64748B] hover:text-[#172B3A] flex items-center space-x-1 transition font-semibold"
                    >
                      <span>{showTechnicalDetails ? '▼ Hide' : '▶ Show'} Advanced Algorithm &amp; Math Telemetry (YOLO, DBSCAN, PostGIS)</span>
                    </button>

                    {showTechnicalDetails && (
                      <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-[#DCE5EE] space-y-2 text-[11px] font-mono text-[#64748B] animate-in fade-in">
                        <div>
                          <strong className="text-[#172B3A]">Raw Narrative:</strong> {incident.xai.summary_narrative}
                        </div>
                        {incident.xai.deduplication_reason && (
                          <div>
                            <strong className="text-[#172B3A]">DBSCAN Spatial Clustering:</strong> {incident.xai.deduplication_reason}
                          </div>
                        )}
                        <div>
                          <strong className="text-[#172B3A]">PostGIS Boundary Routing:</strong> {incident.xai.jurisdiction_rule}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Merged Duplicate Citizen Evidence Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#172B3A] flex items-center space-x-1.5 font-mono uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#13B8C5]" />
                  <span>Consolidated Evidence Gallery ({incident.reports.length} Reports Merged)</span>
                </span>
                {incident.duplicate_match_confidence > 0 && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-[#16A36A] rounded-full font-mono text-[11px] border border-emerald-200 font-semibold">
                    Match Confidence: {incident.duplicate_match_confidence}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incident.reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-50 border border-[#DCE5EE] rounded-2xl p-3.5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#172B3A] flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{report.reporter_alias}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">
                        {report.submitted_at}
                      </span>
                    </div>

                    {/* Media thumbnail */}
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCE5EE] bg-slate-100">
                      <img
                        src={report.media_url}
                        alt={report.reporter_alias}
                        onError={(e) => {
                          const fallbackMap: Record<string, string> = {
                            POTHOLE_ROAD_DAMAGE: '/images/road_pothole_before.jpg',
                            GARBAGE_OVERFLOW: '/images/garbage_before.jpg',
                            BROKEN_STREETLIGHT: '/images/streetlight_before.jpg',
                            DRAINAGE_WATER_LEAKAGE: '/images/drainage_before.jpg',
                            PUBLIC_TOILET_ISSUES: '/images/toilet_before.jpg',
                            WATERLOGGING: '/images/waterlogging_before.jpg',
                            OPEN_MANHOLE_HAZARDS: '/images/manhole_before.jpg'
                          };
                          (e.currentTarget as HTMLImageElement).src = (selectedIncident ? fallbackMap[selectedIncident.category] : null) || '/images/road_pothole_before.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 rounded text-[10px] font-mono text-[#172B3A] shadow-sm border border-[#DCE5EE]">
                        pHash: {report.phash.substring(0, 10)}... | Conf: {report.evidence_confidence}%
                      </div>
                    </div>

                    {/* Multilingual Voice Note Snippet */}
                    {report.original_audio_script && (
                      <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-xl border border-[#DCE5EE]">
                        <div className="text-[#64748B] font-serif">
                          "{report.original_audio_script}"
                        </div>
                        {report.translated_english_text && (
                          <div className="text-[#10243A] font-medium">
                            "{report.translated_english_text}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Closed-Loop Repair Verifier Section */}
            <RepairVerifier incident={incident} />

            {/* Cryptographically Hashed Immutable Audit Log */}
            <div className="border border-[#DCE5EE] rounded-2xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setShowAuditLogs(!showAuditLogs)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-[#16A36A]" />
                  <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider font-mono">
                    Immutable Cryptographic Audit Trail ({incident.audit_logs.length} Blocks)
                  </span>
                </div>
                {showAuditLogs ? (
                  <ChevronUp className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                )}
              </button>

              {showAuditLogs && (
                <div className="p-4 pt-0 space-y-2 border-t border-[#DCE5EE]">
                  {incident.audit_logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-[#DCE5EE] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#10243A] font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[#172B3A]">{log.details}</p>
                      <div className="flex justify-between items-center text-[10px] text-[#64748B] font-mono pt-1">
                        <span>Actor: {log.actor} ({log.actor_role})</span>
                        <span className="text-[#16A36A] font-semibold">{log.cryptographic_hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
