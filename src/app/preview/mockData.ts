import { UserState, AIReviewResult } from '@/types';

const mockReviewResult: AIReviewResult = {
    total_score: 42,
    breakdown: {
        code_structure: 6,
        architecture: 6,
        clean_code: 5,
        scalability: 5,
        documentation: 6,
        error_handling: 5,
        product_thinking: 5,
        performance: 4,
    },
    strengths: [
        'Clean separation between presentation, domain, and data layers',
        'Consistent MVVM pattern applied throughout the codebase',
        'Excellent README with architecture diagram and scalability notes',
    ],
    improvements: [
        {
            problem: 'No unit tests for the ViewModel layer',
            why: 'Business logic in ViewModels is the most critical part to test — bugs here affect the entire UI',
            how: 'Add XCTestCase files for each ViewModel, mock your service layer using protocols',
        },
        {
            problem: 'Error states use generic "Something went wrong" messages',
            why: 'Users need actionable feedback to understand what failed and how to recover',
            how: 'Map each error type to a specific user-facing message with a retry CTA',
        },
    ],
    growth_focus: ['Unit Testing', 'Error UX', 'Async Architecture'],
};

export const MOCK_STATE: UserState = {
    currentWeek: 4,
    unlockedWeeks: [1, 2, 3, 4],
    xp: 318,
    level: 'Product Engineer',
    badgesEarned: ['Foundation Knight', 'System Builder', 'AI Tactician', 'Product Engineer'],
    taskAttempts: {
        w1a: {
            best_score: 42,
            attempts: [
                { score: 28, timestamp: '2026-01-06T10:30:00Z', repoUrl: 'https://github.com/devuser/flutter-arch-refactor', reviewResult: mockReviewResult },
                { score: 35, timestamp: '2026-01-07T14:00:00Z', repoUrl: 'https://github.com/devuser/flutter-arch-refactor', reviewResult: mockReviewResult },
                { score: 42, timestamp: '2026-01-08T09:15:00Z', repoUrl: 'https://github.com/devuser/flutter-arch-refactor-v2', reviewResult: mockReviewResult },
            ],
        },
        w1b: {
            best_score: 38,
            attempts: [
                { score: 31, timestamp: '2026-01-09T11:00:00Z', repoUrl: 'https://github.com/devuser/swiftui-notes-app', reviewResult: mockReviewResult },
                { score: 38, timestamp: '2026-01-10T16:30:00Z', repoUrl: 'https://github.com/devuser/swiftui-notes-app', reviewResult: mockReviewResult },
            ],
        },
        w2a: {
            best_score: 44,
            attempts: [
                { score: 39, timestamp: '2026-01-14T10:00:00Z', repoUrl: 'https://github.com/devuser/flutter-perf-opt', reviewResult: mockReviewResult },
                { score: 44, timestamp: '2026-01-15T13:45:00Z', repoUrl: 'https://github.com/devuser/flutter-perf-opt', reviewResult: mockReviewResult },
            ],
        },
        w2b: {
            best_score: 40,
            attempts: [
                { score: 33, timestamp: '2026-01-16T09:00:00Z', repoUrl: 'https://github.com/devuser/swiftui-login-dashboard', reviewResult: mockReviewResult },
                { score: 40, timestamp: '2026-01-17T14:00:00Z', repoUrl: 'https://github.com/devuser/swiftui-login-dashboard', reviewResult: mockReviewResult },
            ],
        },
        w3a: {
            best_score: 41,
            attempts: [
                { score: 36, timestamp: '2026-01-21T11:00:00Z', repoUrl: 'https://github.com/devuser/flutter-ai-chat', reviewResult: mockReviewResult },
                { score: 41, timestamp: '2026-01-22T15:00:00Z', repoUrl: 'https://github.com/devuser/flutter-ai-chat', reviewResult: mockReviewResult },
            ],
        },
        w3b: {
            best_score: 43,
            attempts: [
                { score: 43, timestamp: '2026-01-23T10:00:00Z', repoUrl: 'https://github.com/devuser/swiftui-ai-chat', reviewResult: mockReviewResult },
            ],
        },
        w4a: {
            best_score: 39,
            attempts: [
                { score: 32, timestamp: '2026-01-28T09:00:00Z', repoUrl: 'https://github.com/devuser/flutter-onboarding-v2', reviewResult: mockReviewResult },
                { score: 39, timestamp: '2026-01-29T11:30:00Z', repoUrl: 'https://github.com/devuser/flutter-onboarding-v2', reviewResult: mockReviewResult },
            ],
        },
        w4b: {
            best_score: 31,
            attempts: [
                { score: 31, timestamp: '2026-01-30T14:00:00Z', repoUrl: 'https://github.com/devuser/swiftui-habit-tracker', reviewResult: mockReviewResult },
            ],
        },
    },
};
