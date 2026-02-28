import { NextRequest, NextResponse } from 'next/server';
import { getUserState } from '@/lib/firestore';
import { StateResponse } from '@/types';

export async function GET() {
    try {
        const state = await getUserState();
        return NextResponse.json<StateResponse>({ success: true, state });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const code = (err as { code?: string })?.code ?? 'unknown';
        console.error('[GET /api/state]', err);
        return NextResponse.json<StateResponse>(
            { success: false, error: `Firestore error [${code}]: ${message}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { updateDoc } = await import('firebase/firestore');
        const { doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const body = await request.json();
        await updateDoc(doc(db, 'levelup', 'main_user'), body);
        const state = await getUserState();
        return NextResponse.json<StateResponse>({ success: true, state });
    } catch (err) {
        console.error('[POST /api/state]', err);
        return NextResponse.json<StateResponse>(
            { success: false, error: 'Failed to update state' },
            { status: 500 }
        );
    }
}
