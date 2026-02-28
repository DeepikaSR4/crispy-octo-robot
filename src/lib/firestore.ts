/**
 * Firestore REST API client — per-user data at levelup/{uid}
 */

import { UserState, LevelTitle } from '@/types';
import { WEEKS } from '@/lib/missions';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COLLECTION = 'levelup';

function docUrl(uid: string, key?: string) {
    const base = `${FIRESTORE_BASE}/${COLLECTION}/${uid}?key=${API_KEY}`;
    return key ? `${base}&key=${API_KEY}`.replace(/\?key.*/, `?key=${API_KEY}`) : base;
}

function collectionUrl() {
    return `${FIRESTORE_BASE}/${COLLECTION}?key=${API_KEY}`;
}

// ─── Firestore Value Converters ───────────────────────────────────────────────

type FSValue =
    | { stringValue: string }
    | { integerValue: string }
    | { doubleValue: number }
    | { booleanValue: boolean }
    | { nullValue: null }
    | { arrayValue: { values?: FSValue[] } }
    | { mapValue: { fields?: Record<string, FSValue> } };

function toFS(value: unknown): FSValue {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') {
        return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    }
    if (typeof value === 'string') return { stringValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFS) } };
    if (typeof value === 'object') {
        const fields: Record<string, FSValue> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            fields[k] = toFS(v);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
}

function fromFS(fsValue: FSValue): unknown {
    if ('nullValue' in fsValue) return null;
    if ('booleanValue' in fsValue) return fsValue.booleanValue;
    if ('integerValue' in fsValue) return Number(fsValue.integerValue);
    if ('doubleValue' in fsValue) return fsValue.doubleValue;
    if ('stringValue' in fsValue) return fsValue.stringValue;
    if ('arrayValue' in fsValue) return (fsValue.arrayValue.values ?? []).map(fromFS);
    if ('mapValue' in fsValue) {
        const obj: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(fsValue.mapValue.fields ?? {})) obj[k] = fromFS(v);
        return obj;
    }
    return null;
}

function fieldsToObject(fields: Record<string, FSValue>): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) obj[k] = fromFS(v);
    return obj;
}

function objectToFields(obj: Record<string, unknown>): Record<string, FSValue> {
    const fields: Record<string, FSValue> = {};
    for (const [k, v] of Object.entries(obj)) fields[k] = toFS(v);
    return fields;
}

// ─── REST Helpers ─────────────────────────────────────────────────────────────

async function fsGet(url: string): Promise<Record<string, FSValue> | null> {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) { const b = await res.text(); throw new Error(`Firestore GET [${res.status}]: ${b}`); }
    const data = await res.json();
    return data.fields ?? {};
}

async function fsPatch(url: string, fields: Record<string, FSValue>): Promise<void> {
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
        cache: 'no-store',
    });
    if (!res.ok) { const b = await res.text(); throw new Error(`Firestore PATCH [${res.status}]: ${b}`); }
}

// ─── Business Logic ───────────────────────────────────────────────────────────

function calculateLevel(xp: number): LevelTitle {
    if (xp >= 300) return 'Product Engineer';
    if (xp >= 200) return 'Engineer';
    if (xp >= 100) return 'Junior Dev';
    return 'Intern';
}

function getDefaultState(uid: string, profile: { userName?: string; email?: string; photoURL?: string }): UserState {
    const taskAttempts: UserState['taskAttempts'] = {};
    WEEKS.forEach((w) => {
        taskAttempts[`w${w.id}a`] = { attempts: [], best_score: 0 };
        taskAttempts[`w${w.id}b`] = { attempts: [], best_score: 0 };
    });
    return {
        currentWeek: 1,
        unlockedWeeks: [1],
        xp: 0,
        level: 'Intern',
        taskAttempts,
        badgesEarned: [],
        lastSeen: new Date().toISOString(),
        ...profile,
    };
}

export async function getUserState(uid: string, profile?: { userName?: string; email?: string; photoURL?: string }): Promise<UserState> {
    const url = docUrl(uid);
    const fields = await fsGet(url);

    if (!fields || Object.keys(fields).length === 0) {
        const defaultState = getDefaultState(uid, profile ?? {});
        await setUserState(uid, defaultState);
        return defaultState;
    }

    const state = fieldsToObject(fields) as unknown as UserState;
    // Update profile fields + lastSeen on every load
    if (profile) {
        state.userName = profile.userName ?? state.userName;
        state.email = profile.email ?? state.email;
        state.photoURL = profile.photoURL ?? state.photoURL;
    }
    state.lastSeen = new Date().toISOString();
    await setUserState(uid, state);
    return state;
}

export async function setUserState(uid: string, state: UserState): Promise<void> {
    const fields = objectToFields(state as unknown as Record<string, unknown>);
    await fsPatch(docUrl(uid), fields);
}

export async function recordAttempt(
    uid: string,
    weekId: number,
    taskId: 'a' | 'b',
    score: number,
    repoUrl: string,
    reviewResult: import('@/types').AIReviewResult,
    profile?: { userName?: string; email?: string; photoURL?: string }
): Promise<{ state: UserState; unlocked: boolean; xpDelta: number }> {
    const state = await getUserState(uid, profile);
    const key = `w${weekId}${taskId}`;
    const taskState = state.taskAttempts[key] ?? { attempts: [], best_score: 0 };
    const prevBest = taskState.best_score;

    taskState.attempts.push({
        score,
        timestamp: new Date().toISOString(),
        repoUrl,
        reviewResult,
    });

    let xpDelta = 0;
    if (score > prevBest) {
        xpDelta = score - prevBest;
        taskState.best_score = score;
    }
    state.taskAttempts[key] = taskState;

    let totalXP = 0;
    Object.values(state.taskAttempts).forEach((ts) => { totalXP += ts.best_score; });
    state.xp = totalXP;
    state.level = calculateLevel(totalXP);

    const week = WEEKS.find((w) => w.id === weekId)!;
    const weekScore = (state.taskAttempts[`w${weekId}a`]?.best_score ?? 0) + (state.taskAttempts[`w${weekId}b`]?.best_score ?? 0);

    let unlocked = false;
    if (weekScore >= week.unlockThreshold && weekId < 4 && !state.unlockedWeeks.includes(weekId + 1)) {
        state.unlockedWeeks.push(weekId + 1);
        state.currentWeek = weekId + 1;
        unlocked = true;
        if (!state.badgesEarned.includes(week.badge)) state.badgesEarned.push(week.badge);
    }

    await setUserState(uid, state);
    return { state, unlocked, xpDelta };
}

export async function getAllUsers(): Promise<(UserState & { uid: string })[]> {
    const res = await fetch(collectionUrl(), { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    if (!res.ok) { const b = await res.text(); throw new Error(`Firestore LIST [${res.status}]: ${b}`); }
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map((doc: { name: string; fields: Record<string, FSValue> }) => {
        const uid = doc.name.split('/').pop()!;
        return { uid, ...(fieldsToObject(doc.fields) as unknown as UserState) };
    });
}
