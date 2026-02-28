'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AIReviewResult, ReviewBreakdown } from '@/types';
import styles from './ReviewResult.module.css';

interface Props {
    result: AIReviewResult;
    xpDelta: number;
}

const BREAKDOWN_LABELS: Record<keyof ReviewBreakdown, string> = {
    code_structure: 'Code Structure',
    architecture: 'Architecture',
    clean_code: 'Clean Code',
    scalability: 'Scalability',
    documentation: 'Documentation',
    error_handling: 'Error Handling',
    product_thinking: 'Product Thinking',
    performance: 'Performance',
};

const BREAKDOWN_ICONS: Record<keyof ReviewBreakdown, string> = {
    code_structure: '🗂️',
    architecture: '🏛️',
    clean_code: '🧹',
    scalability: '📈',
    documentation: '📄',
    error_handling: '🛡️',
    product_thinking: '🧠',
    performance: '⚡',
};

function getScoreColor(score: number, max: number = 7): string {
    const pct = score / max;
    if (pct >= 0.8) return '#34d399';
    if (pct >= 0.6) return '#fbbf24';
    if (pct >= 0.4) return '#fb923c';
    return '#f87171';
}

function AnimatedNumber({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let frame: number;
        const start = performance.now();
        const duration = 1000;

        function animate(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) frame = requestAnimationFrame(animate);
        }

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return <>{display}</>;
}

export default function ReviewResult({ result, xpDelta }: Props) {
    const scoreColor = getScoreColor(result.total_score, 50);

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Score Summary */}
            <div className={styles.scoreSummary}>
                <div className={styles.scoreCircle} style={{ borderColor: scoreColor, boxShadow: `0 0 30px ${scoreColor}33` }}>
                    <span className={styles.scoreNumber} style={{ color: scoreColor }}>
                        <AnimatedNumber value={result.total_score} />
                    </span>
                    <span className={styles.scoreOf}>/50</span>
                </div>
                <div className={styles.scoreInfo}>
                    <div className={styles.scoreTitle}>AI Review Complete</div>
                    {xpDelta > 0 && (
                        <motion.div
                            className={styles.xpDelta}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8, type: 'spring' }}
                        >
                            +{xpDelta} XP
                        </motion.div>
                    )}
                    <div className={styles.scoreDesc}>
                        {result.total_score >= 40 ? '🔥 Excellent work!' :
                            result.total_score >= 30 ? '👍 Good effort, keep pushing' :
                                result.total_score >= 20 ? '📚 Room to grow' : '🌱 Early stage – keep going'}
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>📊 Score Breakdown</div>
                <div className={styles.breakdown}>
                    {(Object.entries(result.breakdown) as [keyof ReviewBreakdown, number][]).map(([key, val]) => {
                        const color = getScoreColor(val);
                        return (
                            <div key={key} className={styles.breakdownRow}>
                                <div className={styles.breakdownLabel}>
                                    <span>{BREAKDOWN_ICONS[key]}</span>
                                    <span>{BREAKDOWN_LABELS[key]}</span>
                                </div>
                                <div className={styles.breakdownBar}>
                                    <motion.div
                                        className={styles.breakdownFill}
                                        style={{ background: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(val / 7) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.1 }}
                                    />
                                </div>
                                <div className={styles.breakdownScore} style={{ color }}>{val}/7</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>✅ Strengths</div>
                    <ul className={styles.list}>
                        {result.strengths.map((s, i) => (
                            <li key={i} className={styles.strengthItem}>{s}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>🚀 Improvements</div>
                    <div className={styles.improvements}>
                        {result.improvements.map((imp, i) => (
                            <div key={i} className={styles.improvCard}>
                                <div className={styles.improvProblem}>⚠️ {imp.problem}</div>
                                <div className={styles.improvWhy}><strong>Why it matters:</strong> {imp.why}</div>
                                <div className={styles.improvHow}><strong>How to fix:</strong> {imp.how}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Growth Focus */}
            {result.growth_focus.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>🎯 Growth Focus</div>
                    <div className={styles.tags}>
                        {result.growth_focus.map((f, i) => (
                            <span key={i} className={styles.tag}>{f}</span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
