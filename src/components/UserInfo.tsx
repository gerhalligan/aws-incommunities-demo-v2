import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const UserInfo = () => {
  const [userInfo, setUserInfo] = useState<{
    displayName?: string;
    email?: string;
    role?: string;
  }>({});

  useEffect(() => {
    // In UserInfo.tsx
    const loadUserInfo = async () => {
      try {
        // Get auth user data
        const { data: authData, error: authError } = await supabase
          .rpc('get_current_user');
        
        if (authError) throw authError;
    
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_current_user_profile');
        
        if (profileError) throw profileError;
    
        // Combine the data
        setUserInfo({
          displayName: profileData?.[0]?.display_name,
          email: authData?.[0]?.email,
          role: profileData?.[0]?.role || 'user'
        });
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };


    loadUserInfo();
  }, []);

  if (!userInfo.email) return null;

  return (
    <div className="w-full bg-gray-50 border-b border-gray-200 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {userInfo.displayName || userInfo.email}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
            {userInfo.role}
          </span>
        </div>
      </div>
    </div>
  );
};