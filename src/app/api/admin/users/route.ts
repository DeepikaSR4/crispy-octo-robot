import { NextRequest, NextResponse } from 'next/server';
import { authFromRequest } from '@/lib/auth';
import { getAllUsers } from '@/lib/firestore';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';

export async function GET(request: NextRequest) {
    try {
        const { email } = await authFromRequest(request);

        if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: admin access only' },
                { status: 403 }
            );
        }

        const users = await getAllUsers();
        return NextResponse.json({ success: true, users });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        const status = message.includes('Authorization') ? 401 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
