import React from "react";
import { Search, Bell, Sparkles, Download, Calendar, RefreshCw, Menu } from "lucide-react";

interface HeaderProps {
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
  availableFYs: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  overdueCount: number;
  onOpenAI: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  title?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedFY,
  setSelectedFY,
  availableFYs,
  searchQuery,
  setSearchQuery,
  overdueCount,
  onOpenAI,
  onExportExcel,
  onResetData,
  title = "Budget & Expense IT",
  onToggleMobileMenu,
}) => {
  return (
    <header id="app-header" className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-between sticky top-0 z-20 gap-2 sm:gap-4 shadow-2xs">
      {/* Top Row on Mobile / Left Section on Desktop */}
      <div className="flex items-center justify-between sm:justify-start gap-3 flex-1 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          title="Apri menu di navigazione"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          {title}
        </h2>

        {/* Global Search Bar - Full Width on Mobile, Max-xl on Desktop */}
        <div className="relative flex-1 hidden sm:block max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca fornitore, voce di costo, n° fattura..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Search Input on Mobile (Below Header Title) */}
      <div className="relative w-full sm:hidden">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="global-search-input-mobile"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca fornitore, voce di costo..."
          className="w-full pl-10 pr-8 py-2 text-xs bg-slate-100/90 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Right Tools & Fiscal Year Selector */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Reset Data Button for easy demo testing */}
          <button
            id="btn-reset-data"
            onClick={onResetData}
            title="Ripristina dati iniziali"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px]">Reset Dati</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative shrink-0">
            <button
              id="btn-notifications"
              className="p-2 rounded-xl border border-slate-200/70 hover:bg-slate-50 text-slate-600 transition-colors relative"
              title={overdueCount > 0 ? `${overdueCount} fatture in ritardo / da pagare` : "Nessuna notifica urgente"}
            >
              <Bell className="w-4 h-4" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {overdueCount}
                </span>
              )}
            </button>
          </div>

          {/* Persistent Fiscal Year Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
              FY:
            </span>
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
        </div>

        <div className="flex items-center gap-1.5">
          {/* Ask AI Button */}
          <button
            id="btn-ask-ai"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-xs hover:shadow-md hover:opacity-95 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-100 animate-spin-slow shrink-0" />
            <span className="hidden sm:inline">Chiedi ad AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Export Excel Report Button */}
          <button
            id="btn-export-report"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0"
            title="Esporta Report Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden md:inline">Esporta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
