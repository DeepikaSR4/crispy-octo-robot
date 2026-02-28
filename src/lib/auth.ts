/**
 * Server-side Firebase ID token verification.
 * Uses Firebase's public REST API — no service account needed.
 */

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

interface TokenInfo {
    uid: string;
    email: string;
    displayName: string;
    photoUrl?: string;
}

export async function verifyIdToken(idToken: string): Promise<TokenInfo> {
    const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        }
    );

    if (!res.ok) {
        throw new Error(`Token verification failed: ${res.status}`);
    }

    const data = await res.json();
    const user = data.users?.[0];

    if (!user) throw new Error('Invalid token: user not found');

    return {
        uid: user.localId,
        email: user.email ?? '',
        displayName: user.displayName ?? user.email ?? 'User',
        photoUrl: user.photoUrl,
    };
}

/**
 * Extract and verify the Bearer token from an Authorization header.
 */
export async function authFromRequest(
    request: Request
): Promise<TokenInfo> {
    const header = request.headers.get('Authorization') ?? '';
    if (!header.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }
    const token = header.slice(7);
    return verifyIdToken(token);
}
