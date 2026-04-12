import { set, get, keys, del } from 'idb-keyval';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface PendingPhoto {
  blob: Blob | File;
  entryId: string;
  uuid: string;
}

export async function cacheFileOffline(docId: string, blob: Blob | File, prefix: 'photo' | 'receipt' | 'variety' | 'zone' = 'photo'): Promise<string> {
  const uuid = crypto.randomUUID();
  const pendingUrl = `pending://${prefix}_${uuid}`;
  
  const payload: PendingPhoto = { blob, entryId: docId, uuid: `${prefix}_${uuid}` };
  await set(`file_${uuid}`, payload);
  
  return pendingUrl;
}

export async function syncPendingFiles() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return; // Wait until we're online
  }

  const allKeys = await keys();
  const fileKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('file_'));

  for (const key of fileKeys) {
    try {
      const payload = await get<PendingPhoto>(key as string);
      if (!payload) continue;

      // Determine storage folder and Firestore collection based on prefix
      let storageFolder: string;
      let collectionName: string;
      const isReceipt = payload.uuid.startsWith('receipt_');
      const isVariety = payload.uuid.startsWith('variety_');
      const isZone = payload.uuid.startsWith('zone_');

      if (isReceipt) { storageFolder = 'equipment_receipts'; collectionName = 'equipment'; }
      else if (isVariety) { storageFolder = 'variety_photos'; collectionName = 'varieties'; }
      else if (isZone) { storageFolder = 'zone_photos'; collectionName = 'zones'; }
      else { storageFolder = 'journal_photos'; collectionName = 'journal_entries'; }

      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `${storageFolder}/${payload.uuid}`);
      await uploadBytes(storageRef, payload.blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Update Firestore Document
      const docRef = doc(db, collectionName, payload.entryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (isReceipt && data.maintenance_log) {
          const updatedLogs = data.maintenance_log.map((log: any) =>
            log.receipt_url === `pending://${payload.uuid}` ? { ...log, receipt_url: downloadUrl } : log
          );
          await updateDoc(docRef, { maintenance_log: updatedLogs });
        } else {
          // For journal, variety, and zone photos — all use photo_urls array
          const currentUrls = data.photo_urls || [];
          const updatedUrls = currentUrls.map((url: string) =>
            url === `pending://${payload.uuid}` ? downloadUrl : url
          );
          await updateDoc(docRef, { photo_urls: updatedUrls });
        }
      }

      // 3. Clear from IDB
      await del(key);
      console.log(`Synced offline file ${payload.uuid}`);
    } catch (err) {
      console.error(`Failed to sync file ${key}`, err);
    }
  }
}

// Auto-bind to window online event to proactively sync when walking back into Wi-Fi
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncPendingFiles);
}
