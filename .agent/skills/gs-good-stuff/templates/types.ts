import { Timestamp } from "firebase/firestore";

// ─── Status Lifecycle ────────────────────────────────────────────────
// stored → jugged → planted → growing → dug → divided → listed → sold
//                                ↓
//                            attention (needs intervention)

export type StatusEnum =
  | "stored"
  | "jugged"
  | "planted"
  | "growing"
  | "attention"
  | "dug"
  | "divided"
  | "listed"
  | "sold";

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

export const STATUS_COLORS: Record<StatusEnum, string> = {
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

// ─── Zones ───────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  geometry: GeoJSON.Polygon;
  status: StatusEnum;
  elevation?: number;
  drainage?: "good" | "fair" | "poor";
  sun_exposure?: "full" | "partial" | "shade";
  frost_risk?: "low" | "medium" | "high";
  soil_notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ─── Varieties ───────────────────────────────────────────────────────

export interface Variety {
  id: string;
  name: string;
  zone_id: string;
  count: number;
  status: StatusEnum;
  planted_date?: Timestamp;
  jugged_date?: Timestamp;
  expected_dig_date?: Timestamp;
  division_yield?: number;
  grade?: "A" | "B" | "C";
  price?: number;
  wholesale_price?: number;
  color_hex?: string;
  bloom_form?: string;
  bloom_size?: string;
  height?: string;
  season?: string;
  photo_urls?: string[];
  notes?: string;
  status_history?: Array<{
    status: StatusEnum;
    timestamp: Timestamp;
    note?: string;
  }>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ─── Tasks ───────────────────────────────────────────────────────────

export type TaskSource = "ai" | "weather" | "equipment" | "manual";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus =
  | "pending"
  | "accepted"
  | "completed"
  | "dismissed"
  | "snoozed";

export interface Task {
  id: string;
  title: string;
  description: string;
  source: TaskSource;
  priority: TaskPriority;
  due_date: Timestamp;
  estimated_hours?: number;
  zone_id?: string;
  equipment_id?: string;
  variety_ids?: string[];
  status: TaskStatus;
  calendar_event_id?: string;
  assigned_to?: string;
  created_at: Timestamp;
  completed_at?: Timestamp;
}

// ─── Journal ─────────────────────────────────────────────────────────

export type JournalCategory =
  | "observation"
  | "planting"
  | "harvest"
  | "maintenance"
  | "business"
  | "personal";

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  category: JournalCategory;
  zone_id?: string;
  variety_ids?: string[];
  photo_urls?: string[];
  is_public?: boolean;
  public_title?: string;
  public_body?: string;
  weather_snapshot?: {
    temp_hi: number;
    temp_lo: number;
    conditions: string;
    precip: number;
  };
  author: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ─── Equipment ───────────────────────────────────────────────────────

export interface ServiceItem {
  type: string;
  interval_hours: number;
  last_completed_at?: Timestamp;
  last_cost?: number;
}

export interface MaintenanceEntry {
  date: Timestamp;
  type: string;
  notes?: string;
  cost?: number;
  receipt_url?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  make_model?: string;
  photo_url?: string;
  current_hours: number;
  service_items: ServiceItem[];
  maintenance_log?: MaintenanceEntry[];
  status: "ok" | "due_soon" | "overdue";
}

// ─── Orders ──────────────────────────────────────────────────────────

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  variety_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export type OrderStatus =
  | "pending"
  | "packing"
  | "shipped"
  | "fulfilled"
  | "refunded";

export interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent?: string;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  tracking_number?: string;
  shipped_at?: Timestamp;
  created_at: Timestamp;
  notes?: string;
}

// ─── Weather ─────────────────────────────────────────────────────────

export interface WeatherLog {
  id: string;
  date: string;
  forecast_json: object;
  actual_high: number;
  actual_low: number;
  precip_inches: number;
  soil_temp_est: number;
  frost_alert: boolean;
}

// ─── Business Plan ───────────────────────────────────────────────────

export interface PlanMetrics {
  production: number;
  planted: number;
  sold: number;
  revenue: number;
  varieties: number;
  stock_purchase: number;
}

export interface Milestone {
  title: string;
  completed: boolean;
  completed_at?: Timestamp;
}

export interface BudgetLine {
  category: string;
  budgeted: number;
  actual: number;
}

export interface BusinessPlan {
  id: string;
  year: number;
  targets: PlanMetrics;
  actuals: PlanMetrics;
  milestones: Milestone[];
  budget: BudgetLine[];
  notes?: string;
}

// ─── Settings ────────────────────────────────────────────────────────

export interface NotificationPrefs {
  frost_alerts: boolean;
  morning_brief: boolean;
  orders: boolean;
  equipment: boolean;
  weekly_summary: boolean;
}

export interface SocialLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
  pinterest: string;
}

export interface Settings {
  farm_name: string;
  location: {
    lat: number;
    lng: number;
    elevation: number;
    zone: string;
  };
  last_frost_date: string;
  first_frost_date: string;
  stripe_account_id?: string;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  notification_prefs: Record<string, NotificationPrefs>;
  social_links: SocialLinks;
  cooler_sensor_id?: string;
  cooler_safe_range: { min: number; max: number };
}
