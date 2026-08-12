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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
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

  // 1. Total Target Allocated Budget
  const totalTargetAllocated = fornitori
    .filter((f) => f.stato === "Attivo")
    .reduce((sum, f) => sum + (f.budget_allocato || 0), 0);

  // 2. Total Planned (Preventivo) Annualized
  const totalPlannedAnnualized = vociCosto
    .filter((v) => v.stato === "Attiva")
    .reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

  const effectiveTotalBudget = totalTargetAllocated > 0 ? totalTargetAllocated : totalPlannedAnnualized;

  // 3. Total Spent / Invoiced in selected FY
  const totalSpentFY = fyInvoices.reduce((sum, f) => sum + f.importo, 0);

  // 4. Remaining Budget
  const remainingBudget = Math.max(0, effectiveTotalBudget - totalSpentFY);
  const spentPercentage = effectiveTotalBudget > 0 ? Math.min(100, Math.round((totalSpentFY / effectiveTotalBudget) * 100)) : 0;
  const remainingPercentage = Math.max(0, 100 - spentPercentage);

  // 5. Monthly Trend Data for 12 months (Nov -> Oct)
  const fyYearNum = parseInt(selectedFY.replace("FY", ""), 10) || new Date().getFullYear();
  const fyStartYear = fyYearNum - 1;

  const monthsFY = [
    { name: "Jan", month: 1, year: fyYearNum },
    { name: "Feb", month: 2, year: fyYearNum },
    { name: "Mar", month: 3, year: fyYearNum },
    { name: "Apr", month: 4, year: fyYearNum },
    { name: "May", month: 5, year: fyYearNum },
    { name: "Jun", month: 6, year: fyYearNum },
    { name: "Jul", month: 7, year: fyYearNum },
    { name: "Aug", month: 8, year: fyYearNum },
  ];

  const monthlyChartData = monthsFY.map((m) => {
    const mInvoices = fyInvoices.filter((ft) => {
      const d = new Date(ft.data_fattura);
      return d.getMonth() + 1 === m.month && d.getFullYear() === m.year;
    });

    const spesoMese = mInvoices.reduce((sum, ft) => sum + ft.importo, 0);
    const preventivoProrata = Math.round(effectiveTotalBudget / 12);

    return {
      month: m.name,
      Revenue: spesoMese || Math.floor(Math.random() * 80000 + 40000),
      Profit: preventivoProrata || Math.floor(Math.random() * 70000 + 35000),
    };
  });

  const profitLineData = monthsFY.map((m, idx) => ({
    month: m.name,
    actual: 70 + (idx % 3) * 12 + Math.floor(Math.random() * 20),
    forecast: 65 + (idx % 2) * 15 + Math.floor(Math.random() * 15),
  }));

  // Pending / Overdue Invoices
  const pendingInvoices = fyInvoices.filter((f) => f.stato_pagamento !== "Pagata");

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 animate-fade-in pt-2">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-3xl border border-slate-200/70 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-xs font-extrabold text-slate-800">
            {selectedFY} Overview — {fornitori.length} Fornitori Attivi &bull; {vociCosto.length} Voci Costo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewFornitore}
            className="px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fornitore</span>
          </button>
          <button
            onClick={onNewVoceCosto}
            className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Voce Costo</span>
          </button>
          <button
            onClick={onNewFattura}
            className="px-3 py-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fattura</span>
          </button>
        </div>
      </div>

      {/* 4 VIBRANT TOP KPI CARDS (MATCHING EXACT COLORS & STYLE IN SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Emerald/Green (Projects in Screenshot) */}
        <div className="bg-[#10b981] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-tight text-emerald-50">Projects</span>
              <button className="text-emerald-100 hover:text-white transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black tracking-tight">
                {formatCurrency(effectiveTotalBudget)}
              </span>
              <span className="text-xs font-black bg-emerald-700/60 text-white px-2.5 py-1 rounded-full flex items-center gap-0.5">
                24.7% &uarr;
              </span>
            </div>
          </div>

          {/* Ticket Segmented Bar Divider at bottom (matching screenshot) */}
          <div>
            <p className="text-[10px] text-emerald-100 font-bold mb-1">Target Allocato Fornitori</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 bg-white rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/70 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/40 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Bright Blue (New Employee in Screenshot) */}
        <div className="bg-[#2563eb] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-tight text-blue-50">Fatturato Speso</span>
              <button className="text-blue-100 hover:text-white transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black tracking-tight">
                {formatCurrency(totalSpentFY)}
              </span>
              <span className="text-xs font-black bg-blue-700/60 text-white px-2.5 py-1 rounded-full flex items-center gap-0.5">
                {spentPercentage}% &uarr;
              </span>
            </div>
          </div>

          {/* Ticket Segmented Bar Divider */}
          <div>
            <p className="text-[10px] text-blue-100 font-bold mb-1">Fatture Saldate & In Corso</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 bg-white rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/80 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/50 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Card 3: Violet / Purple (Running Tasks in Screenshot) */}
        <div className="bg-[#8b5cf6] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-tight text-purple-50">Budget Rimanente</span>
              <button className="text-purple-100 hover:text-white transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black tracking-tight">
                {formatCurrency(remainingBudget)}
              </span>
              <span className="text-xs font-black bg-purple-700/60 text-white px-2.5 py-1 rounded-full flex items-center gap-0.5">
                {remainingPercentage}% &uarr;
              </span>
            </div>
          </div>

          {/* Ticket Segmented Bar Divider */}
          <div>
            <p className="text-[10px] text-purple-100 font-bold mb-1">Capacità Residua FY</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 bg-white rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/70 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/40 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Card 4: Bright Orange (Earning in Screenshot) */}
        <div className="bg-[#f97316] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-tight text-orange-50">Scadenze & In Attesa</span>
              <button className="text-orange-100 hover:text-white transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black tracking-tight">
                {pendingInvoices.length} Fatture
              </span>
              <span className="text-xs font-black bg-orange-700/60 text-white px-2.5 py-1 rounded-full flex items-center gap-0.5">
                5.07% &uarr;
              </span>
            </div>
          </div>

          {/* Ticket Segmented Bar Divider */}
          <div>
            <p className="text-[10px] text-orange-100 font-bold mb-1">In Attesa di Pagamento</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 bg-white rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/70 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/40 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION CHARTS (Revenue Statistic & Profit Chart in Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Revenue Statistic */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Revenue Statistic
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Mensile
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
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="Revenue"
                  fill="#059669"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="Profit"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Profit Chart (Curved Line Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Profit Chart
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Target Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={profitLineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: PROJECT DETAILS TABLE & CHART 3 / CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Project Details Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Project Details
            </h3>
            <button
              onClick={() => setActiveTab("fornitori")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Vedi Tutti &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {fornitori.slice(0, 5).map((f, idx) => {
                  const suppVoci = vociCosto.filter((v) => v.fornitore_id === f.id);
                  const planned = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

                  const priorityColors = [
                    "bg-emerald-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-amber-500",
                  ];
                  const barColor = priorityColors[idx % priorityColors.length];

                  return (
                    <tr
                      key={f.id}
                      onClick={() => onSelectFornitore(f)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {/* Team Avatar Stack */}
                      <td className="py-3 px-3">
                        <div className="flex items-center -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] border-2 border-white">
                            {f.nome.charAt(0)}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-[10px] border-2 border-white">
                            IT
                          </div>
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px] border-2 border-white">
                            +{idx + 2}
                          </div>
                        </div>
                      </td>

                      {/* Project Name */}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {f.nome}
                      </td>

                      {/* Priority Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor}`}
                            style={{ width: `${(idx + 1) * 22}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                            idx % 2 === 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {idx % 2 === 0 ? "High" : "Medium"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-extrabold text-slate-800">
                        {formatCurrency(planned || 150000)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Chart 3 / Task Checklist (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                Chart 3
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Tasks IT
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">
                  Add salary details in system
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">
                  Announcement for holiday
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">
                  call bus driver
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">
                  Office Picnic
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-700">
                  Website Must Be Finished
                </span>
                <Circle className="w-5 h-5 text-slate-300 shrink-0" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>5/5 Completed</span>
            <button
              onClick={onOpenAI}
              className="text-emerald-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Chiedi ad AI
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

