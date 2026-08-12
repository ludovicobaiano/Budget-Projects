import React, { useState, useEffect } from "react";
import {
  Fattura,
  VoceDiCostoConFornitore,
  StatoPagamento,
  calculateFiscalYear,
} from "../types";
import { X, Receipt, CheckCircle2, Calendar } from "lucide-react";

interface ModalFatturaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Fattura>) => void;
  fatturaToEdit?: Fattura | null;
  vociCosto: VoceDiCostoConFornitore[];
}

export const ModalFattura: React.FC<ModalFatturaProps> = ({
  isOpen,
  onClose,
  onSave,
  fatturaToEdit,
  vociCosto,
}) => {
  const [voceCostoId, setVoceCostoId] = useState<string>("");
  const [numeroFattura, setNumeroFattura] = useState<string>("");
  const [dataFattura, setDataFattura] = useState<string>("");
  const [importo, setImporto] = useState<number | string>("");
  const [importoPrevisto, setImportoPrevisto] = useState<number | string>("");
  const [statoPagamento, setStatoPagamento] = useState<StatoPagamento>("Da Pagare");
  const [dataScadenza, setDataScadenza] = useState<string>("");
  const [dataPagamento, setDataPagamento] = useState<string>("");
  const [allegato, setAllegato] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated Fiscal Year
  const calculatedFY = dataFattura ? calculateFiscalYear(dataFattura) : "";

  useEffect(() => {
    if (fatturaToEdit) {
      setVoceCostoId(fatturaToEdit.voce_costo_id);
      setNumeroFattura(fatturaToEdit.numero_fattura || "");
      setDataFattura(fatturaToEdit.data_fattura);
      setImporto(fatturaToEdit.importo);
      setImportoPrevisto(
        fatturaToEdit.importo_previsto !== undefined
          ? fatturaToEdit.importo_previsto
          : fatturaToEdit.importo
      );
      setStatoPagamento(fatturaToEdit.stato_pagamento);
      setDataScadenza(fatturaToEdit.data_scadenza || "");
      setDataPagamento(fatturaToEdit.data_pagamento || "");
      setAllegato(fatturaToEdit.allegato || "");
      setNote(fatturaToEdit.note || "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      const defaultVoce = vociCosto[0];

      setVoceCostoId(defaultVoce?.id || "");
      setNumeroFattura("");
      setDataFattura(today);
      setImporto(defaultVoce?.importo_previsto || "");
      setImportoPrevisto(defaultVoce?.importo_previsto || "");
      setStatoPagamento("Da Pagare");

      // Default due in 30 days
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDataScadenza(d.toISOString().split("T")[0]);
      setDataPagamento("");
      setAllegato("");
      setNote("");
    }
    setError(null);
  }, [fatturaToEdit, isOpen, vociCosto]);

  // When changing voce_costo, update default importoPrevisto
  const handleVoceChange = (vId: string) => {
    setVoceCostoId(vId);
    const selectedV = vociCosto.find((v) => v.id === vId);
    if (selectedV) {
      setImporto(selectedV.importo_previsto);
      setImportoPrevisto(selectedV.importo_previsto);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!voceCostoId) {
      setError("Selezionare una voce di costo collegata.");
      return;
    }
    if (!dataFattura) {
      setError("La data della fattura è obbligatoria.");
      return;
    }
    if (importo === "" || Number(importo) < 0) {
      setError("L'importo della fattura deve essere ≥ 0.");
      return;
    }

    onSave({
      id: fatturaToEdit?.id,
      voce_costo_id: voceCostoId,
      numero_fattura: numeroFattura.trim(),
      data_fattura: dataFattura,
      importo: Number(importo),
      importo_previsto: importoPrevisto !== "" ? Number(importoPrevisto) : Number(importo),
      stato_pagamento: statoPagamento,
      data_scadenza: dataScadenza || undefined,
      data_pagamento: statoPagamento === "Pagata" ? (dataPagamento || dataFattura) : undefined,
      allegato: allegato.trim(),
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm">
              {fatturaToEdit ? "Modifica Registrazione Fattura" : "Registra Nuova Fattura IT"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Voce di Costo */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Voce di Costo Collegata *
            </label>
            <select
              required
              value={voceCostoId}
              onChange={(e) => handleVoceChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {vociCosto.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fornitore_nome} — {v.descrizione} ({v.tipo_costo})
                </option>
              ))}
            </select>
          </div>

          {/* Numero Fattura & Data Fattura */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numero Fattura / Riferimento
              </label>
              <input
                type="text"
                value={numeroFattura}
                onChange={(e) => setNumeroFattura(e.target.value)}
                placeholder="es. FT-2027-081"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data Fattura *
              </label>
              <input
                type="date"
                required
                value={dataFattura}
                onChange={(e) => setDataFattura(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Auto Calculated FY Banner */}
          {calculatedFY && (
            <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between text-sky-800 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                Anno Fiscale Calcolato In Automatico:
              </span>
              <span className="px-2 py-0.5 bg-sky-600 text-white font-extrabold rounded-md text-xs">
                {calculatedFY}
              </span>
            </div>
          )}

          {/* Importo Effettivo & Importo Previsto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Importo Effettivo Fatturato (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={importo}
                onChange={(e) => setImporto(e.target.value)}
                placeholder="es. 4500"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Importo Preventivato (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={importoPrevisto}
                onChange={(e) => setImportoPrevisto(e.target.value)}
                placeholder="es. 4500"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Stato Pagamento & Scadenza */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stato Pagamento *
              </label>
              <select
                value={statoPagamento}
                onChange={(e) => setStatoPagamento(e.target.value as StatoPagamento)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Da Pagare">Da Pagare</option>
                <option value="Pagata">Pagata</option>
                <option value="In Ritardo">In Ritardo</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data Scadenza Pagamento
              </label>
              <input
                type="date"
                value={dataScadenza}
                onChange={(e) => setDataScadenza(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Data Pagamento (If paid) */}
          {statoPagamento === "Pagata" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data Effettivo Saldato
              </label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          )}

          {/* Allegato Link */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Link PDF Fattura (Cloud / SharePoint)
            </label>
            <input
              type="url"
              value={allegato}
              onChange={(e) => setAllegato(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Note / Note di Credito</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Riferimento ordine d'acquisto, approvazione..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salva Registrazione Fattura</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
