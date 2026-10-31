import React from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  ThumbsUp,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';

export const CommunityConfirm: React.FC = () => {
  const { incidents, confirmIncident, selectIncidentByTracking, setCitizenTab } = useCivicPulse();

  const activeIncidents = incidents.filter(
    (inc) => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#DCE5EE] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-50 text-[#13B8C5] rounded-xl border border-cyan-200">
            <ThumbsUp className="w-6 h-6 text-[#13B8C5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#172B3A]">
              1-Tap Community Confirmation (+1 Upvote)
            </h2>
            <p className="text-xs text-[#64748B]">
              Avoid filing duplicate tickets. If you see an active civic problem already on the map, verify it with 1 tap to increase its municipal priority.
            </p>
          </div>
        </div>
      </div>

      {/* Active Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeIncidents.map((incident) => {
          const isP1 = incident.priority === 'P1_CRITICAL';
          return (
            <div
              key={incident.id}
              className="bg-white border border-[#DCE5EE] hover:border-slate-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#10243A] border border-[#DCE5EE]">
                    #{incident.tracking_number}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                      isP1
                        ? 'bg-red-50 text-[#DC4C4C] border border-red-200 animate-pulse'
                        : 'bg-amber-50 text-[#E9A23B] border border-amber-200'
                    }`}
                  >
                    {incident.priority.replace('_', ' ')} · RISK {incident.risk_score}/100
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#172B3A] line-clamp-2">
                  {incident.title}
                </h3>

                <div className="space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{incident.address_display}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>SLA Deadline: {incident.sla_deadline}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Reports Merged: {incident.report_count} | Upvotes: {incident.community_upvotes}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE5EE] flex items-center space-x-3">
                <button
                  onClick={() => confirmIncident(incident.tracking_number)}
                  className="flex-1 py-2 px-3 bg-[#10243A] hover:bg-[#172F49] text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Confirm (+1 Upvote)</span>
                </button>
                <button
                  onClick={() => {
                    selectIncidentByTracking(incident.tracking_number);
                    setCitizenTab('TRACK');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-[#172B3A] text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 border border-[#DCE5EE] shadow-sm"
                  title="Inspect on live map & view details"
                >
                  <Search className="w-3.5 h-3.5 text-[#13B8C5]" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
