import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trash2, Shield, ShieldOff, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      toast.error("Failed to delete user");
      return;
    }
    toast.success("User deleted");
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) {
        toast.error("Failed to remove admin role");
        return;
      }
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) {
        toast.error("Failed to assign admin role");
        return;
      }
      toast.success("Admin role assigned");
    }
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <Badge variant="secondary" className="ml-auto">{users.length} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Savings</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{user.username || "No username"}</p>
                        {user.full_name && (
                          <p className="text-xs text-muted-foreground">{user.full_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? "default" : "secondary"}>
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          {user.totalSaved.toLocaleString()} RWF
                        </p>
                        <p className="text-xs text-muted-foreground">{user.savingsCount} entries</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="text-sm font-medium text-red-500">
                          {user.totalSpent.toLocaleString()} RWF
                        </p>
                        <p className="text-xs text-muted-foreground">{user.expensesCount} entries</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
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
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {user.username || "this user"} and all their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
