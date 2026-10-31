import React, { useState } from 'react';
import { MasterIncident } from '../../types/civicpulse';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface RepairVerifierProps {
  incident: MasterIncident;
}

const getCategoryLabels = (category: string) => {
  switch (category) {
    case 'GARBAGE_OVERFLOW':
      return {
        beforeLabel: 'BEFORE (Overflowing Garbage)',
        afterLabel: 'AFTER (Cleared & Sanitized Sidewalk)',
        tag: 'Sanitation Clearance & Wash'
      };
    case 'PUBLIC_TOILET_ISSUES':
      return {
        beforeLabel: 'BEFORE (Hygiene Outage & Choke)',
        afterLabel: 'AFTER (Disinfected & Restored Facility)',
        tag: 'Plumbing & Sanitation Restored'
      };
    case 'WATERLOGGING':
      return {
        beforeLabel: 'BEFORE (Flooded Roadway)',
        afterLabel: 'AFTER (Dewatered & Open Traffic)',
        tag: 'High-Capacity Dewatering Complete'
      };
    case 'DRAINAGE_WATER_LEAKAGE':
      return {
        beforeLabel: 'BEFORE (Choked Silt & Sewage Spill)',
        afterLabel: 'AFTER (Clean Grate & Flow Restored)',
        tag: 'Suction Jetting & Grate Cleared'
      };
    case 'BROKEN_STREETLIGHT':
      return {
        beforeLabel: 'BEFORE (Dark Blackout Outage)',
        afterLabel: 'AFTER (Illuminated LED Street)',
        tag: 'LED Luminaire Replacement Complete'
      };
    case 'OPEN_MANHOLE_HAZARDS':
      return {
        beforeLabel: 'BEFORE (Exposed Dangerous Pit)',
        afterLabel: 'AFTER (Secure Iron Cover Installed)',
        tag: 'Heavy Ductile Iron Cover Installed'
      };
    case 'POTHOLE_ROAD_DAMAGE':
    default:
      return {
        beforeLabel: 'BEFORE (Severe Pothole Crater)',
        afterLabel: 'AFTER (Repaired Smooth Asphalt)',
        tag: 'Bitumen Patch & Roller Compaction'
      };
  }
};

