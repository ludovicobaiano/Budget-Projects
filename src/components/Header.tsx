import React, { useState } from "react";
import { Search, Bell, Sparkles, Download, Calendar, RefreshCw, Menu, LogOut, ChevronDown } from "lucide-react";
import { AppUser, NotificationItem } from "../types";
import { NotificationsPopover } from "./NotificationsPopover";

interface HeaderProps {
  currentUser: AppUser;
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
  availableFYs: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  overdueCount: number;
  notifications: NotificationItem[];
  onMarkReadNotification: (notifId?: string) => void;
  onLogout: () => void;
  onOpenAI: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  title?: string;
  onToggleMobileMenu?: () => void;
  onSelectFornitoreById?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedFY,
  setSelectedFY,
  availableFYs,
  searchQuery,
  setSearchQuery,
  overdueCount,
  notifications,
  onMarkReadNotification,
  onLogout,
  onOpenAI,
  onExportExcel,
  onResetData,
  title = "Dashboard",
  onToggleMobileMenu,
  onSelectFornitoreById,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Unread notifications for current user
  const unreadNotifsCount = notifications.filter(
    (n) => !n.readBy.includes(currentUser.email)
  ).length;

  const totalBadgeCount = unreadNotifsCount + overdueCount;

  return (
    <header id="app-header" className="px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md bg-[#f3f5f8]/90">
      {/* Title & Search Bar */}
      <div className="flex items-center justify-between sm:justify-start gap-4 flex-1 min-w-0">
        {/* Mobile Menu Toggle Button */}
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-2xl bg-white border border-slate-200 text-slate-700 transition-colors shrink-0 shadow-2xs"
          title="Apri menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight shrink-0">
          {title}
        </h2>

        {/* Centered Pill Search Bar (Matching Search... in Screenshot) */}
        <div className="relative flex-1 hidden md:block max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search...."
            className="w-full pl-10 pr-8 py-2 text-xs bg-white border border-slate-200/90 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="relative w-full md:hidden">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="global-search-input-mobile"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search...."
          className="w-full pl-10 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder-slate-400 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Right User Actions, Notifications & Profile */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* AI Advisor Pill */}
          <button
            id="btn-ask-ai"
            onClick={onOpenAI}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
            <span>AI Assistant</span>
          </button>

          {/* Fiscal Year Pill */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-full px-3 py-1.5 text-xs text-slate-700 font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              id="fy-selector-dropdown"
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {availableFYs.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Bell Button */}
          <div className="relative shrink-0">
            <button
              id="btn-notifications"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center relative shadow-2xs cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {totalBadgeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {totalBadgeCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <NotificationsPopover
                currentUser={currentUser}
                notifications={notifications}
                overdueCount={overdueCount}
                onMarkRead={onMarkReadNotification}
                onClose={() => setIsNotifOpen(false)}
                onSelectFornitoreById={onSelectFornitoreById}
              />
            )}
          </div>

          {/* User Profile Block (Matching "Alex Ragnarsson - Admin Store" in Screenshot) */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-full pl-1.5 pr-3 py-1 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 font-black text-xs shrink-0 overflow-hidden">
              {currentUser.name.charAt(0)}
            </div>

            <div className="text-left min-w-0 hidden sm:block">
              <p className="font-extrabold text-slate-800 text-xs leading-none truncate max-w-[130px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold leading-tight truncate max-w-[130px]">
                {currentUser.role === "Admin" ? "Admin Store" : "Viewer Store"}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
              title="Disconnetti"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


