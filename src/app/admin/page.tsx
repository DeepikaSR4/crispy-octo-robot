'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserState } from '@/types';
import { WEEKS } from '@/lib/missions';
import { getWeekScore } from '@/lib/gamification';
import styles from './page.module.css';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';

const LEVEL_COLORS: Record<string, string> = {
    'Intern': '#60a5fa',
    'Junior Dev': '#a78bfa',
    'Engineer': '#34d399',
    'Product Engineer': '#f59e0b',
};

type UserWithUid = UserState & { uid: string };

export default function AdminPage() {
    const { user, idToken, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserWithUid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = user?.email === ADMIN_EMAIL;

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.replace('/login'); return; }
        if (!isAdmin) { setError('Access denied. Admin only.'); setLoading(false); return; }

        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/users', {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error ?? 'Failed to load users');
                setUsers(data.users ?? []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [authLoading, user, idToken, isAdmin, router]);

    if (authLoading || loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Loading admin panel...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <div className={styles.errorIcon}>⛔</div>
                <div className={styles.errorTitle}>{error}</div>
                <Link href="/" className={styles.backBtn}>← Back to Dashboard</Link>
            </div>
        );
    }

    const totalXP = users.reduce((sum, u) => sum + (u.xp ?? 0), 0);
    const avgXP = users.length ? Math.round(totalXP / users.length) : 0;
    const productEngineers = users.filter((u) => u.level === 'Product Engineer').length;

    return (
        <div className={styles.page}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.backLink}>← Dashboard</Link>
                <div className={styles.navTitle}>⚡ Admin Panel</div>
                <div className={styles.navRight}>
                    <span className={styles.adminBadge}>ADMIN</span>
                </div>
            </nav>

            <main className={styles.main}>
                {/* Stats bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{users.length}</div>
                        <div className={styles.statLabel}>Total Users</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{avgXP}</div>
                        <div className={styles.statLabel}>Avg XP</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{productEngineers}</div>
                        <div className={styles.statLabel}>Product Engineers</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {users.filter((u) => (u.unlockedWeeks ?? [1]).length > 1).length}
                        </div>
                        <div className={styles.statLabel}>Multi-Week</div>
                    </div>
                </div>

                {/* User grid */}
                <div className={styles.sectionLabel}>All Users</div>
                {users.length === 0 ? (
                    <div className={styles.empty}>No users yet. Share the app link!</div>
                ) : (
                    <div className={styles.userGrid}>
                        {users
                            .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
                            .map((u) => {
                                const color = LEVEL_COLORS[u.level] ?? '#60a5fa';
                                const totalAttempts = Object.values(u.taskAttempts ?? {}).reduce(
                                    (sum, ts) => sum + (ts.attempts?.length ?? 0), 0
                                );
                                const lastSeen = u.lastSeen
                                    ? new Date(u.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : 'Unknown';

                                return (
                                    <div key={u.uid} className={styles.userCard}>
                                        <div className={styles.userHeader}>
                                            {u.photoURL ? (
                                                <img src={u.photoURL} alt={u.userName} className={styles.avatar} />
                                            ) : (
                                                <div className={styles.avatarFallback}>
                                                    {(u.userName ?? u.email ?? '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className={styles.userName}>{u.userName ?? 'Anonymous'}</div>
                                                <div className={styles.userEmail}>{u.email ?? ''}</div>
                                            </div>
                                        </div>

                                        <div className={styles.levelRow}>
                                            <span className={styles.levelBadge} style={{ color, borderColor: color }}>
                                                {u.level}
                                            </span>
                                            <span className={styles.xp}>⚡ {u.xp ?? 0} XP</span>
                                        </div>

                                        {/* Week scores */}
                                        <div className={styles.weekScores}>
                                            {WEEKS.map((w) => {
                                                const score = getWeekScore(u.taskAttempts ?? {}, w.id);
                                                const unlocked = (u.unlockedWeeks ?? [1]).includes(w.id);
                                                return (
                                                    <div key={w.id} className={[styles.weekDot, unlocked ? styles.weekUnlocked : styles.weekLocked].join(' ')}>
                                                        <span>W{w.id}</span>
                                                        <span className={styles.weekDotScore}>{unlocked ? score : '🔒'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Badges */}
                                        {(u.badgesEarned ?? []).length > 0 && (
                                            <div className={styles.badges}>
                                                {u.badgesEarned.map((b) => {
                                                    const wk = WEEKS.find((w) => w.badge === b);
                                                    return <span key={b} title={b}>{wk?.badgeIcon}</span>;
                                                })}
                                            </div>
                                        )}

                                        <div className={styles.userMeta}>
                                            <span>{totalAttempts} submissions</span>
                                            <span>Last seen {lastSeen}</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </main>
        </div>
    );
}
