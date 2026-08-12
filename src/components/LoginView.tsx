import React, { useState } from "react";
import { AppUser, PREDEFINED_USERS } from "../types";
import {
  ShieldCheck,
  Eye,
  Lock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Building2,
  BellRing
} from "lucide-react";

interface LoginViewProps {
  onLogin: (user: AppUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<AppUser>(PREDEFINED_USERS[0]);
  const [password, setPassword] = useState<string>("demo123");
  const [emailInput, setEmailInput] = useState<string>(PREDEFINED_USERS[0].email);

  const handleSelectAccount = (user: AppUser) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setPassword("demo123");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Match typed email or fallback to selected
    const matchedUser = PREDEFINED_USERS.find(
      (u) => u.email.toLowerCase() === emailInput.toLowerCase()
    );
    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      onLogin(selectedUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Graphic Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between relative z-10 backdrop-blur-md bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight">
              Gestione Budget & Expense IT
            </h1>
            <p className="text-xs text-slate-400">
              Sistema di Controllo Finanziario Direzione SI
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl text-slate-300">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Accesso Multiruolo Configurabile</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left / Top Info Panel: Quick Account Selector */}
          <div className="lg:col-span-7 bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Seleziona un Profilo Utente</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Seleziona Ruolo per il Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Scegli tra l'account <strong>Amministratore</strong> (permessi completi) o i due account <strong>Visualizzatori</strong> (sola lettura + notifiche nuovi fornitori).
              </p>

              {/* Cards for predefined users */}
              <div className="space-y-3 mt-6">
                {PREDEFINED_USERS.map((user) => {
                  const isSelected = selectedUser.id === user.id;
                  const isAdmin = user.role === "Admin";

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectAccount(user)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-slate-700/80 border-sky-500 ring-2 ring-sky-500/30 shadow-lg"
                          : "bg-slate-900/50 border-slate-700/60 hover:bg-slate-700/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar / Badge */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isAdmin
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm truncate">
                              {user.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isAdmin
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {user.role === "Admin" ? "Amministratore" : "Visualizzatore"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {user.email} &bull; {user.department}
                          </p>

                          <p className="text-[11px] text-slate-400/90 mt-1 flex items-center gap-1.5">
                            {isAdmin ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Inserimento, Modifica ed Eliminazione Fornitori e Voci</span>
                              </>
                            ) : (
                              <>
                                <BellRing className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Sola lettura + Notifica automatica nuovi fornitori</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-sky-400 bg-sky-500 text-white"
                              : "border-slate-600 bg-slate-800 text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Note */}
            <div className="bg-sky-950/40 border border-sky-800/40 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-sky-200">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                <strong>Notifiche Nuovi Fornitori:</strong> Quando un account <em>Amministratore</em> inserisce un nuovo fornitore, il sistema invierà automaticamente una notifica alert ai due account <em>Visualizzatori</em>.
              </p>
            </div>
          </div>

          {/* Right / Login Form Panel */}
          <div className="lg:col-span-5 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="text-center sm:text-left mb-6">
                <h3 className="text-lg font-bold text-white">
                  Accedi come {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inserisci le credenziali o conferma l'accesso rapido.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Aziendale
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-slate-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top.1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Password demo preimpostata: <code className="text-sky-300">demo123</code>
                  </p>
                </div>

                {/* Selected Role Capabilities Summary Box */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ruolo Attivo:</span>
                    <span
                      className={`font-bold ${
                        selectedUser.role === "Admin" ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {selectedUser.role === "Admin" ? "🛡️ Amministratore" : "👁️ Visualizzatore"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Autorizzazioni:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedUser.role === "Admin"
                        ? "Lettura e Scrittura"
                        : "Sola Lettura + Ricezione Notifiche"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                >
                  <span>Entra nel Dashboard IT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-[11px] text-slate-400">
              <p>Sistema IT Budget Manager &bull; Versione Multi-Utente 2.0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-slate-800/80 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/50">
        <p>&copy; 2026 Direzione Sistemi Informativi. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};
