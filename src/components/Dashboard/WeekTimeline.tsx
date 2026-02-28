'use client';

import Link from 'next/link';
import { UserState } from '@/types';
import { WEEKS } from '@/lib/missions';
import { getWeekScore } from '@/lib/gamification';
import styles from './WeekTimeline.module.css';

interface Props {
    state: UserState;
    selectedWeek?: number;
}

export default function WeekTimeline({ state, selectedWeek }: Props) {
    return (
        <div className={styles.container}>
            {WEEKS.map((week) => {
                const isUnlocked = state.unlockedWeeks.includes(week.id);
                const isSelected = selectedWeek === week.id;
                const isCurrent = state.currentWeek === week.id;
                const weekScore = getWeekScore(state.taskAttempts, week.id);
                const hasBadge = state.badgesEarned.includes(week.badge);

                const inner = (
                    <>
                        <div className={styles.weekNumber}>
                            {isUnlocked ? `WEEK ${week.id}` : `🔒 WEEK ${week.id}`}
                        </div>
                        <div className={styles.title}>{week.title}</div>
                        <div className={styles.theme}>{week.theme}</div>

                        {isUnlocked && (
                            <div className={styles.scoreRow}>
                                <div className={styles.score}>
                                    <span className={styles.scoreValue}>{weekScore}</span>
                                    <span className={styles.scoreMax}>/100</span>
                                </div>
                                <div className={styles.threshold}>
                                    Unlock: {week.unlockThreshold}+
                                </div>
                            </div>
                        )}

                        {hasBadge && (
                            <div className={styles.badgePill}>
                                {week.badgeIcon} {week.badge}
                            </div>
                        )}

                        {isCurrent && isUnlocked && !hasBadge && (
                            <div className={styles.activePill}>▶ Active</div>
                        )}
                    </>
                );

                if (!isUnlocked) {
                    return (
                        <div
                            key={week.id}
                            className={[styles.card, styles.locked].join(' ')}
                            aria-disabled="true"
                        >
                            {inner}
                        </div>
                    );
                }

                return (
                    <Link
                        key={week.id}
                        href={`/week/${week.id}`}
                        className={[
                            styles.card,
                            styles.unlocked,
                            isSelected ? styles.selected : '',
                            isCurrent ? styles.current : '',
                        ].join(' ')}
                    >
                        {inner}
                    </Link>
                );
            })}
        </div>
    );
}
