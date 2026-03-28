import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, CheckCircle, AlertCircle, Lock, User, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.info("An admin account already exists. Please sign in.");
        navigate("/auth");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Setup failed");
      }

      setDone(true);
      toast.success("Admin account created successfully!");
    } catch (err: any) {
      if (err.message.includes("Failed to fetch") || err.message.includes("404")) {
        toast.error("Setup endpoint unavailable. Please add your SUPABASE_SERVICE_ROLE_KEY in Replit Secrets.");
      } else {
        toast.error(err.message || "Setup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Created!</h1>
            <p className="text-muted-foreground mt-2">
              You can now sign in with username <strong className="text-foreground">{username}</strong> and your chosen password.
            </p>
          </div>
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80"
            onClick={() => navigate("/auth")}
          >
            Go to Sign In <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Setup</h1>
          <p className="text-muted-foreground mt-2 text-sm">Create the first administrator account</p>
        </div>

        <Card className="border-border shadow-xl shadow-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create Admin Account</CardTitle>
            <CardDescription>
              This page is only accessible once. After an admin exists, it will be locked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <>Create Admin Account <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex gap-3 p-4">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-amber-600">Requires SUPABASE_SERVICE_ROLE_KEY</p>
              <p>Add your Supabase Service Role Key in Replit Secrets (key name: <code className="bg-muted px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>) for this setup to work.</p>
              <p>Find it in: Supabase Dashboard → Project Settings → API → service_role</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
