import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CakeSlice, Mail, Lock, ArrowRight, Eye, EyeOff, Phone, KeyRound, ArrowLeft, User } from "lucide-react";

export function LoginPage({ onLogin }: { onLogin: (email: string) => void }) {
  const [view, setView] = useState<"login" | "forgot_password" | "otp" | "reset_password">("login");
  const [otpFlow, setOtpFlow] = useState<"login" | "reset" | "register">("reset");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetContact, setResetContact] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 10000);
  };

  const verifyOtp = async (otpCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: resetContact, otp: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        setError("");
        if (otpFlow === "login") {
          onLogin(resetContact);
        } else {
          setView("reset_password");
        }
      } else {
        setError(data.error || "Incorrect OTP");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === "login") {
      const storedUsers = JSON.parse(localStorage.getItem("frezzo_users") || "{}");
      
      const isEmail = email.includes("@");
      const cleanPhone = email.replace(/[^0-9]/g, "");
      const isAllowedEmail = isEmail && email.toLowerCase() === "asamlaxman2003@gmail.com";
      const isAllowedPhone = !isEmail && (cleanPhone === "9346122148" || cleanPhone === "919346122148");

      if (!isAllowedEmail && !isAllowedPhone) {
        setError("Access Denied. Only the authorized user is permitted.");
        return;
      }

      const cleanPhoneInput = email.replace(/[^0-9]/g, "");
      const isAllowedPhoneLogin = cleanPhoneInput === "9346122148" || cleanPhoneInput === "919346122148";

      // Use a hardcoded "correct" email and password, plus any registered users
      if (
        (email.toLowerCase() === "asamlaxman2003@gmail.com" && password === "password") || 
        (isAllowedPhoneLogin && password === "password") ||
        storedUsers[email] === password
      ) {
        setError("");
        onLogin(email);
      } else {
        setError("Incorrect email/phone or password");
      }
    } else if (view === "forgot_password") {
      if (resetContact.length >= 5) {
        // Validation for email or phone number
        const isEmail = resetContact.includes("@");
        // phone is anything that has numbers but doesn't have @
        const hasDigits = /[0-9]/.test(resetContact);
        const isPhone = !isEmail && hasDigits;

        const cleanPhone = resetContact.replace(/[^0-9]/g, "");
        const isAllowedEmail = isEmail && resetContact.toLowerCase() === "asamlaxman2003@gmail.com";
        const isAllowedPhone = !isEmail && (cleanPhone === "9346122148" || cleanPhone === "919346122148");

        if (!isAllowedEmail && !isAllowedPhone) {
          setError("Access Denied. Only the authorized developer phone number (9346122148) or email is permitted.");
          return;
        }

        if (isPhone) {
          const cleanPhoneWithPlus = resetContact.replace(/[^0-9+]/g, "");
          const phoneRegex = /^\+?[0-9]{10,15}$/;
          if (!phoneRegex.test(cleanPhoneWithPlus)) {
            setError("Invalid phone number. Please enter a valid 10-15 digit phone number.");
            return;
          }
        }

        // If trying to login or reset password, check if user is already registered
        if (otpFlow === "login" || otpFlow === "reset") {
          const storedUsers = JSON.parse(localStorage.getItem("frezzo_users") || "{}");
          const isRegistered = (resetContact.toLowerCase() === "asamlaxman2003@gmail.com") || 
            (cleanPhone === "9346122148" || cleanPhone === "919346122148") ||
            (storedUsers[resetContact] !== undefined);
          
          if (!isRegistered) {
            setError(isPhone ? "This phone number is not registered." : "This email is not registered.");
            return;
          }
        }

        // If trying to register, check if user is already registered!
        if (otpFlow === "register") {
          const storedUsers = JSON.parse(localStorage.getItem("frezzo_users") || "{}");
          const isRegistered = (resetContact.toLowerCase() === "asamlaxman2003@gmail.com") || 
            (cleanPhone === "9346122148" || cleanPhone === "919346122148") ||
            (storedUsers[resetContact] !== undefined);
          
          if (isRegistered) {
            setError(isPhone ? "This phone number is already registered. Please log in instead." : "This email is already registered. Please log in instead.");
            return;
          }
        }

        setIsLoading(true);
        try {
          const res = await fetch("/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact: resetContact })
          });
          const data = await res.json();
          if (data.success) {
            setView("otp");
            setOtp("");
            setResendTimer(25);
            showNotification(`OTP sent to your mobile/email: ${data.devOtp}`);
          } else {
            setError(data.error || "Failed to send OTP");
          }
        } catch (err) {
          setError("Failed to connect to the server");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Please enter a valid email or phone number");
      }
    } else if (view === "otp") {
      await verifyOtp(otp);
    } else if (view === "reset_password") {
      if (newPassword === confirmPassword && newPassword.length >= 6) {
        setError("");
        
        // Save to local storage for future logins
        const storedUsers = JSON.parse(localStorage.getItem("frezzo_users") || "{}");
        storedUsers[resetContact] = newPassword;
        localStorage.setItem("frezzo_users", JSON.stringify(storedUsers));

        if (otpFlow === "register") {
          showNotification("Account registered successfully! You are now logged in.");
        } else {
          showNotification("Password reset successfully! You are now logged in.");
        }
        onLogin(resetContact);
      } else if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
      } else {
        setError("Password must be at least 6 characters long");
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#FFF9F2] flex flex-col relative overflow-hidden">
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          className="fixed top-6 left-1/2 z-50 bg-[#4A2E1B] text-[#FFF9F2] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-medium whitespace-nowrap"
        >
          <Mail className="w-4 h-4 text-[#F48FB1]" />
          {notification}
        </motion.div>
      )}
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F8BBD0]/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D7CCC8]/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full p-8 justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#4A2E1B] flex items-center justify-center mb-6 shadow-lg">
             <CakeSlice className="w-8 h-8 text-[#FFF9F2]" />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Georgia', serif" }} className="text-4xl font-bold tracking-tight text-[#4A2E1B] mb-2">Frezzo</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#F48FB1]">The Desserts</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          onSubmit={handleSubmit} 
          className="space-y-5 w-full max-w-xs mx-auto"
        >
          {view === "login" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">Email or Phone Number</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] placeholder:text-[#A89F91]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-12 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] placeholder:text-[#A89F91]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#A89F91] hover:text-[#8B5E3C] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  {error ? (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                  ) : (
                    <div />
                  )}
                  <button 
                    type="button" 
                    onClick={() => {
                      setError("");
                      setOtpFlow("reset");
                      setView("forgot_password");
                    }}
                    className="text-[10px] text-[#8B5E3C] hover:text-[#F48FB1] font-semibold transition-colors uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#F48FB1] hover:bg-[#F06292] disabled:opacity-50 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-md flex items-center justify-center gap-2 group"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setOtpFlow("login");
                      setView("forgot_password");
                    }}
                    className="py-4 bg-white border border-[#EAE0D5] hover:bg-[#FFF9F2] text-[#8B5E3C] text-[10px] uppercase tracking-[0.1em] font-bold transition-colors rounded-2xl shadow-sm flex items-center justify-center gap-1 group"
                  >
                    Login with OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setOtpFlow("register");
                      setView("forgot_password");
                    }}
                    className="py-4 bg-white border border-[#EAE0D5] hover:bg-[#FFF9F2] text-[#8B5E3C] text-[10px] uppercase tracking-[0.1em] font-bold transition-colors rounded-2xl shadow-sm flex items-center justify-center gap-1 group"
                  >
                    Register User
                  </button>
                </div>
              </div>
            </>
          )}

          {view === "forgot_password" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#4A2E1B] mb-2">
                  {otpFlow === "login" ? "Login with OTP" : (otpFlow === "register" ? "Register Account" : "Reset Password")}
                </h2>
                <p className="text-xs text-[#8B5E3C]">Enter your email or phone number to receive an OTP.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">Email or Phone</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type="text" 
                    required
                    value={resetContact}
                    onChange={(e) => setResetContact(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] placeholder:text-[#A89F91]"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{error}</p>}
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#F48FB1] hover:bg-[#F06292] disabled:opacity-50 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-md flex items-center justify-center gap-2 group"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("login");
                  }}
                  className="w-full py-4 bg-transparent border border-[#EAE0D5] hover:bg-white text-[#8B5E3C] text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-sm flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}

          {view === "otp" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#4A2E1B] mb-2">Verify OTP</h2>
                <p className="text-xs text-[#8B5E3C]">Enter the 6-digit code sent to your email or phone.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">OTP Code</label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type="text" 
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] tracking-widest placeholder:text-[#A89F91] placeholder:tracking-normal"
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{error}</p>}
                
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={async () => {
                      if (resendTimer > 0) return;
                      setIsLoading(true);
                      try {
                        const res = await fetch("/api/send-otp", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ contact: resetContact })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setOtp("");
                          setResendTimer(25);
                          showNotification(`OTP resent to your mobile/email: ${data.devOtp}`);
                        } else {
                          setError(data.error || "Failed to resend OTP");
                        }
                      } catch (err) {
                        setError("Failed to connect to the server");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className={resendTimer > 0 ? "text-[10px] text-[#A89F91] font-semibold uppercase tracking-wider cursor-not-allowed" : "text-[10px] text-[#8B5E3C] hover:text-[#F48FB1] font-semibold transition-colors uppercase tracking-wider"}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP?"}
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#4A2E1B] hover:bg-[#3E2723] disabled:opacity-50 text-[#FFF9F2] text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-md flex items-center justify-center gap-2 group"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("forgot_password");
                  }}
                  className="w-full py-4 bg-transparent border border-[#EAE0D5] hover:bg-white text-[#8B5E3C] text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-sm flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  Change Contact Method
                </button>
              </div>
            </motion.div>
          )}

          {view === "reset_password" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#4A2E1B] mb-2">
                  {otpFlow === "register" ? "Create Password" : "Create New Password"}
                </h2>
                <p className="text-xs text-[#8B5E3C]">Enter your new password below.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-12 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] placeholder:text-[#A89F91]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#A89F91] hover:text-[#8B5E3C] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-semibold ml-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-[#A89F91]" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-[#EAE0D5] shadow-sm rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#F48FB1] focus:ring-1 focus:ring-[#F48FB1]/50 transition-all text-sm text-[#4A2E1B] placeholder:text-[#A89F91]"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{error}</p>}
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#F48FB1] hover:bg-[#F06292] disabled:opacity-50 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-2xl shadow-md flex items-center justify-center gap-2 group"
                >
                  {isLoading ? "Saving..." : (otpFlow === "register" ? "Register & Login" : "Reset & Login")}
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.form>
      </div>
    </div>
  );
}
