'use client';

import { useState } from 'react';
import styles from './SubmissionForm.module.css';

interface Props {
    onSubmit: (repoUrl: string) => void;
    loading: boolean;
    bestScore: number;
}

function isValidGithubUrl(url: string): boolean {
    return /^https:\/\/github\.com\/[^\/]+\/[^\/\s]+/.test(url);
}

export default function SubmissionForm({ onSubmit, loading, bestScore }: Props) {
    const [url, setUrl] = useState('');
    const [touched, setTouched] = useState(false);
    const isValid = isValidGithubUrl(url.trim());
    const showError = touched && url.length > 0 && !isValid;

    return (
        <div className={styles.container}>
            <div className={styles.heading}>
                <span className={styles.headingIcon}>📤</span>
                Submit Repository for AI Review
                {bestScore > 0 && (
                    <span className={styles.bestScore}>Best: {bestScore}/50</span>
                )}
            </div>

            <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔗</span>
                    <input
                        className={[styles.input, showError ? styles.inputError : ''].join(' ')}
                        type="url"
                        placeholder="https://github.com/your-username/your-repo"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={() => setTouched(true)}
                        disabled={loading}
                        aria-label="GitHub repository URL"
                    />
                </div>
                <button
                    className={styles.btn}
                    disabled={!isValid || loading}
                    onClick={() => onSubmit(url.trim())}
                >
                    {loading ? (
                        <span className={styles.loadingInner}>
                            <span className={styles.spinner} />
                            Analyzing...
                        </span>
                    ) : (
                        'Review with AI ✨'
                    )}
                </button>
            </div>

            {showError && (
                <p className={styles.errorText}>
                    Please enter a valid GitHub URL (e.g. https://github.com/user/repo)
                </p>
            )}

            {loading && (
                <div className={styles.loadingBar}>
                    <div className={styles.loadingFill} />
                </div>
            )}

            {loading && (
                <p className={styles.loadingMsg}>
                    🤖 Fetching repository and running AI review... (up to 15 seconds)
                </p>
            )}
        </div>
    );
}
