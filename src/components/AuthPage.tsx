/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Check, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Phone
} from "lucide-react";
import { LOGO_PATH } from "../constants.ts";
import { DwwaarUser, authService } from "../services/authService.ts";

interface AuthPageProps {
  initialTab?: "login" | "signup";
  onAuthSuccess: (user: DwwaarUser) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = "login",
  onAuthSuccess,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showSwitchToLoginPrompt, setShowSwitchToLoginPrompt] = useState(false);

  // First-time Google user adding mobile number step
  const [googleUserPendingMobile, setGoogleUserPendingMobile] = useState<DwwaarUser | null>(null);
  const [googleMobileInput, setGoogleMobileInput] = useState("");
  const [googleMobileTouched, setGoogleMobileTouched] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginTouched, setLoginTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupTouched, setSignupTouched] = useState<{
    name?: boolean;
    mobile?: boolean;
    email?: boolean;
    password?: boolean;
    confirm?: boolean;
  }>({});

  // Input references for auto-focus on first invalid field
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  const signupNameRef = useRef<HTMLInputElement>(null);
  const signupMobileRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmRef = useRef<HTMLInputElement>(null);
  const googleMobileRef = useRef<HTMLInputElement>(null);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Clean and sanitize Indian mobile number (extract 10 digits starting 6-9)
  const sanitizeMobile = (val: string): string => {
    // Remove all non-digits, leading +91 or 91 or 0
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0") && digits.length > 10) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeMobile(e.target.value);
    setSignupMobile(cleaned);
  };

  const handleGoogleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeMobile(e.target.value);
    setGoogleMobileInput(cleaned);
  };

  // Validation Checkers
  const isValidEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim().toLowerCase());
  };

  const isValidName = (name: string) => name.trim().length >= 2;
  const isValidMobile = (mob: string) => /^[6-9]\d{9}$/.test(mob);
  const isValidPassword = (pass: string) => pass.length >= 8;

  // Password strength calculator (for signup)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  // Login Validation Errors
  const loginErrors = {
    email: !loginEmail ? "Email is required" : !isValidEmail(loginEmail) ? "Enter a valid email address" : null,
    password: !loginPassword ? "Password is required" : loginPassword.length < 8 ? "Password must be at least 8 characters" : null,
  };
  const isLoginFormValid = !loginErrors.email && !loginErrors.password;

  // Signup Validation Errors
  const signupErrors = {
    name: !signupName ? "Full name is required" : !isValidName(signupName) ? "Name must be at least 2 characters" : null,
    mobile: !signupMobile ? "Mobile number is required" : !isValidMobile(signupMobile) ? "Enter valid 10-digit mobile starting with 6-9" : null,
    email: !signupEmail ? "Email is required" : !isValidEmail(signupEmail) ? "Enter a valid email address" : null,
    password: !signupPassword ? "Password is required" : !isValidPassword(signupPassword) ? "Password must be at least 8 characters" : null,
    confirm: !signupConfirmPassword ? "Please confirm your password" : signupConfirmPassword !== signupPassword ? "Passwords do not match" : null,
  };
  const isSignupFormValid =
    !signupErrors.name &&
    !signupErrors.mobile &&
    !signupErrors.email &&
    !signupErrors.password &&
    !signupErrors.confirm;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setShowSwitchToLoginPrompt(false);

    // Touch all fields to show errors if any
    setLoginTouched({ email: true, password: true });

    if (!isLoginFormValid) {
      if (loginErrors.email) {
        loginEmailRef.current?.focus();
      } else if (loginErrors.password) {
        loginPasswordRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authService.loginWithEmail(loginEmail, loginPassword);
      onAuthSuccess(user);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setShowSwitchToLoginPrompt(false);

    // Touch all signup fields
    setSignupTouched({
      name: true,
      mobile: true,
      email: true,
      password: true,
      confirm: true,
    });

    if (!isSignupFormValid) {
      if (signupErrors.name) signupNameRef.current?.focus();
      else if (signupErrors.mobile) signupMobileRef.current?.focus();
      else if (signupErrors.email) signupEmailRef.current?.focus();
      else if (signupErrors.password) signupPasswordRef.current?.focus();
      else if (signupErrors.confirm) signupConfirmRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authService.signupWithEmail(
        signupName,
        signupMobile,
        signupEmail,
        signupPassword
      );
      onAuthSuccess(user);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use" || err.message?.includes("already registered")) {
        setGeneralError("Email already registered, try logging in");
        setShowSwitchToLoginPrompt(true);
      } else {
        setGeneralError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setGeneralError(null);
    setShowSwitchToLoginPrompt(false);
    setIsSubmitting(true);

    try {
      const { user, isNewUser } = await authService.loginWithGoogle();
      if (isNewUser) {
        // Step to add mobile number for first-time Google sign in
        setGoogleUserPendingMobile(user);
      } else {
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google First-Time Mobile Submission
  const handleGoogleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleMobileTouched(true);

    if (!isValidMobile(googleMobileInput)) {
      googleMobileRef.current?.focus();
      return;
    }

    if (!googleUserPendingMobile) return;

    setIsSubmitting(true);
    try {
      const updatedUser = await authService.saveMobile(googleUserPendingMobile.id, googleMobileInput);
      onAuthSuccess(updatedUser);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to save mobile number.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to Login tab with prefilled email
  const handleSwitchToLoginWithEmail = () => {
    setLoginEmail(signupEmail);
    setActiveTab("login");
    setGeneralError(null);
    setShowSwitchToLoginPrompt(false);
    setLoginTouched({ email: true });
    setTimeout(() => loginPasswordRef.current?.focus(), 100);
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  return (
    <div className="min-h-screen w-full bg-[#FBF7F0] text-[#0A1530] flex flex-col lg:flex-row selection:bg-[#F6DDB0] selection:text-[#0A1530]">
      
      {/* ============================================================== */}
      {/* DESKTOP LEFT PANEL: Navy background with Arch Door & Logo     */}
      {/* ============================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1530] text-[#F5EBDA] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        
        {/* Arch shape with soft door-opening glow */}
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] xl:w-[500px] h-[600px] xl:h-[700px] pointer-events-none select-none"
        >
          <div className="relative w-full h-full rounded-t-[260px] border border-[#F6DDB0]/20 bg-gradient-to-b from-[#14234b]/35 to-transparent overflow-hidden">
            {/* Center expanding warm light glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[520px] rounded-t-[180px] bg-gradient-to-b from-[#F6DDB0]/35 via-[#F6DDB0]/10 to-transparent animate-door-expand" />
            <div className="absolute inset-x-8 top-10 bottom-0 rounded-t-[180px] border-t border-x border-[#F6DDB0]/15" />
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#F6DDB0]/20 to-transparent blur-lg" />
          </div>
        </div>

        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(246,221,176,0.12)_0%,transparent_70%)] pointer-events-none"
        />

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6DDB0] rounded-xl p-1"
          >
            <img
              src={LOGO_PATH}
              alt="Dwwaar"
              className="w-11 h-11 rounded-full object-cover border border-[#F6DDB0]/40 group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-extrabold tracking-tight text-[#F5EBDA]">Dwwaar</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5EBDA]/75 hover:text-[#F6DDB0] transition-colors py-1.5 px-3 rounded-lg border border-[#F5EBDA]/15 hover:border-[#F6DDB0]/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </button>
        </div>

        {/* Center: Poetic Dwwaar line */}
        <div className="relative z-10 my-auto py-12 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132349] border border-[#F6DDB0]/25 text-[#F6DDB0] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Real Estate Smart Links</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-[#F5EBDA] leading-[1.12] mb-5">
            Your project, <br />
            <span className="text-[#F6DDB0]">one link away.</span>
          </h2>
          <p className="text-base text-[#F5EBDA]/80 leading-relaxed font-normal">
            Say goodbye to 35MB PDF brochures. Share live pricing, floor plans, and verified RERA details directly with buyers.
          </p>
        </div>

        {/* Bottom Trust markers */}
        <div className="relative z-10 pt-6 border-t border-[#F5EBDA]/10 flex items-center justify-between text-xs text-[#F5EBDA]/60">
          <span>© 2026 Dwwaar</span>
          <span>Zero heavy PDFs · Instant QR</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL (MOBILE & DESKTOP): Cream Form Card              */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 lg:px-12 xl:px-16 overflow-y-auto">
        
        {/* Mobile Header with Back link and Brand logo */}
        <div className="w-full max-w-md flex items-center justify-between mb-6 lg:hidden">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-[#0A1530] font-bold text-lg"
          >
            <img
              src={LOGO_PATH}
              alt="Dwwaar"
              className="w-8 h-8 rounded-full object-cover border border-[#0A1530]/20"
            />
            <span>Dwwaar</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A1530]/70 hover:text-[#0A1530] transition-colors py-1 px-2.5 rounded-lg bg-[#F5EBDA]/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </button>
        </div>

        {/* Desktop Back button on top right of form area */}
        <div className="hidden lg:flex w-full max-w-md justify-end mb-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1530]/60 hover:text-[#0A1530] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </button>
        </div>

        {/* Main Form Card Container */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#0A1530]/8 shadow-lg shadow-[#0A1530]/5">
          
          {/* ========================================================== */}
          {/* STEP: First-Time Google User Needs Mobile Number            */}
          {/* ========================================================== */}
          {googleUserPendingMobile ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EBDA] text-[#0A1530] flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1530] tracking-tight">
                  Add your mobile number
                </h3>
                <p className="text-xs sm:text-sm text-[#0A1530]/70 mt-1.5">
                  Welcome, <span className="font-semibold">{googleUserPendingMobile.name}</span>. Add your phone number so buyers can reach you.
                </p>
              </div>

              {generalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleGoogleMobileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="google-mobile" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-semibold text-[#0A1530]/60 select-none">
                      +91
                    </span>
                    <input
                      ref={googleMobileRef}
                      id="google-mobile"
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      value={googleMobileInput}
                      onChange={handleGoogleMobileChange}
                      onBlur={() => setGoogleMobileTouched(true)}
                      placeholder="98765 43210"
                      maxLength={10}
                      className={`w-full h-12 pl-12 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                        googleMobileTouched && !isValidMobile(googleMobileInput)
                          ? "border-rose-500 focus:ring-rose-400"
                          : googleMobileTouched && isValidMobile(googleMobileInput)
                          ? "border-emerald-500 focus:ring-emerald-400"
                          : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                      }`}
                    />
                    {googleMobileTouched && isValidMobile(googleMobileInput) && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 pointer-events-none" />
                    )}
                  </div>
                  {googleMobileTouched && !isValidMobile(googleMobileInput) && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">
                      Enter a valid 10-digit number starting with 6, 7, 8, or 9.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || (googleMobileTouched && !isValidMobile(googleMobileInput))}
                  className="w-full h-12 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-sm hover:bg-[#14234d] transition-all flex items-center justify-center gap-2 border border-[#F6DDB0]/30 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F6DDB0]" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-[#F6DDB0]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* SEGMENTED TOGGLE: Login | Sign up                        */}
              {/* ======================================================== */}
              <div className="flex items-center p-1 bg-[#F5EBDA]/70 rounded-2xl mb-6 border border-[#0A1530]/5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setGeneralError(null);
                    setShowSwitchToLoginPrompt(false);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                    activeTab === "login"
                      ? "bg-[#0A1530] text-[#F5EBDA] shadow-xs"
                      : "text-[#0A1530]/70 hover:text-[#0A1530]"
                  }`}
                  aria-selected={activeTab === "login"}
                  role="tab"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setGeneralError(null);
                    setShowSwitchToLoginPrompt(false);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                    activeTab === "signup"
                      ? "bg-[#0A1530] text-[#F5EBDA] shadow-xs"
                      : "text-[#0A1530]/70 hover:text-[#0A1530]"
                  }`}
                  aria-selected={activeTab === "signup"}
                  role="tab"
                >
                  Sign up
                </button>
              </div>

              {/* ======================================================== */}
              {/* GOOGLE CONTINUATION BUTTON WITH "RECOMMENDED" BADGE       */}
              {/* ======================================================== */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-[#FBF7F0] hover:bg-[#F5EBDA] border border-[#0A1530]/15 text-[#0A1530] font-bold text-sm transition-all flex items-center justify-between px-4 shadow-2xs hover:shadow-xs disabled:opacity-50 active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3">
                    {/* Official Google G Logo SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A1530] bg-[#F6DDB0] px-2 py-0.5 rounded-md">
                    Recommended
                  </span>
                </button>
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-[#0A1530]/10" />
                <span className="bg-white px-3 text-xs font-semibold text-[#0A1530]/40 uppercase tracking-wider">
                  or
                </span>
                <div className="w-full border-t border-[#0A1530]/10" />
              </div>

              {/* General Feedback / Error banner */}
              {generalError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{generalError}</span>
                  </div>

                  {/* One-tap switch to login if email already registered */}
                  {showSwitchToLoginPrompt && (
                    <button
                      type="button"
                      onClick={handleSwitchToLoginWithEmail}
                      className="ml-6 text-xs font-bold text-[#0A1530] underline hover:text-black block"
                    >
                      Switch to Login Tab →
                    </button>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: LOGIN FORM                                        */}
              {/* ======================================================== */}
              {activeTab === "login" && (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={loginEmailRef}
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onBlur={() => setLoginTouched((prev) => ({ ...prev, email: true }))}
                        placeholder="builder@realty.com"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          loginTouched.email && loginErrors.email
                            ? "border-rose-500 focus:ring-rose-400"
                            : loginTouched.email && !loginErrors.email
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      {loginTouched.email && !loginErrors.email && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 pointer-events-none" />
                      )}
                    </div>
                    {loginTouched.email && loginErrors.email && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{loginErrors.email}</p>
                    )}
                  </div>

                  {/* Password Field (Show/Hide Toggle) */}
                  <div>
                    <label htmlFor="login-password" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={loginPasswordRef}
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onBlur={() => setLoginTouched((prev) => ({ ...prev, password: true }))}
                        placeholder="••••••••"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          loginTouched.password && loginErrors.password
                            ? "border-rose-500 focus:ring-rose-400"
                            : loginTouched.password && !loginErrors.password
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 text-[#0A1530]/50 hover:text-[#0A1530] transition-colors p-1"
                        tabIndex={-1}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginTouched.password && loginErrors.password && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{loginErrors.password}</p>
                    )}
                  </div>

                  {/* Submit Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || (loginTouched.email && !!loginErrors.email) || (loginTouched.password && !!loginErrors.password)}
                      className="w-full h-12 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-sm hover:bg-[#14234d] transition-all flex items-center justify-center gap-2 border border-[#F6DDB0]/30 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#F6DDB0]" />
                          <span>Logging in...</span>
                        </>
                      ) : (
                        <>
                          <span>Log In</span>
                          <ArrowRight className="w-4 h-4 text-[#F6DDB0]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================== */}
              {/* TAB 2: SIGNUP FORM                                       */}
              {/* ======================================================== */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignupSubmit} noValidate className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="signup-name" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={signupNameRef}
                        id="signup-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        onBlur={() => setSignupTouched((prev) => ({ ...prev, name: true }))}
                        placeholder="Rajesh Mehta"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          signupTouched.name && signupErrors.name
                            ? "border-rose-500 focus:ring-rose-400"
                            : signupTouched.name && !signupErrors.name
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      {signupTouched.name && !signupErrors.name && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 pointer-events-none" />
                      )}
                    </div>
                    {signupTouched.name && signupErrors.name && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{signupErrors.name}</p>
                    )}
                  </div>

                  {/* Mobile Number (Fixed +91, 10 Digits) */}
                  <div>
                    <label htmlFor="signup-mobile" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-semibold text-[#0A1530]/60 select-none">
                        +91
                      </span>
                      <input
                        ref={signupMobileRef}
                        id="signup-mobile"
                        type="tel"
                        name="tel"
                        autoComplete="tel"
                        value={signupMobile}
                        onChange={handleMobileChange}
                        onBlur={() => setSignupTouched((prev) => ({ ...prev, mobile: true }))}
                        placeholder="98765 43210"
                        maxLength={10}
                        className={`w-full h-12 pl-12 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          signupTouched.mobile && signupErrors.mobile
                            ? "border-rose-500 focus:ring-rose-400"
                            : signupTouched.mobile && !signupErrors.mobile
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      {signupTouched.mobile && !signupErrors.mobile && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 pointer-events-none" />
                      )}
                    </div>
                    {signupTouched.mobile && signupErrors.mobile && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{signupErrors.mobile}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="signup-email" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={signupEmailRef}
                        id="signup-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        onBlur={() => setSignupTouched((prev) => ({ ...prev, email: true }))}
                        placeholder="rajesh@skylinebuilders.in"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          signupTouched.email && signupErrors.email
                            ? "border-rose-500 focus:ring-rose-400"
                            : signupTouched.email && !signupErrors.email
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      {signupTouched.email && !signupErrors.email && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3.5 pointer-events-none" />
                      )}
                    </div>
                    {signupTouched.email && signupErrors.email && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{signupErrors.email}</p>
                    )}
                  </div>

                  {/* Password with Strength Indicator */}
                  <div>
                    <label htmlFor="signup-password" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1">
                      Password (8+ chars)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={signupPasswordRef}
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onBlur={() => setSignupTouched((prev) => ({ ...prev, password: true }))}
                        placeholder="••••••••"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          signupTouched.password && signupErrors.password
                            ? "border-rose-500 focus:ring-rose-400"
                            : signupTouched.password && !signupErrors.password
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 text-[#0A1530]/50 hover:text-[#0A1530] transition-colors p-1"
                        tabIndex={-1}
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Thin Password Strength Bar */}
                    {signupPassword && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-[#0A1530]/10 rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              passwordStrength <= 1
                                ? "w-1/3 bg-rose-500"
                                : passwordStrength === 2
                                ? "w-2/3 bg-amber-500"
                                : "w-full bg-emerald-500"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-[#0A1530]/60 font-medium">
                          {passwordStrength <= 1 ? "Weak" : passwordStrength === 2 ? "Good" : "Strong"}
                        </span>
                      </div>
                    )}

                    {signupTouched.password && signupErrors.password && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{signupErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="signup-confirm" className="block text-xs font-bold text-[#0A1530] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        ref={signupConfirmRef}
                        id="signup-confirm"
                        type={showSignupConfirm ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        onBlur={() => setSignupTouched((prev) => ({ ...prev, confirm: true }))}
                        placeholder="••••••••"
                        className={`w-full h-12 px-3.5 pr-10 rounded-xl bg-[#FBF7F0] text-sm text-[#0A1530] font-medium border transition-all outline-none focus:ring-2 ${
                          signupTouched.confirm && signupErrors.confirm
                            ? "border-rose-500 focus:ring-rose-400"
                            : signupTouched.confirm && !signupErrors.confirm
                            ? "border-emerald-500 focus:ring-emerald-400"
                            : "border-[#0A1530]/15 focus:ring-[#0A1530]/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                        className="absolute right-3.5 text-[#0A1530]/50 hover:text-[#0A1530] transition-colors p-1"
                        tabIndex={-1}
                        aria-label={showSignupConfirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupTouched.confirm && signupErrors.confirm && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{signupErrors.confirm}</p>
                    )}
                  </div>

                  {/* Submit Signup Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || (signupTouched.email && !isSignupFormValid)}
                      className="w-full h-12 rounded-xl bg-[#0A1530] text-[#F5EBDA] font-bold text-sm hover:bg-[#14234d] transition-all flex items-center justify-center gap-2 border border-[#F6DDB0]/30 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#F6DDB0]" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign up for Free</span>
                          <ArrowRight className="w-4 h-4 text-[#F6DDB0]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
