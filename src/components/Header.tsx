import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Key,
  LogOut,
  Settings,
  User,
  Users,
  Book,
  UserCircle,
  Home,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useAnswers } from "@/contexts/AnswersContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const Header = () => {
  const { setCurrentView } = useView();
  const { clearAnswers } = useAnswers();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
  
        setIsAdmin(profile?.role === "admin");
      }
    };
  
    checkAdminStatus();
  }, []);
  
  const handleViewChange = (view: "user" | "admin") => {
    setCurrentView(view);
    navigate("/questionnaire");
  };

  const handleNewApplication = () => {
    // Clear selected application ID
    localStorage.removeItem("application_id");
    // Clear any existing answers
    localStorage.removeItem("quiz_answers");
    setCurrentView("user");
    navigate("/questionnaire");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("sb-mtpwbtkilrsmwsyyhqky-auth-token");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Logo/Home Link */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 font-semibold hover:text-primary transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="hidden md:inline-block">AWS InCommunities</span>
          </button>

          {/* Main Navigation */}
          <Menubar className="hidden md:flex border-none">
            {isAdmin && (
              // Only show the Change View menu if the user is an admin
              <MenubarMenu>
                <MenubarTrigger className="font-medium">
                  Change View
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => handleViewChange("user")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>App User View</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => handleViewChange("admin")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>App Admin View</span>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            )}
            <MenubarMenu>
              <MenubarTrigger className="font-medium">Account</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">
                Applications
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => navigate("/applications")}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>View Applications</span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={handleNewApplication}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>New Application</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">Settings</MenubarTrigger>
              <MenubarContent>               
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => navigate("/documentation")}
                >
                  <Book className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Mobile Menu */}
          <div className="flex md:hidden ml-auto">
            <Menubar className="border-none">
              <MenubarMenu>
                <MenubarTrigger>
                  <User className="h-5 w-5" />
                </MenubarTrigger>
                <MenubarContent>
                  {isAdmin && (
                    <>
                      <MenubarItem
                        className="cursor-pointer"
                        onClick={() => handleViewChange("user")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>App User View</span>
                      </MenubarItem>
                      <MenubarItem
                        className="cursor-pointer"
                        onClick={() => handleViewChange("admin")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>App Admin View</span>
                      </MenubarItem>
                    </>
                  )}
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => navigate("/documentation")}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    <span>Documentation</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };