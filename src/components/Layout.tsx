import { Header } from "./Header";
import { UserInfo } from "./UserInfo";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Header />
      <UserInfo />
      {children}
    </div>
  );
};