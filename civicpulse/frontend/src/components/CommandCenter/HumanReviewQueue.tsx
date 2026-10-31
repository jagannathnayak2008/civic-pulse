import React from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Camera,
  FileSearch
} from 'lucide-react';

export const HumanReviewQueue: React.FC = () => {
  const { incidents, approveReviewItem, selectIncidentByTracking, setOfficerTab } = useCivicPulse();

  // Find incidents that have reports flagged for human review
  const flaggedIncidents = incidents.filter((inc) =>
    inc.reports.some((r) => r.flagged_for_human_review)
  );

  return (
    <div className="space-y-6">
      {/* Guardrail Policy Notice */}
      <div className="bg-white border border-[#DCE5EE] p-5 rounded-2xl flex items-start space-x-3.5 shadow-sm">
        <div className="p-2.5 bg-amber-50 text-[#E9A23B] rounded-xl border border-amber-200 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-[#E9A23B]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#172B3A]">
            Human-in-the-Loop Safeguard &amp; Evidence Audit Queue
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            <strong className="text-[#172B3A]">CivicPulse Policy:</strong> The autonomous AI system never auto-rejects citizen complaints based on low vision confidence or lighting degradation alone. Items with &lt; 70% evidence confidence or metadata anomalies are routed here for officer verification.
          </p>
        </div>
      </div>

      {/* Review Queue List */}
      {flaggedIncidents.length === 0 ? (
        <div className="bg-white border border-[#DCE5EE] p-12 rounded-2xl text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-[#16A36A] mx-auto" />
          <h4 className="text-base font-bold text-[#172B3A]">
            Human Review Queue Clear
          </h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            All submitted citizen media evidence meets high-confidence authenticity criteria (pHash, EXIF, and sharpness &gt; 70%).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedIncidents.map((incident) => {
            const flaggedReport = incident.reports.find((r) => r.flagged_for_human_review);
            if (!flaggedReport) return null;

            return (
              <div
                key={incident.id}
                className="bg-white border border-[#DCE5EE] rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE5EE] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#10243A] px-2.5 py-0.5 rounded bg-slate-100 border border-[#DCE5EE]">
                        #{incident.tracking_number}
                      </span>
                      <span className="text-xs text-[#E9A23B] font-mono font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        FLAGGED: CONFIDENCE {flaggedReport.evidence_confidence}% (&lt; 70%)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#172B3A]">
                      {incident.title}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      {incident.address_display}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => approveReviewItem(incident.tracking_number)}
                      className="px-4 py-2 bg-[#16A36A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Evidence</span>
                    </button>
                    <button
                      onClick={() => {
                        selectIncidentByTracking(incident.tracking_number);
                        setOfficerTab('MAP');
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="p-2 bg-white hover:bg-slate-100 text-[#172B3A] border border-[#DCE5EE] rounded-xl transition shadow-sm"
                      title="Inspect on Authority Map"
                    >
                      <Eye className="w-4 h-4 text-[#13B8C5]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Media Inspection Thumbnail */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#64748B] font-mono uppercase block font-semibold">
                      Uploaded Night Media
                    </span>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCE5EE] bg-slate-100">
                      <img
                        src={flaggedReport.media_url}
                        alt="Flagged evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* AI Diagnostic Breakdown */}
                  <div className="space-y-2 md:col-span-2 text-xs">
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                      <div className="flex items-center space-x-2 text-[#E9A23B] font-bold">
                        <AlertTriangle className="w-4 h-4 text-[#E9A23B]" />
                        <span>AI Triage Trigger Reason:</span>
                      </div>
                      <p className="text-[#172B3A] leading-relaxed">
                        {flaggedReport.review_reason}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg border border-[#DCE5EE]">
                        <span className="text-[10px] text-[#64748B] block">Blur Score</span>
                        <span className="font-mono font-bold text-[#172B3A]">
                          {flaggedReport.image_quality} Quality
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-[#DCE5EE]">
                        <span className="text-[10px] text-[#64748B] block">GPS Match</span>
                        <span className="font-mono font-bold text-[#16A36A]">
                          {flaggedReport.location_consistency}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-[#DCE5EE]">
                        <span className="text-[10px] text-[#64748B] block">pHash Signature</span>
                        <span className="font-mono font-bold text-[#172B3A]">
                          {flaggedReport.phash.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
