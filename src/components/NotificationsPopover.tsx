import React from "react";
import { NotificationItem, AppUser } from "../types";
import {
  Bell,
  Check,
  Building2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Sparkles,
  UserCheck,
  X
} from "lucide-react";

interface NotificationsPopoverProps {
  currentUser: AppUser;
  notifications: NotificationItem[];
  overdueCount: number;
  onMarkRead: (notifId?: string) => void;
  onClose: () => void;
  onSelectFornitoreById?: (id: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  currentUser,
  notifications,
  overdueCount,
  onMarkRead,
  onClose,
  onSelectFornitoreById,
}) => {
  // Filter unread notifications for current user
  const unreadNotifs = notifications.filter(
    (n) => !n.readBy.includes(currentUser.email)
  );

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

      if (diffMinutes < 1) return "Pochi secondi fa";
      if (diffMinutes < 60) return `${diffMinutes} min fa`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} ore fa`;
      return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in text-slate-800">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Centro Notifiche</h3>
            <p className="text-[10px] text-slate-300">
              Utente: {currentUser.name} ({currentUser.role === "Admin" ? "Admin" : "Visualizzatore"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadNotifs.length > 0 && (
            <button
              onClick={() => onMarkRead()}
              className="text-[10px] font-bold text-sky-300 hover:text-white underline"
            >
              Segna tutte come lette
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overdue Invoice Alert Box */}
      {overdueCount > 0 && (
        <div className="p-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>{overdueCount}</strong> fattur{overdueCount === 1 ? "a" : "e"} in ritardo o in scadenza!
            </span>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nessuna notifica ricevuta.
          </div>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.readBy.includes(currentUser.email);

            return (
              <div
                key={n.id}
                className={`p-3 rounded-xl transition-all ${
                  isUnread
                    ? "bg-sky-50/70 border border-sky-100/80 shadow-2xs"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <span>{n.title}</span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(n.timestamp)}</span>
                      </p>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="p-1 hover:bg-sky-100 text-sky-600 rounded-lg text-[10px] font-bold"
                      title="Segna come letta"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {n.message}
                </p>

                <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">
                    Da: {n.createdByName}
                  </span>

                  {n.fornitoreId && onSelectFornitoreById && (
                    <button
                      onClick={() => {
                        if (n.fornitoreId) {
                          onSelectFornitoreById(n.fornitoreId);
                          onClose();
                        }
                      }}
                      className="text-sky-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Vedi Fornitore</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
        Notifiche automatiche attive per l'inserimento nuovi fornitori.
      </div>
    </div>
  );
};
