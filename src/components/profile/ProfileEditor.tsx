import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileEditorProps {
  user: any;
}

export const ProfileEditor = ({ user }: ProfileEditorProps) => {
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate phone number
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (phoneNumber && !phoneRegex.test(phoneNumber)) {
        throw new Error("Invalid phone number format");
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          phone_number: phoneNumber
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        if (newPassword.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;
      }

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully."
      });

      // Refresh the page to show updated data
      window.location.reload();

      // Clear password fields
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t mt-6">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Display Name</p>
            <p className="font-medium">{displayName || "Not set"}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{phoneNumber || "Not set"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};