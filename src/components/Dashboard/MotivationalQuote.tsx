'use client';

import { UserState } from '@/types';
import { getCompletionPercent } from '@/lib/gamification';
import styles from './MotivationalQuote.module.css';

const QUOTES = [
    { text: "Every expert was once a beginner who refused to quit.", author: "Unknown" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Clean code is not written by following a set of rules. It's written by someone who cares.", author: "Robert C. Martin" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "The difference between a good and great engineer is that great engineers ship.", author: "Unknown" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "The only way to go fast is to go well.", author: "Robert C. Martin" },
    { text: "It's not about ideas. It's about making ideas happen.", author: "Scott Belsky" },
    { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
    { text: "Consistency is the foundation of mastery.", author: "Unknown" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "Reduce abstractions until the code explains itself.", author: "Unknown" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't fear failure. Fear being in the same place next year as today.", author: "Unknown" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Small daily improvements lead to staggering long-term results.", author: "Unknown" },
    { text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown" },
    { text: "Ship it, learn from it, improve it.", author: "Unknown" },
    { text: "The best engineers are the ones who keep learning long after school.", author: "Unknown" },
    { text: "Every line of code you write is a rep. Put in the reps.", author: "Unknown" },
    { text: "Build things that matter. Ship things that ship.", author: "Unknown" },
    { text: "Dare to begin. The rest follows.", author: "Unknown" },
];

function getDailyQuote() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
}

function getProgressMessage(state: UserState): { emoji: string; message: string } {
    const pct = getCompletionPercent(state.xp);
    const week = state.currentWeek;
    const name = state.userName ? `, ${state.userName}` : '';

    if (pct === 0) return { emoji: '🚀', message: `Your journey starts now${name}. Week 1 is unlocked — go build something.` };
    if (pct < 25) return { emoji: '🔥', message: `Week ${week} in progress${name}. Every submission gets you closer.` };
    if (pct < 50) return { emoji: '⚡', message: `You're building momentum${name}. Don't slow down now.` };
    if (pct < 75) return { emoji: '💪', message: `Halfway through the evolution${name}. You're ahead of where most stop.` };
    if (pct < 100) return { emoji: '🏆', message: `Almost there${name}. Product Engineer is within reach.` };
    return { emoji: '🎉', message: `You did it${name}. Full evolution complete. You are a Product Engineer.` };
}

interface Props {
    state: UserState;
}

export default function MotivationalQuote({ state }: Props) {
    const quote = getDailyQuote();
    const { emoji, message } = getProgressMessage(state);

    return (
        <div className={styles.container}>
            <div className={styles.progress}>
                <span className={styles.emoji}>{emoji}</span>
                <span className={styles.progressMsg}>{message}</span>
            </div>
            <div className={styles.divider} />
            <blockquote className={styles.quote}>
                <span className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</span>
                <cite className={styles.author}>— {quote.author}</cite>
            </blockquote>
        </div>
    );
}
