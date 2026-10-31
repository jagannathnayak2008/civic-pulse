import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  Clock,
  AlertTriangle,
  Building,
  Wrench,
  Eye,
  CheckCircle2,
  BellRing
} from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Road Maintenance Department',
  'Sanitation & Solid Waste Management',
  'Public Health & Sanitation Division',
  'Stormwater Management & Flood Unit',
  'Water Supply & Sewerage Board',
  'Electrical & Street Lighting Division',
  'Emergency Civil Infrastructure Unit'
];

export const WorkloadSlaPanel: React.FC = () => {
  const {
    incidents,
    selectIncidentByTracking,
    setOfficerTab,
    setOfficerModalOpen,
    setRepairTargetTracking
  } = useCivicPulse();

  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedDept === 'ALL') return true;
    return inc.assigned_department === selectedDept;
  });

  // Check if any ticket is near breach (< 45 mins) or P1 Critical
  const nearBreachTickets = incidents.filter(
    (inc) =>
      inc.status !== 'RESOLVED' &&
      inc.status !== 'CLOSED' &&
      (inc.priority === 'P1_CRITICAL' || inc.tracking_number === 'CP105')
  );

  return (
    <div className="space-y-6">
      {/* Supervisor Auto-Escalation Alert Banner */}
      {nearBreachTickets.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm">
          <div className="p-2 bg-red-100 text-[#DC4C4C] rounded-xl border border-red-200 animate-pulse">
            <BellRing className="w-5 h-5 text-[#DC4C4C]" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#DC4C4C] uppercase tracking-wider">
                Emergency SLA Auto-Escalation Active ({nearBreachTickets.length} Priority Tickets)
              </h4>
              <span className="text-[10px] font-mono bg-red-100 text-[#DC4C4C] px-2 py-0.5 rounded border border-red-200 font-semibold">
                Supervisor Alert Dispatched
              </span>
            </div>
            <p className="text-xs text-[#DC4C4C] leading-relaxed">
              Ticket <strong className="text-[#172B3A] font-mono">#CP102</strong> (P1 Critical Road Crater) has active 4-hour SLA timer running. Ticket <strong className="text-[#172B3A] font-mono">#CP105</strong> (Industrial Drainage Clog) has under 30 minutes remaining before municipal breach penalty.
            </p>
          </div>
        </div>
      )}

      {/* Department Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-[#DCE5EE] p-3 rounded-2xl shadow-sm">
        <span className="text-xs text-[#64748B] font-mono pl-1 font-bold">Filter Department:</span>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDept === dept
                ? 'bg-[#10243A] text-white shadow-sm font-bold border border-[#10243A]'
                : 'bg-slate-50 text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept.replace(' Department', '')}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-[#DCE5EE] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-[#DCE5EE] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-[#13B8C5]" />
            <h3 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider font-mono">
              Departmental Workload &amp; Live SLA Tracker
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono font-medium">
            {filteredIncidents.length} Tickets in Triage
          </span>
        </div>

        <div className="divide-y divide-[#DCE5EE] overflow-x-auto">
          {filteredIncidents.map((inc) => {
            const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';
            const isP1 = inc.priority === 'P1_CRITICAL';
            const isNearBreach = inc.tracking_number === 'CP105';

            return (
              <div
                key={inc.id}
                className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#10243A] px-2.5 py-0.5 rounded bg-slate-100 border border-[#DCE5EE]">
                      #{inc.tracking_number}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isP1
                          ? 'bg-red-50 text-[#DC4C4C] border border-red-200'
                          : 'bg-amber-50 text-[#E9A23B] border border-amber-200'
                      }`}
                    >
                      {inc.priority.replace('_', ' ')} · RISK {inc.risk_score}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {inc.assigned_department} · {inc.zone_name.split('—')[0]}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#172B3A]">
                    {inc.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                    <span>
                      <strong className="text-[#172B3A]">Reports Merged:</strong> {inc.report_count}
                    </span>
                    <span>
                      <strong className="text-[#172B3A]">Upvotes:</strong> {inc.community_upvotes}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isNearBreach ? 'text-[#DC4C4C] font-bold font-mono' : ''}>
                        Deadline: {inc.sla_deadline}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${
                      isResolved
                        ? 'bg-emerald-50 text-[#16A36A] border-emerald-200'
                        : inc.status === 'AWAITING_CITIZEN_CONFIRMATION'
                        ? 'bg-cyan-50 text-[#13B8C5] border-cyan-200'
                        : isNearBreach
                        ? 'bg-red-50 text-[#DC4C4C] border-red-200 animate-pulse'
                        : 'bg-slate-100 text-[#172B3A] border-[#DCE5EE]'
                    }`}
                  >
                    {inc.status.replace(/_/g, ' ')}
                  </span>

                  <button
                    onClick={() => {
                      selectIncidentByTracking(inc.tracking_number);
                      setOfficerTab('MAP');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="p-2 bg-white hover:bg-slate-100 text-[#172B3A] border border-[#DCE5EE] rounded-xl transition shadow-sm"
                    title="Inspect on Authority Map"
                  >
                    <Eye className="w-4 h-4 text-[#13B8C5]" />
                  </button>

                  {!isResolved && (
                    <button
                      onClick={() => {
                        setRepairTargetTracking(inc.tracking_number);
                        setOfficerModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#16A36A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Verify Repair</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
