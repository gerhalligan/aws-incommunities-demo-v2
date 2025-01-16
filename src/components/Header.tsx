import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Key, LogOut, Settings, User, Users, Book, UserCircle, Home, FileText } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { setCurrentView } = useView();
  const navigate = useNavigate();

  const handleViewChange = (view: "user" | "admin") => {
    setCurrentView(view);
    navigate("/questionnaire");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('sb-mtpwbtkilrsmwsyyhqky-auth-token');
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
            <MenubarMenu>
              <MenubarTrigger className="font-medium">Change View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="cursor-pointer" onClick={() => handleViewChange("user")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>App User View</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => handleViewChange("admin")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>App Admin View</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

              <MenubarMenu>
              <MenubarTrigger className="font-medium">Account</MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="font-medium">Settings</MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/reports")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Reports</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/documentation")}>
                  <Book className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </MenubarItem>
                <MenubarItem 
                 className="cursor-pointer" 
                 onClick={() => {
                   setCurrentView("user");
                   navigate("/questionnaire");
                   // Force completion state
                   window.localStorage.setItem("force_quiz_complete", "true");
                   window.location.reload();
                 }}
               >
                 <FileText className="mr-2 h-4 w-4" />
                 <span>Quiz Summary (Debug)</span>
               </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

          
          </Menubar>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden ml-auto">
          <Menubar className="border-none">
            <MenubarMenu>
              <MenubarTrigger>
                <User className="h-5 w-5" />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="cursor-pointer" onClick={() => handleViewChange("user")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>App User View</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => handleViewChange("admin")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>App Admin View</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/documentation")}>
                  <Book className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  );
};