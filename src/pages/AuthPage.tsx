import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank, Mail, Phone, User, Lock, Eye, EyeOff,
  Sparkles, TrendingUp, Shield, ArrowRight, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type AuthMode = "signin" | "signup";
type SignInMethod = "email" | "phone" | "username";
type SignUpStep = "form" | "verify-email" | "verify-phone";

const features = [
  { icon: TrendingUp, text: "Track your savings & spending" },
  { icon: Shield, text: "Secure & private budgeting" },
  { icon: Sparkles, text: "Smart financial insights" },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("email");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const resetForm = () => {
    setSignUpStep("form");
    setEmailOtp("");
    setPhoneOtp("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;

      if (data.user && !data.session) {
        setSignUpStep("verify-email");
        toast.success("Account created! Check your email for a 6-digit code.", { duration: 6000 });
      } else {
        toast.success("Account created! You're now signed in.");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length < 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: emailOtp,
        type: "signup",
      });
      if (error) throw error;

      if (phone) {
        const { error: smsError } = await supabase.auth.updateUser({ phone });
        if (!smsError) {
          setSignUpStep("verify-phone");
          toast.success("Email verified! Now verify your phone number.");
          return;
        }
      }
      toast.success("Email verified! Welcome to Smart Youth Budget Tracker.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("Verification code resent to your email.");
      setEmailOtp("");
    } catch (err: any) {
      toast.error(err.message || "Could not resend email.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length < 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: phoneOtp,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Phone verified! You're all set.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPhone = () => {
    toast.success("Welcome to Smart Youth Budget Tracker!");
    navigate("/");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (signInMethod === "phone") {
        result = await supabase.auth.signInWithPassword({
          phone: loginIdentifier,
          password,
        });
      } else if (signInMethod === "username") {
        const { data: lookupData, error: lookupError } = await supabase.functions.invoke(
          "lookup-email-by-username",
          { body: { username: loginIdentifier } }
        );
        if (lookupError || !lookupData?.email) {
          throw new Error(lookupData?.error || "Username not found");
        }
        result = await supabase.auth.signInWithPassword({
          email: lookupData.email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: loginIdentifier,
          password,
        });
      }
      if (result?.error) throw result.error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
    />
  );

  const renderVerifyEmail = () => (
    <motion.div
      key="verify-email"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Verify your email</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-semibold">Verification Code</Label>
        <div className="flex justify-center pt-1">
          <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
        disabled={loading || emailOtp.length < 6}
        onClick={handleVerifyEmailOtp}
      >
        {loading ? <Spinner /> : <>Verify Email <ArrowRight className="h-4 w-4" /></>}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary gap-1.5"
          disabled={resending}
          onClick={handleResendEmail}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Sending..." : "Resend code"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center bg-muted/60 rounded-lg px-3 py-2">
        Make sure to check your spam folder. The code expires in 60 minutes.
      </p>
    </motion.div>
  );

  const renderVerifyPhone = () => (
    <motion.div
      key="verify-phone"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Verify your phone</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the 6-digit code sent to <strong className="text-foreground">{phone}</strong>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={phoneOtp} onChange={setPhoneOtp}>
          <InputOTPGroup>
            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
        disabled={loading || phoneOtp.length < 6}
        onClick={handleVerifyPhoneOtp}
      >
        {loading ? <Spinner /> : <>Verify Phone <ArrowRight className="h-4 w-4" /></>}
      </Button>

      <Button variant="outline" className="w-full rounded-xl" onClick={handleSkipPhone}>
        Skip for now
      </Button>
    </motion.div>
  );

  const renderSignUpForm = () => (
    <motion.form
      key="signup-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSignUp}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="username" placeholder="Choose a username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-semibold">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="signup-email" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-phone" className="text-sm font-semibold">
          Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="signup-phone" type="tel" placeholder="+250 7XX XXX XXX" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-semibold">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="signup-password" type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
            required minLength={6} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit"
        className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
        disabled={loading}>
        {loading ? <Spinner /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You'll verify your email with a 6-digit code after signing up
      </p>
    </motion.form>
  );

  const renderSignInForm = () => (
    <motion.form
      key="signin-form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSignIn}
      className="space-y-4"
    >
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {([
          { key: "email" as SignInMethod, icon: Mail, label: "Email" },
          { key: "phone" as SignInMethod, icon: Phone, label: "Phone" },
          { key: "username" as SignInMethod, icon: User, label: "Username" },
        ]).map((m) => (
          <button key={m.key} type="button"
            onClick={() => setSignInMethod(m.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              signInMethod === m.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}>
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-id" className="text-sm font-semibold">
          {signInMethod === "email" ? "Email" : signInMethod === "phone" ? "Phone Number" : "Username"}
        </Label>
        <div className="relative">
          {signInMethod === "email" ? (
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          ) : signInMethod === "phone" ? (
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          ) : (
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input id="login-id"
            type={signInMethod === "email" ? "email" : signInMethod === "phone" ? "tel" : "text"}
            placeholder={
              signInMethod === "email" ? "you@example.com"
                : signInMethod === "phone" ? "+250 7XX XXX XXX"
                : "Your username"
            }
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
            required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm font-semibold">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="login-password" type={showPassword ? "text" : "password"}
            placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
            required minLength={6} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit"
        className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
        disabled={loading}>
        {loading ? <Spinner /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
      </Button>
    </motion.form>
  );

  const renderContent = () => {
    if (mode === "signup") {
      if (signUpStep === "verify-email") return renderVerifyEmail();
      if (signUpStep === "verify-phone") return renderVerifyPhone();
      return renderSignUpForm();
    }
    return renderSignInForm();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-primary-foreground"
              style={{ width: 80 + i * 40, height: 80 + i * 40, top: `${10 + i * 15}%`, left: `${5 + i * 12}%` }}
              animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
          ))}
        </div>
        <div className="relative z-10 text-primary-foreground max-w-md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="bg-primary-foreground/20 backdrop-blur-sm p-4 rounded-2xl inline-flex mb-6">
              <PiggyBank className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
              Smart Youth<br />Budget Tracker
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Take control of your finances. Save smarter, spend wiser, and build your future — one budget at a time.
            </p>
          </motion.div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <f.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-accent p-4 rounded-2xl mb-4 shadow-lg">
              <PiggyBank className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">Smart Youth Budget Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Save smart, spend wise</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {mode === "signin" ? "Welcome back!" : signUpStep === "form" ? "Get started" : "Verify your account"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === "signin"
                ? "Sign in to continue managing your finances"
                : signUpStep === "form"
                ? "Create your free account to start budgeting"
                : "One last step to secure your account"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-primary/5">
            {signUpStep === "form" && (
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                {(["signin", "signup"] as AuthMode[]).map((m) => (
                  <button key={m} type="button"
                    onClick={() => { setMode(m); resetForm(); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      mode === m ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Prepared by Cyubahiro Confiance · March 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
