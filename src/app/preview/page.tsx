'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_STATE } from './mockData';
import { WEEK_MAP, WEEKS } from '@/lib/missions';
import { getWeekScore, getCompletionPercent } from '@/lib/gamification';
import Header from '@/components/Dashboard/Header';
import XPProgressBar from '@/components/Dashboard/XPProgressBar';
import BadgeDisplay from '@/components/Dashboard/BadgeDisplay';
import ReviewResult from '@/components/Review/ReviewResult';
import AttemptHistory from '@/components/Review/AttemptHistory';
import styles from './page.module.css';

const LEVEL_COLORS: Record<string, string> = {
    'Intern': '#60a5fa',
    'Junior Dev': '#a78bfa',
    'Engineer': '#34d399',
    'Product Engineer': '#f59e0b',
};

export default function PreviewPage() {
    const state = MOCK_STATE;
    const [activeWeek, setActiveWeek] = useState(1);
    const [activeTask, setActiveTask] = useState<'a' | 'b'>('a');

    const week = WEEK_MAP[activeWeek];
    const task = activeTask === 'a' ? week.taskA : week.taskB;
    const taskKey = `w${activeWeek}${activeTask}`;
    const taskState = state.taskAttempts[taskKey];
    const lastResult = taskState?.attempts[taskState.attempts.length - 1]?.reviewResult ?? null;
    const weekScore = getWeekScore(state.taskAttempts, activeWeek);

    return (
        <div className={styles.page}>
            {/* Preview Banner */}
            <div className={styles.previewBanner}>
                🎭 Demo Preview Mode — Hardcoded completed state &nbsp;·&nbsp;
                <Link href="/" className={styles.backLink}>Back to Live Dashboard →</Link>
            </div>

            <Header state={state} />

            <main className={styles.main}>
                {/* XP Bar */}
                <section className={styles.section}>
                    <XPProgressBar state={state} />
                </section>

                {/* Week Grid */}
                <section className={styles.section}>
                    <div className={styles.sectionLabel}>4-Week Timeline — All Completed</div>
                    <div className={styles.weekGrid}>
                        {WEEKS.map((w) => {
                            const ws = getWeekScore(state.taskAttempts, w.id);
                            const hasBadge = state.badgesEarned.includes(w.badge);
                            const isActive = activeWeek === w.id;
                            return (
                                <button
                                    key={w.id}
                                    onClick={() => { setActiveWeek(w.id); setActiveTask('a'); }}
                                    className={[styles.weekCard, isActive ? styles.weekCardActive : ''].join(' ')}
                                >
                                    <div className={styles.wcWeek}>WEEK {w.id}</div>
                                    <div className={styles.wcTitle}>{w.title}</div>
                                    <div className={styles.wcScore}>
                                        <span className={styles.wcScoreNum}>{ws}</span>
                                        <span className={styles.wcScoreDen}>/100</span>
                                    </div>
                                    {hasBadge && (
                                        <div className={styles.wcBadge}>{w.badgeIcon} {w.badge}</div>
                                    )}
                                    <div className={styles.wcThreshold}>
                                        {ws >= w.unlockThreshold ? '✅ Unlocked' : `Need ${w.unlockThreshold}`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Badges */}
                <section className={styles.section}>
                    <BadgeDisplay state={state} />
                </section>

                <div className={styles.divider} />

                {/* Week Detail */}
                <section className={styles.section}>
                    <div className={styles.weekDetailHeader}>
                        <div>
                            <h2 className={styles.weekDetailTitle}>
                                <span className={styles.weekPill}>Week {activeWeek}</span>
                                {week.title}
                            </h2>
                            <p className={styles.weekDetailTheme}>{week.theme}</p>
                        </div>
                        <div className={styles.weekScoreBig}>
                            <span className={styles.weekScoreNum}>{weekScore}</span>
                            <span className={styles.weekScoreDen}>/100</span>
                            <div className={styles.weekScoreLabel}>Week Score</div>
                        </div>
                    </div>

                    {/* Task tabs */}
                    <div className={styles.tabs}>
                        {(['a', 'b'] as const).map((tid) => {
                            const t = tid === 'a' ? week.taskA : week.taskB;
                            const ts = state.taskAttempts[`w${activeWeek}${tid}`];
                            return (
                                <button
                                    key={tid}
                                    className={[styles.tab, activeTask === tid ? styles.activeTab : ''].join(' ')}
                                    onClick={() => setActiveTask(tid)}
                                >
                                    <span>{t.technology}</span>
                                    <span className={styles.tabScore}>{ts?.best_score ?? 0}/50</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Task info */}
                    <div className={styles.taskCard}>
                        <div className={styles.taskLabel}>{task.label}</div>
                        <ul className={styles.reqList}>
                            {task.requirements.map((r, i) => (
                                <li key={i} className={styles.reqItem}>{r}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Latest review result */}
                    {lastResult && (
                        <div className={styles.resultSection}>
                            <div className={styles.resultHeader}>
                                📋 Latest AI Review — Attempt #{taskState.attempts.length}
                            </div>
                            <ReviewResult result={lastResult} xpDelta={0} />
                        </div>
                    )}

                    {/* Attempt history */}
                    {taskState && taskState.attempts.length > 0 && (
                        <AttemptHistory taskState={taskState} />
                    )}
                </section>
            </main>
        </div>
    );
}
