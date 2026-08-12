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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50/70 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Light Graphic Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-sky-100 flex items-center justify-between relative z-10 backdrop-blur-md bg-white/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 tracking-tight">
              Gestione Budget & Expense IT
            </h1>
            <p className="text-xs text-slate-500">
              Sistema di Controllo Finanziario Direzione SI
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-xl text-sky-800 font-medium">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Accesso Multiruolo Configurabile</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left / Top Info Panel: Quick Account Selector */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-sky-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl shadow-sky-900/5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold mb-4">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Seleziona un Profilo Utente</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Seleziona Ruolo per il Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Scegli tra l'account <strong className="text-amber-700">Amministratore</strong> (permessi completi) o i due account <strong className="text-emerald-700">Visualizzatori</strong> (sola lettura + notifiche nuovi fornitori).
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
                          ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/20 shadow-md"
                          : "bg-slate-50/70 border-slate-200 hover:bg-sky-50/40 hover:border-sky-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar / Badge */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-2xs ${
                            isAdmin
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
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
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {user.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isAdmin
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {user.role === "Admin" ? "Amministratore" : "Visualizzatore"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {user.email} &bull; {user.department}
                          </p>

                          <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                            {isAdmin ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Inserimento, Modifica ed Eliminazione Fornitori e Voci</span>
                              </>
                            ) : (
                              <>
                                <BellRing className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-slate-300 bg-white text-transparent"
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
            <div className="bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p>
                <strong>Notifiche Nuovi Fornitori:</strong> Quando un account <em>Amministratore</em> inserisce un nuovo fornitore, il sistema invierà automaticamente una notifica alert ai due account <em>Visualizzatori</em>.
              </p>
            </div>
          </div>

          {/* Right / Login Form Panel */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl border border-sky-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-sky-900/5">
            <div>
              <div className="text-center sm:text-left mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Accedi come {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inserisci le credenziali o conferma l'accesso rapido.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Aziendale
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900 placeholder-slate-400 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900 placeholder-slate-400 font-medium transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Password demo preimpostata: <code className="text-sky-700 font-bold bg-sky-50 px-1 py-0.5 rounded border border-sky-200">demo123</code>
                  </p>
                </div>

                {/* Selected Role Capabilities Summary Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Ruolo Attivo:</span>
                    <span
                      className={`font-bold ${
                        selectedUser.role === "Admin" ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {selectedUser.role === "Admin" ? "🛡️ Amministratore" : "👁️ Visualizzatore"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Autorizzazioni:</span>
                    <span className="text-slate-800 font-bold">
                      {selectedUser.role === "Admin"
                        ? "Lettura e Scrittura"
                        : "Sola Lettura + Ricezione Notifiche"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                >
                  <span>Entra nel Dashboard IT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              <p>Sistema IT Budget Manager &bull; Versione Multi-Utente 2.0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-sky-100 text-center text-xs text-slate-500 backdrop-blur-md bg-white/70">
        <p>&copy; 2026 Direzione Sistemi Informativi. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};
