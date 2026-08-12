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
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Eye
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
      label: "Fornitori IT",
      icon: Building2,
    },
    {
      id: "voci_costo" as TabType,
      label: "Voci di Costo",
      icon: DollarSign,
    },
    {
      id: "fatture" as TabType,
      label: "Fatture e Scadenze",
      icon: Receipt,
    },
    {
      id: "analytics" as TabType,
      label: "Analytics & Trend",
      icon: BarChart3,
    },
    {
      id: "import_export" as TabType,
      label: "Import / Export Excel",
      icon: FileSpreadsheet,
    },
    {
      id: "ai_assistant" as TabType,
      label: "AI Budget Advisor",
      icon: Bot,
      badge: "AI",
    },
  ];

  const handleNavClick = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full select-none">
      {/* Top Header & Brand */}
      <div>
        <div id="sidebar-header" className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-base leading-tight tracking-tight">
                IT Budget SI
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Gestione {selectedFY}
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>

        {/* User Card */}
        {currentUser && (
          <div
            id="user-profile-card"
            className="mx-4 my-3 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex items-center justify-between hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  currentUser.role === "Admin"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}
              >
                {currentUser.role === "Admin" ? <ShieldCheck className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {currentUser.role === "Admin" ? "Amministratore IT" : "Visualizzatore"}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Disconnetti / Cambia Utente"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Section */}
        <div className="px-3 py-2">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Principale
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-600 font-semibold shadow-xs border border-sky-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-sky-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Anno Fiscale: <strong className="text-slate-700">{selectedFY}</strong>
          </span>
          <span className="text-[10px] text-slate-400">1/11 - 31/10</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside id="sidebar-container" className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 h-screen shrink-0 sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
