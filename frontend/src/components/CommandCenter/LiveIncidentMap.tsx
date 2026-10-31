import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { MasterIncident } from '../../types/civicpulse';
import {
  Layers,
  Flame,
  Filter,
  CheckCircle2,
  Wrench,
  Eye,
  Building,
  AlertTriangle
} from 'lucide-react';

// Create high-contrast SVG div-icons for Leaflet
const createCustomIcon = (priority: string, status: string, trackingNumber: string) => {
  let color = '#3B82F6'; // P4 Blue
  let pulse = false;

  if (status === 'RESOLVED' || status === 'CLOSED') {
    color = '#16A36A'; // Emerald Green
  } else if (priority === 'P1_CRITICAL') {
    color = '#DC4C4C'; // Red
    pulse = true;
  } else if (priority === 'P2_HIGH') {
    color = '#F97316'; // Orange
  } else if (priority === 'P3_MEDIUM') {
    color = '#E9A23B'; // Amber
  }

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        pulse
          ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${color}33; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(16,36,58,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; font-family: monospace;">
        ${trackingNumber.replace('CP', '')}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
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
        <div style="position: absolute; top: -14px; background: #FFFFFF; color: #10243A; font-weight: 900; font-family: monospace; font-size: 11px; padding: 2px 7px; border-radius: 9999px; border: 2px solid #10243A; box-shadow: 0 0 16px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(16,36,58,0.4); white-space: nowrap; z-index: 10;">
          #${trackingNumber}
        </div>

        <!-- Pure White Marker Teardrop Pin -->
        <div style="filter: drop-shadow(0 0 16px rgba(255, 255, 255, 1)) drop-shadow(0 4px 10px rgba(16,36,58,0.3)); transform: scale(1.15);">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.611 0 0 7.611 0 17C0 28.5 17 44 17 44C17 44 34 28.5 34 17C34 7.611 26.389 0 17 0Z" fill="#FFFFFF" stroke="#10243A" stroke-width="1.8"/>
            <circle cx="17" cy="16" r="9.5" fill="#10243A"/>
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

// Map Recenter Helper Component with smooth flight to inspected coordinates
const MapRecenterer: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [center[0], center[1], map]);
  return null;
};

// Individual Marker Component with automatic popup and status update for Authorize Map
interface AuthorizeIncidentMarkerProps {
  inc: MasterIncident;
  isSelected: boolean;
  onSelect: (tracking: string) => void;
  updateIncidentStatus: (tracking: string, status: string, notes?: string) => void;
  setRepairTargetTracking: (tracking: string) => void;
  setOfficerModalOpen: (open: boolean) => void;
}

