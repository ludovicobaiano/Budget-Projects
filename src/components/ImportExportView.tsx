import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Table,
  RefreshCw,
  Sparkles,
  Eye,
  Lock,
} from "lucide-react";

interface ImportExportViewProps {
  selectedFY: string;
  onExportExcel: () => void;
  onRefreshAll: () => void;
  isAdmin?: boolean;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  selectedFY,
  onExportExcel,
  onRefreshAll,
  isAdmin = true,
}) => {
  const [importType, setImportType] = useState<"voci_costo" | "fatture">("voci_costo");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Download Sample Template XLSX
  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    if (importType === "voci_costo") {
      const templateVoci = [
        {
          fornitore_nome: "Microsoft Italia S.r.l.",
          tipologia: "Asset",
          descrizione: "Licenze Microsoft 365 Copilot",
          tipo_costo: "Ricorrente",
          frequenza_fatturazione: "Mensile",
          importo_previsto: 1200,
          importo_consuntivo: 1200,
          data_inizio: "2026-11-01",
          data_fine: "2027-10-31",
          note: "Modulo AI aggiuntivo",
          stato: "Attiva",
        },
        {
          fornitore_nome: "Cisco Systems Italia",
          tipologia: "Asset",
          descrizione: "Firewall ASA Backup",
          tipo_costo: "Una Tantum",
          frequenza_fatturazione: "",
          importo_previsto: 15000,
          importo_consuntivo: 14800,
          data_inizio: "2026-12-01",
          data_fine: "",
          note: "Hardware sicurezza",
          stato: "Attiva",
        },
      ];

      const sheet = XLSX.utils.json_to_sheet(templateVoci);
      XLSX.utils.book_append_sheet(workbook, sheet, "Template_Voci_Costo");
      XLSX.writeFile(workbook, "Template_Import_Voci_Costo.xlsx");
    } else {
      const templateFatture = [
        {
          fornitore_nome: "Microsoft Italia S.r.l.",
          voce_costo_descrizione: "Licenze Microsoft 365 E5 & Azure Tenant Base",
          numero_fattura: "FT-2027-991",
          data_fattura: "2026-11-15",
          importo: 4500,
          importo_previsto: 4500,
          stato_pagamento: "Pagata",
          data_scadenza: "2026-12-15",
          data_pagamento: "2026-12-10",
          note: "Fattura Novembre 2026",
        },
        {
          fornitore_nome: "Fastweb S.p.A.",
          voce_costo_descrizione: "Connettività Fibra Dedicata 10Gbps + SD-WAN",
          numero_fattura: "FW-2027-001",
          data_fattura: "2026-12-01",
          importo: 1600,
          importo_previsto: 1600,
          stato_pagamento: "Da Pagare",
          data_scadenza: "2027-01-01",
          data_pagamento: "",
          note: "Canone Dicembre 2026",
        },
      ];

      const sheet = XLSX.utils.json_to_sheet(templateFatture);
      XLSX.utils.book_append_sheet(workbook, sheet, "Template_Fatture");
      XLSX.writeFile(workbook, "Template_Import_Fatture.xlsx");
    }
  };

  // Handle File Upload and Parse Excel File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setStatusMessage({
            type: "error",
            text: "Il file caricato risulta vuoto o privo di righe valide.",
          });
          setParsedData([]);
        } else {
          setParsedData(data);
        }
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: `Errore durante la lettura del file Excel: ${err?.message || err}`,
        });
        setParsedData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Import to Backend API
  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/import-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: importType,
          items: parsedData,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: `Importazione completata con successo! Inseriti ${resData.count} elementi.`,
        });
        setParsedData([]);
        setFileName("");
        onRefreshAll();
      } else {
        setStatusMessage({
          type: "error",
          text: resData.error || "Errore durante l'importazione dei dati.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Errore di rete: ${err?.message || err}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div id="import-export-view" className="space-y-6 pb-12 animate-fade-in">
      {!isAdmin && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-medium shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Modalità Visualizzatore:</strong> L'esportazione dei report Excel è abilitata per tutti, mentre l'importazione massiva da Excel è riservata agli Amministratori.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[10px] shrink-0 border border-emerald-200">
            Export Abilitato
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            Import / Export Massivo Excel & CSV
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Esporta il report finanziario dell'anno fiscale o carica in blocco preventivi, consuntivi e fatture.
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Esporta Report {selectedFY} (.xlsx)</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Import Configuration & Upload */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-600" /> Configura Importazione
            </h3>

            {/* Select Import Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipologia Dati da Importare:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportType("voci_costo");
                    setParsedData([]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    importType === "voci_costo"
                      ? "bg-sky-50 text-sky-700 border-sky-300 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Voci di Costo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportType("fatture");
                    setParsedData([]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    importType === "fatture"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Fatture
                </button>
              </div>
            </div>

            {/* Step 1: Download Template */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Step 1: Scarica Modello Guida
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Template Excel (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: File Dropzone */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Step 2: Carica il tuo file Excel / CSV
              </p>

              <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-all">
                <Upload className="w-8 h-8 text-sky-500 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  {fileName ? fileName : "Clicca per selezionare un file"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Formati supportati: .xlsx, .xls, .csv
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview & Action Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Table className="w-4 h-4 text-sky-600" /> Anteprima Dati Pronti per l'Importazione
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verifica la correttezza delle colonne prima di procedere con l'inserimento nel database.
                </p>
              </div>

              {parsedData.length > 0 && (
                <span className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs font-bold">
                  {parsedData.length} righe pronte
                </span>
              )}
            </div>

            {parsedData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-center p-6 text-slate-400">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Nessun file in anteprima</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Seleziona un file Excel nel pannello a sinistra per visualizzare qui l'anteprima dei dati.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600">
                      {Object.keys(parsedData[0] || {}).map((col) => (
                        <th key={col} className="p-2.5 capitalize border-r border-slate-200">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, colIdx) => (
                          <td key={colIdx} className="p-2.5 border-r border-slate-100 text-slate-700 truncate max-w-[150px]">
                            {String(val ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50">
                    Ed altri {parsedData.length - 10} elementi...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          {parsedData.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setParsedData([])}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isUploading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importazione in corso...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conferma Importazione Massiva</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
