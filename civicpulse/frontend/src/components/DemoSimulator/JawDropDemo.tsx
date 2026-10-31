import React, { useEffect, useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Film,
  Scan,
  GitMerge,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  AlertTriangle,
  Sliders
} from 'lucide-react';

export const JawDropDemo: React.FC = () => {
  const {
    demoStep,
    setDemoStep,
    demoAutoPlaying,
    toggleDemoAutoPlay,
    resetDemo,
    incidents,
    selectIncidentByTracking,
    verifyRepair,
    submitCitizenFeedback,
    setRole,
    setCitizenTab
  } = useCivicPulse();

  const [stepTimerSeconds, setStepTimerSeconds] = useState<number>(18); // 5 steps x 18s = 90s
  const [sliderPos, setSliderPos] = useState<number>(50);

  const cp102 = incidents.find((i) => i.tracking_number === 'CP102') || incidents[0];

  // 90-Second Auto-play loop
  useEffect(() => {
    let interval: any = null;
    if (demoAutoPlaying) {
      interval = setInterval(() => {
        setStepTimerSeconds((prev) => {
          if (prev <= 1) {
            setDemoStep(demoStep >= 5 ? 1 : demoStep + 1);
            return 18;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setStepTimerSeconds(18);
    }
    return () => clearInterval(interval);
  }, [demoAutoPlaying, demoStep, setDemoStep]);

  const stepMeta = [
    {
      num: 1,
      title: '01 — Multimodal Ingestion',
      subtitle: 'Citizen A Video + Odia Voice + GPS',
      icon: Film,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      num: 2,
      title: '02 — AI Vision & XAI Risk',
      subtitle: 'YOLO 94% + Risk Score 92/100 (P1)',
      icon: Scan,
      color: 'from-red-500 to-amber-500'
    },
    {
      num: 3,
      title: '03 — AI Duplicate Merge',
      subtitle: 'Citizen B 10:20 AM (DBSCAN 96% Match)',
      icon: GitMerge,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      num: 4,
      title: '04 — Autonomous Routing',
      subtitle: 'Zone 3 Road Maint. + 4h SLA Active',
      icon: Building,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      num: 5,
      title: '05 — Before/After Verification',
      subtitle: 'AI Repair 91% + Citizen Confirmation',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 90-Second Live Demo Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg shadow-amber-500/10">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>90-SECOND LIVE DEMO SIMULATOR</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Flagship Incident #CP102
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              From Citizen Complaint to Verified Civic Action
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Automated end-to-end walkthrough demonstrating OpenCV video frame extraction, YOLO defect detection, multi-factor deduplication, explainable severity scoring, and closed-loop repair verification.
            </p>
          </div>

          {/* Controls: Auto-Play, Step Advance, Reset */}
          <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={toggleDemoAutoPlay}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg ${
                demoAutoPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
            >
              {demoAutoPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause ({stepTimerSeconds}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Auto-Play 90s Demo</span>
                </>
              )}
            </button>

            <button
              onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
              disabled={demoStep === 1}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-white px-2">
              Step {demoStep} / 5
            </span>

            <button
              onClick={() => setDemoStep(Math.min(5, demoStep + 1))}
              disabled={demoStep === 5}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl transition"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={resetDemo}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              title="Reset Demo to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Step Progress Tabs */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-800/80">
          {stepMeta.map((s) => {
            const Icon = s.icon;
            const isActive = demoStep === s.num;
            const isCompleted = demoStep > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setDemoStep(s.num)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400'
                    : isCompleted
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-cyan-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-[11px] font-bold text-slate-200 truncate">
                  {s.title}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Step Content Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* ================= STEP 01 ================= */}
        {demoStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
                Step 01 of 05 · Multimodal &amp; Multilingual Ingestion
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Citizen A Uploads Video with Odia Voice Note at 10:00 AM
              </h3>
              <p className="text-xs text-slate-400">
                Citizen reports severe road hazard near school in Municipal Zone 3. Whisper transcribes Indian regional dialect; OpenCV samples 4 keyframes.
              </p>
            </div>

            {/* 4 Video Keyframes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  OpenCV Keyframe Sampling Strip:
                </span>
                <span className="font-mono text-cyan-400 text-[11px]">
                  Laplacian Blur Scores: 142.5, 168.0, 155.2, 139.8 (All &gt; 40 Good)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 1, ts: '0.0s', label: 'Entrance tarmac void' },
                  { id: 2, ts: '1.2s', label: 'Crater core void' },
                  { id: 3, ts: '2.5s', label: 'Submerged muddy water' },
                  { id: 4, ts: '3.8s', label: 'Edge crack fracture' }
                ].map((frame) => (
                  <div
                    key={frame.id}
                    className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-md"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80"
                      alt={`Frame ${frame.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 bg-black/70 rounded text-cyan-300">
                          Frame #{frame.id}
                        </span>
                        <span className="text-slate-300">{frame.ts}</span>
                      </div>
                      <span className="text-[10px] text-slate-200 font-medium truncate">
                        {frame.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Transcription Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                  Whisper Regional Speech Recognition (Odia Script):
                </span>
                <p className="text-sm font-serif text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  "ରାସ୍ତାରେ ଏକ ବଡ଼ ଗାତ ହୋଇଛି, ପାଣି ଜମି ରହିଛି ଏବଂ ସ୍କୁଲ ପାଖରେ ଗାଡ଼ି ଚଳାଚଳରେ ବିପଦ ସୃଷ୍ଟି ହେଉଛି।"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">
                  Zero-Shot English Internal Translation:
                </span>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  "There is a deep crater pothole on the road with stagnant water, creating severe hazard for school transit."
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400">Extracted Category:</span>
                <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full font-mono font-bold">
                  POTHOLE_ROAD_DAMAGE
                </span>
                <span className="text-slate-400 ml-2">Urgency Tags:</span>
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-mono text-[10px]">
                  ସ୍କୁଲ ପାଖରେ (School Buffer)
                </span>
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-mono text-[10px]">
                  ବଡ଼ ଗାତ (Deep Void)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 02 ================= */}
        {demoStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-red-400 bg-red-950 px-3 py-1 rounded-full border border-red-800">
                Step 02 of 05 · AI Vision Inspection &amp; Severity Scoring
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                YOLO Detects Road Crater (94% Conf) · AI Risk Score: 92/100 (P1 Critical)
              </h3>
              <p className="text-xs text-slate-400">
                Proximity to St. Xavier Model High School (&lt; 200m buffer) triggers the Emergency Escalation Engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* YOLO Bounding Box Overlay */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  YOLOv8 Damage Bounding-Box Overlay:
                </span>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                    alt="Road Crater YOLO"
                    className="w-full h-full object-cover"
                  />
                  {/* Visual Bounding Box */}
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded-lg flex flex-col justify-between p-1.5"
                    style={{ top: '35%', left: '22%', width: '55%', height: '42%' }}
                  >
                    <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow self-start">
                      Pothole #01 (94.2% Conf)
                    </span>
                    <span className="bg-black/80 text-white text-[9px] font-mono px-1 rounded self-end">
                      Est. Area: 1.8m x 1.2m
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Score & Factor Breakdown */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      AI Severity Risk Score
                    </span>
                    <span className="text-3xl font-black text-red-400 font-mono">
                      92 / 100
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-red-950 text-red-300 border border-red-800 rounded-full font-mono text-xs font-bold animate-pulse">
                    P1 CRITICAL (4h SLA)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Why This AI Decision? Point Breakdown:
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-300">+35 Base Defect Severity</span>
                      <span className="font-mono font-bold text-cyan-400">1.8m Crater Depth</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-300">+25 Sensitive Proximity</span>
                      <span className="font-mono font-bold text-amber-400">&lt; 200m St. Xavier School</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-300">+20 Traffic Importance</span>
                      <span className="font-mono font-bold text-blue-400">Arterial Bus Transit Road</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-300">+12 Worsening Trend</span>
                      <span className="font-mono font-bold text-red-400">Consecutive Citizen Reports</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 03 ================= */}
        {demoStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
                Step 03 of 05 · AI Duplicate Intelligence &amp; Consolidation
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Citizen B Reports Same Road Void at 10:20 AM (Alternate Angle)
              </h3>
              <p className="text-xs text-slate-400">
                DBSCAN spatial clustering (14m GPS distance) + Perceptual Hashing (pHash 96% match) merges 2 reports into 1 unique master ticket (#CP102).
              </p>
            </div>

            {/* Side-by-Side Comparison of Citizen A vs. Citizen B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Citizen A (10:00 AM)</span>
                  <span className="font-mono text-cyan-400">North Side Video</span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"
                    alt="Citizen A"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Odia audio: Deep waterlogged crater opposite school gate.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Citizen B (10:20 AM)</span>
                  <span className="font-mono text-purple-400">South Side Photo</span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80"
                    alt="Citizen B"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  English text: Same huge pothole seen from south sidewalk, school vans swerving.
                </p>
              </div>
            </div>

            {/* Merge Result Banner */}
            <div className="p-4 bg-purple-950/50 border border-purple-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300 font-bold block">
                  Consolidation Metric Output
                </span>
                <div className="text-sm font-bold text-white flex items-center space-x-2">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  <span>2 Citizen Reports Consolidated $\rightarrow$ 1 Unique Incident (#CP102)</span>
                </div>
                <p className="text-xs text-purple-200/90">
                  Spatial distance: 14 meters (threshold &lt; 35m). Duplicate Match Confidence: 96.0%. Zero duplicate tickets created in municipal dispatch.
                </p>
              </div>

              <div className="px-4 py-2 bg-purple-900/80 rounded-xl border border-purple-700 text-center flex-shrink-0">
                <span className="text-[10px] uppercase font-mono text-purple-300 block">Match Score</span>
                <span className="text-2xl font-black text-white font-mono">96%</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 04 ================= */}
        {demoStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
                Step 04 of 05 · Autonomous Jurisdiction Routing &amp; SLA Activation
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Mapped to Zone 3 · Dispatched to Road Maintenance Department
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic PostGIS polygon containment maps GPS coordinates to Municipal Zone 3 and assigns Er. Alok Das (Chief Zonal Engineer) with an active 4-hour SLA timer.
              </p>
            </div>

            {/* Dispatch Payload Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Municipal Zone</span>
                <span className="text-sm font-bold text-white block">Zone 3 — Central Tech Corridor</span>
                <span className="text-xs text-slate-400">PostGIS ST_Contains Polygon</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Assigned Department</span>
                <span className="text-sm font-bold text-white block">Road Maintenance Department</span>
                <span className="text-xs text-slate-400">Zonal Head: Er. Alok Das</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">P1 SLA Countdown</span>
                <span className="text-sm font-bold text-red-400 font-mono block">4 Hours Resolution Window</span>
                <span className="text-xs text-slate-400">Target: {cp102.sla_deadline}</span>
              </div>
            </div>

            {/* Immutable Cryptographic Audit Log Block */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Immutable Audit Log Block Appended:
              </span>
              <div className="font-mono text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div>
                  <strong className="text-cyan-400">BLOCK_HASH:</strong> SHA256-11ac92ef8834db02
                </div>
                <div>
                  <strong className="text-slate-400">PREV_HASH:</strong> SHA256-7f8e1d2c3b4a5960
                </div>
                <div>
                  <strong className="text-emerald-400">ACTION:</strong> ROUTED_TO_DEPARTMENT (Road Maintenance · Zone 3)
                </div>
                <div>
                  <strong className="text-slate-400">TIMESTAMP:</strong> 2026-10-31 10:00:35 UTC
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 05 ================= */}
        {demoStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                Step 05 of 05 · Before-and-After AI Repair Verification
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Municipal Officer Uploads After-Repair Road Photo · AI Score: 91.4%
              </h3>
              <p className="text-xs text-slate-400">
                Vision AI verifies the bitumen patch and ensures the road crater is resolved. System transitions to Awaiting Citizen Confirmation.
              </p>
            </div>

            {/* Interactive Before/After Split Comparison Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-mono text-red-400 font-semibold">BEFORE (Original Crater)</span>
                <span className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Drag Slider to Compare</span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold">AFTER (Repaired Bitumen)</span>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 select-none bg-slate-950 shadow-xl">
                {/* AFTER Image (Full background) */}
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                  alt="After Repair"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* BEFORE Image (Clipped overlay) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                    alt="Before Repair"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100vw', maxWidth: 'none' }}
                  />
                </div>

                {/* Slider divider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>

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

            {/* AI Verification Findings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Repair Score</span>
                <span className="text-xl font-black text-emerald-400 font-mono">91.4% Verified</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">GPS Tolerance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">12m Passed (&lt; 30m)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Next Action</span>
                <span className="text-sm font-bold text-cyan-400">Citizen Confirmation</span>
              </div>
            </div>

            {/* Citizen Confirmation Action Callout */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Citizen Approval Ready</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Status: {cp102.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Click below to emulate citizen confirmation, which closes Master Ticket #CP102 and registers an immutable resolution block.
              </p>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => {
                    verifyRepair(
                      'CP102',
                      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                      20.2961,
                      85.8245
                    );
                    submitCitizenFeedback('CP102', 'CONFIRM');
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Repair as Citizen &amp; Close #CP102</span>
                </button>
                <button
                  onClick={() => {
                    selectIncidentByTracking('CP102');
                    setRole('CITIZEN');
                    setCitizenTab('TRACK');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  View in Citizen Portal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
            disabled={demoStep === 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            {stepMeta[demoStep - 1].title}
          </span>

          <button
            onClick={() => setDemoStep(Math.min(5, demoStep + 1))}
            disabled={demoStep === 5}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-md shadow-cyan-600/20"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

