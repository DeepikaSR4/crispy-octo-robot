'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OnboardingModal.module.css';

interface Props {
    onComplete: (name: string) => void;
}

export default function OnboardingModal({ onComplete }: Props) {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const trimmed = name.trim();
    const isValid = trimmed.length >= 2;

    async function handleSubmit() {
        if (!isValid) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: trimmed }),
            });
            if (!res.ok) throw new Error('Failed to save');
            onComplete(trimmed);
        } catch {
            setError('Failed to save. Please try again.');
            setSaving(false);
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                >
                    {/* Glow orb */}
                    <div className={styles.glow} />

                    <div className={styles.icon}>⚡</div>

                    <h1 className={styles.title}>Welcome to LevelUp Engine</h1>
                    <p className={styles.subtitle}>
                        Your 4-week structured growth system. AI-powered code reviews. Real progress.
                    </p>

                    <div className={styles.cards}>
                        <div className={styles.featureCard}>🤖 AI Code Review</div>
                        <div className={styles.featureCard}>🏆 XP & Badges</div>
                        <div className={styles.featureCard}>📈 Tracked Growth</div>
                    </div>

                    <div className={styles.inputSection}>
                        <label className={styles.label}>What should we call you?</label>
                        <input
                            className={[styles.input, error ? styles.inputErr : ''].join(' ')}
                            type="text"
                            placeholder="Your first name"
                            value={name}
                            maxLength={32}
                            autoFocus
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
                        />
                        {error && <p className={styles.error}>{error}</p>}
                    </div>

                    <button
                        className={styles.btn}
                        disabled={!isValid || saving}
                        onClick={handleSubmit}
                    >
                        {saving ? (
                            <span className={styles.btnInner}>
                                <span className={styles.spinner} /> Starting your journey...
                            </span>
                        ) : (
                            `Start My Evolution →`
                        )}
                    </button>

                    <p className={styles.hint}>Single-user system · No account needed</p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
