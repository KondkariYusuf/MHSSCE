import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  LayoutDashboard,
  Building2,
  Upload,
  CheckSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Institutes", path: "/institutes", icon: Building2 },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Upload", path: "/upload", icon: Upload },
  { label: "Approvals", path: "/approvals", icon: CheckSquare },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

export function SidebarNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden brutal-button !p-2"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary border-r-[3px] border-foreground flex flex-col transition-transform duration-200 ${
          collapsed
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b-[3px] border-foreground/30">
          <h1 className="text-2xl font-mono font-bold text-primary-foreground tracking-tighter">
            AICP
          </h1>
          <p className="text-xs text-primary-foreground/80 font-medium mt-1 uppercase tracking-widest">
            Compliance Portal
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setCollapsed(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-foreground/20 text-primary-foreground border-l-4 border-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-[3px] border-foreground/30">
          <div className="text-xs text-primary-foreground/60 mb-3 font-medium">
            Logged in as <br />
            <span className="text-primary-foreground font-bold">
              {profile?.full_name ?? "..."}
            </span>
            <br />
            <span className="uppercase tracking-wider">
              {profile?.role ?? ""}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm font-bold uppercase tracking-wider"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
