import { Timestamp } from "firebase/firestore";
import { StatusEnum } from "./constants";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completed_at?: Timestamp;
  due_date?: string; // ISO date string "YYYY-MM-DD"
  parent_type?: 'zone' | 'variety';
  parent_id?: string;
  parent_name?: string;
}

export interface Zone {
  id: string;
  name: string;
  geometry: GeoJSON.Polygon;
  status: StatusEnum;
  elevation?: number;
  drainage?: 'good' | 'fair' | 'poor';
  sun_exposure?: 'full' | 'partial' | 'shade';
  frost_risk?: 'low' | 'medium' | 'high';
  soil_notes?: string;
  photo_urls?: string[];
  checklist?: ChecklistItem[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

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
  grade?: 'A' | 'B' | 'C';
  price?: number;
  wholesale_price?: number;
  color_hex?: string;
  bloom_form?: string;
  bloom_size?: string;
  height?: string;
  season?: string;
  photo_urls?: string[];
  notes?: string;
  checklist?: ChecklistItem[];
  status_history?: Array<{ status: StatusEnum; timestamp: Timestamp; note?: string }>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  source: 'ai' | 'weather' | 'equipment' | 'manual';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date: Timestamp;
  estimated_hours?: number;
  zone_id?: string;
  equipment_id?: string;
  variety_ids?: string[];
  status: 'pending' | 'accepted' | 'completed' | 'dismissed' | 'snoozed';
  calendar_event_id?: string;
  assigned_to?: string;
  created_at: Timestamp;
  completed_at?: Timestamp;
  updated_at: Timestamp;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  category: 'observation' | 'planting' | 'harvest' | 'maintenance' | 'business' | 'personal';
  zone_id?: string;
  variety_ids?: string[];
  photo_urls?: string[];
  is_public?: boolean;
  public_title?: string;
  public_body?: string;
  weather_snapshot?: { temp_hi: number; temp_lo: number; conditions: string; precip: number };
  author: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  make_model?: string;
  photo_url?: string;
  current_hours: number;
  service_items: Array<{
    type: string;
    interval_hours: number;
    last_completed_at?: Timestamp;
    last_completed_hours?: number;
    last_cost?: number;
  }>;
  maintenance_log?: Array<{
    date: Timestamp;
    type: string;
    notes?: string;
    machine_hours?: number;
    cost?: number;
    receipt_url?: string;
  }>;
  status: 'ok' | 'due_soon' | 'overdue';
  updated_at: Timestamp;
}

export interface OrderItem {
  variety_id: string;
  zone_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  source: 'online' | 'manual' | 'market' | 'wholesale';
  customer_name: string;
  customer_email?: string;
  shipping_address?: {
    line1: string; line2?: string; city: string; state: string; zip: string; country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount?: number;
  total: number;
  status: 'pending' | 'packing' | 'shipped' | 'fulfilled' | 'refunded';
  tracking_number?: string;
  shipped_at?: Timestamp;
  created_at: Timestamp;
  updated_at?: Timestamp;
  notes?: string;
}

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

export interface BusinessPlan {
  id: string;
  year: number;
  targets: { production: number; planted: number; sold: number; revenue: number; varieties: number; stock_purchase: number };
  actuals: { production: number; planted: number; sold: number; revenue: number; varieties: number; stock_purchase: number };
  milestones: Array<{ title: string; completed: boolean; completed_at?: Timestamp }>;
  budget: Array<{ category: string; budgeted: number; actual: number }>;
  notes?: string;
}

export interface Settings {
  farm_name: string;
  location: { lat: number; lng: number; elevation: number; zone: string };
  last_frost_date: string;
  first_frost_date: string;
  stripe_account_id?: string;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  notification_prefs: Record<string, { frost_alerts: boolean; morning_brief: boolean; orders: boolean; equipment: boolean; weekly_summary: boolean }>;
  social_links: { instagram: string; tiktok: string; facebook: string; pinterest: string };
  cooler_sensor_id?: string;
  cooler_safe_range: { min: number; max: number };
}
