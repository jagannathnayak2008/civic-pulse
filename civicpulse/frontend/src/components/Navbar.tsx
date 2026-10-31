import React from 'react';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  ShieldAlert,
  Radio,
  UserCheck,
  Building2,
  RotateCcw,
  CheckCircle2,
  X,
  LogOut,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    wsConnected,
    notification,
    clearNotification,
    resetDemo,
    kpi,
    currentUser,
    setLogoutModalOpen
  } = useCivicPulse();

  return (
    <header className="sticky top-0 z-[1000] bg-[#10243A] backdrop-blur-md border-b border-[#172F49] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#13B8C5] via-[#3B82F6] to-[#10243A] flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-[#13B8C5]/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Civic<span className="text-[#13B8C5]">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#172F49] text-[#13B8C5] border border-[#13B8C5]/40 rounded-full">
                  AI v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                From Citizen Complaints to Verified Civic Action
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-[#172F49] p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setRole('CITIZEN')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'CITIZEN'
                  ? 'bg-[#13B8C5] text-white shadow-md shadow-cyan-900/40 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>📷 Report Damage</span>
            </button>

            <button
              onClick={() => setRole('OFFICER')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'OFFICER'
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🔐 Authority Dashboard</span>
              {kpi.critical_incidents > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#DC4C4C] text-white rounded-full text-[10px] font-bold">
                  {kpi.critical_incidents}
                </span>
              )}
            </button>
          </div>

          {/* Right Status Badges & Reset Button */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-[#172F49] border border-slate-700/60 rounded-lg text-[11px]">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    wsConnected ? 'bg-[#16A36A]' : 'bg-[#16A36A]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    wsConnected ? 'bg-[#16A36A]' : 'bg-[#16A36A]'
                  }`}
                />
              </span>
              <span className="text-slate-200 font-mono font-medium">
                {wsConnected ? 'LIVE FEED (SYNCED)' : 'LIVE WEBSOCKET FEED'}
              </span>
            </div>

            <button
              onClick={resetDemo}
              title="Reset state to pristine baseline"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-[#172F49] hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset State</span>
            </button>

            {/* Authenticated User Badge & Logout Option */}
            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700/60">
                <div className="flex items-center space-x-2 px-2.5 py-1 bg-[#172F49] border border-slate-700/60 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#13B8C5] to-[#3B82F6] flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-tight max-w-[120px] truncate">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-[#13B8C5] font-mono block leading-none">
                      {currentUser.phone_number}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-200 hover:text-white bg-red-900/40 hover:bg-red-800/60 border border-red-700/60 rounded-xl transition shadow-sm"
                  title="Sign Out of CivicPulse"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="bg-[#172F49] border-b border-[#13B8C5]/40 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#13B8C5] flex-shrink-0" />
              <span className="font-medium">{notification}</span>
            </div>
            <button
              onClick={clearNotification}
              className="text-slate-300 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
