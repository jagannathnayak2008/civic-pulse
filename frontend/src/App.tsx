import React, { useState } from 'react';
import { CivicPulseProvider, useCivicPulse } from './context/CivicPulseContext';
import { Navbar } from './components/Navbar';
import { ReportWizard } from './components/CitizenPortal/ReportWizard';
import { TrackingPortal } from './components/CitizenPortal/TrackingPortal';
import { CommunityConfirm } from './components/CitizenPortal/CommunityConfirm';
import { KpiGrid } from './components/CommandCenter/KpiGrid';
import { LiveIncidentMap } from './components/CommandCenter/LiveIncidentMap';
import { WorkloadSlaPanel } from './components/CommandCenter/WorkloadSlaPanel';
import { HumanReviewQueue } from './components/CommandCenter/HumanReviewQueue';
import { OfficerRepairModal } from './components/CommandCenter/OfficerRepairModal';
import { PasskeyGate } from './components/CommandCenter/PasskeyGate';
import {
  UploadCloud,
  Search,
  ThumbsUp,
  MapPin,
  Clock,
  ShieldAlert
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    role,
    setRole,
    citizenTab,
    setCitizenTab,
    officerTab,
    setOfficerTab,
    kpi
  } = useCivicPulse();

  const [authorityUnlocked, setAuthorityUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authorityUnlocked') === 'true';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#172B3A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= VIEW 1: CITIZEN REPORTING & TRACKING ================= */}
        {role !== 'OFFICER' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Citizen Sub-Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-[#DCE5EE] pb-3">
              <button
                onClick={() => setCitizenTab('REPORT')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  citizenTab === 'REPORT'
                    ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                    : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>📷 Report Damage</span>
              </button>

              <button
                onClick={() => setCitizenTab('TRACK')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  citizenTab === 'TRACK'
                    ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                    : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>🔍 Track Incident</span>
              </button>

              <button
                onClick={() => setCitizenTab('CONFIRM')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  citizenTab === 'CONFIRM'
                    ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                    : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>👍 Community Confirm</span>
              </button>
            </div>

            {/* Active Citizen Tab Content */}
            {citizenTab === 'REPORT' && <ReportWizard />}
            {citizenTab === 'TRACK' && <TrackingPortal />}
            {citizenTab === 'CONFIRM' && <CommunityConfirm />}
          </div>
        )}

        {/* ================= VIEW 2: MUNICIPAL COMMAND CENTER (AUTHORITY DASHBOARD) ================= */}
        {role === 'OFFICER' && (
          !authorityUnlocked ? (
            <PasskeyGate
              onUnlock={() => setAuthorityUnlocked(true)}
              onCancel={() => setRole('CITIZEN')}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top 6 KPI Cards (Strictly 6 - NO Average Resolution Time) */}
              <KpiGrid />

              {/* Officer Sub-Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE5EE] pb-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setOfficerTab('MAP')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      officerTab === 'MAP'
                        ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                        : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Live Geospatial Map</span>
                  </button>

                  <button
                    onClick={() => setOfficerTab('SLA_BOARD')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      officerTab === 'SLA_BOARD'
                        ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                        : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Workload &amp; SLA Boards</span>
                  </button>

                  <button
                    onClick={() => setOfficerTab('REVIEW_QUEUE')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      officerTab === 'REVIEW_QUEUE'
                        ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40 border border-[#10243A]'
                        : 'bg-white text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE]'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Human Review Queue</span>
                    <span className="ml-1 px-1.5 py-0.2 bg-[#E9A23B] text-white font-bold text-[10px] rounded-full">
                      1
                    </span>
                  </button>
                </div>
              </div>

              {officerTab === 'MAP' && <LiveIncidentMap />}
              {officerTab === 'SLA_BOARD' && <WorkloadSlaPanel />}
              {officerTab === 'REVIEW_QUEUE' && <HumanReviewQueue />}
            </div>
          )
        )}
      </main>

      {/* Officer Repair Modal Dialog */}
      <OfficerRepairModal />

      {/* Footer */}
      <footer className="border-t border-[#DCE5EE] py-6 mt-12 bg-white text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            CivicPulse &copy; 2026 · Autonomous Civic Incident Intelligence &amp; Action Platform
          </span>
          <span className="font-mono text-[11px] text-[#64748B]">
            Open-Source Vision AI · Edge Processing · Direct Dashboard Access
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CivicPulseProvider>
      <AppContent />
    </CivicPulseProvider>
  );
};

export default App;
