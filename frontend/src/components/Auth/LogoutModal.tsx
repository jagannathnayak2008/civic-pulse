import React from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { LogOut, AlertTriangle, X, Shield } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useCivicPulse();

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#DCE5EE] rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl relative text-[#172B3A]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-[#172B3A] p-1 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-[#DC4C4C] flex items-center justify-center shadow-md shadow-red-100">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172B3A]">Sign Out Confirmation</h3>
            <p className="text-xs text-[#64748B]">CivicPulse Incident Session</p>
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Are you sure you want to log out? Your secure session will be terminated and you will need to sign in again with your registered number to submit or track incidents.
        </p>

        {currentUser && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-[#DCE5EE] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#10243A] font-bold text-xs">
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="font-bold text-[#172B3A] block">{currentUser.full_name}</span>
                <span className="text-[10px] text-[#64748B] font-mono">
                  {currentUser.phone_number}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#10243A] border border-[#DCE5EE]">
              {currentUser.role}
            </span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#DCE5EE] bg-white hover:bg-slate-50 text-xs font-semibold text-[#172B3A] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="px-4 py-2.5 rounded-xl bg-[#DC4C4C] hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-200 flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
