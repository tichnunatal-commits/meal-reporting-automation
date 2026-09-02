import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  Firestore
} from 'firebase/firestore';
import { DailyReportRow, MonthlyKitchenSummary } from '../types/index.js';

// Firebase Configuration — loaded from environment variables (VITE_FIREBASE_*)
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'meal-reporting-app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with Offline Persistence (IndexedDB multi-tab cache)
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // If already initialized, fallback to getFirestore
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

// Collection Names
export const COLLECTIONS = {
  DAILY_REPORTS: 'daily_reports',
  MONTHLY_SUMMARIES: 'monthly_summaries',
  APP_CONFIG: 'app_config'
} as const;

// App config document interface
export interface AppConfigData {
  disabledKitchens: number[];
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * 2. Data Seeding:
 * Checks if Firestore collections are empty. If empty, uploads local data
 * (from localStorage or defaults) safely using batched writes so no data is lost.
 */
export async function seedInitialDataIfEmpty(
  localReports: DailyReportRow[],
  localSummaries: MonthlyKitchenSummary[],
  localDisabledKitchens: number[]
): Promise<boolean> {
  try {
    const configRef = doc(db, COLLECTIONS.APP_CONFIG, 'settings');
    const configSnap = await getDoc(configRef);

    // If config does not exist, seed initial config & data
    if (!configSnap.exists()) {
      console.log('🌱 Seeding initial data to Firestore...');
      const batch = writeBatch(db);

      // 1. Config (disabled kitchens)
      batch.set(configRef, {
        disabledKitchens: localDisabledKitchens || [],
        updatedAt: new Date().toISOString()
      });

      // 2. Daily reports (chunked if large, max 500 per batch)
      if (localReports && localReports.length > 0) {
        for (const report of localReports) {
          const reportRef = doc(db, COLLECTIONS.DAILY_REPORTS, String(report.id));
          batch.set(reportRef, cleanFirestoreData(report));
        }
      }

      // 3. Monthly summaries
      if (localSummaries && localSummaries.length > 0) {
        for (const summary of localSummaries) {
          const summaryRef = doc(db, COLLECTIONS.MONTHLY_SUMMARIES, String(summary.id));
          batch.set(summaryRef, cleanFirestoreData(summary));
        }
      }

      await batch.commit();
      console.log('✅ Data seeding completed successfully.');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Data seeding check or execution encountered an error:', err);
    return false;
  }
}

/**
 * Realtime listener for Daily Reports
 */
export function subscribeToDailyReports(
  onUpdate: (reports: DailyReportRow[]) => void,
  onError?: (error: Error) => void
) {
  const reportsCol = collection(db, COLLECTIONS.DAILY_REPORTS);
  return onSnapshot(
    reportsCol,
    (snapshot) => {
      const reports: DailyReportRow[] = [];
      snapshot.forEach((docSnap) => {
        reports.push(docSnap.data() as DailyReportRow);
      });
      // Sort reports descending by id or date
      reports.sort((a, b) => b.id - a.id);
      onUpdate(reports);
    },
    (err) => {
      console.error('Error in daily_reports listener:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for Monthly Summaries
 */
export function subscribeToMonthlySummaries(
  onUpdate: (summaries: MonthlyKitchenSummary[]) => void,
  onError?: (error: Error) => void
) {
  const summariesCol = collection(db, COLLECTIONS.MONTHLY_SUMMARIES);
  return onSnapshot(
    summariesCol,
    (snapshot) => {
      const summaries: MonthlyKitchenSummary[] = [];
      snapshot.forEach((docSnap) => {
        summaries.push(docSnap.data() as MonthlyKitchenSummary);
      });
      onUpdate(summaries);
    },
    (err) => {
      console.error('Error in monthly_summaries listener:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for App Config (e.g. disabledKitchens)
 */
export function subscribeToAppConfig(
  onUpdate: (config: AppConfigData) => void,
  onError?: (error: Error) => void
) {
  const configDocRef = doc(db, COLLECTIONS.APP_CONFIG, 'settings');
  return onSnapshot(
    configDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as AppConfigData);
      } else {
        onUpdate({ disabledKitchens: [] });
      }
    },
    (err) => {
      console.error('Error in app_config listener:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Helper to strip any `undefined` values from data objects before saving to Firestore.
 * Firestore strictly rejects `undefined` values.
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Firestore Mutations
 */
export async function saveDailyReportToFirestore(report: DailyReportRow): Promise<void> {
  const reportRef = doc(db, COLLECTIONS.DAILY_REPORTS, String(report.id));
  const clean = cleanFirestoreData(report);
  await setDoc(reportRef, clean, { merge: true });
}

export async function updateDailyReportInFirestore(
  reportId: number,
  fields: Partial<DailyReportRow>
): Promise<void> {
  const clean = cleanFirestoreData(fields);
  if (Object.keys(clean).length === 0) return;
  const reportRef = doc(db, COLLECTIONS.DAILY_REPORTS, String(reportId));
  await updateDoc(reportRef, clean);
}

export async function deleteDailyReportFromFirestore(reportId: number): Promise<void> {
  const reportRef = doc(db, COLLECTIONS.DAILY_REPORTS, String(reportId));
  await deleteDoc(reportRef);
}

export async function saveMonthlySummaryToFirestore(summary: MonthlyKitchenSummary): Promise<void> {
  const summaryRef = doc(db, COLLECTIONS.MONTHLY_SUMMARIES, String(summary.id));
  const clean = cleanFirestoreData(summary);
  await setDoc(summaryRef, clean, { merge: true });
}

export async function saveDisabledKitchensToFirestore(disabledKitchens: number[]): Promise<void> {
  const configRef = doc(db, COLLECTIONS.APP_CONFIG, 'settings');
  await setDoc(configRef, {
    disabledKitchens,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Batch delete reports matching a filter / list of IDs
 */
export async function batchDeleteReportsFromFirestore(reportIds: number[]): Promise<void> {
  if (reportIds.length === 0) return;
  const batch = writeBatch(db);
  for (const id of reportIds) {
    batch.delete(doc(db, COLLECTIONS.DAILY_REPORTS, String(id)));
  }
  await batch.commit();
}

/**
 * Batch update report statuses
 */
export async function batchUpdateReportsStatusInFirestore(
  reportIds: number[],
  status: DailyReportRow['status']
): Promise<void> {
  if (reportIds.length === 0) return;
  const batch = writeBatch(db);
  for (const id of reportIds) {
    batch.update(doc(db, COLLECTIONS.DAILY_REPORTS, String(id)), { status });
  }
  await batch.commit();
}
