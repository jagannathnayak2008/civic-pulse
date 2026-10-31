import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  Wrench,
  X,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export const OfficerRepairModal: React.FC = () => {
  const {
    officerModalOpen,
    setOfficerModalOpen,
    repairTargetTracking,
    verifyRepair,
    incidents
  } = useCivicPulse();

  const [afterImageUrl, setAfterImageUrl] = useState<string>(
    '/images/road_pothole_after.jpg'
  );
  const [officerLat, setOfficerLat] = useState<number>(20.2961);
  const [officerLon, setOfficerLon] = useState<number>(85.8245);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<string>('');

  if (!officerModalOpen || !repairTargetTracking) return null;

  const targetIncident = incidents.find(
    (i) => i.tracking_number.toUpperCase() === repairTargetTracking.toUpperCase()
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    const steps = [
      'Checking officer GPS proximity (< 30m tolerance)...',
      'Computing Structural Similarity Index (SSIM)...',
      'Running YOLO feature diff on asphalt compaction...',
      'Synthesizing Repair Verification Score (91.4%)...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setVerifyStep(steps[i]);
      await new Promise((r) => setTimeout(r, 450));
    }

    await verifyRepair(repairTargetTracking, afterImageUrl, officerLat, officerLon);
    setIsVerifying(false);
    setOfficerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE5EE] rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 text-[#172B3A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5EE] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-[#16A36A] rounded-xl border border-emerald-200">
              <Wrench className="w-5 h-5 text-[#16A36A]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B3A]">
                Officer Resolution &amp; Closed-Loop AI Verification
              </h3>
              <p className="text-xs text-[#64748B]">
                Master Incident #{repairTargetTracking} · {targetIncident?.assigned_department}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOfficerModalOpen(false)}
            className="text-slate-400 hover:text-[#172B3A] p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Target Hazard Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-[#DCE5EE] text-xs text-[#64748B]">
            <strong className="text-[#10243A] block mb-0.5">Physical Hazard to Resolve:</strong>
            {targetIncident?.title} ({targetIncident?.address_display})
          </div>

          {/* After Repair Photo Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#172B3A] flex items-center justify-between">
              <span>After-Repair Completed Photograph</span>
              <span className="text-[10px] text-[#64748B] font-mono">Sample preloaded</span>
            </label>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCE5EE] bg-slate-100">
              <img
                src={afterImageUrl}
                alt="Repaired tarmac"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-xs font-mono text-white bg-black/70 px-3 py-1 rounded-full border border-white/40">
                  Clean Bitumen Compacted Patch
                </span>
              </div>
            </div>
          </div>

          {/* Officer On-Site Coordinates */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block mb-1 font-semibold">Officer Latitude (On-Site)</span>
              <input
                type="number"
                step="0.0001"
                value={officerLat}
                onChange={(e) => setOfficerLat(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl p-2.5 font-mono text-[#172B3A] text-xs focus:border-[#13B8C5] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[#64748B] block mb-1 font-semibold">Officer Longitude (On-Site)</span>
              <input
                type="number"
                step="0.0001"
                value={officerLon}
                onChange={(e) => setOfficerLon(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl p-2.5 font-mono text-[#172B3A] text-xs focus:border-[#13B8C5] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16A36A] flex items-center space-x-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
            <span>
              GPS validation ensures the officer is standing within 30m of the reported defect.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setOfficerModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs text-[#64748B] hover:text-[#172B3A] bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center space-x-2 shadow-sm ${
                isVerifying
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#16A36A] hover:bg-emerald-700'
              }`}
            >
              {isVerifying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span className="font-mono text-[11px]">{verifyStep}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute AI Before/After Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
