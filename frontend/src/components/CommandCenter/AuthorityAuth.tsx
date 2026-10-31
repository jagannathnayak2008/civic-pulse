import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin,
  Layers,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useCivicPulse } from '../../context/CivicPulseContext';

interface AuthorityAuthProps {
  onAuthenticated: () => void;
}

// Custom Leaflet marker icons matching the CivicPulse theme
const createAuthMarkerIcon = (priority: string, status: string, trackingNumber: string) => {
  let color = '#3B82F6';
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
          ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}44; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
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

const ZONE_COLORS = [
  '#3B82F6', // Zone 1
  '#16A36A', // Zone 2
  '#8B5CF6', // Zone 3
  '#E9A23B', // Zone 4
  '#EC4899'  // Zone 5
];

export const AuthorityAuth: React.FC<AuthorityAuthProps> = ({ onAuthenticated }) => {
  const { incidents, zones } = useCivicPulse();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setError('');
      onAuthenticated();
    } else {
      setError('Incorrect password. Please enter the authorized municipal engineer password.');
    }
  };

  const centerLat = 20.2961;
  const centerLon = 85.8245;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* ================= LEFT COLUMN: MUNICIPAL GEOSPATIAL RADAR MAP ================= */}
      <div className="lg:col-span-7 flex flex-col bg-white border border-[#DCE5EE] rounded-3xl overflow-hidden shadow-sm">
        {/* Map Header Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-[#DCE5EE] flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#13B8C5]" />
              <span>Municipal Geospatial Map</span>
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              ({incidents.length} active pins)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-[#16A36A] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A36A]"></span>
              </span>
              <span>Live Sensor Sync</span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-100 text-[#172B3A] border border-[#DCE5EE] text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Authorize Preview
            </span>
          </div>
        </div>

        {/* Leaflet Map Body */}
        <div className="relative w-full h-[480px] sm:h-[520px] z-0 isolate">
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#F4F7FB' }}
          >
            {/* OpenStreetMap tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Municipal Zones Polygons */}
            {zones.map((zone, idx) => (
              <Polygon
                key={zone.zone_id}
                positions={zone.boundary_polygon}
                pathOptions={{
                  color: ZONE_COLORS[idx % ZONE_COLORS.length],
                  weight: 2,
                  dashArray: '4, 4',
                  fillColor: ZONE_COLORS[idx % ZONE_COLORS.length],
                  fillOpacity: 0.12
                }}
              />
            ))}

            {/* Active Incident Markers */}
            {incidents.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={createAuthMarkerIcon(inc.priority, inc.status, inc.tracking_number)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-[#172B3A] font-sans min-w-[220px] max-w-[260px] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-1.5">
                      <span className="font-mono font-bold text-xs text-[#10243A]">
                        {inc.tracking_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          inc.priority === 'P1_CRITICAL'
                            ? 'bg-red-50 text-[#DC4C4C] border border-red-200'
                            : inc.priority === 'P2_HIGH'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-amber-50 text-[#E9A23B] border border-amber-200'
                        }`}
                      >
                        {inc.priority.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#172B3A] line-clamp-2">
                      {inc.title || inc.category}
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{inc.address_display}</span>
                    </div>

                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-[#10243A] flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                      <span>Unlock dashboard to assign crews or triage</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Map Footer Bar */}
        <div className="p-3 bg-slate-50 border-t border-[#DCE5EE] text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3 font-medium">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC4C4C] inline-block"></span>
              <span>P1 Critical</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span>P2 High</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] inline-block"></span>
              <span>P3 Medium</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A] inline-block"></span>
              <span>Resolved</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#64748B]">
            Zones 1–5 Geospatial Grid • OpenStreetMap
          </span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: AUTHORITY AUTH CARD ================= */}
      <div className="lg:col-span-5 bg-white border border-[#DCE5EE] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-[#10243A] rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-100">
              <Lock className="w-8 h-8 text-[#10243A]" />
            </div>
            <h3 className="text-xl font-black text-[#172B3A] tracking-tight">
              🔐 Authority Dashboard Access
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Restricted municipal engineer console for road inspection, priority triage, contractor dispatch, and repair verification.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#172B3A] block mb-1.5">
                Authority Access Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter authority access password..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#172B3A] font-mono focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#172B3A] transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-xs text-[#DC4C4C] flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#10243A] hover:bg-[#172F49] text-white font-bold text-xs rounded-xl transition shadow-md shadow-slate-300/40 flex items-center justify-center space-x-2"
            >
              <span>Unlock Authority Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Capabilities Checklist */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-[#DCE5EE] text-[11px] text-[#64748B] space-y-2">
          <span className="font-bold text-[#172B3A] block flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
            <span>Authorized Officer Capabilities:</span>
          </span>
          <ul className="space-y-1.5 text-[#64748B] pl-1">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#13B8C5] flex-shrink-0 mt-0.5" />
              <span>Full triage console: review YOLO defect telemetry &amp; DBSCAN merges</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#13B8C5] flex-shrink-0 mt-0.5" />
              <span>Manage P1 Critical emergency dispatches within 4h SLA clock</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#13B8C5] flex-shrink-0 mt-0.5" />
              <span>Update repair status (In Progress / Fixed) &amp; verify with SSIM camera</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
