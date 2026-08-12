import React from "react";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  DollarSign,
  ShieldCheck,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import { AppUser } from "../types";

export type TabType =
  | "dashboard"
  | "fornitori"
  | "voci_costo"
  | "fatture"
  | "analytics"
  | "import_export"
  | "ai_assistant";

export type ActiveTab = TabType;

interface SidebarProps {
  currentUser?: AppUser;
  onLogout?: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedFY: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  selectedFY,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "fornitori" as TabType,
      label: "Fornitori",
      icon: Building2,
    },
    {
      id: "voci_costo" as TabType,
      label: "Voci Costo",
      icon: DollarSign,
    },
    {
      id: "fatture" as TabType,
      label: "Fatture",
      icon: Receipt,
    },
    {
      id: "analytics" as TabType,
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "import_export" as TabType,
      label: "Import/Export",
      icon: FileSpreadsheet,
    },
    {
      id: "ai_assistant" as TabType,
      label: "AI Advisor",
      icon: Bot,
      badge: "AI",
    },
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full select-none py-2">
      <div>
        {/* Top App Logo (Emerald rounded icon like screenshot) */}
        <div id="sidebar-header" className="px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-600/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.8L18.6 8 12 11.2 5.4 8 12 4.8zM5 9.5l6 3.6v6.4l-6-3.3V9.5zm14 6.7l-6 3.3v-6.4l6-3.6v6.7z"/>
              </svg>
            </div>
            <div className="hidden xl:block">
              <h1 className="font-black text-slate-800 text-sm tracking-tight leading-tight">
                IT BUDGET
              </h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                {selectedFY} Management
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items list */}
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? "bg-emerald-50/80 text-emerald-700 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
                title={item.label}
              >
                {/* Active Left Pill Indicator Bar (as seen in screenshot) */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-emerald-600 rounded-r-full shadow-xs" />
                )}

                <div className="flex items-center gap-3 pl-1">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="hidden xl:inline text-xs tracking-tight">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-600 text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card & Logout */}
      <div className="px-2 pt-4 border-t border-slate-100">
        {currentUser && (
          <div className="flex flex-col gap-2">
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    currentUser.role === "Admin"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">
                    {currentUser.role === "Admin" ? "Admin Store" : "Viewer"}
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Disconnetti"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Floating Rail/Sidebar */}
      <aside
        id="sidebar-container"
        className="hidden lg:flex w-20 xl:w-60 bg-white rounded-3xl border border-slate-200/70 shadow-sm h-[calc(100vh-1.5rem)] my-3 ml-3 shrink-0 sticky top-3 z-30 flex-col"
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-left p-2">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

