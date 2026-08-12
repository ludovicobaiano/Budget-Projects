import React, { useState, useEffect } from "react";
import { Sparkles, X, RefreshCw, Bot, FileText, CheckCircle2 } from "lucide-react";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFY: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedFY,
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fy: selectedFY }),
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || "Impossibile recuperare l'analisi AI.");
      }
    } catch (err: any) {
      setError(`Errore di comunicazione: ${err?.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis) {
      fetchAIAnalysis();
    }
  }, [isOpen, selectedFY]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">
                AI Budget Advisor - Responsabile SI
              </h2>
              <p className="text-xs text-sky-100">
                Analisi predittiva e raccomandazioni per Anno Fiscale {selectedFY}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs leading-relaxed space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-700">
                Elaborazione analisi finanziaria con Gemini AI...
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Incrocio dati di fornitori, costi preventivati e fatture effettive registrate.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-center">
              <p className="font-bold mb-1">Si è verificato un errore</p>
              <p className="text-xs">{error}</p>
              <button
                onClick={fetchAIAnalysis}
                className="mt-3 px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Riprova
              </button>
            </div>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Analisi basata sul modello Gemini 3.6
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAIAnalysis}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Rigenera</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
