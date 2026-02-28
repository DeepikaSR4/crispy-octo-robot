'use client';

import { useState } from 'react';
import { UserState, AIReviewResult, ReviewResponse } from '@/types';
import { WEEK_MAP } from '@/lib/missions';
import SubmissionForm from '@/components/Review/SubmissionForm';
import ReviewResult from '@/components/Review/ReviewResult';
import AttemptHistory from '@/components/Review/AttemptHistory';
import styles from './MissionView.module.css';

interface Props {
    state: UserState;
    weekId: number;
    onStateUpdate: (state: UserState) => void;
    onUnlock: () => void;
}

export default function MissionView({ state, weekId, onStateUpdate, onUnlock }: Props) {
    const [activeTask, setActiveTask] = useState<'a' | 'b'>('a');
    const [reviewing, setReviewing] = useState(false);
    const [lastResult, setLastResult] = useState<AIReviewResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [xpDelta, setXpDelta] = useState<number>(0);

    const week = WEEK_MAP[weekId];
    const isUnlocked = state.unlockedWeeks.includes(weekId);
    const task = activeTask === 'a' ? week.taskA : week.taskB;
    const taskKey = `w${weekId}${activeTask}`;
    const taskState = state.taskAttempts[taskKey];

    async function handleSubmit(repoUrl: string) {
        setReviewing(true);
        setError(null);
        setLastResult(null);

        try {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl, weekId, taskId: activeTask }),
            });

            const data: ReviewResponse = await res.json();
            if (!data.success || !data.result || !data.updatedState) {
                throw new Error(data.error ?? 'Unknown error from review API');
            }

            const prevBest = taskState?.best_score ?? 0;
            const newScore = data.result.total_score;
            setXpDelta(newScore > prevBest ? newScore - prevBest : 0);
            setLastResult(data.result);
            onStateUpdate(data.updatedState);

            if (data.unlocked) onUnlock();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Review failed. Please try again.');
        } finally {
            setReviewing(false);
        }
    }

    if (!isUnlocked) {
        return (
            <div className={styles.locked}>
                <div className={styles.lockIcon}>🔒</div>
                <div className={styles.lockTitle}>Week {weekId} is Locked</div>
                <div className={styles.lockDesc}>
                    Complete the previous week with {WEEK_MAP[weekId - 1]?.unlockThreshold ?? 70}+ points to unlock this week.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.weekHeader}>
                <h2 className={styles.weekTitle}>
                    <span className={styles.weekBadge}>Week {weekId}</span>
                    {week.title}
                </h2>
                <p className={styles.weekTheme}>{week.theme}</p>
            </div>

            {/* Task Tabs */}
            <div className={styles.tabs}>
                {(['a', 'b'] as const).map((tid) => {
                    const t = tid === 'a' ? week.taskA : week.taskB;
                    const ts = state.taskAttempts[`w${weekId}${tid}`];
                    return (
                        <button
                            key={tid}
                            className={[styles.tab, activeTask === tid ? styles.activeTab : ''].join(' ')}
                            onClick={() => { setActiveTask(tid); setLastResult(null); setError(null); }}
                        >
                            <span className={styles.tabTech}>{t.technology}</span>
                            {ts?.best_score > 0 && (
                                <span className={styles.tabScore}>{ts.best_score}/50</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Task Detail */}
            <div className={styles.taskCard}>
                <div className={styles.taskLabel}>{task.label}</div>
                <p className={styles.taskDesc}>{task.description}</p>

                <div className={styles.requirements}>
                    <div className={styles.reqHeading}>✅ Requirements</div>
                    <ul className={styles.reqList}>
                        {task.requirements.map((r, i) => (
                            <li key={i} className={styles.reqItem}>{r}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.threshold}>
                    <span>Week unlock threshold: </span>
                    <strong>{week.unlockThreshold} points</strong>
                    <span className={styles.thresholdNote}> (combined Task A + Task B)</span>
                </div>
            </div>

            {/* Submission */}
            <SubmissionForm
                onSubmit={handleSubmit}
                loading={reviewing}
                bestScore={taskState?.best_score ?? 0}
            />

            {error && (
                <div className={styles.errorBox}>
                    ⚠️ {error}
                </div>
            )}

            {lastResult && (
                <ReviewResult result={lastResult} xpDelta={xpDelta} />
            )}

            {taskState && taskState.attempts.length > 0 && (
                <AttemptHistory taskState={taskState} />
            )}
        </div>
    );
}
