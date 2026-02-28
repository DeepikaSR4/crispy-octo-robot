import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoContent } from '@/lib/github';
import { reviewRepo } from '@/lib/aiReview';
import { recordAttempt } from '@/lib/firestore';
import { authFromRequest } from '@/lib/auth';
import { WEEK_MAP } from '@/lib/missions';
import { ReviewRequest, ReviewResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { uid, displayName, email, photoUrl } = await authFromRequest(request);

        const body: ReviewRequest = await request.json();
        const { repoUrl, weekId, taskId } = body;

        if (!repoUrl || !weekId || !taskId) {
            return NextResponse.json<ReviewResponse>(
                { success: false, error: 'Missing required fields: repoUrl, weekId, taskId' },
                { status: 400 }
            );
        }

        const week = WEEK_MAP[weekId];
        if (!week) {
            return NextResponse.json<ReviewResponse>(
                { success: false, error: `Invalid weekId: ${weekId}` },
                { status: 400 }
            );
        }

        const task = taskId === 'a' ? week.taskA : week.taskB;

        // Step 1: Fetch GitHub repo content
        let repoContent;
        try {
            repoContent = await fetchRepoContent(repoUrl);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub repository';
            return NextResponse.json<ReviewResponse>({ success: false, error: msg }, { status: 422 });
        }

        // Step 2: AI Review
        let reviewResult;
        try {
            reviewResult = await reviewRepo(repoContent, task.label, task.requirements);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'AI review failed. Please try again.';
            return NextResponse.json<ReviewResponse>({ success: false, error: msg }, { status: 500 });
        }

        // Step 3: Record attempt under uid
        const { state, unlocked } = await recordAttempt(
            uid,
            weekId,
            taskId,
            reviewResult.total_score,
            repoUrl,
            reviewResult,
            { userName: displayName, email, photoURL: photoUrl }
        );

        return NextResponse.json<ReviewResponse>({
            success: true,
            result: reviewResult,
            updatedState: state,
            unlocked,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        const status = message.includes('Authorization') ? 401 : 500;
        return NextResponse.json<ReviewResponse>({ success: false, error: message }, { status });
    }
}
