declare module 'canvas-confetti' {
    interface Options {
        particleCount?: number;
        angle?: number;
        spread?: number;
        startVelocity?: number;
        decay?: number;
        gravity?: number;
        drift?: number;
        flat?: boolean;
        ticks?: number;
        origin?: { x?: number; y?: number };
        colors?: string[];
        shapes?: string[];
        zIndex?: number;
        disableForReducedMotion?: boolean;
        useWorker?: boolean;
        resize?: boolean;
        canvas?: HTMLCanvasElement | null;
        scalar?: number;
    }

    type ConfettiCannon = (options?: Options) => Promise<null> | null;

    const confetti: ConfettiCannon & {
        reset: () => void;
        create: (canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean }) => ConfettiCannon;
    };

    export default confetti;
}
