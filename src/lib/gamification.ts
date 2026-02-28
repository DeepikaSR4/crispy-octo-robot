import { LevelTitle, UserState } from '@/types';
import { LEVEL_THRESHOLDS } from '@/lib/missions';

export function calculateLevel(xp: number): LevelTitle {
    for (const tier of LEVEL_THRESHOLDS) {
        if (xp >= tier.min && xp <= tier.max) return tier.title as LevelTitle;
    }
    return 'Product Engineer';
}

export function calculateXP(taskAttempts: UserState['taskAttempts']): number {
    return Object.values(taskAttempts).reduce((sum, ts) => sum + (ts.best_score ?? 0), 0);
}

export function getScoreDelta(attempts: { score: number }[]): number {
    if (attempts.length < 2) return 0;
    const last = attempts[attempts.length - 1].score;
    const prev = attempts[attempts.length - 2].score;
    return last - prev;
}

export function getWeekScore(
    taskAttempts: UserState['taskAttempts'],
    weekId: number
): number {
    const a = taskAttempts[`w${weekId}a`]?.best_score ?? 0;
    const b = taskAttempts[`w${weekId}b`]?.best_score ?? 0;
    return a + b;
}

export function getCompletionPercent(xp: number): number {
    return Math.min(Math.round((xp / 400) * 100), 100);
}
