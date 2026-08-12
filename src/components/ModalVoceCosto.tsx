import React, { useState, useEffect } from "react";
import {
  VoceDiCosto,
  Fornitore,
  TipoCosto,
  FrequenzaFatturazione,
  StatoVoceCosto,
} from "../types";
import { X, DollarSign, CheckCircle2 } from "lucide-react";

interface ModalVoceCostoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VoceDiCosto>) => void;
  voceToEdit?: VoceDiCosto | null;
  fornitori: Fornitore[];
}

export const ModalVoceCosto: React.FC<ModalVoceCostoProps> = ({
  isOpen,
  onClose,
  onSave,
  voceToEdit,
  fornitori,
}) => {
  const [fornitoreId, setFornitoreId] = useState<string>("");
  const [descrizione, setDescrizione] = useState<string>("");
  const [tipoCosto, setTipoCosto] = useState<TipoCosto>("Ricorrente");
  const [frequenza, setFrequenza] = useState<FrequenzaFatturazione>("Mensile");
  const [importoPrevisto, setImportoPrevisto] = useState<number | string>("");
  const [importoConsuntivo, setImportoConsuntivo] = useState<number | string>("");
  const [dataInizio, setDataInizio] = useState<string>("");
  const [dataFine, setDataFine] = useState<string>("");
  const [linkContratto, setLinkContratto] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [stato, setStato] = useState<StatoVoceCosto>("Attiva");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (voceToEdit) {
      setFornitoreId(voceToEdit.fornitore_id);
      setDescrizione(voceToEdit.descrizione);
      setTipoCosto(voceToEdit.tipo_costo);
      setFrequenza(voceToEdit.frequenza_fatturazione || "Mensile");
      setImportoPrevisto(voceToEdit.importo_previsto);
      setImportoConsuntivo(
        voceToEdit.importo_consuntivo !== undefined
          ? voceToEdit.importo_consuntivo
          : voceToEdit.importo_previsto
      );
      setDataInizio(voceToEdit.data_inizio || "");
      setDataFine(voceToEdit.data_fine || "");
      setLinkContratto(voceToEdit.link_contratto || "");
      setNote(voceToEdit.note || "");
      setStato(voceToEdit.stato);
    } else {
      setFornitoreId(fornitori[0]?.id || "");
      setDescrizione("");
      setTipoCosto("Ricorrente");
      setFrequenza("Mensile");
      setImportoPrevisto("");
      setImportoConsuntivo("");
      setDataInizio(new Date().toISOString().split("T")[0]);
      setDataFine("");
      setLinkContratto("");
      setNote("");
      setStato("Attiva");
    }
    setError(null);
  }, [voceToEdit, isOpen, fornitori]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fornitoreId) {
      setError("Selezionare un fornitore.");
      return;
    }
    if (!descrizione.trim()) {
      setError("La descrizione della voce di costo è obbligatoria.");
      return;
    }
    if (importoPrevisto === "" || Number(importoPrevisto) < 0) {
      setError("L'importo previsto deve essere un valore numerico ≥ 0.");
      return;
    }
    if (tipoCosto === "Ricorrente" && !frequenza) {
      setError("La frequenza di fatturazione è obbligatoria per costi ricorrenti.");
      return;
    }
    if (dataFine && dataInizio && new Date(dataFine) < new Date(dataInizio)) {
      setError("La data fine deve essere successiva o uguale alla data inizio.");
      return;
    }

    onSave({
      id: voceToEdit?.id,
      fornitore_id: fornitoreId,
      descrizione: descrizione.trim(),
      tipo_costo: tipoCosto,
      frequenza_fatturazione: tipoCosto === "Ricorrente" ? frequenza : undefined,
      importo_previsto: Number(importoPrevisto),
      importo_consuntivo:
        importoConsuntivo !== "" ? Number(importoConsuntivo) : Number(importoPrevisto),
      data_inizio: dataInizio,
      data_fine: dataFine || undefined,
      link_contratto: linkContratto.trim(),
      note: note.trim(),
      stato,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm">
              {voceToEdit ? "Modifica Voce di Costo" : "Nuova Voce di Costo (Preventivo / Consuntivo)"}
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

          {/* Fornitore */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fornitore Collegato *
            </label>
            <select
              required
              value={fornitoreId}
              onChange={(e) => setFornitoreId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {fornitori.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome} ({f.tipologia})
                </option>
              ))}
            </select>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Descrizione Voce di Costo *
            </label>
            <input
              type="text"
              required
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="es. Licenze Microsoft 365 E5, Assistenza DevOps..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Tipo Costo & Frequenza */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipo Costo *
              </label>
              <select
                value={tipoCosto}
                onChange={(e) => setTipoCosto(e.target.value as TipoCosto)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Ricorrente">Ricorrente (Canone)</option>
                <option value="Una Tantum">Una Tantum (Spot)</option>
              </select>
            </div>

            {tipoCosto === "Ricorrente" && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Frequenza Fatturazione *
                </label>
                <select
                  value={frequenza}
                  onChange={(e) => setFrequenza(e.target.value as FrequenzaFatturazione)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Mensile">Mensile (12/anno)</option>
                  <option value="Trimestrale">Trimestrale (4/anno)</option>
                  <option value="Semestrale">Semestrale (2/anno)</option>
                  <option value="Annuale">Annuale (1/anno)</option>
                </select>
              </div>
            )}
          </div>

          {/* Importo Previsto & Importo Consuntivo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Importo Previsto (Preventivo €) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={importoPrevisto}
                onChange={(e) => setImportoPrevisto(e.target.value)}
                placeholder="es. 4500"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Per periodo se ricorrente; totale se una tantum.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Importo Consuntivo (Effettivo €)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={importoConsuntivo}
                onChange={(e) => setImportoConsuntivo(e.target.value)}
                placeholder="Stima o consuntivo reale"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Data Inizio & Data Fine */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data Inizio Validità *
              </label>
              <input
                type="date"
                required
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Data Fine (Opzionale)
              </label>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Link Contratto specifico */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Link Contratto Specifico (Sovrascrive il fornitore)
            </label>
            <input
              type="url"
              value={linkContratto}
              onChange={(e) => setLinkContratto(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Stato */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Stato *</label>
            <select
              value={stato}
              onChange={(e) => setStato(e.target.value as StatoVoceCosto)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Attiva">Attiva</option>
              <option value="Sospesa">Sospesa</option>
              <option value="Chiusa">Chiusa</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Note</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dettagli licenze, SLA, rinnovo..."
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
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salva Voce di Costo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
