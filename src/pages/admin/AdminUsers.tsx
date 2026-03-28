import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trash2, Shield, ShieldOff, Search, PiggyBank, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  created_at: string;
  isAdmin: boolean;
  savingsCount: number;
  totalSaved: number;
  expensesCount: number;
  totalSpent: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    const [profilesRes, rolesRes, savingsRes, expensesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("savings").select("user_id, amount, withdrawn"),
      supabase.from("expenses").select("user_id, amount"),
    ]);

    const roles = rolesRes.data || [];
    const savings = savingsRes.data || [];
    const expenses = expensesRes.data || [];

    const userList: UserProfile[] = (profilesRes.data || []).map((p) => {
      const userSavings = savings.filter((s) => s.user_id === p.id && !s.withdrawn);
      const userExpenses = expenses.filter((e) => e.user_id === p.id);
      return {
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        created_at: p.created_at,
        isAdmin: roles.some((r) => r.user_id === p.id && r.role === "admin"),
        savingsCount: userSavings.length,
        totalSaved: userSavings.reduce((s, v) => s + Number(v.amount), 0),
        expensesCount: userExpenses.length,
        totalSpent: userExpenses.reduce((s, v) => s + Number(v.amount), 0),
      };
    });

    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId + "-delete");
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setActionLoading(null);
  };

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    setActionLoading(userId + "-role");
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) { toast.error("Failed to remove admin role"); }
      else { toast.success("Admin role removed"); fetchUsers(); }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) { toast.error("Failed to assign admin role"); }
      else { toast.success("Admin role assigned"); fetchUsers(); }
    }
    setActionLoading(null);
  };

  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered {users.length === 1 ? "user" : "users"}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "Admins", value: users.filter((u) => u.isAdmin).length, icon: Shield, color: "text-amber-500 bg-amber-500/10" },
          { label: "Regular Users", value: users.filter((u) => !u.isAdmin).length, icon: Users, color: "text-primary bg-primary/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground font-display">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-display">All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Savings</TableHead>
                  <TableHead className="hidden md:table-cell">Expenses</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      {search ? "No users match your search" : "No users yet"}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(user.username || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{user.username || "—"}</p>
                          {user.full_name && (
                            <p className="text-xs text-muted-foreground">{user.full_name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isAdmin ? "default" : "secondary"}
                        className={user.isAdmin ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : ""}
                      >
                        {user.isAdmin ? (
                          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span>
                        ) : (
                          "User"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-medium text-foreground">{user.totalSaved.toLocaleString()} RWF</span>
                        <span>({user.savingsCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 text-rose-500" />
                        <span className="font-medium text-foreground">{user.totalSpent.toLocaleString()} RWF</span>
                        <span>({user.expensesCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={actionLoading === user.id + "-role"}
                          onClick={() => toggleAdmin(user.id, user.isAdmin)}
                          title={user.isAdmin ? "Remove admin" : "Make admin"}
                        >
                          {user.isAdmin ? (
                            <ShieldOff className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove <strong>{user.username || "this user"}</strong> and all their data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
