import React, { useState } from "react";
import {
  VoceDiCostoConFornitore,
  Fornitore,
  formatCurrency,
  formatDateIt,
  calculateAnnualizedPreventivo,
  calculateAnnualizedConsuntivo,
} from "../types";
import {
  Plus,
  DollarSign,
  Filter,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Repeat,
  Zap,
  Eye,
} from "lucide-react";

interface VociCostoViewProps {
  vociCosto: VoceDiCostoConFornitore[];
  fornitori: Fornitore[];
  selectedFY: string;
  onNewVoceCosto: () => void;
  onEditVoceCosto: (v: VoceDiCostoConFornitore) => void;
  onDeleteVoceCosto: (id: string) => void;
  searchQuery: string;
  isAdmin?: boolean;
}

export const VociCostoView: React.FC<VociCostoViewProps> = ({
  vociCosto,
  fornitori,
  selectedFY,
  onNewVoceCosto,
  onEditVoceCosto,
  onDeleteVoceCosto,
  searchQuery,
  isAdmin = true,
}) => {
  const [filterTipo, setFilterTipo] = useState<string>("Tutti");
  const [filterFornitore, setFilterFornitore] = useState<string>("Tutti");
  const [filterStato, setFilterStato] = useState<string>("Attiva");

  const filteredVoci = vociCosto.filter((v) => {
    const matchesSearch =
      v.descrizione.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.fornitore_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.note && v.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTipo = filterTipo === "Tutti" || v.tipo_costo === filterTipo;
    const matchesFornitore =
      filterFornitore === "Tutti" || v.fornitore_id === filterFornitore;
    const matchesStato = filterStato === "Tutti" || v.stato === filterStato;

    return matchesSearch && matchesTipo && matchesFornitore && matchesStato;
  });

  const totalPreventivoAnnualized = filteredVoci.reduce(
    (acc, v) => acc + calculateAnnualizedPreventivo(v),
    0
  );

  const totalConsuntivoAnnualized = filteredVoci.reduce(
    (acc, v) => acc + calculateAnnualizedConsuntivo(v),
    0
  );

  return (
    <div id="voci-costo-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      {!isAdmin && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-medium shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Modalità Visualizzatore (Sola Lettura):</strong> Sei connesso come solo visualizzatore. L'inserimento e la modifica delle voci di costo sono riservati all'Amministratore.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px] shrink-0 border border-emerald-200">
            Sola Lettura
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sky-600" />
            Voci di Costo IT - Preventivo & Consuntivo ({vociCosto.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione di dettaglio per costi Ricorrenti (annualizzati) ed Una Tantum per la pianificazione del budget.
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-add-voce-top"
            onClick={onNewVoceCosto}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Voce di Costo</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-200 select-none">
            <Eye className="w-3.5 h-3.5" />
            <span>Aggiungi (Solo Admin)</span>
          </div>
        )}
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">
            Preventivo Annualizzato Totale
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalPreventivoAnnualized)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Calcolato per {filteredVoci.length} voci filtrate
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">
            Consuntivo / Stima Aggiornata Totale
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalConsuntivoAnnualized)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Delta: {formatCurrency(totalConsuntivoAnnualized - totalPreventivoAnnualized)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400">
            Ripartizione Costi Fissi / Variabili
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs font-bold">
            <span className="text-sky-600 flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5" /> Ricorrenti:{" "}
              {vociCosto.filter((v) => v.tipo_costo === "Ricorrente").length}
            </span>
            <span className="text-indigo-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Una Tantum:{" "}
              {vociCosto.filter((v) => v.tipo_costo === "Una Tantum").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tipo Costo */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Tipo Costo:</span>
            <select
              id="filter-tipo-costo"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs"
            >
              <option value="Tutti">Tutti</option>
              <option value="Ricorrente">Ricorrente</option>
              <option value="Una Tantum">Una Tantum</option>
            </select>
          </div>

          {/* Fornitore */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold">Fornitore:</span>
            <select
              id="filter-fornitore-select"
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

          {/* Stato */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold">Stato:</span>
            <select
              id="filter-stato-voce"
              value={filterStato}
              onChange={(e) => setFilterStato(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none text-xs"
            >
              <option value="Tutti">Tutti</option>
              <option value="Attiva">Attive</option>
              <option value="Sospesa">Sospese</option>
              <option value="Chiusa">Chiuse</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Mostrando {filteredVoci.length} di {vociCosto.length} voci
        </p>
      </div>

      {/* Cost Items Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Voce di Costo</th>
                <th className="py-3.5 px-4">Fornitore</th>
                <th className="py-3.5 px-4">Tipologia Costo</th>
                <th className="py-3.5 px-4 text-right">Preventivo Unitario</th>
                <th className="py-3.5 px-4 text-right">Costo Annualizzato</th>
                <th className="py-3.5 px-4 text-right">Consuntivo</th>
                <th className="py-3.5 px-4 text-center">Periodo</th>
                <th className="py-3.5 px-4 text-center">Stato</th>
                <th className="py-3.5 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVoci.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nessuna voce di costo trovata per i filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredVoci.map((v) => {
                  const annualizedPrev = calculateAnnualizedPreventivo(v);
                  const annualizedCons = calculateAnnualizedConsuntivo(v);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Description */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                        <p className="truncate">{v.descrizione}</p>
                        {v.note && (
                          <p className="text-[11px] font-normal text-slate-400 truncate">
                            {v.note}
                          </p>
                        )}
                      </td>

                      {/* Fornitore */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {v.fornitore_nome}
                      </td>

                      {/* Tipo Costo & Frequenza */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              v.tipo_costo === "Ricorrente"
                                ? "bg-sky-50 text-sky-700 border border-sky-100"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}
                          >
                            {v.tipo_costo === "Ricorrente" ? (
                              <Repeat className="w-3 h-3" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            {v.tipo_costo}
                          </span>
                          {v.frequenza_fatturazione && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Frequenza: {v.frequenza_fatturazione}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Preventivo Unitario */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(v.importo_previsto)}
                      </td>

                      {/* Costo Annualizzato */}
                      <td className="py-3.5 px-4 text-right font-bold text-sky-700">
                        {formatCurrency(annualizedPrev)}
                      </td>

                      {/* Consuntivo */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(v.importo_consuntivo !== undefined ? v.importo_consuntivo : v.importo_previsto)}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                        <div>
                          <span>Dal: {formatDateIt(v.data_inizio)}</span>
                          {v.data_fine && (
                            <span className="block text-slate-400">
                              Al: {formatDateIt(v.data_fine)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stato */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.stato === "Attiva"
                              ? "bg-emerald-100 text-emerald-700"
                              : v.stato === "Sospesa"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {v.stato}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {v.link_contratto && (
                            <a
                              href={v.link_contratto}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                              title="Apri contratto"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => onEditVoceCosto(v)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
                                title="Modifica voce"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteVoceCosto(v.id)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Elimina voce"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic px-1">Sola Lettura</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
          {filteredVoci.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nessuna voce di costo trovata per i filtri selezionati.
            </div>
          ) : (
            filteredVoci.map((v) => {
              const annualizedPrev = calculateAnnualizedPreventivo(v);

              return (
                <div
                  key={v.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {v.descrizione}
                      </h3>
                      <p className="text-xs text-sky-700 font-semibold mt-0.5">
                        {v.fornitore_nome}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        v.stato === "Attiva"
                          ? "bg-emerald-100 text-emerald-700"
                          : v.stato === "Sospesa"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {v.stato}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                        v.tipo_costo === "Ricorrente"
                          ? "bg-sky-50 text-sky-700 border border-sky-100"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}
                    >
                      {v.tipo_costo === "Ricorrente" ? <Repeat className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {v.tipo_costo}
                    </span>
                    {v.frequenza_fatturazione && (
                      <span className="text-slate-400 text-[10px]">
                        ({v.frequenza_fatturazione})
                      </span>
                    )}
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <p className="text-slate-400 text-[10px]">Prev. Unitario</p>
                      <p className="font-semibold text-slate-700">{formatCurrency(v.importo_previsto)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Costo Annualizzato</p>
                      <p className="font-extrabold text-sky-700">{formatCurrency(annualizedPrev)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Dal {formatDateIt(v.data_inizio)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => onEditVoceCosto(v)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => onDeleteVoceCosto(v.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Sola Lettura</span>
                      )}
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