const AuthorizeIncidentMarker: React.FC<AuthorizeIncidentMarkerProps> = ({
  inc,
  isSelected,
  onSelect,
  updateIncidentStatus,
  setRepairTargetTracking,
  setOfficerModalOpen
}) => {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      const timer = setTimeout(() => {
        markerRef.current?.openPopup();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSelected, inc.id]);

  return (
    <Marker
      ref={markerRef}
      position={[inc.latitude, inc.longitude]}
      icon={
        isSelected
          ? createWhiteSelectedMarkerIcon(inc.tracking_number)
          : createCustomIcon(inc.priority, inc.status, inc.tracking_number)
      }
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(inc.tracking_number)
      }}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-3 text-[#172B3A] font-sans min-w-[250px] max-w-[290px] space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-2">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold text-xs text-[#10243A]">
                #{inc.tracking_number}
              </span>
              {isSelected && (
                <span className="text-[10px] font-bold bg-white text-[#10243A] border border-[#10243A] px-1.5 py-0.2 rounded-full shadow-sm">
                  ✓ Inspected
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                  ? 'bg-emerald-50 text-[#16A36A] border border-emerald-200'
                  : inc.priority === 'P1_CRITICAL'
                  ? 'bg-red-50 text-[#DC4C4C] border border-red-200'
                  : 'bg-amber-50 text-[#E9A23B] border border-amber-200'
              }`}
            >
              {inc.priority.replace('_', ' ')}
            </span>
          </div>

          {/* Defect Title & Address */}
          <div>
            <h4 className="font-bold text-xs text-[#172B3A] line-clamp-1">
              {inc.title}
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {inc.address_display}
            </p>
          </div>

          {/* AI & Reports Badge */}
          <div className="bg-slate-50 p-2 rounded-xl text-[11px] space-y-1 text-[#64748B] border border-[#DCE5EE]">
            <div className="flex justify-between">
              <span>Risk Score:</span>
              <strong className="text-[#172B3A] font-mono">
                {inc.risk_score}/100
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Department:</span>
              <strong className="text-[#10243A] font-bold truncate max-w-[140px]">
                {inc.assigned_department}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Reports Merged:</span>
              <strong className="text-[#172B3A]">
                {inc.report_count} citizen submissions
              </strong>
            </div>
            <div className="flex justify-between">
              <span>SLA Clock:</span>
              <strong className="text-[#3B82F6] font-mono">
                {inc.sla_deadline}
              </strong>
            </div>
          </div>

          {/* Quick 1-Click Status Update Buttons Inside Popup */}
          <div className="pt-1.5 border-t border-[#DCE5EE] space-y-1.5">
            <div className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
              Authorize Status Update:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => updateIncidentStatus(inc.tracking_number, 'IN_PROGRESS')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                  inc.status === 'IN_PROGRESS' || inc.status === 'AWAITING_CITIZEN_CONFIRMATION'
                    ? 'bg-[#E9A23B] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-amber-50 text-[#E9A23B] border border-[#DCE5EE]'
                }`}
              >
                🟡 In Progress
              </button>
              <button
                onClick={() => updateIncidentStatus(inc.tracking_number, 'RESOLVED')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                  inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                    ? 'bg-[#16A36A] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-emerald-50 text-[#16A36A] border border-[#DCE5EE]'
                }`}
              >
                🟢 Mark Fixed
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-[#DCE5EE]">
            <button
              onClick={() => onSelect(inc.tracking_number)}
              className="text-[11px] font-bold text-[#10243A] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-[#DCE5EE] flex items-center space-x-1"
            >
              <Eye className="w-3 h-3 text-[#13B8C5]" />
              <span>{isSelected ? '✓ Inspected' : 'Inspect Details'}</span>
            </button>

            {inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && (
              <button
                onClick={() => {
                  setRepairTargetTracking(inc.tracking_number);
                  setOfficerModalOpen(true);
                }}
                className="px-2.5 py-1 bg-[#16A36A] hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition flex items-center space-x-1 shadow-sm"
              >
                <Wrench className="w-3 h-3" />
                <span>Verify Repair</span>
              </button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const ZONE_COLORS = [
  '#3B82F6', // Zone 1
  '#16A36A', // Zone 2
  '#8B5CF6', // Zone 3 (Metro)
  '#E9A23B', // Zone 4
  '#EC4899'  // Zone 5
];

export const LiveIncidentMap: React.FC = () => {
  const {
    incidents,
    selectedIncident,
    zones,
    selectIncidentByTracking,
    setOfficerModalOpen,
    setRepairTargetTracking,
    updateIncidentStatus
  } = useCivicPulse();

  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Filtered incidents
  const displayedIncidents = incidents.filter((inc) => {
    if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return false;
    if (filterCategory !== 'ALL' && inc.category !== filterCategory) return false;
    return true;
  });

  const centerLat = 20.2961;
  const centerLon = 85.8245;

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <div className="bg-white border border-[#DCE5EE] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px] relative">
        {/* Map Control Bar Overlay */}
        <div className="p-3 bg-slate-50 border-b border-[#DCE5EE] flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#13B8C5]" />
              <span>Municipal Geospatial Console</span>
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              ({displayedIncidents.length} active pins shown)
            </span>
          </div>

          {/* Toggles & Filter Pills */}
          <div className="flex items-center space-x-2">
            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-[#DCE5EE] text-[#172B3A] text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-[#13B8C5]"
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

            {/* Priority filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-[#DCE5EE] text-xs">
              {['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterPriority(tier)}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    filterPriority === tier
                      ? 'bg-[#10243A] text-white font-bold'
                      : 'text-[#64748B] hover:text-[#172B3A]'
                  }`}
                >
                  {tier === 'ALL' ? 'All Tiers' : tier.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Zone toggle */}
            <button
              onClick={() => setShowZones(!showZones)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showZones
                  ? 'bg-[#10243A] text-white border-[#10243A]'
                  : 'bg-white text-[#64748B] border-[#DCE5EE]'
              }`}
            >
              Zones 1–5
            </button>

            {/* Severity Heatmap toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 ${
                showHeatmap
                  ? 'bg-red-50 text-[#DC4C4C] border-red-200 animate-pulse font-bold'
                  : 'bg-white text-[#64748B] border-[#DCE5EE]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heatmap Overlay</span>
            </button>
          </div>
        </div>

        {/* Leaflet Map Body */}
        <div className="flex-1 w-full h-full relative z-0 isolate">
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#F4F7FB' }}
          >
            {/* OpenStreetMap tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Municipal Zones 1-5 Polygons */}
            {showZones &&
              zones.map((zone, idx) => (
                <Polygon
                  key={zone.zone_id}
                  positions={zone.boundary_polygon}
                  pathOptions={{
                    color: ZONE_COLORS[idx % ZONE_COLORS.length],
                    weight: 2,
                    dashArray: '4, 4',
                    fillColor: ZONE_COLORS[idx % ZONE_COLORS.length],
                    fillOpacity: showHeatmap ? 0.05 : 0.12
                  }}
                />
              ))}

            {/* Simulated Severity Heatmap Circles */}
            {showHeatmap &&
              incidents.map((inc) => (
                <Circle
                  key={`heat-${inc.id}`}
                  center={[inc.latitude, inc.longitude]}
                  radius={inc.priority === 'P1_CRITICAL' ? 380 : 220}
                  pathOptions={{
                    color: inc.priority === 'P1_CRITICAL' ? '#DC4C4C' : '#F97316',
                    fillColor: inc.priority === 'P1_CRITICAL' ? '#DC4C4C' : '#F97316',
                    fillOpacity: 0.28,
                    weight: 0
                  }}
                />
              ))}

            {/* Sensitive Location Buffers */}
            <Circle
              center={[20.2968, 85.8248]}
              radius={200}
              pathOptions={{
                color: '#DC4C4C',
                fillColor: '#DC4C4C',
                fillOpacity: 0.1,
                weight: 1.5,
                dashArray: '6, 6'
              }}
            />

            {/* Master Incidents Pins with White Inspect Highlighting */}
            {displayedIncidents.map((inc) => (
              <AuthorizeIncidentMarker
                key={inc.id}
                inc={inc}
                isSelected={selectedIncident?.tracking_number === inc.tracking_number}
                onSelect={(tracking) => selectIncidentByTracking(tracking)}
                updateIncidentStatus={updateIncidentStatus}
                setRepairTargetTracking={setRepairTargetTracking}
                setOfficerModalOpen={setOfficerModalOpen}
              />
            ))}

            {selectedIncident && (
              <MapRecenterer center={[selectedIncident.latitude, selectedIncident.longitude]} />
            )}
          </MapContainer>
        </div>
      </div>

      {/* ================= SIMPLE INCIDENT STATUS MANAGER ================= */}
      <div className="bg-white border border-[#DCE5EE] rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE5EE] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#13B8C5]" />
              <span>Simple Incident Status Manager</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              1-Click status updates: change tickets to <strong>In Progress</strong>, <strong>Fixed</strong>, or <strong>Assigned</strong>.
            </p>
          </div>
          <span className="text-xs font-mono text-[#10243A] font-bold bg-slate-100 px-3 py-1 rounded-full border border-[#DCE5EE] self-start sm:self-auto">
            {displayedIncidents.length} Active Tickets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {displayedIncidents.map((inc) => {
            const isHigh = inc.priority === 'P1_CRITICAL' || inc.priority === 'P2_HIGH' || inc.risk_score >= 70;
            const isInProgress = inc.status === 'IN_PROGRESS' || inc.status === 'AWAITING_CITIZEN_CONFIRMATION';
            const isFixed = inc.status === 'RESOLVED' || inc.status === 'CLOSED';

            return (
              <div
                key={inc.id}
                className="bg-slate-50 border border-[#DCE5EE] hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-white text-[#10243A] border border-[#DCE5EE]">
                      #{inc.tracking_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isFixed
                          ? 'bg-emerald-50 text-[#16A36A] border border-emerald-200'
                          : isInProgress
                          ? 'bg-amber-50 text-[#E9A23B] border border-amber-200'
                          : isHigh
                          ? 'bg-red-50 text-[#DC4C4C] border border-red-200 animate-pulse'
                          : 'bg-blue-50 text-[#3B82F6] border border-blue-200'
                      }`}
                    >
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#172B3A] line-clamp-1">{inc.title}</h4>
                  <p className="text-[11px] text-[#64748B] truncate">{inc.address_display}</p>
                </div>

                {/* 1-Click Status Action Buttons */}
                <div className="pt-2 border-t border-[#DCE5EE] flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => updateIncidentStatus(inc.tracking_number, 'IN_PROGRESS')}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      isInProgress
                        ? 'bg-[#E9A23B] text-white shadow-sm'
                        : 'bg-white hover:bg-amber-50 text-[#E9A23B] border border-[#DCE5EE]'
                    }`}
                  >
                    <span>🟡 In Progress</span>
                  </button>

                  <button
                    onClick={() => updateIncidentStatus(inc.tracking_number, 'RESOLVED')}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      isFixed
                        ? 'bg-[#16A36A] text-white shadow-sm'
                        : 'bg-white hover:bg-emerald-50 text-[#16A36A] border border-[#DCE5EE]'
                    }`}
                  >
                    <span>🟢 Mark Fixed</span>
                  </button>

                  <button
                    onClick={() => {
                      selectIncidentByTracking(inc.tracking_number);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition shadow-sm flex items-center space-x-1 border ${
                      selectedIncident?.tracking_number === inc.tracking_number
                        ? 'bg-[#10243A] text-white border-[#10243A]'
                        : 'bg-white hover:bg-slate-100 text-[#172B3A] border-[#DCE5EE]'
                    }`}
                    title="Inspect on live map"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#13B8C5]" />
                    <span className="text-[11px] font-bold">Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
