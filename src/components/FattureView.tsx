import React, { useState } from "react";
import {
  FatturaDettagliata,
  Fornitore,
  formatCurrency,
  formatDateIt,
} from "../types";
import {
  Plus,
  Receipt,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface FattureViewProps {
  fatture: FatturaDettagliata[];
  fornitori: Fornitore[];
  selectedFY: string;
  onNewFattura: () => void;
  onEditFattura: (f: FatturaDettagliata) => void;
  onDeleteFattura: (id: string) => void;
  searchQuery: string;
}

export const FattureView: React.FC<FattureViewProps> = ({
  fatture,
  fornitori,
  selectedFY,
  onNewFattura,
  onEditFattura,
  onDeleteFattura,
  searchQuery,
}) => {
  const [filterStato, setFilterStato] = useState<string>("Tutti");
  const [filterFornitore, setFilterFornitore] = useState<string>("Tutti");

  // Filter invoices for selected FY and criteria
  const filteredFatture = fatture.filter((f) => {
    const matchesFY = f.anno_fiscale === selectedFY;

    const matchesSearch =
      (f.numero_fattura && f.numero_fattura.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.fornitore_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.voce_costo_descrizione.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.note && f.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStato = filterStato === "Tutti" || f.stato_pagamento === filterStato;
    const matchesFornitore = filterFornitore === "Tutti" || f.fornitore_id === filterFornitore;

    return matchesFY && matchesSearch && matchesStato && matchesFornitore;
  });

  const totalInvoiced = filteredFatture.reduce((sum, f) => sum + f.importo, 0);
  const totalPlanned = filteredFatture.reduce((sum, f) => sum + (f.importo_previsto || f.importo), 0);

  const countPagate = filteredFatture.filter((f) => f.stato_pagamento === "Pagata").length;
  const countDaPagare = filteredFatture.filter((f) => f.stato_pagamento === "Da Pagare").length;
  const countInRitardo = filteredFatture.filter((f) => f.stato_pagamento === "In Ritardo").length;

  return (
    <div id="fatture-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-600" />
            Registro Fatture & Scadenze ({selectedFY})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tutte le fatture collegate alle voci di costo. Calcolo automatico Anno Fiscale (1/11 - 31/10).
          </p>
        </div>

        <button
          id="btn-add-fattura-top"
          onClick={onNewFattura}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registra Nuova Fattura</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">Totale Fatturato ({selectedFY})</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalInvoiced)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Preventivato: {formatCurrency(totalPlanned)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">Fatture Saldate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" /> {countPagate}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Stato: Pagata</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">Da Saldare</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" /> {countDaPagare}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Prossime scadenze</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">In Ritardo</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-500" /> {countInRitardo}
          </p>
          <p className="text-[11px] text-rose-500 font-medium mt-1">Azione urgente richiesta</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stato Pagamento Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Stato Pagamento:</span>
            <select
              id="filter-stato-pagamento"
              value={filterStato}
              onChange={(e) => setFilterStato(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs"
            >
              <option value="Tutti">Tutti gli stati</option>
              <option value="Pagata">Pagata</option>
              <option value="Da Pagare">Da Pagare</option>
              <option value="In Ritardo">In Ritardo</option>
            </select>
          </div>

          {/* Fornitore Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold">Fornitore:</span>
            <select
              id="filter-fornitore-fatture"
              value={filterFornitore}
              onChange={(e) => setFilterFornitore(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs max-w-[180px]"
            >
              <option value="Tutti">Tutti i Fornitori</option>
              {fornitori.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Trovate {filteredFatture.length} fatture per {selectedFY}
        </p>
      </div>

      {/* Invoices Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">N° Fattura</th>
                <th className="py-3.5 px-4">Data Fattura</th>
                <th className="py-3.5 px-4">Anno Fiscale</th>
                <th className="py-3.5 px-4">Fornitore</th>
                <th className="py-3.5 px-4">Voce di Costo</th>
                <th className="py-3.5 px-4 text-right">Importo Effettivo</th>
                <th className="py-3.5 px-4 text-right">Preventivo</th>
                <th className="py-3.5 px-4 text-center">Stato Pagamento</th>
                <th className="py-3.5 px-4 text-center">Scadenza</th>
                <th className="py-3.5 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFatture.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Nessuna fattura trovata per l'Anno Fiscale {selectedFY} con i filtri correnti.
                  </td>
                </tr>
              ) : (
                filteredFatture.map((ft) => (
                  <tr
                    key={ft.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Numero Fattura */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {ft.numero_fattura || "N.A."}
                    </td>

                    {/* Data Fattura */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDateIt(ft.data_fattura)}
                    </td>

                    {/* Auto FY */}
                    <td className="py-3.5 px-4 font-semibold text-sky-700">
                      <span className="bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 text-[10px]">
                        {ft.anno_fiscale}
                      </span>
                    </td>

                    {/* Fornitore */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {ft.fornitore_nome}
                    </td>

                    {/* Voce di Costo */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {ft.voce_costo_descrizione}
                    </td>

                    {/* Importo Effettivo (Consuntivo) */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(ft.importo)}
                    </td>

                    {/* Preventivo */}
                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(ft.importo_previsto || ft.importo)}
                    </td>

                    {/* Stato Pagamento */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ft.stato_pagamento === "Pagata"
                            ? "bg-emerald-100 text-emerald-700"
                            : ft.stato_pagamento === "In Ritardo"
                            ? "bg-rose-100 text-rose-700 animate-pulse"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {ft.stato_pagamento}
                      </span>
                    </td>

                    {/* Scadenza */}
                    <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                      {formatDateIt(ft.data_scadenza)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ft.allegato && (
                          <a
                            href={ft.allegato}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                            title="Apri allegato fattura"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onEditFattura(ft)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-600 transition-colors"
                          title="Modifica fattura"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFattura(ft.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Elimina fattura"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
          {filteredFatture.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nessuna fattura trovata per l'Anno Fiscale {selectedFY} con i filtri correnti.
            </div>
          ) : (
            filteredFatture.map((ft) => (
              <div
                key={ft.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-800 text-sm">
                        Fatt. {ft.numero_fattura || "N.A."}
                      </span>
                      <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-100">
                        {ft.anno_fiscale}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {ft.fornitore_nome}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">
                      {ft.voce_costo_descrizione}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      ft.stato_pagamento === "Pagata"
                        ? "bg-emerald-100 text-emerald-700"
                        : ft.stato_pagamento === "In Ritardo"
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ft.stato_pagamento}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <p className="text-slate-400 text-[10px]">Importo Effettivo</p>
                    <p className="font-extrabold text-slate-900">{formatCurrency(ft.importo)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Scadenza</p>
                    <p className="font-semibold text-slate-700">{formatDateIt(ft.data_scadenza)}</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    Data: {formatDateIt(ft.data_fattura)}
                  </span>

                  <div className="flex items-center gap-2">
                    {ft.allegato && (
                      <a
                        href={ft.allegato}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[10px] rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Allegato
                      </a>
                    )}
                    <button
                      onClick={() => onEditFattura(ft)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => onDeleteFattura(ft.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
