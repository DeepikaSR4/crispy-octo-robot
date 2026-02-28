import { NextRequest, NextResponse } from 'next/server';
import { getUserState, setUserState } from '@/lib/firestore';

export async function POST(request: NextRequest) {
    try {
        const { userName } = await request.json();
        if (!userName || typeof userName !== 'string' || userName.trim().length < 2) {
            return NextResponse.json({ success: false, error: 'Invalid name' }, { status: 400 });
        }

        const state = await getUserState();
        state.userName = userName.trim();
        await setUserState(state);

        return NextResponse.json({ success: true, state });
    } catch (err) {
        console.error('[POST /api/profile]', err);
        return NextResponse.json({ success: false, error: 'Failed to save name' }, { status: 500 });
    }
}
