'use client';

import { motion } from 'framer-motion';
import { UserState } from '@/types';
import { getCompletionPercent } from '@/lib/gamification';
import styles from './XPProgressBar.module.css';

interface Props {
    state: UserState;
}

const LEVELS = [
    { label: 'Intern', xp: 0 },
    { label: 'Junior Dev', xp: 100 },
    { label: 'Engineer', xp: 200 },
    { label: 'Pro Engineer', xp: 300 },
    { label: 'MAX', xp: 400 },
];

export default function XPProgressBar({ state }: Props) {
    const pct = getCompletionPercent(state.xp);

    return (
        <div className={styles.container}>
            <div className={styles.labels}>
                {LEVELS.map((l) => (
                    <span
                        key={l.xp}
                        className={styles.label}
                        style={{ left: `${(l.xp / 400) * 100}%` }}
                    >
                        <span className={styles.labelDot} />
                        <span className={styles.labelText}>{l.label}</span>
                    </span>
                ))}
            </div>

            <div className={styles.track}>
                <motion.div
                    className={styles.fill}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <div className={styles.shimmer} />
            </div>

            <div className={styles.footer}>
                <span className={styles.xpText}>{state.xp} XP earned</span>
                <span className={styles.remaining}>{400 - state.xp} XP to max</span>
            </div>
        </div>
    );
}
