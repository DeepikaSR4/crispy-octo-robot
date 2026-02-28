'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserState } from '@/types';
import Header from '@/components/Dashboard/Header';
import XPProgressBar from '@/components/Dashboard/XPProgressBar';
import WeekTimeline from '@/components/Dashboard/WeekTimeline';
import BadgeDisplay from '@/components/Dashboard/BadgeDisplay';
import MotivationalQuote from '@/components/Dashboard/MotivationalQuote';
import OnboardingModal from '@/components/UI/OnboardingModal';
import styles from './page.module.css';

export default function DashboardPage() {
  const [state, setState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (!data.success || !data.state) throw new Error(data.error ?? 'Failed to load state');
      setState(data.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadState(); }, [loadState]);

  function handleOnboardingComplete(name: string) {
    if (state) setState({ ...state, userName: name });
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <div className={styles.loadingText}>Loading your evolution data...</div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorTitle}>Failed to Load Dashboard</div>
        <div className={styles.errorDesc}>{error}</div>
        <div className={styles.errorHint}>
          Make sure your <code>.env.local</code> file has valid Firebase credentials, then refresh.
        </div>
        <button className={styles.retryBtn} onClick={loadState}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {/* Show onboarding modal on first visit (no userName stored yet) */}
      {!state.userName && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className={styles.page}>
        <Header state={state} />
        <main className={styles.main}>
          <section className={styles.section}>
            <XPProgressBar state={state} />
          </section>

          <section className={styles.section}>
            <MotivationalQuote state={state} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionLabel}>4-Week Evolution Timeline — click a week to start</div>
            <WeekTimeline state={state} selectedWeek={state.currentWeek} />
          </section>

          <section className={styles.section}>
            <BadgeDisplay state={state} />
          </section>
        </main>
      </div>
    </>
  );
}
