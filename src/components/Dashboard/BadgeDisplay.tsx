'use client';

import { UserState } from '@/types';
import { WEEKS } from '@/lib/missions';
import styles from './BadgeDisplay.module.css';

interface Props {
    state: UserState;
}

export default function BadgeDisplay({ state }: Props) {
    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Badges</h3>
            <div className={styles.grid}>
                {WEEKS.map((week) => {
                    const earned = state.badgesEarned.includes(week.badge);
                    return (
                        <div
                            key={week.id}
                            className={[styles.badge, earned ? styles.earned : styles.locked].join(' ')}
                            title={earned ? `Earned: ${week.badge}` : `Locked – Complete Week ${week.id} to unlock`}
                        >
                            <span className={styles.icon}>{week.badgeIcon}</span>
                            <span className={styles.name}>{week.badge}</span>
                            <span className={styles.weekLabel}>Week {week.id}</span>
                            {!earned && <div className={styles.lockOverlay}>🔒</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
