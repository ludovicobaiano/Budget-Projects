import React, { useState, useEffect } from "react";
import { Fornitore, TipologiaFornitore, StatoFornitore } from "../types";
import { X, Building2, CheckCircle2, User, Phone } from "lucide-react";

interface ModalFornitoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Fornitore>) => void;
  fornitoreToEdit?: Fornitore | null;
}

export const ModalFornitore: React.FC<ModalFornitoreProps> = ({
  isOpen,
  onClose,
  onSave,
  fornitoreToEdit,
}) => {
  const [nome, setNome] = useState<string>("");
  const [tipologia, setTipologia] = useState<TipologiaFornitore>("Asset");
  const [accountManagerNome, setAccountManagerNome] = useState<string>("");
  const [accountManagerTelefono, setAccountManagerTelefono] = useState<string>("");
  const [budgetAllocato, setBudgetAllocato] = useState<number | string>("");
  const [note, setNote] = useState<string>("");
  const [linkContratto, setLinkContratto] = useState<string>("");
  const [stato, setStato] = useState<StatoFornitore>("Attivo");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fornitoreToEdit) {
      setNome(fornitoreToEdit.nome);
      setTipologia(fornitoreToEdit.tipologia);
      setAccountManagerNome(fornitoreToEdit.account_manager_nome || "");
      setAccountManagerTelefono(fornitoreToEdit.account_manager_telefono || "");
      setBudgetAllocato(fornitoreToEdit.budget_allocato || "");
      setNote(fornitoreToEdit.note || "");
      setLinkContratto(fornitoreToEdit.link_contratto || "");
      setStato(fornitoreToEdit.stato);
    } else {
      setNome("");
      setTipologia("Asset");
      setAccountManagerNome("");
      setAccountManagerTelefono("");
      setBudgetAllocato("");
      setNote("");
      setLinkContratto("");
      setStato("Attivo");
    }
    setError(null);
  }, [fornitoreToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError("Il nome del fornitore è obbligatorio.");
      return;
    }

    onSave({
      id: fornitoreToEdit?.id,
      nome: nome.trim(),
      tipologia,
      account_manager_nome: accountManagerNome.trim(),
      account_manager_telefono: accountManagerTelefono.trim(),
      budget_allocato: budgetAllocato !== "" ? Number(budgetAllocato) : 0,
      note: note.trim(),
      link_contratto: linkContratto.trim(),
      stato,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm">
              {fornitoreToEdit ? "Modifica Fornitore IT" : "Nuovo Fornitore IT"}
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

          {/* Nome */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nome Fornitore *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Microsoft Italia S.r.l., AWS, Cisco..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
            />
          </div>

          {/* Tipologia & Stato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipologia Fornitore *
              </label>
              <select
                value={tipologia}
                onChange={(e) => setTipologia(e.target.value as TipologiaFornitore)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Asset">Asset (Hardware/Licenze)</option>
                <option value="Servizi">Servizi (Consulenza/Helpdesk)</option>
                <option value="Acquisto Terze Parti">Acquisto Terze Parti (Spot)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stato *
              </label>
              <select
                value={stato}
                onChange={(e) => setStato(e.target.value as StatoFornitore)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Attivo">Attivo</option>
                <option value="Inattivo">Inattivo</option>
              </select>
            </div>
          </div>

          {/* Account Manager Section */}
          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100/80 space-y-3">
            <span className="font-bold text-sky-900 text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              Account Manager Referente
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome e Cognome
                </label>
                <input
                  type="text"
                  value={accountManagerNome}
                  onChange={(e) => setAccountManagerNome(e.target.value)}
                  placeholder="es. Marco Rossi"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cellulare / Telefono
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={accountManagerTelefono}
                    onChange={(e) => setAccountManagerTelefono(e.target.value)}
                    placeholder="es. +39 348 1234567"
                    className="w-full p-2.5 pl-8 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Target Budget Allocato */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Budget Allocato (€ / Anno)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetAllocato}
              onChange={(e) => setBudgetAllocato(e.target.value)}
              placeholder="es. 50000"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Cap di spesa annuale concordato per questo fornitore.
            </p>
          </div>

          {/* Link Contratto */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Link URL Contratto (Drive, SharePoint)
            </label>
            <input
              type="url"
              value={linkContratto}
              onChange={(e) => setLinkContratto(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Note</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Informazioni aggiuntive sul fornitore..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
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
              <span>Salva Fornitore</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
