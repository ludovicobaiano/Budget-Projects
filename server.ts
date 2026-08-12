import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";
import {
  Fornitore,
  VoceDiCosto,
  Fattura,
  NotificationItem,
  calculateFiscalYear,
  getCurrentFiscalYear,
  calculateAnnualizedPreventivo,
  calculateAnnualizedConsuntivo,
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Persistent Storage File Path
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DataStore {
  fornitori: Fornitore[];
  vociCosto: VoceDiCosto[];
  fatture: Fattura[];
  notifications: NotificationItem[];
}

// Initial Seed Data
function getSeedData(): DataStore {
  const currentYear = new Date().getFullYear();
  const currentFY = getCurrentFiscalYear();

  const fornitori: Fornitore[] = [
    {
      id: "f-1",
      nome: "Microsoft Italia S.r.l.",
      tipologia: "Asset",
      note: "Accordo Quadro Enterprise Agreement M365 ed Azure.",
      link_contratto: "https://drive.google.com/file/d/sample-msft-contract",
      account_manager_nome: "Marco Rossi",
      account_manager_telefono: "+39 348 1234567",
      stato: "Attivo",
      budget_allocato: 65000,
      data_creazione: "2025-01-10",
      data_ultima_modifica: "2026-02-01",
    },
    {
      id: "f-2",
      nome: "AWS Cloud Services (Amazon)",
      tipologia: "Asset",
      note: "Infrastruttura Cloud EC2, RDS, S3 per ambiente di Produzione.",
      link_contratto: "https://aws.amazon.com/agreements",
      account_manager_nome: "Elena Bianchi",
      account_manager_telefono: "+39 335 9876543",
      stato: "Attivo",
      budget_allocato: 38000,
      data_creazione: "2025-01-15",
      data_ultima_modifica: "2026-01-20",
    },
    {
      id: "f-3",
      nome: "Reply S.p.A. Consulenza",
      tipologia: "Servizi",
      note: "Consulenza specialistica DevOps e Cyber Security.",
      link_contratto: "https://sharepoint.company.it/docs/reply-2026.pdf",
      account_manager_nome: "Luca Ferrari",
      account_manager_telefono: "+39 340 5551234",
      stato: "Attivo",
      budget_allocato: 45000,
      data_creazione: "2025-02-01",
      data_ultima_modifica: "2026-02-10",
    },
    {
      id: "f-4",
      nome: "Fastweb S.p.A.",
      tipologia: "Servizi",
      note: "Connettività fibra primaria 10Gbps e backup SD-WAN.",
      link_contratto: "https://fastweb.it/contratti/10049281",
      account_manager_nome: "Giuseppe Moretti",
      account_manager_telefono: "+39 339 8877665",
      stato: "Attivo",
      budget_allocato: 22000,
      data_creazione: "2025-03-01",
      data_ultima_modifica: "2026-01-11",
    },
    {
      id: "f-5",
      nome: "Cisco Systems Italia",
      tipologia: "Asset",
      note: "Fornitura switch di rete Core, firewall ASA e access point.",
      link_contratto: "",
      account_manager_nome: "Alessandro Conti",
      account_manager_telefono: "+39 347 1122334",
      stato: "Attivo",
      budget_allocato: 28000,
      data_creazione: "2025-04-10",
      data_ultima_modifica: "2026-02-05",
    },
    {
      id: "f-6",
      nome: "Zucchetti S.p.A.",
      tipologia: "Asset",
      note: "Licenze e manutenzione Software ERP Presenze & Paghe.",
      link_contratto: "https://zucchetti.it/portal/agreements",
      account_manager_nome: "Chiara Esposito",
      account_manager_telefono: "+39 331 4455667",
      stato: "Attivo",
      budget_allocato: 18000,
      data_creazione: "2025-05-12",
      data_ultima_modifica: "2026-01-18",
    },
    {
      id: "f-7",
      nome: "Amazon Business IT Store",
      tipologia: "Acquisto Terze Parti",
      note: "Acquisti spot di periferiche, monitor, cavetteria e accessori IT.",
      link_contratto: "",
      account_manager_nome: "Supporto Key Account",
      account_manager_telefono: "+39 02 8009988",
      stato: "Attivo",
      budget_allocato: 12000,
      data_creazione: "2025-06-01",
      data_ultima_modifica: "2026-02-01",
    },
    {
      id: "f-8",
      nome: "Aruba Datacenter",
      tipologia: "Servizi",
      note: "Housing server fisici e Disaster Recovery presso Datacenter Bergamo.",
      link_contratto: "https://aruba.it/datacenter-contract.pdf",
      account_manager_nome: "Matteo Romano",
      account_manager_telefono: "+39 320 9988776",
      stato: "Attivo",
      budget_allocato: 15000,
      data_creazione: "2025-06-15",
      data_ultima_modifica: "2026-01-05",
    },
  ];

  const vociCosto: VoceDiCosto[] = [
    // Microsoft
    {
      id: "v-1",
      fornitore_id: "f-1",
      descrizione: "Licenze Microsoft 365 E5 & Azure Tenant Base",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Mensile",
      importo_previsto: 4500, // 4500 * 12 = 54.000 €/anno
      importo_consuntivo: 4650,
      data_inizio: "2025-11-01",
      data_fine: "2028-10-31",
      link_contratto: "",
      note: "Licenze per 250 utenti con pacchetto E5 inclusa telefonia Teams.",
      stato: "Attiva",
    },
    {
      id: "v-2",
      fornitore_id: "f-1",
      descrizione: "Add-on Copilot & Microsoft Defender Suite",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Annuale",
      importo_previsto: 9500,
      importo_consuntivo: 9500,
      data_inizio: "2026-11-01",
      data_fine: "2027-10-31",
      note: "Integrazione AI Copilot per 30 utenti chiave IT e Direzione.",
      stato: "Attiva",
    },
    // AWS
    {
      id: "v-3",
      fornitore_id: "f-2",
      descrizione: "Hosting Infrastruttura Cloud EC2, RDS, S3",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Mensile",
      importo_previsto: 2800, // 2800 * 12 = 33.600 €
      importo_consuntivo: 2950,
      data_inizio: "2025-11-01",
      data_fine: "2027-10-31",
      note: "Servizi cloud su regione eu-south-1 (Milano).",
      stato: "Attiva",
    },
    {
      id: "v-4",
      fornitore_id: "f-2",
      descrizione: "Migrazione Data Lake & Backup S3 Glacier",
      tipo_costo: "Una Tantum",
      importo_previsto: 4000,
      importo_consuntivo: 4200,
      data_inizio: "2026-12-01",
      note: "Progetto speciale di archiviazione storica log e backup.",
      stato: "Attiva",
    },
    // Reply
    {
      id: "v-5",
      fornitore_id: "f-3",
      descrizione: "Assistenza Specialistica IT & DevOps Support",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Trimestrale",
      importo_previsto: 8500, // 8500 * 4 = 34.000 €
      importo_consuntivo: 8500,
      data_inizio: "2025-11-01",
      data_fine: "2027-10-31",
      note: "Pacchetto 300 ore/anno di consulenza senior.",
      stato: "Attiva",
    },
    {
      id: "v-6",
      fornitore_id: "f-3",
      descrizione: "Penetration Testing & Assessment ISO 27001",
      tipo_costo: "Una Tantum",
      importo_previsto: 11000,
      importo_consuntivo: 11000,
      data_inizio: "2027-02-01",
      note: "Audit annuale di sicurezza informatica.",
      stato: "Attiva",
    },
    // Fastweb
    {
      id: "v-7",
      fornitore_id: "f-4",
      descrizione: "Connettività Fibra Dedicata 10Gbps + SD-WAN",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Mensile",
      importo_previsto: 1600, // 1600 * 12 = 19.200 €
      importo_consuntivo: 1600,
      data_inizio: "2025-11-01",
      data_fine: "2028-10-31",
      note: "Canone mensile con SLA 99.99%.",
      stato: "Attiva",
    },
    // Cisco
    {
      id: "v-8",
      fornitore_id: "f-5",
      descrizione: "Upgrade Switch Core & Access Point Wi-Fi 6E",
      tipo_costo: "Una Tantum",
      importo_previsto: 28000,
      importo_consuntivo: 27500,
      data_inizio: "2026-11-15",
      note: "Hardware di rete per il nuovo padiglione uffici.",
      stato: "Attiva",
    },
    // Zucchetti
    {
      id: "v-9",
      fornitore_id: "f-6",
      descrizione: "Canone Manutenzione ERP Paghe & Presenze",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Semestrale",
      importo_previsto: 8500, // 8500 * 2 = 17.000 €
      importo_consuntivo: 8500,
      data_inizio: "2025-11-01",
      data_fine: "2027-10-31",
      note: "Aggiornamenti normativi e assistenza software.",
      stato: "Attiva",
    },
    // Amazon Business
    {
      id: "v-10",
      fornitore_id: "f-7",
      descrizione: "Acquisto Monitor 27'' USB-C & Docking Station",
      tipo_costo: "Una Tantum",
      importo_previsto: 6500,
      importo_consuntivo: 6800,
      data_inizio: "2026-11-10",
      note: "Dotazione postazioni lavoro personale neo-assunto.",
      stato: "Attiva",
    },
    {
      id: "v-11",
      fornitore_id: "f-7",
      descrizione: "Cavi di Rete, Adattatori & Tastiere Ergonomiche",
      tipo_costo: "Una Tantum",
      importo_previsto: 3200,
      importo_consuntivo: 2900,
      data_inizio: "2027-01-15",
      note: "Materiale informatico di consumo.",
      stato: "Attiva",
    },
    // Aruba
    {
      id: "v-12",
      fornitore_id: "f-8",
      descrizione: "Housing Rack 42U Datacenter Bergamo",
      tipo_costo: "Ricorrente",
      frequenza_fatturazione: "Mensile",
      importo_previsto: 1100, // 1100 * 12 = 13.200 €
      importo_consuntivo: 1100,
      data_inizio: "2025-11-01",
      data_fine: "2027-10-31",
      note: "Canone mensile inclusa alimentazione ridondata e banda.",
      stato: "Attiva",
    },
  ];

  // Generiamo fatture per FY2026 e FY2027
  const fatture: Fattura[] = [
    // --- FY2026 (01/11/2025 - 31/10/2026) ---
    {
      id: "ft-101",
      voce_costo_id: "v-1",
      numero_fattura: "FT-2025-1102",
      data_fattura: "2025-11-05",
      anno_fiscale: "FY2026",
      importo: 4500,
      importo_previsto: 4500,
      stato_pagamento: "Pagata",
      data_scadenza: "2025-12-05",
      data_pagamento: "2025-12-01",
      note: "Fattura Microsoft M365 Novembre 2025",
    },
    {
      id: "ft-102",
      voce_costo_id: "v-1",
      numero_fattura: "FT-2025-1210",
      data_fattura: "2025-12-05",
      anno_fiscale: "FY2026",
      importo: 4500,
      importo_previsto: 4500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-01-05",
      data_pagamento: "2026-01-02",
      note: "Fattura Microsoft M365 Dicembre 2025",
    },
    {
      id: "ft-103",
      voce_costo_id: "v-3",
      numero_fattura: "AWS-993810",
      data_fattura: "2025-11-12",
      anno_fiscale: "FY2026",
      importo: 2850,
      importo_previsto: 2800,
      stato_pagamento: "Pagata",
      data_scadenza: "2025-12-12",
      data_pagamento: "2025-12-10",
      note: "Consumi Cloud AWS Novembre 2025",
    },
    {
      id: "ft-104",
      voce_costo_id: "v-5",
      numero_fattura: "REP-2025-Q1",
      data_fattura: "2025-11-20",
      anno_fiscale: "FY2026",
      importo: 8500,
      importo_previsto: 8500,
      stato_pagamento: "Pagata",
      data_scadenza: "2025-12-20",
      data_pagamento: "2025-12-18",
      note: "Consulenza Q1 Reply",
    },
    {
      id: "ft-105",
      voce_costo_id: "v-7",
      numero_fattura: "FW-88491",
      data_fattura: "2025-11-15",
      anno_fiscale: "FY2026",
      importo: 1600,
      importo_previsto: 1600,
      stato_pagamento: "Pagata",
      data_scadenza: "2025-12-15",
      data_pagamento: "2025-12-14",
      note: "Canone Fastweb Nov 2025",
    },

    // --- FY2027 (01/11/2026 - 31/10/2027) ---
    // Microsoft M365 Nov 2026
    {
      id: "ft-201",
      voce_costo_id: "v-1",
      numero_fattura: "FT-2026-1104",
      data_fattura: "2026-11-04",
      anno_fiscale: "FY2027",
      importo: 4650,
      importo_previsto: 4500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-04",
      data_pagamento: "2026-12-01",
      note: "Fattura Microsoft M365 Novembre 2026 (Adeguamento licenze)",
    },
    // Microsoft M365 Dic 2026
    {
      id: "ft-202",
      voce_costo_id: "v-1",
      numero_fattura: "FT-2026-1208",
      data_fattura: "2026-12-06",
      anno_fiscale: "FY2027",
      importo: 4650,
      importo_previsto: 4500,
      stato_pagamento: "Pagata",
      data_scadenza: "2027-01-06",
      data_pagamento: "2027-01-04",
      note: "Fattura Microsoft M365 Dicembre 2026",
    },
    // Microsoft Copilot Addon
    {
      id: "ft-203",
      voce_costo_id: "v-2",
      numero_fattura: "FT-2026-COP1",
      data_fattura: "2026-11-12",
      anno_fiscale: "FY2027",
      importo: 9500,
      importo_previsto: 9500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-12",
      data_pagamento: "2026-12-10",
      note: "Canone Annuale Copilot AI Security Suite",
    },
    // AWS Cloud Nov 2026
    {
      id: "ft-204",
      voce_costo_id: "v-3",
      numero_fattura: "AWS-102941",
      data_fattura: "2026-11-10",
      anno_fiscale: "FY2027",
      importo: 2950,
      importo_previsto: 2800,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-10",
      data_pagamento: "2026-12-08",
      note: "Consumi Cloud AWS Novembre 2026",
    },
    // AWS Cloud Dic 2026
    {
      id: "ft-205",
      voce_costo_id: "v-3",
      numero_fattura: "AWS-104822",
      data_fattura: "2026-12-11",
      anno_fiscale: "FY2027",
      importo: 2910,
      importo_previsto: 2800,
      stato_pagamento: "Pagata",
      data_scadenza: "2027-01-11",
      data_pagamento: "2027-01-10",
      note: "Consumi Cloud AWS Dicembre 2026",
    },
    // AWS Data Lake (Una Tantum)
    {
      id: "ft-206",
      voce_costo_id: "v-4",
      numero_fattura: "AWS-DL-2026",
      data_fattura: "2026-12-20",
      anno_fiscale: "FY2027",
      importo: 4200,
      importo_previsto: 4000,
      stato_pagamento: "Pagata",
      data_scadenza: "2027-01-20",
      data_pagamento: "2027-01-18",
      note: "Progetto Migrazione Data Lake S3",
    },
    // Cisco Hardware
    {
      id: "ft-207",
      voce_costo_id: "v-8",
      numero_fattura: "CSC-2026-8819",
      data_fattura: "2026-11-25",
      anno_fiscale: "FY2027",
      importo: 27500,
      importo_previsto: 28000,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-25",
      data_pagamento: "2026-12-20",
      note: "Fornitura hardware switch core e access point Wi-Fi 6E",
    },
    // Reply Q1 FY2027
    {
      id: "ft-208",
      voce_costo_id: "v-5",
      numero_fattura: "REP-2026-Q1",
      data_fattura: "2026-11-15",
      anno_fiscale: "FY2027",
      importo: 8500,
      importo_previsto: 8500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-15",
      data_pagamento: "2026-12-12",
      note: "Consulenza Q1 DevOps & IT Support",
    },
    // Fastweb Nov & Dic
    {
      id: "ft-209",
      voce_costo_id: "v-7",
      numero_fattura: "FW-94021",
      data_fattura: "2026-11-10",
      anno_fiscale: "FY2027",
      importo: 1600,
      importo_previsto: 1600,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-10",
      data_pagamento: "2026-12-08",
      note: "Canone Connettività 10Gbps Nov 2026",
    },
    {
      id: "ft-210",
      voce_costo_id: "v-7",
      numero_fattura: "FW-95112",
      data_fattura: "2026-12-10",
      anno_fiscale: "FY2027",
      importo: 1600,
      importo_previsto: 1600,
      stato_pagamento: "Pagata",
      data_scadenza: "2027-01-10",
      data_pagamento: "2027-01-08",
      note: "Canone Connettività 10Gbps Dic 2026",
    },
    // Zucchetti Semestrale 1
    {
      id: "ft-211",
      voce_costo_id: "v-9",
      numero_fattura: "ZUC-2026-SEM1",
      data_fattura: "2026-11-05",
      anno_fiscale: "FY2027",
      importo: 8500,
      importo_previsto: 8500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-05",
      data_pagamento: "2026-12-02",
      note: "Manutenzione ERP Paghe 1° Semestre FY2027",
    },
    // Amazon Monitor
    {
      id: "ft-212",
      voce_costo_id: "v-10",
      numero_fattura: "AMZ-2026-9921",
      data_fattura: "2026-11-18",
      anno_fiscale: "FY2027",
      importo: 6800,
      importo_previsto: 6500,
      stato_pagamento: "Pagata",
      data_scadenza: "2026-12-18",
      data_pagamento: "2026-12-15",
      note: "Docking station e monitor 27 pollici",
    },

    // --- FATTURE IN SCADENZA / DA PAGARE / IN RITARDO (Gen/Feb 2027 per vista alert) ---
    {
      id: "ft-213",
      voce_costo_id: "v-1",
      numero_fattura: "FT-2027-0105",
      data_fattura: "2027-01-05",
      anno_fiscale: "FY2027",
      importo: 4650,
      importo_previsto: 4500,
      stato_pagamento: "Da Pagare",
      data_scadenza: "2027-02-25",
      note: "Fattura Microsoft M365 Gennaio 2027",
    },
    {
      id: "ft-214",
      voce_costo_id: "v-3",
      numero_fattura: "AWS-108920",
      data_fattura: "2027-01-10",
      anno_fiscale: "FY2027",
      importo: 2980,
      importo_previsto: 2800,
      stato_pagamento: "Da Pagare",
      data_scadenza: "2027-02-28",
      note: "Consumi Cloud AWS Gennaio 2027",
    },
    {
      id: "ft-215",
      voce_costo_id: "v-5",
      numero_fattura: "REP-2027-Q2",
      data_fattura: "2027-01-15",
      anno_fiscale: "FY2027",
      importo: 8500,
      importo_previsto: 8500,
      stato_pagamento: "In Ritardo",
      data_scadenza: "2027-02-01",
      note: "Consulenza Q2 DevOps Reply (scaduta il 01/02)",
    },
    {
      id: "ft-216",
      voce_costo_id: "v-11",
      numero_fattura: "AMZ-2027-0012",
      data_fattura: "2027-01-20",
      anno_fiscale: "FY2027",
      importo: 2900,
      importo_previsto: 3200,
      stato_pagamento: "Da Pagare",
      data_scadenza: "2027-02-20",
      note: "Tastiere, cavi e adattatori USB-C",
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: "notif-seed-1",
      title: "Nuovo Fornitore Inserito",
      message: "L'Amministratore Alessandro Conti ha aggiunto il fornitore 'Aruba Datacenter' (Servizi).",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
      fornitoreId: "f-8",
      fornitoreNome: "Aruba Datacenter",
      fornitoreTipologia: "Servizi",
      createdByName: "Alessandro Conti (Amministratore IT)",
      readBy: [],
    },
    {
      id: "notif-seed-2",
      title: "Nuovo Fornitore Inserito",
      message: "L'Amministratore Alessandro Conti ha aggiunto il fornitore 'Amazon Business IT Store' (Acquisto Terze Parti).",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      fornitoreId: "f-7",
      fornitoreNome: "Amazon Business IT Store",
      fornitoreTipologia: "Acquisto Terze Parti",
      createdByName: "Alessandro Conti (Amministratore IT)",
      readBy: [],
    },
  ];

  return { fornitori, vociCosto, fatture, notifications };
}

// Data Store Helpers
function loadData(): DataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (!parsed.notifications) {
        parsed.notifications = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading db.json, using seed data:", err);
  }
  const seed = getSeedData();
  saveData(seed);
  return seed;
}

