export enum StatusEnum {
  STORED = 'stored',
  JUGGED = 'jugged',
  PLANTED = 'planted',
  GROWING = 'growing',
  ATTENTION = 'attention',
  DUG = 'dug',
  DIVIDED = 'divided',
  LISTED = 'listed',
  SOLD = 'sold',
}

export const ADDISON_COORDINATES = {
  lat: 42.04461541863469,
  lng: -77.32801550272669,
  elevation_ft: 1020,
  zone: '5b',
};

// Colors mapping for status markers
export const STATUS_COLORS: Record<StatusEnum, string> = {
  [StatusEnum.STORED]: '#3E7A8C',   // creek
  [StatusEnum.JUGGED]: '#C17F4E',   // petal
  [StatusEnum.PLANTED]: '#5B7C4F',  // leaf
  [StatusEnum.GROWING]: '#5B7C4F',  // leaf
  [StatusEnum.ATTENTION]: '#B94A42',// frost
  [StatusEnum.DUG]: '#8B7D6B',      // stone-c
  [StatusEnum.DIVIDED]: '#4A3728',  // soil
  [StatusEnum.LISTED]: '#CB9B2D',   // bloom
  [StatusEnum.SOLD]: '#5B7C4F',     // leaf
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#B94A42',   // frost
  high: '#C17F4E',     // petal
  medium: '#CB9B2D',   // bloom
  low: '#3E7A8C'       // creek
};

export const FIVE_YEAR_PLAN = {
  "2026": { production: 400, revenue: 2000 },
  "2027": { production: 2000, revenue: 12000 },
  "2028": { production: 10000, revenue: 54000 },
  "2029": { production: 32000, revenue: 160000 },
  "2030": { production: 82432, revenue: 480000 },
};

// Predefined checklist templates
export const ZONE_CHECKLIST_DEFAULTS = [
  "Soil test completed",
  "Amendments applied",
  "Beds shaped and prepped",
  "Irrigation installed",
  "Mulch applied",
  "Deer fence checked",
  "Drainage assessed",
  "Weed barrier laid",
];

export const VARIETY_CHECKLIST_DEFAULTS: Record<string, string[]> = {
  [StatusEnum.STORED]: ["Inspect for rot/mold", "Label bags", "Verify cooler temp 38-48°F"],
  [StatusEnum.JUGGED]: ["Prep milk jugs", "Add potting mix", "Place in warm area", "Mist daily"],
  [StatusEnum.PLANTED]: ["Dig hole 6\" deep", "Add bone meal", "Water in thoroughly", "Mark with stake"],
  [StatusEnum.GROWING]: ["Check for pests", "Pinch center bud", "Stake tall varieties", "Deep water weekly"],
  [StatusEnum.DUG]: ["Cut stems to 4\"", "Rinse clumps", "Cure in dry area 2 days"],
  [StatusEnum.DIVIDED]: ["Separate tubers with eye", "Dust with sulfur", "Label each division", "Store in cooler"],
  [StatusEnum.LISTED]: ["Photograph tuber", "Write description", "Set price", "Upload to store"],
  [StatusEnum.SOLD]: ["Pull from inventory", "Pack for shipping", "Print label", "Update tracking"],
};

// Site feature type defaults
export const SITE_FEATURE_TYPES: Record<string, { label: string; geometry: 'polygon' | 'line' | 'point'; color: string; icon: string }> = {
  walkway: { label: 'Walkway', geometry: 'polygon', color: '#A99D8F', icon: 'Footprints' },
  irrigation: { label: 'Irrigation', geometry: 'line', color: '#3E7A8C', icon: 'Droplets' },
  driveway: { label: 'Driveway', geometry: 'polygon', color: '#8B7D6B', icon: 'Car' },
  fence: { label: 'Fence', geometry: 'line', color: '#4A3728', icon: 'Fence' },
  building: { label: 'Building', geometry: 'polygon', color: '#332518', icon: 'Home' },
  wet_area: { label: 'Wet Area', geometry: 'polygon', color: '#3E7A8C', icon: 'Waves' },
  well: { label: 'Well Point', geometry: 'point', color: '#3E7A8C', icon: 'Droplet' },
  hazard: { label: 'Hazard', geometry: 'point', color: '#B94A42', icon: 'AlertTriangle' },
  steep_grade: { label: 'Steep Grade', geometry: 'polygon', color: '#CB9B2D', icon: 'TrendingUp' },
  custom: { label: 'Custom', geometry: 'polygon', color: '#C17F4E', icon: 'MapPin' },
};

export const SOCIAL = {
  instagram: "https://instagram.com/gsgoodstuff",
  tiktok: "https://tiktok.com/@gsgoodstuff",
  facebook: "https://facebook.com/gsgoodstuff",
  pinterest: "https://pinterest.com/gsgoodstuff",
};