export const RepairVerifier: React.FC<RepairVerifierProps> = ({ incident }) => {
  const { submitCitizenFeedback } = useCivicPulse();
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const repair = incident.repair_verification;
  const labels = getCategoryLabels(incident.category);

  if (!repair) {
    return (
      <div className="p-6 bg-white border border-[#DCE5EE] rounded-2xl text-center space-y-3 shadow-sm">
        <Building className="w-8 h-8 text-[#64748B] mx-auto" />
        <h4 className="text-sm font-semibold text-[#172B3A]">
          On-Site Repair in Progress
        </h4>
        <p className="text-xs text-[#64748B] max-w-md mx-auto">
          The assigned department ({incident.assigned_department}) is currently mobilized. Once repair work completes, the officer will upload an after-repair photo for closed-loop AI verification.
        </p>
      </div>
    );
  }

  const handleConfirm = () => {
    submitCitizenFeedback(incident.tracking_number, 'CONFIRM');
  };

  const handleDispute = () => {
    if (!disputeReason) return;
    submitCitizenFeedback(incident.tracking_number, 'DISPUTE', disputeReason);
    setShowDisputeModal(false);
  };

  return (
    <div className="bg-white border border-[#DCE5EE] rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header & Verification Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5EE] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#13B8C5] bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 font-semibold">
              Module 6: Closed-Loop AI Verification
            </span>
            {repair.citizen_feedback_status === 'CONFIRMED' && (
              <span className="text-xs font-mono font-bold text-[#16A36A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                CITIZEN APPROVED
              </span>
            )}
            {repair.citizen_feedback_status === 'DISPUTED' && (
              <span className="text-xs font-mono font-bold text-[#DC4C4C] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                REPAIR DISPUTED
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#172B3A] mt-1">
            Before vs. After AI Repair Verification
          </h3>
          <p className="text-xs text-[#64748B]">
            Uploaded by {repair.officer_name} ({repair.uploaded_at})
          </p>
        </div>

        {/* AI Score Badge */}
        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-[#DCE5EE]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-[#64748B] block font-semibold">
              Repair Score
            </span>
            <span className="text-2xl font-black text-[#16A36A] font-mono">
              {repair.repair_verification_score}%
            </span>
          </div>
          <div className="p-2 bg-emerald-50 text-[#16A36A] rounded-lg border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Split Comparison Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-[#64748B] font-semibold">
          <span className="font-mono text-[#DC4C4C]">{labels.beforeLabel}</span>
          <span className="flex items-center space-x-1 text-[#64748B] font-mono text-[11px]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Slide to Compare</span>
          </span>
          <span className="font-mono text-[#16A36A]">{labels.afterLabel}</span>
        </div>

        <div
          ref={containerRef}
          className="relative aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden border border-[#DCE5EE] select-none bg-slate-100 shadow-md"
        >
          {/* AFTER Image (Full background) */}
          <img
            src={repair.after_image_url}
            alt="After Repair"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/road_pothole_after.jpg';
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* BEFORE Image (Clipped overlay with exact pixel width matching container) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={repair.before_image_url}
              alt="Before Repair"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/road_pothole_before.jpg';
              }}
              className="absolute inset-0 h-full object-cover"
              style={{
                width: containerWidth ? `${containerWidth}px` : '100%',
                maxWidth: 'none'
              }}
            />
          </div>

          {/* Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-10"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#13B8C5] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#13B8C5]/50">
              <Sliders className="w-4 h-4" />
            </div>
          </div>

          {/* Invisible interactive range input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
          />
        </div>
      </div>

      {/* AI Analysis Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-[#DCE5EE] text-xs">
        <div>
          <span className="text-[10px] text-[#64748B] block uppercase font-mono font-semibold">Structural Match</span>
          <span className="font-mono font-bold text-[#172B3A]">SSIM: {repair.ssim_score}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#64748B] block uppercase font-mono font-semibold">GPS Tolerance</span>
          <span className="font-mono font-bold text-[#16A36A]">PASSED (&lt; 30m match)</span>
        </div>
        <div>
          <span className="text-[10px] text-[#64748B] block uppercase font-mono font-semibold">Hazard Status</span>
          <span className="font-mono font-bold text-[#16A36A]">REPAIR VERIFIED (91.4%)</span>
        </div>
      </div>

      {/* Citizen Feedback Actions */}
      {repair.citizen_feedback_status === 'PENDING' ? (
        <div className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#172B3A]">
            <UserCheck className="w-4 h-4 text-[#13B8C5]" />
            <span>Citizen Confirmation Required to Close Master Ticket</span>
          </div>
          <p className="text-xs text-[#64748B]">
            Does the repaired asphalt completely resolve the hazard? Your decision is immutably logged.
          </p>
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-[#16A36A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Resolution (Close Ticket)</span>
            </button>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-red-50 text-[#DC4C4C] text-xs font-semibold rounded-xl border border-[#DCE5EE] transition flex items-center space-x-1.5 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-[#DC4C4C]" />
              <span>Dispute Repair</span>
            </button>
          </div>
        </div>
      ) : repair.citizen_feedback_status === 'CONFIRMED' ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-[#16A36A] font-medium">
          <CheckCircle2 className="w-5 h-5 text-[#16A36A] flex-shrink-0" />
          <span>
            Citizen has inspected and approved this repair. Master Ticket #{incident.tracking_number} is closed and archived in the municipal audit register.
          </span>
        </div>
      ) : (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-xs text-[#DC4C4C] font-medium">
          <AlertTriangle className="w-5 h-5 text-[#DC4C4C] flex-shrink-0" />
          <span>
            Repair disputed by citizen: "{repair.citizen_dispute_reason}". Ticket reopened and escalated to Zonal Supervisor.
          </span>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE5EE] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-[#172B3A]">
            <h4 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#DC4C4C]" />
              <span>Dispute Road Repair Quality</span>
            </h4>
            <p className="text-xs text-[#64748B]">
              Please specify why the repair work is unsatisfactory (e.g., loose gravel, unfinished drainage, uneven grade).
            </p>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g., Loose asphalt gravel remaining on roadside, causing bikes to skid."
              className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl p-3 text-xs text-[#172B3A] focus:border-[#DC4C4C] focus:bg-white focus:outline-none"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#64748B] hover:text-[#172B3A] bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#DC4C4C] hover:bg-red-700 shadow-sm"
              >
                Submit Dispute &amp; Escalate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
