import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertCircle, X } from 'lucide-react';

interface PasskeyGateProps {
  onUnlock: () => void;
  onCancel: () => void;
}

const AUTHORITY_PASSKEY = import.meta.env.VITE_AUTHORITY_PASSKEY || "admin123";

export const PasskeyGate: React.FC<PasskeyGateProps> = ({ onUnlock, onCancel }) => {
  const [passkey, setPasskey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === AUTHORITY_PASSKEY) {
      sessionStorage.setItem("authorityUnlocked", "true");
      setError('');
      onUnlock();
    } else {
      setError("Incorrect passkey");
      setPasskey('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#DCE5EE] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-400 hover:text-[#172B3A] p-1.5 rounded-xl hover:bg-slate-100 transition"
          title="Cancel"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#10243A] to-[#172F49] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Lock className="w-7 h-7 text-[#13B8C5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#172B3A] tracking-tight">
              Authority Dashboard Gate
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Restricted console for municipal engineering, review queue &amp; SLA triage.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B3A] block mb-1.5 text-left">
              Enter Authority Passkey
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter passkey..."
                autoFocus
                className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B3A] font-mono focus:border-[#3B82F6] focus:bg-white focus:outline-none transition"
              />
            </div>
            {error && (
              <div className="mt-2 text-xs text-[#DC4C4C] font-semibold flex items-center space-x-1.5 text-left">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#172B3A] border border-[#DCE5EE] rounded-xl text-xs font-bold transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

