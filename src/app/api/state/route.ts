import { NextRequest, NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/auth';
import { getUserState } from '@/lib/firestore';
import { StateResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { uid, displayName, email, photoUrl } = await authFromRequest(request);
        const state = await getUserState(uid, {
            userName: displayName,
            email,
            photoURL: photoUrl,
        });
        return NextResponse.json<StateResponse>({ success: true, state });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json<StateResponse>(
            { success: false, error: message },
            { status: err instanceof Error && message.includes('Authorization') ? 401 : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { uid } = await authFromRequest(request);
        const { updateDoc } = await import('firebase/firestore');
        const { doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const body = await request.json();
        await updateDoc(doc(db, 'levelup', uid), body);
        const state = await getUserState(uid);
        return NextResponse.json<StateResponse>({ success: true, state });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json<StateResponse>({ success: false, error: message }, { status: 500 });
    }
}
