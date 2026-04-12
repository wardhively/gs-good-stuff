/**
 * Firestore Seed Script — G&S Good Stuff
 *
 * Run with: npx ts-node --esm scripts/seed-data.ts
 * Or adapt for use in a Cloud Function / admin script.
 *
 * Seeds Firestore with realistic sample data for development.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin SDK init.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize with your service account
initializeApp({
  // credential: cert(require("./service-account.json")),
});

const db = getFirestore();

async function seed() {
  console.log("Seeding Firestore...");

  // ─── Settings ────────────────────────────────────────────────────
  await db.doc("settings/main").set({
    farm_name: "G&S Good Stuff",
    location: { lat: 42.1, lng: -77.23, elevation: 1020, zone: "5b" },
    last_frost_date: "05-15",
    first_frost_date: "10-01",
    shipping_flat_rate: 9.45,
    free_shipping_threshold: 150,
    notification_prefs: {
      gary: { frost_alerts: true, morning_brief: true, orders: false, equipment: true, weekly_summary: true },
      suzy: { frost_alerts: true, morning_brief: false, orders: true, equipment: false, weekly_summary: true },
    },
    social_links: {
      instagram: "https://instagram.com/gsgoodstuff",
      tiktok: "https://tiktok.com/@gsgoodstuff",
      facebook: "https://facebook.com/gsgoodstuff",
      pinterest: "https://pinterest.com/gsgoodstuff",
    },
    cooler_safe_range: { min: 38, max: 48 },
  });
  console.log("  ✓ Settings");

  // ─── Zones ───────────────────────────────────────────────────────
  const zones = [
    {
      id: "zone-1",
      name: "Zone 1 — North Ridge",
      status: "planted",
      elevation: 1040,
      drainage: "good",
      sun_exposure: "full",
      frost_risk: "medium",
      soil_notes: "Sandy loam, amended with compost 2025",
      geometry: {
        type: "Polygon",
        coordinates: [[[-77.232, 42.101], [-77.230, 42.101], [-77.230, 42.102], [-77.232, 42.102], [-77.232, 42.101]]],
      },
    },
    {
      id: "zone-2",
      name: "Zone 2 — South Flat",
      status: "stored",
      elevation: 1010,
      drainage: "fair",
      sun_exposure: "full",
      frost_risk: "low",
      soil_notes: "Clay-heavy, needs drainage tiles",
      geometry: {
        type: "Polygon",
        coordinates: [[[-77.231, 42.099], [-77.229, 42.099], [-77.229, 42.100], [-77.231, 42.100], [-77.231, 42.099]]],
      },
    },
    {
      id: "zone-3",
      name: "Zone 3 — Creek Bed",
      status: "stored",
      elevation: 1000,
      drainage: "poor",
      sun_exposure: "partial",
      frost_risk: "high",
      soil_notes: "Rich alluvial soil but flood-prone in spring",
      geometry: {
        type: "Polygon",
        coordinates: [[[-77.233, 42.100], [-77.231, 42.100], [-77.231, 42.101], [-77.233, 42.101], [-77.233, 42.100]]],
      },
    },
    {
      id: "zone-4",
      name: "Zone 4 — Barn Side",
      status: "stored",
      elevation: 1025,
      drainage: "good",
      sun_exposure: "full",
      frost_risk: "low",
      soil_notes: "Best soil on property, deep topsoil",
      geometry: {
        type: "Polygon",
        coordinates: [[[-77.230, 42.100], [-77.228, 42.100], [-77.228, 42.101], [-77.230, 42.101], [-77.230, 42.100]]],
      },
    },
    {
      id: "zone-5",
      name: "Zone 5 — Hillside",
      status: "stored",
      elevation: 1060,
      drainage: "good",
      sun_exposure: "full",
      frost_risk: "high",
      soil_notes: "Thin topsoil, needs heavy amendment. Great air drainage.",
      geometry: {
        type: "Polygon",
        coordinates: [[[-77.229, 42.101], [-77.227, 42.101], [-77.227, 42.102], [-77.229, 42.102], [-77.229, 42.101]]],
      },
    },
  ];

  for (const zone of zones) {
    const { id, ...data } = zone;
    await db.doc(`zones/${id}`).set({
      ...data,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
  }
  console.log(`  ✓ ${zones.length} Zones`);

  // ─── Varieties ─────────────────────────────────────────────────
  const varieties = [
    { id: "v-cafe-au-lait", name: "Café au Lait", zone_id: "zone-1", count: 8, status: "stored", color_hex: "#E8C8A0", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 12, grade: "A" },
    { id: "v-thomas-edison", name: "Thomas Edison", zone_id: "zone-1", count: 6, status: "stored", color_hex: "#6B2D5B", bloom_form: "Decorative", bloom_size: "A", height: "Tall", season: "Mid", price: 10, grade: "A" },
    { id: "v-kelvin-floodlight", name: "Kelvin Floodlight", zone_id: "zone-2", count: 10, status: "stored", color_hex: "#FFD700", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 8, grade: "B" },
    { id: "v-bishop-of-llandaff", name: "Bishop of Llandaff", zone_id: "zone-2", count: 5, status: "stored", color_hex: "#CC2222", bloom_form: "Peony", bloom_size: "B", height: "Medium", season: "Early", price: 10, grade: "A" },
    { id: "v-labyrinth", name: "Labyrinth", zone_id: "zone-3", count: 4, status: "stored", color_hex: "#E8A090", bloom_form: "Decorative", bloom_size: "A", height: "Tall", season: "Mid", price: 15, grade: "A" },
    { id: "v-cornel-bronze", name: "Cornel Bronze", zone_id: "zone-3", count: 6, status: "stored", color_hex: "#CD853F", bloom_form: "Waterlily", bloom_size: "B", height: "Medium", season: "Early", price: 9, grade: "B" },
    { id: "v-ferncliff-illusion", name: "Ferncliff Illusion", zone_id: "zone-4", count: 4, status: "stored", color_hex: "#DDA0DD", bloom_form: "Decorative", bloom_size: "A", height: "Tall", season: "Late", price: 18, grade: "A" },
    { id: "v-american-dawn", name: "American Dawn", zone_id: "zone-4", count: 8, status: "stored", color_hex: "#FFB6C1", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 10, grade: "A" },
    { id: "v-penhill-dark-monarch", name: "Penhill Dark Monarch", zone_id: "zone-5", count: 3, status: "stored", color_hex: "#8B0000", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Late", price: 20, grade: "A" },
    { id: "v-senior-ball", name: "Senior's Ball", zone_id: "zone-5", count: 6, status: "stored", color_hex: "#FFE4B5", bloom_form: "Ball", bloom_size: "B", height: "Medium", season: "Mid", price: 8, grade: "B" },
    { id: "v-creme-de-cassis", name: "Crème de Cassis", zone_id: "zone-1", count: 5, status: "stored", color_hex: "#4B0082", bloom_form: "Waterlily", bloom_size: "B", height: "Medium", season: "Early", price: 12, grade: "A" },
    { id: "v-cafe-au-lait-royal", name: "Café au Lait Royal", zone_id: "zone-4", count: 3, status: "stored", color_hex: "#D8B0D8", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 25, grade: "A" },
    { id: "v-otto-e-thrill", name: "Otto's Thrill", zone_id: "zone-2", count: 7, status: "stored", color_hex: "#FF69B4", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 10, grade: "A" },
    { id: "v-jowey-winnie", name: "Jowey Winnie", zone_id: "zone-3", count: 5, status: "stored", color_hex: "#DA70D6", bloom_form: "Ball", bloom_size: "BB", height: "Medium", season: "Early", price: 9, grade: "B" },
    { id: "v-wizard-of-oz", name: "Wizard of Oz", zone_id: "zone-5", count: 4, status: "stored", color_hex: "#FFB347", bloom_form: "Dinnerplate", bloom_size: "AA", height: "Tall", season: "Mid", price: 11, grade: "A" },
    { id: "v-ice-queen", name: "Ice Queen", zone_id: "zone-1", count: 4, status: "stored", color_hex: "#F0F0F0", bloom_form: "Cactus", bloom_size: "A", height: "Tall", season: "Late", price: 14, grade: "A" },
    { id: "v-night-queen", name: "Night Queen", zone_id: "zone-4", count: 3, status: "stored", color_hex: "#2F0030", bloom_form: "Decorative", bloom_size: "A", height: "Tall", season: "Mid", price: 16, grade: "A" },
    { id: "v-gallery-pablo", name: "Gallery Pablo", zone_id: "zone-2", count: 8, status: "stored", color_hex: "#FF4500", bloom_form: "Decorative", bloom_size: "M", height: "Short", season: "Early", price: 7, grade: "B" },
    { id: "v-northern-lights", name: "Northern Lights", zone_id: "zone-3", count: 4, status: "stored", color_hex: "#9370DB", bloom_form: "Informal Decorative", bloom_size: "A", height: "Tall", season: "Mid", price: 13, grade: "A" },
    { id: "v-firepot", name: "Firepot", zone_id: "zone-5", count: 6, status: "stored", color_hex: "#FF6347", bloom_form: "Ball", bloom_size: "BB", height: "Medium", season: "Early", price: 8, grade: "B" },
  ];

  for (const variety of varieties) {
    const { id, ...data } = variety;
    await db.doc(`varieties/${id}`).set({
      ...data,
      status_history: [{ status: "stored", timestamp: Timestamp.now() }],
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
  }
  console.log(`  ✓ ${varieties.length} Varieties`);

  // ─── Equipment ─────────────────────────────────────────────────
  const equipment = [
    {
      id: "eq-kubota",
      name: "Kubota L2501",
      type: "Tractor",
      make_model: "Kubota L2501 4WD",
      current_hours: 187,
      status: "ok",
      service_items: [
        { type: "Oil Change", interval_hours: 250, last_completed_at: Timestamp.fromDate(new Date("2026-01-15")), last_cost: 45 },
        { type: "Air Filter", interval_hours: 500, last_completed_at: Timestamp.fromDate(new Date("2025-10-01")), last_cost: 25 },
        { type: "Hydraulic Fluid", interval_hours: 1000, last_cost: 80 },
      ],
      maintenance_log: [
        { date: Timestamp.fromDate(new Date("2026-01-15")), type: "Oil Change", notes: "Used Rotella T6 5W-40", cost: 45 },
      ],
    },
    {
      id: "eq-rototiller",
      name: "Rototiller",
      type: "Implement",
      make_model: "BCS 853 Walk-Behind",
      current_hours: 42,
      status: "ok",
      service_items: [
        { type: "Oil Change", interval_hours: 50, last_completed_at: Timestamp.fromDate(new Date("2026-02-01")), last_cost: 15 },
        { type: "Tine Inspection", interval_hours: 25, last_completed_at: Timestamp.fromDate(new Date("2026-02-01")) },
      ],
    },
    {
      id: "eq-generator",
      name: "Generator",
      type: "Generator",
      make_model: "Honda EU3000iS",
      current_hours: 310,
      status: "due_soon",
      service_items: [
        { type: "Oil Change", interval_hours: 100, last_completed_at: Timestamp.fromDate(new Date("2025-11-01")), last_cost: 20 },
        { type: "Spark Plug", interval_hours: 300, last_cost: 8 },
      ],
    },
  ];

  for (const eq of equipment) {
    const { id, ...data } = eq;
    await db.doc(`equipment/${id}`).set(data);
  }
  console.log(`  ✓ ${equipment.length} Equipment`);

  // ─── Business Plan 2026 ────────────────────────────────────────
  await db.doc("business_plan/2026").set({
    year: 2026,
    targets: { production: 400, planted: 100, sold: 200, revenue: 2000, varieties: 20, stock_purchase: 1500 },
    actuals: { production: 0, planted: 0, sold: 0, revenue: 0, varieties: 20, stock_purchase: 1200 },
    milestones: [
      { title: "App v1 live", completed: false },
      { title: "First online sale", completed: false },
      { title: "All zones mapped", completed: false },
      { title: "AI task system operational", completed: false },
      { title: "10 blog posts published", completed: false },
      { title: "Instagram to 500 followers", completed: false },
      { title: "First wholesale inquiry", completed: false },
    ],
    budget: [
      { category: "Tuber stock", budgeted: 1500, actual: 1200 },
      { category: "Firebase/hosting", budgeted: 300, actual: 0 },
      { category: "Stripe fees", budgeted: 60, actual: 0 },
      { category: "Shipping supplies", budgeted: 200, actual: 0 },
      { category: "Soil amendments", budgeted: 400, actual: 150 },
      { category: "Tools & equipment", budgeted: 500, actual: 0 },
      { category: "Marketing", budgeted: 200, actual: 0 },
    ],
  });
  console.log("  ✓ Business Plan 2026");

  // ─── Sample Journal Entries ────────────────────────────────────
  const entries = [
    {
      id: "j-1",
      title: "Tuber stock arrived",
      body: "Received 60 tubers from Swan Island and 40 from Floret. All look healthy, stored in cooler at 42°F. Labeled every bag with variety name and source.",
      category: "business",
      author: "Gary",
      is_public: true,
      public_title: "Our First Tuber Order Has Arrived!",
      public_body: "We're thrilled to announce our founding collection of 100 premium dahlia tubers has arrived! Twenty gorgeous varieties from top growers, now safely tucked into the cooler awaiting spring planting.",
    },
    {
      id: "j-2",
      title: "Soil test results — Zone 1",
      body: "pH 6.4, good organic matter. Slightly low on phosphorus. Plan to add bone meal before planting. Drainage is excellent on the ridge.",
      category: "observation",
      zone_id: "zone-1",
      author: "Gary",
      is_public: false,
    },
    {
      id: "j-3",
      title: "Zone mapping complete",
      body: "Walked all 5 zones with GPS. Mapped boundaries, noted sun exposure and drainage patterns. Zone 3 near the creek will need raised beds.",
      category: "maintenance",
      author: "Gary",
      is_public: false,
    },
  ];

  for (const entry of entries) {
    const { id, ...data } = entry;
    await db.doc(`journal_entries/${id}`).set({
      ...data,
      photo_urls: [],
      variety_ids: [],
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
  }
  console.log(`  ✓ ${entries.length} Journal Entries`);

  console.log("\nSeed complete!");
}

seed().catch(console.error);
