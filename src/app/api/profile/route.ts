import { NextResponse } from 'next/server';

// This endpoint is deprecated — user profile (name, photo) now comes from Google Auth.
export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Deprecated: profile is managed via Google Auth' },
        { status: 410 }
    );
}
