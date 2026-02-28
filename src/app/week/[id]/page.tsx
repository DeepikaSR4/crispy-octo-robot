'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserState } from '@/types';
import { WEEK_MAP } from '@/lib/missions';
import MissionView from '@/components/Dashboard/MissionView';
import ConfettiEffect from '@/components/UI/ConfettiEffect';
import styles from './page.module.css';

export default function WeekPage() {
    const params = useParams();
    const router = useRouter();
    const weekId = Number(params.id);

    const [state, setState] = useState<UserState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

    const week = WEEK_MAP[weekId];

    const loadState = useCallback(async () => {
        try {
            const res = await fetch('/api/state');
            const data = await res.json();
            if (!data.success || !data.state) throw new Error(data.error ?? 'Failed to load');
            setState(data.state);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load state');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadState(); }, [loadState]);

    // Redirect if invalid week
    useEffect(() => {
        if (!week) router.replace('/');
    }, [week, router]);

    function handleUnlock() {
        setUnlocked(true);
        setUnlockMessage(`🎉 Week ${weekId + 1} unlocked! You've earned the ${week?.badge} badge!`);
        setTimeout(() => { setUnlocked(false); setUnlockMessage(null); }, 6000);
    }

    if (!week) return null;

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner} />
                <div className={styles.loadingText}>Loading Week {weekId}...</div>
            </div>
        );
    }

    if (error || !state) {
        return (
            <div className={styles.errorScreen}>
                <p className={styles.errorText}>⚠️ {error}</p>
                <Link href="/" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>
        );
    }

    const isUnlocked = state.unlockedWeeks.includes(weekId);

    return (
        <>
            <ConfettiEffect trigger={unlocked} />

            <div className={styles.page}>
                {/* Top Nav */}
                <nav className={styles.nav}>
                    <Link href="/" className={styles.backLink}>
                        ← Dashboard
                    </Link>
                    <div className={styles.navCenter}>
                        <span className={styles.navWeek}>Week {weekId}</span>
                        <span className={styles.navTitle}>{week.title}</span>
                    </div>
                    <div className={styles.navRight}>
                        {/* Week switcher */}
                        <div className={styles.weekSwitcher}>
                            {[1, 2, 3, 4].map((wid) => {
                                const isAvail = state.unlockedWeeks.includes(wid);
                                const isCurrent = wid === weekId;
                                return (
                                    <Link
                                        key={wid}
                                        href={`/week/${wid}`}
                                        className={[
                                            styles.weekDot,
                                            isCurrent ? styles.weekDotActive : '',
                                            !isAvail ? styles.weekDotLocked : '',
                                        ].join(' ')}
                                        title={`Week ${wid}: ${WEEK_MAP[wid]?.title}`}
                                        onClick={(e) => !isAvail && e.preventDefault()}
                                    >
                                        {wid}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* XP/Level strip */}
                <div className={styles.strip}>
                    <span className={styles.stripXp}>⚡ {state.xp} XP</span>
                    <span className={styles.stripLevel}>{state.level}</span>
                    {state.badgesEarned.length > 0 && (
                        <span className={styles.stripBadges}>
                            {state.badgesEarned.map((b) => {
                                const w = Object.values(WEEK_MAP).find((wk) => wk.badge === b);
                                return w ? <span key={b} title={b}>{w.badgeIcon}</span> : null;
                            })}
                        </span>
                    )}
                </div>

                {/* Unlock toast */}
                {unlockMessage && (
                    <div className={styles.unlockToast}>{unlockMessage}</div>
                )}

                <main className={styles.main}>
                    <MissionView
                        state={state}
                        weekId={weekId}
                        onStateUpdate={setState}
                        onUnlock={handleUnlock}
                    />
                </main>
            </div>
        </>
    );
}