function saveData(data: DataStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving db.json:", err);
  }
}

// Global state in memory synced with db.json
let store: DataStore = loadData();

async function startServer() {
  // --- API ROUTES ---

  // 1. FORNITORI CRUD
  app.get("/api/fornitori", (req, res) => {
    res.json(store.fornitori);
  });

  app.post("/api/fornitori", (req, res) => {
    const { nome, tipologia, note, link_contratto, stato, budget_allocato, account_manager_nome, account_manager_telefono } = req.body;
    if (!nome || !tipologia) {
      return res.status(400).json({ error: "Nome e Tipologia sono obbligatori." });
    }
    const today = new Date().toISOString().split("T")[0];
    const newFornitore: Fornitore = {
      id: `f-${Date.now()}`,
      nome,
      tipologia,
      note: note || "",
      link_contratto: link_contratto || "",
      account_manager_nome: account_manager_nome || "",
      account_manager_telefono: account_manager_telefono || "",
      stato: stato || "Attivo",
      budget_allocato: Number(budget_allocato) || 0,
      data_creazione: today,
      data_ultima_modifica: today,
    };
    store.fornitori.push(newFornitore);

    // Create Notification for Viewers
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Nuovo Fornitore Inserito",
      message: `L'Amministratore ha aggiunto il nuovo fornitore "${nome}" (${tipologia}).`,
      timestamp: new Date().toISOString(),
      fornitoreId: newFornitore.id,
      fornitoreNome: newFornitore.nome,
      fornitoreTipologia: newFornitore.tipologia,
      createdByName: req.body.creator_name || "Alessandro Conti (Amministratore IT)",
      readBy: [],
    };
    if (!store.notifications) store.notifications = [];
    store.notifications.unshift(newNotif);

    saveData(store);
    res.status(201).json(newFornitore);
  });

  // NOTIFICATIONS ENDPOINTS
  app.get("/api/notifications", (req, res) => {
    res.json(store.notifications || []);
  });

  app.post("/api/notifications/mark-read", (req, res) => {
    const { userEmail, notifId } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail è obbligatorio." });
    }

    if (!store.notifications) store.notifications = [];

    if (notifId) {
      const target = store.notifications.find((n) => n.id === notifId);
      if (target && !target.readBy.includes(userEmail)) {
        target.readBy.push(userEmail);
      }
    } else {
      // Mark all as read for user
      store.notifications.forEach((n) => {
        if (!n.readBy.includes(userEmail)) {
          n.readBy.push(userEmail);
        }
      });
    }

    saveData(store);
    res.json({ success: true, notifications: store.notifications });
  });

  app.put("/api/fornitori/:id", (req, res) => {
    const { id } = req.params;
    const index = store.fornitori.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Fornitore non trovato." });
    }
    const { nome, tipologia, note, link_contratto, stato, budget_allocato, account_manager_nome, account_manager_telefono } = req.body;
    const today = new Date().toISOString().split("T")[0];
    
    store.fornitori[index] = {
      ...store.fornitori[index],
      nome: nome ?? store.fornitori[index].nome,
      tipologia: tipologia ?? store.fornitori[index].tipologia,
      note: note ?? store.fornitori[index].note,
      link_contratto: link_contratto ?? store.fornitori[index].link_contratto,
      account_manager_nome: account_manager_nome !== undefined ? account_manager_nome : store.fornitori[index].account_manager_nome,
      account_manager_telefono: account_manager_telefono !== undefined ? account_manager_telefono : store.fornitori[index].account_manager_telefono,
      stato: stato ?? store.fornitori[index].stato,
      budget_allocato: budget_allocato !== undefined ? Number(budget_allocato) : store.fornitori[index].budget_allocato,
      data_ultima_modifica: today,
    };

    saveData(store);
    res.json(store.fornitori[index]);
  });

  app.delete("/api/fornitori/:id", (req, res) => {
    const { id } = req.params;
    // Check if supplier has active cost items
    const hasVoci = store.vociCosto.some((v) => v.fornitore_id === id);
    if (hasVoci) {
      return res.status(400).json({
        error: "Impossibile eliminare: il fornitore ha voci di costo collegate. Elimina prima le voci di costo o disattiva il fornitore.",
      });
    }
    store.fornitori = store.fornitori.filter((f) => f.id !== id);
    saveData(store);
    res.json({ success: true, message: "Fornitore eliminato con successo." });
  });

  // 2. VOCI DI COSTO CRUD
  app.get("/api/voci-costo", (req, res) => {
    // Return populated with supplier details
    const populated = store.vociCosto.map((v) => {
      const forn = store.fornitori.find((f) => f.id === v.fornitore_id);
      return {
        ...v,
        fornitore_nome: forn ? forn.nome : "Sconosciuto",
        fornitore_tipologia: forn ? forn.tipologia : "Asset",
      };
    });
    res.json(populated);
  });

  app.post("/api/voci-costo", (req, res) => {
    const {
      fornitore_id,
      descrizione,
      tipo_costo,
      frequenza_fatturazione,
      importo_previsto,
      importo_consuntivo,
      data_inizio,
      data_fine,
      link_contratto,
      note,
      stato,
    } = req.body;

    if (!fornitore_id || !descrizione || !tipo_costo || importo_previsto === undefined || !data_inizio) {
      return res.status(400).json({ error: "Compilare tutti i campi obbligatori." });
    }

    if (tipo_costo === "Ricorrente" && !frequenza_fatturazione) {
      return res.status(400).json({
        error: "La frequenza di fatturazione è obbligatoria per costi ricorrenti.",
      });
    }

    const newVoce: VoceDiCosto = {
      id: `v-${Date.now()}`,
      fornitore_id,
      descrizione,
      tipo_costo,
      frequenza_fatturazione: tipo_costo === "Ricorrente" ? frequenza_fatturazione : undefined,
      importo_previsto: Number(importo_previsto),
      importo_consuntivo: importo_consuntivo !== undefined ? Number(importo_consuntivo) : Number(importo_previsto),
      data_inizio,
      data_fine: data_fine || undefined,
      link_contratto: link_contratto || "",
      note: note || "",
      stato: stato || "Attiva",
    };

    store.vociCosto.push(newVoce);
    saveData(store);

    const forn = store.fornitori.find((f) => f.id === fornitore_id);
    res.status(201).json({
      ...newVoce,
      fornitore_nome: forn ? forn.nome : "Sconosciuto",
      fornitore_tipologia: forn ? forn.tipologia : "Asset",
    });
  });

  app.put("/api/voci-costo/:id", (req, res) => {
    const { id } = req.params;
    const index = store.vociCosto.findIndex((v) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Voce di costo non trovata." });
    }

    const {
      fornitore_id,
      descrizione,
      tipo_costo,
      frequenza_fatturazione,
      importo_previsto,
      importo_consuntivo,
      data_inizio,
      data_fine,
      link_contratto,
      note,
      stato,
    } = req.body;

    store.vociCosto[index] = {
      ...store.vociCosto[index],
      fornitore_id: fornitore_id ?? store.vociCosto[index].fornitore_id,
      descrizione: descrizione ?? store.vociCosto[index].descrizione,
      tipo_costo: tipo_costo ?? store.vociCosto[index].tipo_costo,
      frequenza_fatturazione:
        tipo_costo === "Ricorrente"
          ? frequenza_fatturazione ?? store.vociCosto[index].frequenza_fatturazione
          : undefined,
      importo_previsto: importo_previsto !== undefined ? Number(importo_previsto) : store.vociCosto[index].importo_previsto,
      importo_consuntivo: importo_consuntivo !== undefined ? Number(importo_consuntivo) : store.vociCosto[index].importo_consuntivo,
      data_inizio: data_inizio ?? store.vociCosto[index].data_inizio,
      data_fine: data_fine !== undefined ? data_fine : store.vociCosto[index].data_fine,
      link_contratto: link_contratto ?? store.vociCosto[index].link_contratto,
      note: note ?? store.vociCosto[index].note,
      stato: stato ?? store.vociCosto[index].stato,
    };

    saveData(store);

    const forn = store.fornitori.find((f) => f.id === store.vociCosto[index].fornitore_id);
    res.json({
      ...store.vociCosto[index],
      fornitore_nome: forn ? forn.nome : "Sconosciuto",
      fornitore_tipologia: forn ? forn.tipologia : "Asset",
    });
  });

  app.delete("/api/voci-costo/:id", (req, res) => {
    const { id } = req.params;
    const hasFatture = store.fatture.some((f) => f.voce_costo_id === id);
    if (hasFatture) {
      return res.status(400).json({
        error: "Impossibile eliminare: la voce di costo ha fatture collegate. Elimina prima le fatture collegate o imposta lo stato su Chiusa.",
      });
    }
    store.vociCosto = store.vociCosto.filter((v) => v.id !== id);
    saveData(store);
    res.json({ success: true, message: "Voce di costo eliminata con successo." });
  });

  // 3. FATTURE CRUD
  app.get("/api/fatture", (req, res) => {
    const { fy, fornitore_id, stato_pagamento } = req.query;

    let filtered = store.fatture;

    if (fy) {
      filtered = filtered.filter((f) => f.anno_fiscale === fy);
    }
    if (stato_pagamento) {
      filtered = filtered.filter((f) => f.stato_pagamento === stato_pagamento);
    }

    const detailed = filtered.map((f) => {
      const voce = store.vociCosto.find((v) => v.id === f.voce_costo_id);
      const forn = voce ? store.fornitori.find((supp) => supp.id === voce.fornitore_id) : undefined;

      return {
        ...f,
        voce_costo_descrizione: voce ? voce.descrizione : "Sconosciuta",
        voce_costo_tipo: voce ? voce.tipo_costo : "Una Tantum",
        fornitore_id: forn ? forn.id : "",
        fornitore_nome: forn ? forn.nome : "Sconosciuto",
        fornitore_tipologia: forn ? forn.tipologia : "Asset",
      };
    });

    if (fornitore_id) {
      res.json(detailed.filter((item) => item.fornitore_id === fornitore_id));
    } else {
      res.json(detailed);
    }
  });

  app.post("/api/fatture", (req, res) => {
    const {
      voce_costo_id,
      numero_fattura,
      data_fattura,
      importo,
      importo_previsto,
      stato_pagamento,
      data_scadenza,
      data_pagamento,
      allegato,
      note,
    } = req.body;

    if (!voce_costo_id || !data_fattura || importo === undefined) {
      return res.status(400).json({ error: "Voce di costo, Data fattura e Importo sono obbligatori." });
    }

    // Auto calculate anno_fiscale from data_fattura according to PRD!
    const anno_fiscale = calculateFiscalYear(data_fattura);

    const newFattura: Fattura = {
      id: `ft-${Date.now()}`,
      voce_costo_id,
      numero_fattura: numero_fattura || "",
      data_fattura,
      anno_fiscale,
      importo: Number(importo),
      importo_previsto: importo_previsto !== undefined ? Number(importo_previsto) : Number(importo),
      stato_pagamento: stato_pagamento || "Da Pagare",
      data_scadenza: data_scadenza || undefined,
      data_pagamento: data_pagamento || undefined,
      allegato: allegato || "",
      note: note || "",
    };

    store.fatture.push(newFattura);
    saveData(store);

    const voce = store.vociCosto.find((v) => v.id === voce_costo_id);
    const forn = voce ? store.fornitori.find((s) => s.id === voce.fornitore_id) : undefined;

    res.status(201).json({
      ...newFattura,
      voce_costo_descrizione: voce ? voce.descrizione : "Sconosciuta",
      voce_costo_tipo: voce ? voce.tipo_costo : "Una Tantum",
      fornitore_id: forn ? forn.id : "",
      fornitore_nome: forn ? forn.nome : "Sconosciuto",
      fornitore_tipologia: forn ? forn.tipologia : "Asset",
    });
  });

  app.put("/api/fatture/:id", (req, res) => {
    const { id } = req.params;
    const index = store.fatture.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Fattura non trovata." });
    }

    const {
      voce_costo_id,
      numero_fattura,
      data_fattura,
      importo,
      importo_previsto,
      stato_pagamento,
      data_scadenza,
      data_pagamento,
      allegato,
      note,
    } = req.body;

    const updatedDataFattura = data_fattura ?? store.fatture[index].data_fattura;
    const anno_fiscale = calculateFiscalYear(updatedDataFattura);

    store.fatture[index] = {
      ...store.fatture[index],
      voce_costo_id: voce_costo_id ?? store.fatture[index].voce_costo_id,
      numero_fattura: numero_fattura ?? store.fatture[index].numero_fattura,
      data_fattura: updatedDataFattura,
      anno_fiscale,
      importo: importo !== undefined ? Number(importo) : store.fatture[index].importo,
      importo_previsto: importo_previsto !== undefined ? Number(importo_previsto) : store.fatture[index].importo_previsto,
      stato_pagamento: stato_pagamento ?? store.fatture[index].stato_pagamento,
      data_scadenza: data_scadenza !== undefined ? data_scadenza : store.fatture[index].data_scadenza,
      data_pagamento: data_pagamento !== undefined ? data_pagamento : store.fatture[index].data_pagamento,
      allegato: allegato ?? store.fatture[index].allegato,
      note: note ?? store.fatture[index].note,
    };

    saveData(store);

    const voce = store.vociCosto.find((v) => v.id === store.fatture[index].voce_costo_id);
    const forn = voce ? store.fornitori.find((s) => s.id === voce.fornitore_id) : undefined;

    res.json({
      ...store.fatture[index],
      voce_costo_descrizione: voce ? voce.descrizione : "Sconosciuta",
      voce_costo_tipo: voce ? voce.tipo_costo : "Una Tantum",
      fornitore_id: forn ? forn.id : "",
      fornitore_nome: forn ? forn.nome : "Sconosciuto",
      fornitore_tipologia: forn ? forn.tipologia : "Asset",
    });
  });

  app.delete("/api/fatture/:id", (req, res) => {
    const { id } = req.params;
    store.fatture = store.fatture.filter((f) => f.id !== id);
    saveData(store);
    res.json({ success: true, message: "Fattura eliminata." });
  });

  // 4. RESET TO SEED DATA (Utility for user testing)
  app.post("/api/reset-data", (req, res) => {
    store = getSeedData();
    saveData(store);
    res.json({ success: true, message: "Dati ripristinati con successo al dataset iniziale." });
  });

  // 5. EXPORT TO EXCEL (.xlsx)
  app.get("/api/export-excel", (req, res) => {
    const fy = (req.query.fy as string) || getCurrentFiscalYear();

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary KPI
    const totalAllocated = store.fornitori.reduce((acc, f) => acc + (f.budget_allocato || 0), 0);
    
    // Filtered invoices for selected FY
    const fyInvoices = store.fatture.filter((f) => f.anno_fiscale === fy);
    const totalInvoiced = fyInvoices.reduce((acc, f) => acc + f.importo, 0);

    // Calculate total planned (annualized) for active cost items
    const totalPlanned = store.vociCosto.reduce((acc, v) => acc + calculateAnnualizedPreventivo(v), 0);

    const kpiData = [
      ["Report Budget IT - Anno Fiscale", fy],
      ["Data Generazione Report", new Date().toLocaleString("it-IT")],
      [""],
      ["Indicatore KPI", "Valore (€)"],
      ["Budget Totale Allocato (Target Fornitori)", totalAllocated],
      ["Budget Annualizzato Previsto (Voci di Costo)", totalPlanned],
      ["Totale Fatturato / Speso Effettivo", totalInvoiced],
      ["Delta (Previsto vs Fatturato)", totalPlanned - totalInvoiced],
      ["Percentuale Utilizzo Budget", totalPlanned > 0 ? `${((totalInvoiced / totalPlanned) * 100).toFixed(1)}%` : "0%"],
      ["Fornitori Attivi", store.fornitori.filter((f) => f.stato === "Attivo").length],
    ];

    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, "Sintesi Budget");

    // Sheet 2: Fornitori
    const fornitoriData = store.fornitori.map((f) => {
      // Find invoices for this supplier in FY
      const suppVociIds = store.vociCosto.filter((v) => v.fornitore_id === f.id).map((v) => v.id);
      const suppInvoices = store.fatture.filter((ft) => ft.anno_fiscale === fy && suppVociIds.includes(ft.voce_costo_id));
      const spentFY = suppInvoices.reduce((sum, ft) => sum + ft.importo, 0);

      const suppVoci = store.vociCosto.filter((v) => v.fornitore_id === f.id);
      const plannedFY = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

      return {
        "ID Fornitore": f.id,
        "Nome Fornitore": f.nome,
        "Tipologia": f.tipologia,
        "Account Manager": f.account_manager_nome || "",
        "Cellulare Account Manager": f.account_manager_telefono || "",
        "Stato": f.stato,
        "Budget Allocato Target (€)": f.budget_allocato || 0,
        "Preventivo Annualizzato FY (€)": plannedFY,
        "Fatturato Effettivo FY (€)": spentFY,
        "Delta (€)": plannedFY - spentFY,
        "Note": f.note || "",
        "Link Contratto": f.link_contratto || "",
      };
    });

    const fornSheet = XLSX.utils.json_to_sheet(fornitoriData);
    XLSX.utils.book_append_sheet(workbook, fornSheet, "Fornitori");

    // Sheet 3: Voci di Costo
    const vociData = store.vociCosto.map((v) => {
      const forn = store.fornitori.find((f) => f.id === v.fornitore_id);
      return {
        "ID Voce": v.id,
        "Fornitore": forn ? forn.nome : "",
        "Descrizione": v.descrizione,
        "Tipo Costo": v.tipo_costo,
        "Frequenza Fatturazione": v.frequenza_fatturazione || "-",
        "Importo Previsto (€)": v.importo_previsto,
        "Cost Annualizzato Previsto (€)": calculateAnnualizedPreventivo(v),
        "Importo Consuntivo (€)": v.importo_consuntivo || v.importo_previsto,
        "Data Inizio": v.data_inizio,
        "Data Fine": v.data_fine || "-",
        "Stato": v.stato,
        "Note": v.note || "",
      };
    });

    const vociSheet = XLSX.utils.json_to_sheet(vociData);
    XLSX.utils.book_append_sheet(workbook, vociSheet, "Voci di Costo");

    // Sheet 4: Fatture FY
    const fattureData = fyInvoices.map((ft) => {
      const voce = store.vociCosto.find((v) => v.id === ft.voce_costo_id);
      const forn = voce ? store.fornitori.find((s) => s.id === voce.fornitore_id) : undefined;

      return {
        "ID Fattura": ft.id,
        "N° Fattura": ft.numero_fattura || "-",
        "Data Fattura": ft.data_fattura,
        "Anno Fiscale": ft.anno_fiscale,
        "Fornitore": forn ? forn.nome : "",
        "Voce di Costo": voce ? voce.descrizione : "",
        "Importo Effettivo (€)": ft.importo,
        "Importo Previsto (€)": ft.importo_previsto || ft.importo,
        "Stato Pagamento": ft.stato_pagamento,
        "Data Scadenza": ft.data_scadenza || "-",
        "Data Pagamento": ft.data_pagamento || "-",
        "Note": ft.note || "",
      };
    });

    const fattureSheet = XLSX.utils.json_to_sheet(fattureData);
    XLSX.utils.book_append_sheet(workbook, fattureSheet, `Fatture ${fy}`);

    // Buffer output
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Budget_IT_Export_${fy}.xlsx"`);
    res.send(buffer);
  });

  // 6. IMPORT MASSIVO DA EXCEL / CSV
  app.post("/api/import-excel", (req, res) => {
    try {
      const { items, type } = req.body; 
      // type: 'voci_costo' | 'fatture' | 'full'
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Nessun dato valido fornito per l'importazione." });
      }

      let importedCount = 0;

      if (type === "voci_costo") {
        for (const item of items) {
          // Find or create supplier
          let supplier = store.fornitori.find(
            (f) => f.nome.toLowerCase().trim() === (item.fornitore_nome || "").toLowerCase().trim()
          );

          if (!supplier && item.fornitore_nome) {
            supplier = {
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              nome: item.fornitore_nome,
              tipologia: item.tipologia || "Asset",
              note: "Creato automaticamente da Import Excel",
              stato: "Attivo",
              budget_allocato: 0,
              data_creazione: new Date().toISOString().split("T")[0],
              data_ultima_modifica: new Date().toISOString().split("T")[0],
            };
            store.fornitori.push(supplier);
          }

          if (supplier && item.descrizione) {
            const newVoce: VoceDiCosto = {
              id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              fornitore_id: supplier.id,
              descrizione: item.descrizione,
              tipo_costo: item.tipo_costo === "Ricorrente" ? "Ricorrente" : "Una Tantum",
              frequenza_fatturazione: item.frequenza_fatturazione || "Mensile",
              importo_previsto: Number(item.importo_previsto) || 0,
              importo_consuntivo: item.importo_consuntivo !== undefined ? Number(item.importo_consuntivo) : Number(item.importo_previsto) || 0,
              data_inizio: item.data_inizio || new Date().toISOString().split("T")[0],
              data_fine: item.data_fine || undefined,
              note: item.note || "Importato da Excel",
              stato: item.stato || "Attiva",
            };
            store.vociCosto.push(newVoce);
            importedCount++;
          }
        }
      } else if (type === "fatture") {
        for (const item of items) {
          // Find matching cost item
          let voce = store.vociCosto.find(
            (v) => v.descrizione.toLowerCase().trim() === (item.voce_costo_descrizione || "").toLowerCase().trim()
          );

          if (!voce) {
            // Find any cost item by supplier name
            const supp = store.fornitori.find(
              (f) => f.nome.toLowerCase().trim() === (item.fornitore_nome || "").toLowerCase().trim()
            );
            if (supp) {
              voce = store.vociCosto.find((v) => v.fornitore_id === supp.id);
            }
          }

          if (voce && item.data_fattura && item.importo !== undefined) {
            const anno_fiscale = calculateFiscalYear(item.data_fattura);
            const newFt: Fattura = {
              id: `ft-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              voce_costo_id: voce.id,
              numero_fattura: item.numero_fattura || `IMP-${Math.floor(Math.random() * 9000 + 1000)}`,
              data_fattura: item.data_fattura,
              anno_fiscale,
              importo: Number(item.importo) || 0,
              importo_previsto: item.importo_previsto !== undefined ? Number(item.importo_previsto) : Number(item.importo) || 0,
              stato_pagamento: item.stato_pagamento || "Pagata",
              data_scadenza: item.data_scadenza || undefined,
              data_pagamento: item.data_pagamento || undefined,
              note: item.note || "Importato da file Excel",
            };
            store.fatture.push(newFt);
            importedCount++;
          }
        }
      }

      saveData(store);
      res.json({ success: true, count: importedCount, message: `Importati con successo ${importedCount} elementi.` });
    } catch (err: any) {
      res.status(500).json({ error: `Errore durante l'importazione: ${err?.message || err}` });
    }
  });

  // 7. GEMINI AI INSIGHTS ENDPOINT FOR IT BUDGET MANAGER
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { fy } = req.body;
      const targetFY = fy || getCurrentFiscalYear();

      const fyInvoices = store.fatture.filter((f) => f.anno_fiscale === targetFY);
      const totalInvoiced = fyInvoices.reduce((sum, f) => sum + f.importo, 0);

      const activeFornitori = store.fornitori.filter((f) => f.stato === "Attivo");
      const totalAllocatedTarget = activeFornitori.reduce((sum, f) => sum + (f.budget_allocato || 0), 0);

      const totalPlannedAnnualized = store.vociCosto
        .filter((v) => v.stato === "Attiva")
        .reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

      // Breakdown by supplier
      const supplierBreakdown = activeFornitori.map((f) => {
        const suppVociIds = store.vociCosto.filter((v) => v.fornitore_id === f.id).map((v) => v.id);
        const suppInv = fyInvoices.filter((ft) => suppVociIds.includes(ft.voce_costo_id));
        const spent = suppInv.reduce((sum, ft) => sum + ft.importo, 0);

        const suppVoci = store.vociCosto.filter((v) => v.fornitore_id === f.id);
        const planned = suppVoci.reduce((sum, v) => sum + calculateAnnualizedPreventivo(v), 0);

        return {
          nome: f.nome,
          tipologia: f.tipologia,
          budget_allocato: f.budget_allocato || 0,
          preventivo_annualizzato: planned,
          fatturato_effettivo: spent,
          variance: spent - planned,
        };
      });

      // Overdue invoices
      const overdue = fyInvoices.filter((f) => f.stato_pagamento === "In Ritardo");

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          analysis: `### 📊 Analisi Budget IT (${targetFY})
- **Budget Allocato Target**: ${totalAllocatedTarget.toLocaleString("it-IT")} €
- **Preventivo Annualizzato Voci**: ${totalPlannedAnnualized.toLocaleString("it-IT")} €
- **Totale Speso Effettivo**: ${totalInvoiced.toLocaleString("it-IT")} €
- **Delta Rimanente**: ${(totalPlannedAnnualized - totalInvoiced).toLocaleString("it-IT")} €

#### 💡 Suggerimenti per il Responsabile SI:
1. **Controllo Rinnovi Cloud**: Monitorare i consumi su AWS per evitare sforamenti sui costi variabili.
2. **Fatture in Ritardo**: Sono presenti ${overdue.length} fatture con stato 'In Ritardo'. Sollecitarne il pagamento.
3. **Consolida Fornitori Servizi**: La voce consulenza Reply rappresenta un'incidenza significativa. Valutare la rinegoziazione dei canoni.`,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Sei un esperto Senior IT Controller e Advisor finanziario specializzato nella gestione dei budget IT per Responsabili Sistemi Informativi (CIO / Responsabile SI).

Analizza i seguenti dati del Budget IT aziendale relativi all'Anno Fiscale ${targetFY} (Periodo 1 Novembre - 31 Ottobre):

1. **Riepilogo Generale**:
   - Budget Target Allocato Fornitori: € ${totalAllocatedTarget.toLocaleString("it-IT")}
   - Budget Annualizzato Previsto (Voci di Costo): € ${totalPlannedAnnualized.toLocaleString("it-IT")}
   - Totale Speso/Fatturato Effettivo finora: € ${totalInvoiced.toLocaleString("it-IT")}
   - Delta Previsto vs Speso: € ${(totalPlannedAnnualized - totalInvoiced).toLocaleString("it-IT")}
   - Fatture in ritardo: ${overdue.length}

2. **Dettaglio Spesa Fornitori (Preventivo vs Speso Effettivo)**:
${JSON.stringify(supplierBreakdown, null, 2)}

Fornisci una risposta chiara, sintetica, altamente professionale e strutturata in Markdown (in lingua ITALIANA) indirizzata al Responsabile SI:
- **Status Sintetico del Budget**: Valutazione rapida dello stato di salute del budget (in linea, a rischio sforamento, o in risparmio).
- **Fornitori Critici / Anomalie**: Identifica dove ci sono gli scostamenti maggiori tra preventivo e speso o budget allocato.
- **3 Azioni Strategiche Consigliate**: Consigli concreti e pratici (es. rinegoziazione contratti, ottimizzazione licenze cloud, gestione fatture in scadenza).
- **Proiezione a Fine FY**: Una breve stima di spesa a fine anno fiscale basata sull'andamento attuale.

Usa toni professionali, formattazione Markdown con punti elenco, numeri e grassetti per massimizzare la leggibilità.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({
        error: "Impossibile generare le analisi AI in questo momento.",
      });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Express avviato su http://0.0.0.0:${PORT}`);
  });
}

startServer();
