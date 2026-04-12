import { db } from './firebase';
import { collection, doc, DocumentData, CollectionReference } from 'firebase/firestore';
import type { Zone, Variety, Task, JournalEntry, Equipment, Order, WeatherLog, BusinessPlan, Settings, SiteFeature, AssistantConversation } from './types';

// Generic data type converter to ensure type safety going in/out of Firestore
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const collections = {
  zones: createCollection<Zone>('zones'),
  varieties: createCollection<Variety>('varieties'),
  tasks: createCollection<Task>('tasks'),
  journalEntries: createCollection<JournalEntry>('journal_entries'),
  equipment: createCollection<Equipment>('equipment'),
  orders: createCollection<Order>('orders'),
  weatherLog: createCollection<WeatherLog>('weather_log'),
  businessPlan: createCollection<BusinessPlan>('business_plan'),
  settings: createCollection<Settings>('settings'),
  siteFeatures: createCollection<SiteFeature>('site_features'),
  assistantConversations: createCollection<AssistantConversation>('assistant_conversations')
};

// Typed document references
export const getSettingsDoc = () => doc(db, 'settings', 'store_config');
