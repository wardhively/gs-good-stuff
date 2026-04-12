import type { StatusEnum } from "./types";

// ─── Farm Location ───────────────────────────────────────────────────

export const FARM = {
  name: "G&S Good Stuff",
  lat: 42.1,
  lng: -77.23,
  elevation: 1020, // feet
  zone: "5b",
  lastFrost: "05-15",  // May 15
  firstFrost: "10-01", // October 1
  growingSeason: 138,   // days
  valley: "Canisteo River",
} as const;

// ─── Map Defaults ────────────────────────────────────────────────────

export const MAP = {
  center: [42.1, -77.23] as [number, number],
  defaultZoom: 16,
  maxZoom: 19,
  minZoom: 14,
  tileUrl: "/tiles/{z}/{x}/{y}.png",
  fallbackTileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;

// ─── Status Colors (maps to Tailwind tokens) ────────────────────────

export const STATUS_COLOR: Record<StatusEnum, string> = {
  stored: "creek",
  jugged: "petal",
  planted: "leaf",
  growing: "leaf",
  attention: "frost",
  dug: "stone-c",
  divided: "soil",
  listed: "bloom",
  sold: "leaf",
};

export const STATUS_HEX: Record<StatusEnum, string> = {
  stored: "#3E7A8C",
  jugged: "#C17F4E",
  planted: "#5B7C4F",
  growing: "#5B7C4F",
  attention: "#B94A42",
  dug: "#8B7D6B",
  divided: "#4A3728",
  listed: "#CB9B2D",
  sold: "#5B7C4F",
};

export const STATUS_LABELS: Record<StatusEnum, string> = {
  stored: "Stored",
  jugged: "Jugged",
  planted: "Planted",
  growing: "Growing",
  attention: "Attention",
  dug: "Dug",
  divided: "Divided",
  listed: "Listed",
  sold: "Sold",
};

export const STATUS_ORDER: StatusEnum[] = [
  "stored",
  "jugged",
  "planted",
  "growing",
  "attention",
  "dug",
  "divided",
  "listed",
  "sold",
];

// ─── Weather ─────────────────────────────────────────────────────────

export const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=42.10&longitude=-77.23&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York";

export const FROST_THRESHOLD_F = 32;
export const RAIN_CONCERN_INCHES = 3; // weekly total
export const SOIL_TEMP_FACTOR = 0.85; // 7-day rolling avg * factor

// ─── Cooler ──────────────────────────────────────────────────────────

export const COOLER_SAFE_RANGE = { min: 38, max: 48 } as const; // °F

// ─── Shipping ────────────────────────────────────────────────────────

export const SHIPPING = {
  flatRate: 9.45,
  freeThreshold: 150,
} as const;

// ─── Tuber Lifecycle ─────────────────────────────────────────────────

export const DAYS_TO_DIG = 140; // planted + 140 = expected dig date

// ─── Notification Categories ─────────────────────────────────────────

export const NOTIFICATION_CATEGORIES = [
  "frost_alert",
  "morning_brief",
  "order_received",
  "equipment_due",
  "weekly_summary",
  "cooler_alarm",
] as const;

// ─── Social ──────────────────────────────────────────────────────────

export const SOCIAL = {
  instagram: "https://instagram.com/gsgoodstuff",
  tiktok: "https://tiktok.com/@gsgoodstuff",
  facebook: "https://facebook.com/gsgoodstuff",
  pinterest: "https://pinterest.com/gsgoodstuff",
} as const;

// ─── 5-Year Growth Targets ──────────────────────────────────────────

export const FIVE_YEAR_PLAN = [
  { year: 2026, planted: 100, produced: 400, sold: 200, revenue: 2000, varieties: 20 },
  { year: 2027, planted: 400, produced: 2000, sold: 1200, revenue: 12000, varieties: 40 },
  { year: 2028, planted: 2000, produced: 10000, sold: 6000, revenue: 54000, varieties: 80 },
  { year: 2029, planted: 8000, produced: 32000, sold: 20000, revenue: 160000, varieties: 120 },
  { year: 2030, planted: 20000, produced: 82432, sold: 60000, revenue: 480000, varieties: 150 },
] as const;
