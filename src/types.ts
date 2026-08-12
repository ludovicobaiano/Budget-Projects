/**
 * Data Model Types for IT Budget Management (Gestione Budget IT)
 */

export type TipologiaFornitore = 'Asset' | 'Servizi' | 'Acquisto Terze Parti';
export type StatoFornitore = 'Attivo' | 'Inattivo';

export type TipoCosto = 'Ricorrente' | 'Una Tantum';
export type FrequenzaFatturazione = 'Mensile' | 'Trimestrale' | 'Semestrale' | 'Annuale';
export type StatoVoceCosto = 'Attiva' | 'Chiusa' | 'Sospesa';

export type StatoPagamento = 'Da Pagare' | 'Pagata' | 'In Ritardo';

export type UserRole = 'Admin' | 'Viewer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
}

export const PREDEFINED_USERS: AppUser[] = [
  {
    id: 'u-admin',
    name: 'Alessandro Conti',
    email: 'admin@company.it',
    role: 'Admin',
    department: 'Direzione IT (Amministratore)',
  },
  {
    id: 'u-viewer1',
    name: 'Mario Rossi',
    email: 'viewer1@company.it',
    role: 'Viewer',
    department: 'Controllo di Gestione (Visualizzatore 1)',
  },
  {
    id: 'u-viewer2',
    name: 'Giulia Bianchi',
    email: 'viewer2@company.it',
    role: 'Viewer',
    department: 'Audit & Compliance (Visualizzatore 2)',
  },
];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  fornitoreId?: string;
  fornitoreNome: string;
  fornitoreTipologia?: TipologiaFornitore;
  createdByName: string;
  readBy: string[]; // List of user emails who marked as read
}

export interface Fornitore {
  id: string;
  nome: string;
  tipologia: TipologiaFornitore;
  note?: string;
  link_contratto?: string;
  account_manager_nome?: string;
  account_manager_telefono?: string;
  stato: StatoFornitore;
  budget_allocato?: number; // Budget target allocato annuo
  data_creazione: string;
  data_ultima_modifica: string;
}

export interface VoceDiCosto {
  id: string;
  fornitore_id: string;
  descrizione: string;
  tipo_costo: TipoCosto;
  frequenza_fatturazione?: FrequenzaFatturazione;
  importo_previsto: number; // Preventivo
  importo_consuntivo?: number; // Consuntivo
  data_inizio: string;
  data_fine?: string;
  link_contratto?: string;
  note?: string;
  stato: StatoVoceCosto;
}

export interface Fattura {
  id: string;
  voce_costo_id: string;
  numero_fattura?: string;
  data_fattura: string; // YYYY-MM-DD
  anno_fiscale: string; // Auto-calcolato es. "FY2027"
  importo: number; // Importo effettivo (Consuntivo)
  importo_previsto?: number; // Preventive matched amount
  stato_pagamento: StatoPagamento;
  data_scadenza?: string;
  data_pagamento?: string;
  allegato?: string;
  note?: string;
}

// Joined interfaces for populated API views
export interface VoceDiCostoConFornitore extends VoceDiCosto {
  fornitore_nome: string;
  fornitore_tipologia: TipologiaFornitore;
}

export interface FatturaDettagliata extends Fattura {
  voce_costo_descrizione: string;
  voce_costo_tipo: TipoCosto;
  fornitore_id: string;
  fornitore_nome: string;
  fornitore_tipologia: TipologiaFornitore;
}

/**
 * Fiscal Year (Anno Fiscale) Helper Functions
 * Fiscal year runs Nov 1 to Oct 31.
 * e.g., 2026-11-01 -> FY2027, 2027-10-31 -> FY2027
 */
export function calculateFiscalYear(dateStr: string | Date): string {
  if (!dateStr) return getCurrentFiscalYear();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return getCurrentFiscalYear();
  
  const month = d.getMonth() + 1; // 1 to 12
  const year = d.getFullYear();
  
  // November (11) and December (12) belong to next year's FY
  if (month >= 11) {
    return `FY${year + 1}`;
  } else {
    return `FY${year}`;
  }
}

export function getCurrentFiscalYear(): string {
  const now = new Date();
  return calculateFiscalYear(now);
}

export function getFiscalYearYearNum(fyStr: string): number {
  const match = fyStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : new Date().getFullYear();
}

/**
 * Format currency in Italian format (1.234,56 €)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0,00 €';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date in Italian format (GG/MM/AAAA)
 */
export function formatDateIt(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculate annualized cost for a budget item in a Fiscal Year
 */
export function calculateAnnualizedPreventivo(voce: VoceDiCosto): number {
  if (voce.tipo_costo === 'Una Tantum') {
    return voce.importo_previsto || 0;
  }
  
  // Ricorrente
  switch (voce.frequenza_fatturazione) {
    case 'Mensile':
      return (voce.importo_previsto || 0) * 12;
    case 'Trimestrale':
      return (voce.importo_previsto || 0) * 4;
    case 'Semestrale':
      return (voce.importo_previsto || 0) * 2;
    case 'Annuale':
    default:
      return voce.importo_previsto || 0;
  }
}

export function calculateAnnualizedConsuntivo(voce: VoceDiCosto): number {
  const consuntivo = voce.importo_consuntivo !== undefined ? voce.importo_consuntivo : voce.importo_previsto;
  if (voce.tipo_costo === 'Una Tantum') {
    return consuntivo || 0;
  }
  
  switch (voce.frequenza_fatturazione) {
    case 'Mensile':
      return (consuntivo || 0) * 12;
    case 'Trimestrale':
      return (consuntivo || 0) * 4;
    case 'Semestrale':
      return (consuntivo || 0) * 2;
    case 'Annuale':
    default:
      return consuntivo || 0;
  }
}
