import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoContent } from '@/lib/github';
import { reviewRepo } from '@/lib/aiReview';
import { recordAttempt } from '@/lib/firestore';
import { WEEK_MAP } from '@/lib/missions';
import { ReviewRequest, ReviewResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: ReviewRequest = await request.json();
        const { repoUrl, weekId, taskId } = body;

        // Validate inputs
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

        // Step 1: Fetch repo content from GitHub
        let repoContent;
        try {
            repoContent = await fetchRepoContent(repoUrl);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub repository';
            return NextResponse.json<ReviewResponse>(
                { success: false, error: msg },
                { status: 422 }
            );
        }

        // Step 2: AI Review
        let reviewResult;
        try {
            reviewResult = await reviewRepo(repoContent, task.label, task.requirements);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'AI review failed. Please try again.';
            return NextResponse.json<ReviewResponse>(
                { success: false, error: msg },
                { status: 500 }
            );
        }

        // Step 3: Record attempt and update state
        const { state, unlocked } = await recordAttempt(
            weekId,
            taskId,
            reviewResult.total_score,
            repoUrl,
            reviewResult
        );

        return NextResponse.json<ReviewResponse>({
            success: true,
            result: reviewResult,
            updatedState: state,
            unlocked,
        });
    } catch (err) {
        console.error('[/api/review] Unexpected error:', err);
        return NextResponse.json<ReviewResponse>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
