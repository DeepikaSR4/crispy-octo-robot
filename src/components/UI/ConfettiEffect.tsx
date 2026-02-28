'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
    trigger: boolean;
}

export default function ConfettiEffect({ trigger }: Props) {
    useEffect(() => {
        if (!trigger) return;

        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#c084fc', '#818cf8', '#fbbf24', '#34d399', '#f472b6'],
        });

        const timer = setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.4, x: 0.3 },
                colors: ['#c084fc', '#7c3aed', '#a78bfa'],
            });
        }, 400);

        const timer2 = setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.4, x: 0.7 },
                colors: ['#fbbf24', '#fb923c', '#34d399'],
            });
        }, 700);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, [trigger]);

    return null;
}
