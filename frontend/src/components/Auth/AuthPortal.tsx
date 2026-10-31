import React, { useState } from 'react';
import { API_BASE } from '../../services/api';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  ShieldAlert,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { login, register } = useCivicPulse();

  // Mode: 'LOGIN' or 'REGISTER'
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Password complexity checks for registration
  const hasMinLength = regPassword.length >= 6;
  const hasUpperCase = /[A-Z]/.test(regPassword);
  const hasLowerCase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]~\\/]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const isPasswordValid = hasMinLength && passwordsMatch;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your Registered Number or User ID.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await login({
      login_identifier: loginIdentifier.trim(),
      password: loginPassword,
      remember_me: rememberMe
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please verify credentials.');
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Mobile Number / Login Identifier is required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      full_name: regFullName.trim(),
      phone_number: regPhone.trim(),
      password: regPassword,
      confirm_password: regConfirmPassword
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Account created successfully! Signing you in...');
    } else {
      setErrorMessage(res.message || 'Registration failed. Please try again.');
    }
  };

  // Quick Demo Autofill
  const handleFillDemo = (type: 'CITIZEN' | 'OFFICER') => {
    setMode('LOGIN');
    setErrorMessage(null);
    setSuccessMessage(null);
    if (type === 'CITIZEN') {
      setLoginIdentifier('9876543210');
      setLoginPassword('Password@123');
    } else {
      setLoginIdentifier('9437033003');
      setLoginPassword('Officer@123');
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Registered Number.');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('New password must be at least 8 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: forgotIdentifier.trim(),
          new_password: forgotNewPassword
        })
      });
      const data = await response.json();
      setForgotLoading(false);

      if (response.ok && data.success) {
        setForgotSuccess(data.message || 'Password updated successfully! You can now sign in.');
        setTimeout(() => {
          setForgotModalOpen(false);
          setMode('LOGIN');
          setLoginIdentifier(forgotIdentifier.trim());
          setLoginPassword('');
          setForgotSuccess(null);
        }, 1200);
      } else {
        setForgotError(data.detail || data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError('Network error connecting to reset service.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#172B3A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting effects matching CivicPulse theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#13B8C5]/10 via-[#3B82F6]/10 to-indigo-100/30 blur-[120px] pointer-events-none rounded-full" />

      {/* Header Branding */}
      <div className="text-center space-y-3 mb-8 relative z-10 max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#13B8C5] via-[#3B82F6] to-[#10243A] flex items-center justify-center shadow-xl shadow-cyan-900/15 mx-auto border border-[#13B8C5]/20">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#172B3A] flex items-center justify-center space-x-2">
            <span>Civic</span>
            <span className="text-[#13B8C5]">Pulse</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-[#10243A] border border-[#DCE5EE] rounded-full tracking-normal">
              SECURE ACCESS
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Autonomous Civic Incident Verification &amp; Resolution Platform
          </p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white border border-[#DCE5EE] rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative z-10 space-y-6">
        {/* Tab Toggle: Sign In vs First-Time User */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-[#DCE5EE] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${mode === 'LOGIN'
              ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40'
              : 'text-[#64748B] hover:text-[#172B3A]'
              }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${mode === 'REGISTER'
              ? 'bg-[#10243A] text-white shadow-md shadow-slate-300/40'
              : 'text-[#64748B] hover:text-[#172B3A]'
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>First-Time Register</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC4C4C] text-xs rounded-xl flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[#DC4C4C] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#16A36A] text-xs rounded-xl flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* ================= MODE 1: LOGIN FORM ================= */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Registered Number / User ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172B3A] block flex items-center justify-between">
                <span>Registered Number / User ID</span>
                <span className="text-[10px] text-[#64748B] font-mono">e.g. 9876543210</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter registered mobile number or user ID..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B3A] font-mono placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Field 2: Password with Show/Hide toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#172B3A]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-[#3B82F6] hover:text-[#10243A] transition font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#172B3A] placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#172B3A] transition"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-[#64748B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DCE5EE] bg-white text-[#10243A] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#10243A] hover:bg-[#172F49] text-white font-bold text-xs rounded-xl transition shadow-md shadow-slate-300/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to CivicPulse</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials Fill Chips */}
            <div className="pt-2 border-t border-[#DCE5EE]">
              <span className="text-[10px] text-[#64748B] font-mono block mb-1.5 uppercase tracking-wider font-semibold">
                ⚡ Quick Fill Demo Credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('CITIZEN')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-[#DCE5EE] rounded-lg text-[10px] text-[#172B3A] font-mono transition flex items-center space-x-1"
                >
                  <span>Citizen (9876543210)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('OFFICER')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-[#DCE5EE] rounded-lg text-[10px] text-[#172B3A] font-mono transition flex items-center space-x-1"
                >
                  <span>Officer (9437033003)</span>
                </button>
              </div>
            </div>

            {/* Switch to Register link */}
            <div className="text-center pt-2 text-xs text-[#64748B]">
              <span>First time here? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMessage(null);
                }}
                className="text-[#3B82F6] hover:text-[#10243A] font-semibold underline underline-offset-2 ml-1"
              >
                Create your account
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE 2: FIRST-TIME REGISTRATION FORM ================= */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Field 1: Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Full Name <span className="text-[#DC4C4C]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Enter your full name (e.g. Ramesh Sahu)..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B3A] placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Field 2: Mobile Number / Unique User Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172B3A] block flex items-center justify-between">
                <span>Mobile Number / Login Identifier <span className="text-[#DC4C4C]">*</span></span>
                <span className="text-[10px] text-[#13B8C5] font-mono font-semibold">Used to sign in</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="10-digit mobile number (e.g. 9876543210)..."
                  maxLength={15}
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B3A] font-mono placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Field 3: Create Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Create Password <span className="text-[#DC4C4C]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 chars, uppercase, lowercase, number, symbol..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#172B3A] placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#172B3A] transition"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 4: Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172B3A] block">
                Confirm Password <span className="text-[#DC4C4C]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password to confirm..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#172B3A] placeholder:text-slate-400 focus:border-[#13B8C5] focus:bg-white focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#172B3A] transition"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Real-time Password Security Checklist */}
            <div className="p-3 bg-slate-50 rounded-xl border border-[#DCE5EE] space-y-1.5 text-[11px]">
              <span className="font-bold text-[#172B3A] block">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasMinLength ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>6+ characters</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${hasUpperCase ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasUpperCase ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>1 uppercase letter (A-Z)</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${hasLowerCase ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasLowerCase ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>1 lowercase letter (a-z)</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${hasNumber ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasNumber ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>1 number (0-9)</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${hasSpecialChar ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasSpecialChar ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>1 special symbol (!@#$)</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${passwordsMatch ? 'text-[#16A36A] font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${passwordsMatch ? 'text-[#16A36A]' : 'text-slate-300'}`} />
                  <span>Passwords match</span>
                </span>
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full py-3 bg-[#10243A] hover:bg-[#172F49] text-white font-bold text-xs rounded-xl transition shadow-md shadow-slate-300/40 flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Access Dashboard</span>
                </>
              )}
            </button>

            {/* Switch to Login link */}
            <div className="text-center pt-2 text-xs text-[#64748B]">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage(null);
                }}
                className="text-[#3B82F6] hover:text-[#10243A] font-semibold underline underline-offset-2 ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security badge footer */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#64748B] font-mono pt-2 border-t border-[#DCE5EE]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
          <span>Bcrypt Password Encryption · Real-Time Token Verification</span>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE5EE] rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl relative text-[#172B3A]">
            <button
              onClick={() => {
                setForgotModalOpen(false);
                setForgotError(null);
                setForgotSuccess(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-[#172B3A]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#172B3A]">
              <KeyRound className="w-5 h-5 text-[#13B8C5]" />
              <h3 className="text-base font-bold">Reset Password</h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Enter your registered mobile number and set a new password.
            </p>

            {forgotError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-[#DC4C4C] text-xs rounded-xl flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#16A36A] text-xs rounded-xl flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-[#172B3A] font-semibold block mb-1">Registered Number / ID</label>
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl px-3 py-2 text-xs text-[#172B3A] font-mono focus:border-[#13B8C5] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#172B3A] font-semibold block mb-1">New Password (8+ chars)</label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="New strong password..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl px-3 py-2 text-xs text-[#172B3A] focus:border-[#13B8C5] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#172B3A] font-semibold block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl px-3 py-2 text-xs text-[#172B3A] focus:border-[#13B8C5] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3 py-2 text-xs text-[#64748B] hover:text-[#172B3A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-[#10243A] hover:bg-[#172F49] text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  {forgotLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
