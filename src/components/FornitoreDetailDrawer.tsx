import React from "react";
import {
  Fornitore,
  VoceDiCosto,
  FatturaDettagliata,
  formatCurrency,
  formatDateIt,
  calculateAnnualizedPreventivo,
} from "../types";
import {
  X,
  Building2,
  ExternalLink,
  DollarSign,
  Receipt,
  Edit2,
  Plus,
  Clock,
  HardDrive,
  Wrench,
  ShoppingBag,
  User,
  Phone,
} from "lucide-react";

interface FornitoreDetailDrawerProps {
  fornitore: Fornitore | null;
  onClose: () => void;
  vociCosto: VoceDiCosto[];
  fatture: FatturaDettagliata[];
  selectedFY: string;
  onEditFornitore: (f: Fornitore) => void;
  onNewVoceCostoForFornitore: (fId: string) => void;
}

export const FornitoreDetailDrawer: React.FC<FornitoreDetailDrawerProps> = ({
  fornitore,
  onClose,
  vociCosto,
  fatture,
  selectedFY,
  onEditFornitore,
  onNewVoceCostoForFornitore,
}) => {
  if (!fornitore) return null;

  const suppVoci = vociCosto.filter((v) => v.fornitore_id === fornitore.id);
  const suppVociIds = suppVoci.map((v) => v.id);

  const totalPlannedFY = suppVoci.reduce(
    (sum, v) => sum + calculateAnnualizedPreventivo(v),
    0
  );

  const suppFattureFY = fatture.filter(
    (ft) => ft.anno_fiscale === selectedFY && suppVociIds.includes(ft.voce_costo_id)
  );

  const totalSpentFY = suppFattureFY.reduce((sum, ft) => sum + ft.importo, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-extrabold text-base flex items-center justify-center">
              {fornitore.nome.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">{fornitore.nome}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                  {fornitore.tipologia}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
                  {fornitore.stato}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditFornitore(fornitore)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Modifica
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-800">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-semibold text-[11px]">
                Budget Preventivato FY ({selectedFY})
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(totalPlannedFY)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Target Allocato: {fornitore.budget_allocato ? formatCurrency(fornitore.budget_allocato) : "Non impostato"}
              </p>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
              <span className="text-sky-700 font-semibold text-[11px]">
                Fatturato Reale FY ({selectedFY})
              </span>
              <p className="text-xl font-extrabold text-sky-900 mt-1">
                {formatCurrency(totalSpentFY)}
              </p>
              <p className="text-[10px] text-sky-600 mt-0.5">
                {suppFattureFY.length} fatture registrate
              </p>
            </div>
          </div>

          {/* Account Manager Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" /> Account Manager Referente
              </span>
              {fornitore.account_manager_telefono && (
                <a
                  href={`tel:${fornitore.account_manager_telefono.replace(/\s+/g, '')}`}
                  className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-[10px] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3" /> Chiamata
                </a>
              )}
            </div>

            {fornitore.account_manager_nome ? (
              <div className="pt-1">
                <p className="text-sm font-bold text-slate-100">{fornitore.account_manager_nome}</p>
                {fornitore.account_manager_telefono && (
                  <p className="text-xs text-sky-300 font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span>{fornitore.account_manager_telefono}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic pt-1">
                Nessun account manager specificato. Clicca su "Modifica" per aggiungere i dettagli.
              </p>
            )}
          </div>

          {/* Details & Links */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs mb-2">Anagrafica & Note</h4>
            {fornitore.link_contratto && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Contratto Quadro:</span>
                <a
                  href={fornitore.link_contratto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Apri Documento
                </a>
              </div>
            )}
            {fornitore.note && (
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                "{fornitore.note}"
              </p>
            )}
          </div>

          {/* Cost Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-sky-600" />
                Voci di Costo ({suppVoci.length})
              </h4>
              <button
                onClick={() => onNewVoceCostoForFornitore(fornitore.id)}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1 border border-sky-100"
              >
                <Plus className="w-3 h-3" /> Aggiungi Voce
              </button>
            </div>

            {suppVoci.length === 0 ? (
              <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                Nessuna voce di costo registrata per questo fornitore.
              </p>
            ) : (
              <div className="space-y-2">
                {suppVoci.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{v.descrizione}</p>
                      <p className="text-[10px] text-slate-400">
                        {v.tipo_costo} {v.frequenza_fatturazione ? `(${v.frequenza_fatturazione})` : ""} — Valida dal: {formatDateIt(v.data_inizio)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {formatCurrency(v.importo_previsto)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Annualiz: {formatCurrency(calculateAnnualizedPreventivo(v))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Section for selected FY */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Fatture Registrate ({selectedFY})
            </h4>

            {suppFattureFY.length === 0 ? (
              <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                Nessuna fattura presente per l'anno fiscale {selectedFY}.
              </p>
            ) : (
              <div className="space-y-2">
                {suppFattureFY.map((ft) => (
                  <div
                    key={ft.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {ft.numero_fattura || "Fattura senza numero"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Data: {formatDateIt(ft.data_fattura)} | Scad: {formatDateIt(ft.data_scadenza)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {formatCurrency(ft.importo)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          ft.stato_pagamento === "Pagata"
                            ? "bg-emerald-100 text-emerald-700"
                            : ft.stato_pagamento === "In Ritardo"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {ft.stato_pagamento}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
