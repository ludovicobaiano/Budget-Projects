import React from "react";
import {
  Fornitore,
  VoceDiCosto,
  FatturaDettagliata,
  formatCurrency,
  formatDateIt,
  calculateAnnualizedPreventivo,
  calculateAnnualizedConsuntivo,
} from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  HardDrive,
  Wrench,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface DashboardViewProps {
  selectedFY: string;
  fornitori: Fornitore[];
  vociCosto: VoceDiCosto[];
  fatture: FatturaDettagliata[];
  onOpenAI: () => void;
  onNewFornitore: () => void;
  onNewVoceCosto: () => void;
  onNewFattura: () => void;
  onSelectFornitore: (f: Fornitore) => void;
  setActiveTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedFY,
  fornitori,
  vociCosto,
  fatture,
  onOpenAI,
  onNewFornitore,
  onNewVoceCosto,
  onNewFattura,
  onSelectFornitore,
  setActiveTab,
}) => {
  // Filter invoices for selected FY
  const fyInvoices = fatture.filter((f) => f.anno_fiscale === selectedFY);

  // 1. Total Allocated Target Budget across active suppliers
  const totalTargetAllocated = fornitori
    .filter((f) => f.stato === "Attivo")
    .reduce((sum, f) => sum + (f.budget_allocato || 0), 0);

  // 2. Total Planned (Preventivo) Annualized
  const totalPlannedAnnualized = vociCosto
    .filter((v) => v.stato === "Attiva")
    .reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

  // Use target allocated if defined, else planned annualized
  const effectiveTotalBudget = totalTargetAllocated > 0 ? totalTargetAllocated : totalPlannedAnnualized;

  // 3. Total Spent / Invoiced in selected FY
  const totalSpentFY = fyInvoices.reduce((sum, f) => sum + f.importo, 0);

  // 4. Remaining Budget
  const remainingBudget = Math.max(0, effectiveTotalBudget - totalSpentFY);
  const spentPercentage = effectiveTotalBudget > 0 ? Math.min(100, Math.round((totalSpentFY / effectiveTotalBudget) * 100)) : 0;
  const remainingPercentage = Math.max(0, 100 - spentPercentage);

  // 5. Fixed (Ricorrenti) vs Variable (Una Tantum) Breakdown
  const vociRicorrenti = vociCosto.filter((v) => v.tipo_costo === "Ricorrente" && v.stato === "Attiva");
  const vociUnaTantum = vociCosto.filter((v) => v.tipo_costo === "Una Tantum" && v.stato === "Attiva");

  const plannedRicorrenti = vociRicorrenti.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);
  const plannedUnaTantum = vociUnaTantum.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

  const spentRicorrenti = fyInvoices
    .filter((f) => f.voce_costo_tipo === "Ricorrente")
    .reduce((sum, f) => sum + f.importo, 0);

  const spentUnaTantum = fyInvoices
    .filter((f) => f.voce_costo_tipo === "Una Tantum")
    .reduce((sum, f) => sum + f.importo, 0);

  // 6. Breakdown per Tipologia Fornitore (Asset, Servizi, Acquisto Terze Parti)
  const tipologiaData = {
    Asset: { planned: 0, spent: 0 },
    Servizi: { planned: 0, spent: 0 },
    "Acquisto Terze Parti": { planned: 0, spent: 0 },
  };

  fornitori.forEach((f) => {
    const tip = f.tipologia as keyof typeof tipologiaData;
    if (tipologiaData[tip]) {
      const suppVoci = vociCosto.filter((v) => v.fornitore_id === f.id);
      const suppVociIds = suppVoci.map((v) => v.id);

      tipologiaData[tip].planned += suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);
      tipologiaData[tip].spent += fyInvoices
        .filter((ft) => suppVociIds.includes(ft.voce_costo_id))
        .reduce((sum, ft) => sum + ft.importo, 0);
    }
  });

  // 7. Monthly Trend Data for 12 months of Fiscal Year (Nov -> Oct)
  // Extract year from selectedFY (e.g., FY2027 -> 2027)
  const fyYearNum = parseInt(selectedFY.replace("FY", ""), 10) || new Date().getFullYear();
  const fyStartYear = fyYearNum - 1; // Nov 2026 for FY2027

  const monthsFY = [
    { name: `Nov '${fyStartYear.toString().substring(2)}`, month: 11, year: fyStartYear },
    { name: `Dic '${fyStartYear.toString().substring(2)}`, month: 12, year: fyStartYear },
    { name: `Gen '${fyYearNum.toString().substring(2)}`, month: 1, year: fyYearNum },
    { name: `Feb '${fyYearNum.toString().substring(2)}`, month: 2, year: fyYearNum },
    { name: `Mar '${fyYearNum.toString().substring(2)}`, month: 3, year: fyYearNum },
    { name: `Apr '${fyYearNum.toString().substring(2)}`, month: 4, year: fyYearNum },
    { name: `Mag '${fyYearNum.toString().substring(2)}`, month: 5, year: fyYearNum },
    { name: `Giu '${fyYearNum.toString().substring(2)}`, month: 6, year: fyYearNum },
    { name: `Lug '${fyYearNum.toString().substring(2)}`, month: 7, year: fyYearNum },
    { name: `Ago '${fyYearNum.toString().substring(2)}`, month: 8, year: fyYearNum },
    { name: `Set '${fyYearNum.toString().substring(2)}`, month: 9, year: fyYearNum },
    { name: `Ott '${fyYearNum.toString().substring(2)}`, month: 10, year: fyYearNum },
  ];

  const monthlyChartData = monthsFY.map((m) => {
    // Invoices for this month
    const mInvoices = fyInvoices.filter((ft) => {
      const d = new Date(ft.data_fattura);
      return d.getMonth() + 1 === m.month && d.getFullYear() === m.year;
    });

    const spesoMese = mInvoices.reduce((sum, ft) => sum + ft.importo, 0);
    const preventivoProrata = Math.round(effectiveTotalBudget / 12);

    return {
      month: m.name,
      "Fatturato Reale": spesoMese,
      "Budget Previsto": preventivoProrata,
    };
  });

  // 8. Overdue and Pending Invoices
  const pendingInvoices = fyInvoices.filter((f) => f.stato_pagamento !== "Pagata");

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Action Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Panoramica Budget IT ({selectedFY})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Anno Fiscale dal 1° Novembre al 31 Ottobre — Monitoraggio integrato costi e fornitori.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-add-fornitore"
            onClick={onNewFornitore}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuovo Fornitore</span>
          </button>

          <button
            id="btn-add-voce"
            onClick={onNewVoceCosto}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuova Voce Costo</span>
          </button>

          <button
            id="btn-add-fattura"
            onClick={onNewFattura}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registra Fattura</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS (Matching Mowany Style in screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Budget Totale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  €
                </span>
                Budget Totale ({selectedFY})
              </span>
              <button
                onClick={onNewVoceCosto}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100/80"
              >
                + Modifica Voci
              </button>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(effectiveTotalBudget)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              Target Fornitori Allocato
            </span>
            <span className="text-slate-400 text-[11px]">
              Previsto Voci: {formatCurrency(totalPlannedAnnualized)}
            </span>
          </div>
        </div>

        {/* Card 2: Speso Finora */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                  ↑
                </span>
                Fatturato / Speso Finora
              </span>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                {spentPercentage}% del budget
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(totalSpentFY)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  spentPercentage > 90 ? "bg-rose-500" : "bg-sky-500"
                }`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Fatture registrate nell'anno fiscale corrente.
            </p>
          </div>
        </div>

        {/* Card 3: Budget Rimanente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  ↘
                </span>
                Budget Rimanente
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {remainingPercentage}% disponibile
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              {spentPercentage > 85 ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Utilizzo elevato
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Spesa in linea
                </span>
              )}
            </span>
            <button
              onClick={() => setActiveTab("fatture")}
              className="text-[11px] text-sky-600 hover:underline font-semibold"
            >
              Vedi fatture &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: MONTHLY SPENDING TREND & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Andamento Spesa Mensile ({selectedFY})
              </h3>
              <p className="text-[11px] text-slate-400">
                Confronto Mese per Mese (Novembre &rarr; Ottobre) tra Budget Pro-rata e Fatturato
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
              12 Mesi FY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickFormatter={(val) => `€${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Budget Previsto"
                  fill="#e0f2fe"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="Fatturato Reale"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown & AI Insight Box (1 Col) */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* AI Insight Box (Matching Mowany blue card style) */}
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-5 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                  <Sparkles className="w-4 h-4 text-sky-100 animate-pulse" />
                </div>
                <span className="text-xs font-bold tracking-wide uppercase text-sky-100">
                  AI Financial Insight
                </span>
              </div>
              <p className="text-xs text-sky-50 leading-relaxed font-medium">
                Analisi automatica budget: Le spese per licenze M365 ed AWS sono in linea. Rilevate <strong>{pendingInvoices.length} fatture</strong> in attesa di saldo nel periodo.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 relative z-10">
              <button
                onClick={onOpenAI}
                className="w-full py-2 px-3 rounded-xl bg-white text-blue-600 text-xs font-bold hover:bg-sky-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Genera Report AI Completo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Background decorative glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-400/30 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Fixed vs Variable Expenses Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Ricorrenti (Fissi)</span>
              </div>
              <p className="text-base font-extrabold text-slate-800">
                {formatCurrency(spentRicorrenti)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Previsto: {formatCurrency(plannedRicorrenti)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Una Tantum (Spot)</span>
              </div>
              <p className="text-base font-extrabold text-slate-800">
                {formatCurrency(spentUnaTantum)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Previsto: {formatCurrency(plannedUnaTantum)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: BREAKDOWN BY SUPPLIER TYPE & OVERDUE INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers Budget Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Fornitori IT & Utilizzo Budget ({selectedFY})
              </h3>
              <p className="text-[11px] text-slate-400">
                Stato di avanzamento spesa preventivata vs fatturata per fornitore
              </p>
            </div>

            <button
              onClick={() => setActiveTab("fornitori")}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              Vedi Tutti ({fornitori.length}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Fornitore</th>
                  <th className="py-3 px-4">Tipologia</th>
                  <th className="py-3 px-4 text-right">Preventivo FY</th>
                  <th className="py-3 px-4 text-right">Fatturato FY</th>
                  <th className="py-3 px-4 text-center">Avanzamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {fornitori.map((f) => {
                  const suppVoci = vociCosto.filter((v) => v.fornitore_id === f.id);
                  const suppVociIds = suppVoci.map((v) => v.id);
                  const planned = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

                  const spent = fyInvoices
                    .filter((ft) => suppVociIds.includes(ft.voce_costo_id))
                    .reduce((sum, ft) => sum + ft.importo, 0);

                  const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;

                  return (
                    <tr
                      key={f.id}
                      onClick={() => onSelectFornitore(f)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {f.nome.charAt(0)}
                        </div>
                        <span className="truncate max-w-[180px]">{f.nome}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            f.tipologia === "Asset"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : f.tipologia === "Servizi"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {f.tipologia}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(planned)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {formatCurrency(spent)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pct > 100 ? "bg-rose-500" : pct > 75 ? "bg-amber-500" : "bg-sky-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tipologia Breakdown & Upcoming Invoices (1 Col) */}
        <div className="space-y-5">
          {/* Tipologia Breakdown Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Ripartizione Spesa per Tipologia
            </h3>

            <div className="space-y-3">
              {/* Asset */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Asset
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(tipologiaData["Asset"].spent)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${
                        totalSpentFY > 0
                          ? Math.round((tipologiaData["Asset"].spent / totalSpentFY) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Servizi */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-emerald-500" /> Servizi
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(tipologiaData["Servizi"].spent)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        totalSpentFY > 0
                          ? Math.round((tipologiaData["Servizi"].spent / totalSpentFY) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Acquisto Terze Parti */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Acquisto Terze Parti
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(tipologiaData["Acquisto Terze Parti"].spent)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${
                        totalSpentFY > 0
                          ? Math.round((tipologiaData["Acquisto Terze Parti"].spent / totalSpentFY) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending / Overdue Invoices Alert Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Fatture da Saldare ({pendingInvoices.length})
              </h3>
              <button
                onClick={() => setActiveTab("fatture")}
                className="text-xs text-sky-600 hover:underline font-semibold"
              >
                Vedi tutte
              </button>
            </div>

            {pendingInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Tutte le fatture risultano regolarmente saldate!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {pendingInvoices.map((ft) => (
                  <div
                    key={ft.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[150px]">
                        {ft.fornitore_nome}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {ft.numero_fattura || "N.A."} — Scad: {formatDateIt(ft.data_scadenza)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {formatCurrency(ft.importo)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          ft.stato_pagamento === "In Ritardo"
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
