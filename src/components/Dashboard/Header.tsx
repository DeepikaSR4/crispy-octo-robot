'use client';

import { UserState } from '@/types';
import { calculateLevel, getCompletionPercent } from '@/lib/gamification';
import styles from './Header.module.css';

interface Props {
    state: UserState;
}

const LEVEL_COLORS: Record<string, string> = {
    'Intern': '#60a5fa',
    'Junior Dev': '#a78bfa',
    'Engineer': '#34d399',
    'Product Engineer': '#f59e0b',
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function Header({ state }: Props) {
    const level = calculateLevel(state.xp);
    const color = LEVEL_COLORS[level] ?? '#60a5fa';
    const pct = getCompletionPercent(state.xp);
    const name = state.userName;

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.logo}>⚡ LevelUp Engine</div>
                {name ? (
                    <div className={styles.greeting}>
                        {getGreeting()}, <span className={styles.greetingName}>{name}</span>
                        {' '}— you&apos;re a{' '}
                        <span className={styles.greetingLevel} style={{ color }}>
                            {level}
                        </span>
                    </div>
                ) : (
                    <div className={styles.tagline}>4-Week Developer Evolution System</div>
                )}
            </div>
            <div className={styles.right}>
                <div className={styles.levelBadge} style={{ borderColor: color, color }}>
                    {level}
                </div>
                <div className={styles.xpBlock}>
                    <span className={styles.xpValue}>{state.xp}</span>
                    <span className={styles.xpMax}> / 400 XP</span>
                </div>
                <div className={styles.percentBadge}>{pct}% Complete</div>
            </div>
        </header>
    );
}
