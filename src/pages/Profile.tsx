import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { AdminUserTable } from "@/components/profile/AdminUserTable";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { currentView } = useView();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser({ ...user, ...profile });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Management</h1>
        
        {currentView === "admin" ? (
          <AdminUserTable currentUser={currentUser} />
        ) : (
          <ProfileEditor user={currentUser} />
        )}
      </div>
    </Layout>
  );
};

export default Profile;