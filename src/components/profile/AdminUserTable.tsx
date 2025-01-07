import { Button } from "@/components/ui/button";
import { ProfileEditor } from "./ProfileEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const AdminUserTable = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: authUsers, error } = await supabase.rpc('get_auth_users');
      
      if (error) throw error;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Combine auth users with their profiles
      const combinedUsers = authUsers.map(authUser => ({
        ...authUser,
        ...profiles.find(profile => profile.id === authUser.id)
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: "Password Reset",
        description: "Password has been reset successfully"
      });

      setShowPasswordDialog(false);
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search users..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowProfileDialog(true);
                    }}
                    className="hover:text-primary text-left w-full"
                  >
                    {user.email}
                  </button>
                </TableCell>
                <TableCell>{user.display_name || "Not set"}</TableCell>
                <TableCell>{user.role || "user"}</TableCell>
                <TableCell>
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordDialog(true);
                      }}
                    >
                      Reset Password
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleDialog(true);
                      }}
                    >
                      Change Role
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Profile Editor Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <ProfileEditor 
              user={selectedUser}
              onSave={() => {
                setShowProfileDialog(false);
                loadUsers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};