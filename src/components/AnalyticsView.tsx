import React from "react";
import {
  Fornitore,
  VoceDiCosto,
  FatturaDettagliata,
  formatCurrency,
  calculateAnnualizedPreventivo,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  Target,
  Sparkles,
} from "lucide-react";

interface AnalyticsViewProps {
  fornitori: Fornitore[];
  vociCosto: VoceDiCosto[];
  fatture: FatturaDettagliata[];
  selectedFY: string;
  onOpenAI: () => void;
}

const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  fornitori,
  vociCosto,
  fatture,
  selectedFY,
  onOpenAI,
}) => {
  // 1. Multi-FY Comparison Data (FY2025, FY2026, FY2027, FY2028)
  const fyList = ["FY2025", "FY2026", "FY2027", "FY2028"];
  const multiFYData = fyList.map((fy) => {
    const fyInv = fatture.filter((f) => f.anno_fiscale === fy);
    const spent = fyInv.reduce((sum, f) => sum + f.importo, 0);

    return {
      fy,
      "Fatturato Effettivo": spent,
    };
  });

  // 2. Top Suppliers by Spend in Selected FY
  const fyInvoices = fatture.filter((f) => f.anno_fiscale === selectedFY);

  const topSuppliersData = fornitori
    .map((f) => {
      const suppVociIds = vociCosto.filter((v) => v.fornitore_id === f.id).map((v) => v.id);
      const spent = fyInvoices
        .filter((ft) => suppVociIds.includes(ft.voce_costo_id))
        .reduce((sum, ft) => sum + ft.importo, 0);

      return {
        name: f.nome,
        spesa: spent,
      };
    })
    .filter((s) => s.spesa > 0)
    .sort((a, b) => b.spesa - a.spesa);

  // 3. Breakdown Ricorrenti vs Una Tantum
  const spentRicorrente = fyInvoices
    .filter((f) => f.voce_costo_tipo === "Ricorrente")
    .reduce((sum, f) => sum + f.importo, 0);

  const spentUnaTantum = fyInvoices
    .filter((f) => f.voce_costo_tipo === "Una Tantum")
    .reduce((sum, f) => sum + f.importo, 0);

  const pieTypeData = [
    { name: "Costi Ricorrenti (Fissi)", value: spentRicorrente },
    { name: "Costi Una Tantum (Spot)", value: spentUnaTantum },
  ];

  // 4. Forecast vs Actual (End of Year Projection)
  // Projected = Registered Invoices + Planned remaining recurring
  const totalPlannedAnnual = vociCosto
    .filter((v) => v.stato === "Attiva")
    .reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

  const totalSpentSoFar = fyInvoices.reduce((sum, f) => sum + f.importo, 0);
  const forecastTotal = Math.max(totalSpentSoFar, totalPlannedAnnual);

  return (
    <div id="analytics-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Analytics & Reportistica Avanzata ({selectedFY})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisi comparativa pluriennale, top fornitori e proiezioni di spesa a fine anno fiscale.
          </p>
        </div>

        <button
          onClick={onOpenAI}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:opacity-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-sky-100" />
          <span>Analizza Trend con AI</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Target className="w-4 h-4 text-sky-500" /> Forecast a Fine FY
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(forecastTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Proiezione basata su contratti attivi e consuntivi
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Costi Ricorrenti vs Totale
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalSpentSoFar > 0
              ? `${Math.round((spentRicorrente / totalSpentSoFar) * 100)}%`
              : "0%"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Incidenza dei canoni fissi sul totale speso
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" /> Top Fornitore
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 truncate">
            {topSuppliersData[0]?.name || "N.A."}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Spesa: {formatCurrency(topSuppliersData[0]?.spesa || 0)}
          </p>
        </div>
      </div>

      {/* CHARTS GRID 1: Multi-FY Comparison & Ricorrenti vs Una Tantum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-FY Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Andamento Storico Multi-FY
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Confronto della spesa totale fatturata per gli anni fiscali
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={multiFYData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fy" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Fatturato"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Fatturato Effettivo" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ricorrenti vs Una Tantum Breakdown Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Ripartizione Costi: Ricorrenti vs Spot ({selectedFY})
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Flessibilità del budget tra canoni ricorrenti fissa e spese una tantum
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            {totalSpentSoFar === 0 ? (
              <p className="text-xs text-slate-400">Nessun dato di spesa per il FY selezionato.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#0284c7" />
                    <Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), ""]} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: Top Suppliers Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Classifica Top Fornitori per Spesa ({selectedFY})
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Fornitori con maggiore incidenza economica sul budget IT
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topSuppliersData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), "Speso"]} />
              <Bar dataKey="spesa" fill="#0284c7" radius={[0, 6, 6, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
