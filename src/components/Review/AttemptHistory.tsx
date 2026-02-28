'use client';

import { TaskState } from '@/types';
import { getScoreDelta } from '@/lib/gamification';
import styles from './AttemptHistory.module.css';

interface Props {
    taskState: TaskState;
}

export default function AttemptHistory({ taskState }: Props) {
    const { attempts, best_score } = taskState;

    if (attempts.length === 0) return null;

    const delta = getScoreDelta(attempts);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>📋 Attempt History</span>
                <span className={styles.bestBadge}>Best: {best_score}/50</span>
            </div>

            <div className={styles.list}>
                {[...attempts].reverse().map((attempt, revIdx) => {
                    const realIdx = attempts.length - 1 - revIdx;
                    const isBest = attempt.score === best_score;
                    const isLatest = revIdx === 0;
                    const prevScore = realIdx > 0 ? attempts[realIdx - 1].score : null;
                    const scoreDiff = prevScore !== null ? attempt.score - prevScore : null;

                    const date = new Date(attempt.timestamp);
                    const formatted = date.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    });

                    return (
                        <div
                            key={attempt.timestamp}
                            className={[
                                styles.item,
                                isBest ? styles.bestItem : '',
                                isLatest ? styles.latestItem : '',
                            ].join(' ')}
                        >
                            <div className={styles.itemLeft}>
                                <div className={styles.attemptNum}>#{realIdx + 1}</div>
                                <div className={styles.timestamp}>{formatted}</div>
                                <a
                                    href={attempt.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.repoLink}
                                >
                                    🔗 {attempt.repoUrl.replace('https://github.com/', '')}
                                </a>
                            </div>

                            <div className={styles.itemRight}>
                                {scoreDiff !== null && (
                                    <span className={[
                                        styles.delta,
                                        scoreDiff > 0 ? styles.deltaPos : scoreDiff < 0 ? styles.deltaNeg : styles.deltaZero,
                                    ].join(' ')}>
                                        {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? '±0' : scoreDiff}
                                    </span>
                                )}
                                <span className={styles.score}>{attempt.score}/50</span>
                                {isBest && <span className={styles.star}>⭐</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {attempts.length >= 2 && (
                <div className={styles.footer}>
                    {delta > 0 ? (
                        <span className={styles.footerPos}>📈 +{delta} pts improvement on latest attempt</span>
                    ) : delta < 0 ? (
                        <span className={styles.footerNeg}>📉 Score dropped on latest attempt</span>
                    ) : (
                        <span className={styles.footerNeutral}>Score unchanged on latest attempt</span>
                    )}
                </div>
            )}
        </div>
    );
}
