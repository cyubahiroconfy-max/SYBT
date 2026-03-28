import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank, Mail, Phone, User, Lock, Eye, EyeOff,
  Sparkles, TrendingUp, Shield, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";
type AuthMethod = "email" | "phone";

const features = [
  { icon: TrendingUp, text: "Track your savings & spending" },
  { icon: Shield, text: "Secure & private budgeting" },
  { icon: Sparkles, text: "Smart financial insights" },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const credentials: any = {
          password,
          options: {
            data: { username },
          },
        };
        if (method === "email") {
          credentials.email = email;
        } else {
          credentials.phone = phone;
        }

        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast.success(
            "Account created! Please check your email to verify your account before signing in.",
            { duration: 6000 }
          );
        } else {
          toast.success("Account created! You're now signed in.");
          navigate("/");
        }
      } else {
        let result;
        if (method === "email") {
          result = await supabase.auth.signInWithPassword({ email, password });
        } else {
          result = await supabase.auth.signInWithPassword({ phone, password });
        }
        if (result.error) throw result.error;
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary-foreground"
              style={{
                width: 80 + i * 40,
                height: 80 + i * 40,
                top: `${10 + i * 15}%`,
                left: `${5 + i * 12}%`,
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-primary-foreground max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-primary-foreground/20 backdrop-blur-sm p-4 rounded-2xl inline-flex mb-6">
              <PiggyBank className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
              Smart Youth
              <br />
              Budget Tracker
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Take control of your finances. Save smarter, spend wiser, and build your future — one budget at a time.
            </p>
          </motion.div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3"
              >
                <f.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile branding */}
          <div className="text-center mb-8 lg:hidden">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-accent p-4 rounded-2xl mb-4 shadow-lg"
            >
              <PiggyBank className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Smart Youth Budget Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save smart, spend wise 💰
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {mode === "signin" ? "Welcome back!" : "Get started"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === "signin"
                ? "Sign in to continue managing your finances"
                : "Create your free account to start budgeting"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-primary/5">
            {/* Mode toggle */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              {(["signin", "signup"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Method toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={method === "email" ? "default" : "outline"}
                className="flex-1 gap-2 rounded-xl"
                size="sm"
                onClick={() => setMethod("email")}
              >
                <Mail className="h-4 w-4" /> Email
              </Button>
              <Button
                type="button"
                variant={method === "phone" ? "default" : "outline"}
                className="flex-1 gap-2 rounded-xl"
                size="sm"
                onClick={() => setMethod("phone")}
              >
                <Phone className="h-4 w-4" /> Phone
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {method === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 7XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                📧 You'll receive a verification email to confirm your account
              </p>
            )}
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
