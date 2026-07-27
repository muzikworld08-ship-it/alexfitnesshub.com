import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Mail, Lock, User, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Award } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginEmail, signUpEmail, loginWithGoogle, loginWithApple, sendPasswordReset } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Real-time validation states
  const [validation, setValidation] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const validateEmail = (val: string) => {
    if (!val) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return "Please enter a valid email address (e.g., user@example.com).";
    }
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) {
      return "Password is required.";
    }
    if (val.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return "";
  };

  const validateName = (val: string) => {
    if (!val.trim()) {
      return "Name is required.";
    }
    if (val.trim().length < 3) {
      return "Name must be at least 3 characters.";
    }
    return "";
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setValidation(prev => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setValidation(prev => ({ ...prev, password: validatePassword(val) }));
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setValidation(prev => ({ ...prev, name: validateName(val) }));
  };

  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Run final validations
    const emailErr = validateEmail(email);
    const passwordErr = !isForgot ? validatePassword(password) : "";
    const nameErr = (isSignUp && !isForgot) ? validateName(name) : "";

    if (emailErr || passwordErr || nameErr) {
      setValidation({
        email: emailErr,
        password: passwordErr,
        name: nameErr
      });
      setError("Please fix the validation errors in the form before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      if (isForgot) {
        await sendPasswordReset(email);
        setMessage("A password recovery link has been pushed to your email.");
      } else if (isSignUp) {
        await signUpEmail(email, password, name, rememberMe);
        onClose();
      } else {
        await loginEmail(email, password, rememberMe);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred. Please verify your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = (provider: "google" | "apple") => {
    setError("");
    setSubmitting(true);
    if (provider === "google") {
      loginWithGoogle()
        .then(() => {
          onClose();
        })
        .catch((err: any) => {
          setError(err?.message || "Google Authentication failed.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      loginWithApple()
        .then(() => {
          onClose();
        })
        .catch((err: any) => {
          setError(err?.message || "Apple Authentication failed.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: "rgba(9, 13, 22, 0.6)" }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#0A0E17] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col min-h-[500px] max-h-[90vh]">
        
        {/* ATHLETE PORTAL SIGN-IN/REGISTRATION */}
        <div className="w-full p-6 sm:p-10 bg-white dark:bg-[#0A0E17] text-slate-900 dark:text-white flex flex-col justify-between overflow-y-auto max-h-[90vh] relative">
          
          {/* Close Button top-right */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition z-10 cursor-pointer border-0 bg-transparent"
            aria-label="Close portal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                ATHLETE ACCESS PORTAL
              </span>
              <h3 className="text-xl font-bold font-sans text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
                {isForgot ? "Reset Password" : isSignUp ? "Create Account" : "Sign In"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isForgot 
                  ? "Enter your email to retrieve recovery parameters" 
                  : isSignUp ? "Build your personal AlexFitnessHub profile" : "Gain instant workout ecosystem credentials"}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex flex-col gap-2 font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-350 font-semibold">
                {message}
              </div>
            )}

            {/* Primary Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && !isForgot && (
                <div>
                  <label htmlFor="auth-name-input" className="block text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 mb-1 uppercase">YOUR ATHLETE NAME</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-name-input"
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onBlur={() => setValidation(prev => ({ ...prev, name: validateName(name) }))}
                      aria-invalid={!!validation.name}
                      aria-describedby={validation.name ? "name-error" : undefined}
                      className={`w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-semibold transition ${
                        validation.name === "" && name.trim().length >= 3
                          ? "border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500"
                          : validation.name
                          ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-800 focus:ring-[#C0392B] focus:border-[#C0392B]"
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {validation.name === "" && name.trim().length >= 3 && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {validation.name && (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                  {validation.name && (
                    <p id="name-error" className="mt-1 text-[10px] text-rose-500 font-bold flex items-center gap-1 animate-fade-in" aria-live="polite">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {validation.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="auth-email-input" className="block text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 mb-1 uppercase">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, email: validateEmail(email) }))}
                    aria-invalid={!!validation.email}
                    aria-describedby={validation.email ? "email-error" : undefined}
                    className={`w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-semibold transition ${
                      validation.email === "" && email.length > 0
                        ? "border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500"
                        : validation.email
                        ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:ring-[#C0392B] focus:border-[#C0392B]"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {validation.email === "" && email.length > 0 && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                    {validation.email && (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>
                {validation.email && (
                  <p id="email-error" className="mt-1 text-[10px] text-rose-500 font-bold flex items-center gap-1 animate-fade-in" aria-live="polite">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {validation.email}
                  </p>
                )}
              </div>

              {!isForgot && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="auth-password-input" className="block text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 uppercase">PASSWORD</label>
                    <button
                      type="button"
                      onClick={() => { setIsForgot(true); setError(""); setMessage(""); }}
                      className="text-[10px] text-[#C0392B] dark:text-[#E74C3C] hover:underline font-bold bg-transparent border-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => setValidation(prev => ({ ...prev, password: validatePassword(password) }))}
                      aria-invalid={!!validation.password}
                      aria-describedby={validation.password ? "password-error" : undefined}
                      className={`w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-semibold transition ${
                        validation.password === "" && password.length >= 6
                          ? "border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500"
                          : validation.password
                          ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                          : "border-slate-200 dark:border-slate-800 focus:ring-[#C0392B] focus:border-[#C0392B]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer bg-transparent border-0"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validation.password && (
                    <p id="password-error" className="mt-1 text-[10px] text-rose-500 font-bold flex items-center gap-1 animate-fade-in" aria-live="polite">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {validation.password}
                    </p>
                  )}
                </div>
              )}
              
              {!isForgot && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#C0392B] border-slate-300 dark:border-slate-700 rounded focus:ring-[#C0392B] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 cursor-pointer uppercase select-none">
                    Remember Me
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-xs font-black text-white uppercase tracking-wider bg-[#C0392B] hover:bg-[#A82E22] transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {submitting ? "Processing..." : isForgot ? "Recover Account" : isSignUp ? "Build My Profile" : "Accredited Sign In"}
              </button>
            </form>

            {/* Social Authentication */}
            {!isForgot && (
              <div className="space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-full border-t border-slate-150 dark:border-slate-800" />
                  <span className="relative px-3 bg-white dark:bg-[#0A0E17] text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase font-bold">OR ACCELERATE WITH</span>
                </div>

                <button
                  onClick={() => handleOAuth("google")}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer bg-white dark:bg-slate-900/40"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Connect with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-900 pt-4">
            {isForgot ? (
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(""); }}
                className="text-xs text-[#C0392B] dark:text-[#E74C3C] hover:underline font-bold bg-transparent border-0 cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSignUp ? "Already have a profile?" : "New to AlexFitnessHub?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                  className="font-bold text-[#C0392B] dark:text-[#E74C3C] hover:underline cursor-pointer bg-transparent border-0"
                >
                  {isSignUp ? "Sign In Instead" : "Create Account Now"}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
