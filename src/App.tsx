import React, { useState, useEffect, useCallback } from "react";
import {
  Fornitore,
  VoceDiCosto,
  VoceDiCostoConFornitore,
  Fattura,
  FatturaDettagliata,
} from "./types";
import { Sidebar, ActiveTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { FornitoriView } from "./components/FornitoriView";
import { VociCostoView } from "./components/VociCostoView";
import { FattureView } from "./components/FattureView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ImportExportView } from "./components/ImportExportView";
import { AIAssistantModal } from "./components/AIAssistantModal";
import { ModalFornitore } from "./components/ModalFornitore";
import { ModalVoceCosto } from "./components/ModalVoceCosto";
import { ModalFattura } from "./components/ModalFattura";
import { FornitoreDetailDrawer } from "./components/FornitoreDetailDrawer";
import { RefreshCw } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedFY, setSelectedFY] = useState<string>("FY2027");
  const availableFYs = ["FY2028", "FY2027", "FY2026", "FY2025"];
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Core Data Collections
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  const [vociCosto, setVociCosto] = useState<VoceDiCostoConFornitore[]>([]);
  const [fatture, setFatture] = useState<FatturaDettagliata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isFornitoreModalOpen, setIsFornitoreModalOpen] = useState<boolean>(false);
  const [fornitoreToEdit, setFornitoreToEdit] = useState<Fornitore | null>(null);

  const [isVoceModalOpen, setIsVoceModalOpen] = useState<boolean>(false);
  const [voceToEdit, setVoceToEdit] = useState<VoceDiCosto | null>(null);

  const [isFatturaModalOpen, setIsFatturaModalOpen] = useState<boolean>(false);
  const [fatturaToEdit, setFatturaToEdit] = useState<Fattura | null>(null);

  const [selectedFornitoreForDrawer, setSelectedFornitoreForDrawer] = useState<Fornitore | null>(null);

  // Fetch all database records
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resF, resV, resFt] = await Promise.all([
        fetch("/api/fornitori"),
        fetch("/api/voci-costo"),
        fetch("/api/fatture"),
      ]);

      if (resF.ok) setFornitori(await resF.json());
      if (resV.ok) setVociCosto(await resV.json());
      if (resFt.ok) setFatture(await resFt.json());
    } catch (err) {
      console.error("Errore nel caricamento dei dati:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Overdue Invoices Count
  const overdueCount = fatture.filter((f) => f.stato_pagamento === "In Ritardo").length;

  // --- HANDLERS FOR FORNITORI CRUD ---
  const handleSaveFornitore = async (data: Partial<Fornitore>) => {
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `/api/fornitori/${data.id}` : "/api/fornitori";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Errore: ${err.error || "Operazione non riuscita"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFornitore = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo fornitore? L'azione fallirà se ha voci di costo attive.")) return;
    try {
      const res = await fetch(`/api/fornitori/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Impossibile eliminare: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS FOR VOCI DI COSTO CRUD ---
  const handleSaveVoceCosto = async (data: Partial<VoceDiCosto>) => {
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `/api/voci-costo/${data.id}` : "/api/voci-costo";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Errore: ${err.error || "Operazione non riuscita"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVoceCosto = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa voce di costo?")) return;
    try {
      const res = await fetch(`/api/voci-costo/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Impossibile eliminare: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS FOR FATTURE CRUD ---
  const handleSaveFattura = async (data: Partial<Fattura>) => {
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `/api/fatture/${data.id}` : "/api/fatture";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Errore: ${err.error || "Operazione non riuscita"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFattura = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa fattura?")) return;
    try {
      const res = await fetch(`/api/fatture/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Impossibile eliminare: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset database to initial PRD seed
  const handleResetData = async () => {
    if (!window.confirm("Vuoi ripristinare i dati di esempio iniziali per il budget IT?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Excel Export download
  const handleExportExcel = () => {
    window.open(`/api/export-excel?fy=${selectedFY}`, "_blank");
  };

  return (
    <div id="app-container" className="min-h-screen bg-slate-50/50 flex font-sans antialiased text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* Persistent Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Sticky Header */}
        <Header
          selectedFY={selectedFY}
          setSelectedFY={setSelectedFY}
          availableFYs={availableFYs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          overdueCount={overdueCount}
          onOpenAI={() => setIsAIModalOpen(true)}
          onExportExcel={handleExportExcel}
          onResetData={handleResetData}
        />

        {/* Viewport Content Container */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">
                Caricamento dati budget e fornitori...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  selectedFY={selectedFY}
                  fornitori={fornitori}
                  vociCosto={vociCosto}
                  fatture={fatture}
                  onOpenAI={() => setIsAIModalOpen(true)}
                  onNewFornitore={() => {
                    setFornitoreToEdit(null);
                    setIsFornitoreModalOpen(true);
                  }}
                  onNewVoceCosto={() => {
                    setVoceToEdit(null);
                    setIsVoceModalOpen(true);
                  }}
                  onNewFattura={() => {
                    setFatturaToEdit(null);
                    setIsFatturaModalOpen(true);
                  }}
                  onSelectFornitore={(f) => setSelectedFornitoreForDrawer(f)}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "fornitori" && (
                <FornitoriView
                  fornitori={fornitori}
                  vociCosto={vociCosto}
                  fatture={fatture}
                  selectedFY={selectedFY}
                  onNewFornitore={() => {
                    setFornitoreToEdit(null);
                    setIsFornitoreModalOpen(true);
                  }}
                  onEditFornitore={(f) => {
                    setFornitoreToEdit(f);
                    setIsFornitoreModalOpen(true);
                  }}
                  onDeleteFornitore={handleDeleteFornitore}
                  onSelectFornitore={(f) => setSelectedFornitoreForDrawer(f)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "voci_costo" && (
                <VociCostoView
                  vociCosto={vociCosto}
                  fornitori={fornitori}
                  selectedFY={selectedFY}
                  onNewVoceCosto={() => {
                    setVoceToEdit(null);
                    setIsVoceModalOpen(true);
                  }}
                  onEditVoceCosto={(v) => {
                    setVoceToEdit(v);
                    setIsVoceModalOpen(true);
                  }}
                  onDeleteVoceCosto={handleDeleteVoceCosto}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "fatture" && (
                <FattureView
                  fatture={fatture}
                  fornitori={fornitori}
                  selectedFY={selectedFY}
                  onNewFattura={() => {
                    setFatturaToEdit(null);
                    setIsFatturaModalOpen(true);
                  }}
                  onEditFattura={(ft) => {
                    setFatturaToEdit(ft);
                    setIsFatturaModalOpen(true);
                  }}
                  onDeleteFattura={handleDeleteFattura}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsView
                  fornitori={fornitori}
                  vociCosto={vociCosto}
                  fatture={fatture}
                  selectedFY={selectedFY}
                  onOpenAI={() => setIsAIModalOpen(true)}
                />
              )}

              {activeTab === "import_export" && (
                <ImportExportView
                  selectedFY={selectedFY}
                  onExportExcel={handleExportExcel}
                  onRefreshAll={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        selectedFY={selectedFY}
      />

      {/* Supplier Modal */}
      <ModalFornitore
        isOpen={isFornitoreModalOpen}
        onClose={() => setIsFornitoreModalOpen(false)}
        onSave={handleSaveFornitore}
        fornitoreToEdit={fornitoreToEdit}
      />

      {/* Budget Cost Item Modal */}
      <ModalVoceCosto
        isOpen={isVoceModalOpen}
        onClose={() => setIsVoceModalOpen(false)}
        onSave={handleSaveVoceCosto}
        voceToEdit={voceToEdit}
        fornitori={fornitori}
      />

      {/* Invoice Modal */}
      <ModalFattura
        isOpen={isFatturaModalOpen}
        onClose={() => setIsFatturaModalOpen(false)}
        onSave={handleSaveFattura}
        fatturaToEdit={fatturaToEdit}
        vociCosto={vociCosto}
      />

      {/* Supplier Detail Slide-over Drawer */}
      <FornitoreDetailDrawer
        fornitore={selectedFornitoreForDrawer}
        onClose={() => setSelectedFornitoreForDrawer(null)}
        vociCosto={vociCosto}
        fatture={fatture}
        selectedFY={selectedFY}
        onEditFornitore={(f) => {
          setSelectedFornitoreForDrawer(null);
          setFornitoreToEdit(f);
          setIsFornitoreModalOpen(true);
        }}
        onNewVoceCostoForFornitore={(fId) => {
          setSelectedFornitoreForDrawer(null);
          setVoceToEdit(null);
          setIsVoceModalOpen(true);
        }}
      />
    </div>
  );
}
export default App;
