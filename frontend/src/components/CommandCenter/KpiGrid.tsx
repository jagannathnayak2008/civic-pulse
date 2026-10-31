import React from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  FileText,
  CheckCircle2,
  GitMerge,
  Clock,
  AlertOctagon,
  Award
} from 'lucide-react';

export const KpiGrid: React.FC = () => {
  const { kpi } = useCivicPulse();

  /**
   * STRICT NEGATIVE CONSTRAINT AUDIT:
   * Strictly 6 municipal metrics.
   * NO average resolution time.
   * NO predictive analytics.
   * NO digital twin metrics.
   */
  const metrics = [
    {
      id: 'total_reports',
      label: 'Total Incidents',
      value: kpi.total_reports.toLocaleString(),
      subtext: 'Citizen submissions across channels',
      icon: FileText,
      accentColor: '#3B82F6', // Blue
      iconColor: 'text-[#3B82F6]',
      iconBg: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'verified_incidents',
      label: 'Verified Incidents',
      value: kpi.verified_incidents.toLocaleString(),
      subtext: 'Passed AI authenticity criteria',
      icon: CheckCircle2,
      accentColor: '#13B8C5', // Cyan
      iconColor: 'text-[#13B8C5]',
      iconBg: 'bg-cyan-50 border-cyan-200'
    },
    {
      id: 'duplicate_merged',
      label: 'Duplicate Reports',
      value: kpi.duplicate_reports_merged.toLocaleString(),
      subtext: 'Consolidated via DBSCAN + pHash',
      icon: GitMerge,
      accentColor: '#8B5CF6', // Purple / Blue-Grey
      iconColor: 'text-[#8B5CF6]',
      iconBg: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'pending_incidents',
      label: 'Pending Incidents',
      value: kpi.pending_incidents.toLocaleString(),
      subtext: 'Active tickets in dispatch queue',
      icon: Clock,
      accentColor: '#E9A23B', // Amber
      iconColor: 'text-[#E9A23B]',
      iconBg: 'bg-amber-50 border-amber-200'
    },
    {
      id: 'critical_p1',
      label: 'Critical Incidents',
      value: kpi.critical_incidents.toLocaleString(),
      subtext: 'Immediate arterial safety hazards',
      icon: AlertOctagon,
      accentColor: '#DC4C4C', // Red
      iconColor: 'text-[#DC4C4C]',
      iconBg: 'bg-red-50 border-red-200'
    },
    {
      id: 'resolved_incidents',
      label: 'Resolved Incidents',
      value: kpi.resolved_incidents.toLocaleString(),
      subtext: 'Closed with Before/After proof',
      icon: Award,
      accentColor: '#16A36A', // Green
      iconColor: 'text-[#16A36A]',
      iconBg: 'bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-white border border-[#DCE5EE] shadow-sm flex flex-col justify-between transition hover:shadow-md hover:border-slate-300 relative overflow-hidden"
          >
            {/* Subtle top indicator line matching metric semantic color */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: m.accentColor }}
            />
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                {m.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${m.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${m.iconColor}`} />
              </div>
            </div>
            <div className="my-2.5">
              <span className="text-2xl font-black text-[#172B3A] font-mono tracking-tight">
                {m.value}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] truncate font-medium">
              {m.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
