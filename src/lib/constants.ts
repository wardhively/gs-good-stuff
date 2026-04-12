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
  lat: 42.10,
  lng: -77.23,
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

export const SOCIAL = {
  instagram: "https://instagram.com/gsgoodstuff",
  tiktok: "https://tiktok.com/@gsgoodstuff",
  facebook: "https://facebook.com/gsgoodstuff",
  pinterest: "https://pinterest.com/gsgoodstuff",
};
