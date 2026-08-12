import React, { useState } from "react";
import {
  Fornitore,
  VoceDiCosto,
  FatturaDettagliata,
  formatCurrency,
  formatDateIt,
  calculateAnnualizedPreventivo,
} from "../types";
import {
  Plus,
  Search,
  Building2,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  FileText,
  DollarSign,
  ChevronRight,
  HardDrive,
  Wrench,
  ShoppingBag,
  User,
  Phone,
} from "lucide-react";

interface FornitoriViewProps {
  fornitori: Fornitore[];
  vociCosto: VoceDiCosto[];
  fatture: FatturaDettagliata[];
  selectedFY: string;
  onNewFornitore: () => void;
  onEditFornitore: (f: Fornitore) => void;
  onDeleteFornitore: (id: string) => void;
  onSelectFornitore: (f: Fornitore) => void;
  searchQuery: string;
}

export const FornitoriView: React.FC<FornitoriViewProps> = ({
  fornitori,
  vociCosto,
  fatture,
  selectedFY,
  onNewFornitore,
  onEditFornitore,
  onDeleteFornitore,
  onSelectFornitore,
  searchQuery,
}) => {
  const [filterTipologia, setFilterTipologia] = useState<string>("Tutti");
  const [filterStato, setFilterStato] = useState<string>("Attivo");

  // Filtered suppliers
  const filteredFornitori = fornitori.filter((f) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      f.nome.toLowerCase().includes(query) ||
      (f.note && f.note.toLowerCase().includes(query)) ||
      (f.account_manager_nome && f.account_manager_nome.toLowerCase().includes(query)) ||
      (f.account_manager_telefono && f.account_manager_telefono.toLowerCase().includes(query));

    const matchesTipologia =
      filterTipologia === "Tutti" || f.tipologia === filterTipologia;

    const matchesStato =
      filterStato === "Tutti" || f.stato === filterStato;

    return matchesSearch && matchesTipologia && matchesStato;
  });

  return (
    <div id="fornitori-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Anagrafica Fornitori IT ({fornitori.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione centralizzata fornitori, account manager, tipologie (Asset / Servizi / Terze Parti) e contratti.
          </p>
        </div>

        <button
          id="btn-add-fornitore-top"
          onClick={onNewFornitore}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Fornitore</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tipologia Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Tipologia:</span>
            <select
              id="filter-tipologia-select"
              value={filterTipologia}
              onChange={(e) => setFilterTipologia(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs"
            >
              <option value="Tutti">Tutte le Tipologie</option>
              <option value="Asset">Asset</option>
              <option value="Servizi">Servizi</option>
              <option value="Acquisto Terze Parti">Acquisto Terze Parti</option>
            </select>
          </div>

          {/* Stato Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold">Stato:</span>
            <select
              id="filter-stato-select"
              value={filterStato}
              onChange={(e) => setFilterStato(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs"
            >
              <option value="Tutti">Tutti</option>
              <option value="Attivo">Attivi</option>
              <option value="Inattivo">Inattivi</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Mostrando {filteredFornitori.length} di {fornitori.length} fornitori
        </p>
      </div>

      {/* Suppliers Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Desktop Table (hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Fornitore</th>
                <th className="py-3.5 px-4">Account Manager</th>
                <th className="py-3.5 px-4">Tipologia</th>
                <th className="py-3.5 px-4 text-right">Target Allocato</th>
                <th className="py-3.5 px-4 text-right">Preventivo FY</th>
                <th className="py-3.5 px-4 text-right">Speso Effettivo ({selectedFY})</th>
                <th className="py-3.5 px-4 text-center">Stato</th>
                <th className="py-3.5 px-4 text-center">Contratto</th>
                <th className="py-3.5 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFornitori.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nessun fornitore trovato con i filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredFornitori.map((f) => {
                  const suppVoci = vociCosto.filter((v) => v.fornitore_id === f.id);
                  const suppVociIds = suppVoci.map((v) => v.id);
                  const planned = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

                  const spent = fatture
                    .filter((ft) => ft.anno_fiscale === selectedFY && suppVociIds.includes(ft.voce_costo_id))
                    .reduce((sum, ft) => sum + ft.importo, 0);

                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name */}
                      <td
                        onClick={() => onSelectFornitore(f)}
                        className="py-3.5 px-4 font-bold text-slate-800 cursor-pointer flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs shrink-0 group-hover:bg-sky-100 group-hover:text-sky-700 transition-colors">
                          {f.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="hover:text-sky-600 transition-colors">{f.nome}</p>
                          {f.note && (
                            <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
                              {f.note}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Account Manager */}
                      <td className="py-3.5 px-4">
                        {f.account_manager_nome ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>{f.account_manager_nome}</span>
                            </p>
                            {f.account_manager_telefono && (
                              <a
                                href={`tel:${f.account_manager_telefono.replace(/\s+/g, '')}`}
                                className="text-[11px] text-slate-500 hover:text-sky-600 font-medium inline-flex items-center gap-1 transition-colors"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{f.account_manager_telefono}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px] italic">Non specificato</span>
                        )}
                      </td>

                      {/* Tipologia */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                            f.tipologia === "Asset"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : f.tipologia === "Servizi"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {f.tipologia === "Asset" && <HardDrive className="w-3 h-3" />}
                          {f.tipologia === "Servizi" && <Wrench className="w-3 h-3" />}
                          {f.tipologia === "Acquisto Terze Parti" && <ShoppingBag className="w-3 h-3" />}
                          {f.tipologia}
                        </span>
                      </td>

                      {/* Target Allocato */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {f.budget_allocato ? formatCurrency(f.budget_allocato) : "-"}
                      </td>

                      {/* Preventivo FY */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        {formatCurrency(planned)}
                      </td>

                      {/* Speso Effettivo FY */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(spent)}
                      </td>

                      {/* Stato */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.stato === "Attivo"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {f.stato}
                        </span>
                      </td>

                      {/* Link Contratto */}
                      <td className="py-3.5 px-4 text-center">
                        {f.link_contratto ? (
                          <a
                            href={f.link_contratto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Apri
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectFornitore(f)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-600 transition-colors"
                            title="Visualizza scheda dettaglio"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditFornitore(f)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-600 transition-colors"
                            title="Modifica fornitore"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFornitore(f.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Elimina fornitore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Cards for small screens */}
        <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
          {filteredFornitori.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nessun fornitore trovato con i filtri selezionati.
            </div>
          ) : (
            filteredFornitori.map((f) => {
              const suppVoci = vociCosto.filter((v) => v.fornitore_id === f.id);
              const suppVociIds = suppVoci.map((v) => v.id);
              const planned = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);
              const spent = fatture
                .filter((ft) => ft.anno_fiscale === selectedFY && suppVociIds.includes(ft.voce_costo_id))
                .reduce((sum, ft) => sum + ft.importo, 0);

              return (
                <div
                  key={f.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => onSelectFornitore(f)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 font-extrabold text-sm shrink-0">
                        {f.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate hover:text-sky-600 transition-colors">
                          {f.nome}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                              f.tipologia === "Asset"
                                ? "bg-blue-50 text-blue-600"
                                : f.tipologia === "Servizi"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {f.tipologia}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              f.stato === "Attivo"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {f.stato}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectFornitore(f)}
                      className="p-1.5 bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-lg shrink-0 transition-colors"
                      title="Apri scheda"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account Manager Box for Mobile */}
                  {f.account_manager_nome && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Account Manager</p>
                        <p className="font-semibold text-slate-800 truncate flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate">{f.account_manager_nome}</span>
                        </p>
                      </div>

                      {f.account_manager_telefono && (
                        <a
                          href={`tel:${f.account_manager_telefono.replace(/\s+/g, '')}`}
                          className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1 shadow-2xs shrink-0 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Chiama</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Financial Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <p className="text-slate-400 font-medium text-[10px]">Target Allocato</p>
                      <p className="font-semibold text-slate-700">
                        {f.budget_allocato ? formatCurrency(f.budget_allocato) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px]">Preventivo FY</p>
                      <p className="font-semibold text-slate-800">{formatCurrency(planned)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px]">Speso Effettivo</p>
                      <p className="font-extrabold text-slate-900">{formatCurrency(spent)}</p>
                    </div>
                  </div>

                  {/* Mobile Actions Footer */}
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                    <div>
                      {f.link_contratto && (
                        <a
                          href={f.link_contratto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600"
                        >
                          <ExternalLink className="w-3 h-3" /> Contratto
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditFornitore(f)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDeleteFornitore(f.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
