import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIReviewResult, ReviewBreakdown } from '@/types';
import { RepoContent } from '@/lib/github';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildPrompt(
    repoContent: RepoContent,
    taskLabel: string,
    requirements: string[]
): string {
    const fileTreeStr = repoContent.fileTree.slice(0, 50).join('\n');
    const sourceFilesStr = repoContent.sourceFiles
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
        .join('\n\n');

    return `You are an expert senior software engineer and technical reviewer conducting a structured code review.

## Task Being Reviewed
**${taskLabel}**

## Requirements Checklist
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## Repository: ${repoContent.owner}/${repoContent.repo}

### README
${repoContent.readme.slice(0, 3000)}

### File Structure
\`\`\`
${fileTreeStr}
\`\`\`

### Source Files
${sourceFilesStr}

---

## Your Task
Review this repository against the requirements above. Provide a structured JSON assessment.

Score each category from 0–7 (total across all 8 = max 56, but your final total_score must be out of 50):

- **code_structure** (0–7): Folder organization, separation of concerns
- **architecture** (0–7): Pattern usage, codebase scalability
- **clean_code** (0–7): Readability, naming, no duplication
- **scalability** (0–7): How well this could grow
- **documentation** (0–7): README quality, code comments
- **error_handling** (0–7): All error/edge cases handled
- **product_thinking** (0–7): User experience and practical value considered
- **performance** (0–7): Efficiency, no obvious bottlenecks

After scoring, normalize the sum to be out of 50.

Return ONLY valid JSON (no markdown, no explanation):
{
  "total_score": <number 0-50>,
  "breakdown": {
    "code_structure": <0-7>,
    "architecture": <0-7>,
    "clean_code": <0-7>,
    "scalability": <0-7>,
    "documentation": <0-7>,
    "error_handling": <0-7>,
    "product_thinking": <0-7>,
    "performance": <0-7>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    {
      "problem": "<what's missing or wrong>",
      "why": "<why this matters>",
      "how": "<concrete fix with code direction>"
    }
  ],
  "growth_focus": ["<focus area 1>", "<focus area 2>", "<focus area 3>"]
}`;
}

function parseAIResponse(text: string): AIReviewResult {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const breakdown: ReviewBreakdown = {
        code_structure: Number(parsed.breakdown?.code_structure ?? 0),
        architecture: Number(parsed.breakdown?.architecture ?? 0),
        clean_code: Number(parsed.breakdown?.clean_code ?? 0),
        scalability: Number(parsed.breakdown?.scalability ?? 0),
        documentation: Number(parsed.breakdown?.documentation ?? 0),
        error_handling: Number(parsed.breakdown?.error_handling ?? 0),
        product_thinking: Number(parsed.breakdown?.product_thinking ?? 0),
        performance: Number(parsed.breakdown?.performance ?? 0),
    };

    // Normalize total_score to be out of 50
    const rawSum = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const normalizedScore = Math.round((rawSum / 56) * 50);

    return {
        total_score: normalizedScore,
        breakdown,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        growth_focus: Array.isArray(parsed.growth_focus) ? parsed.growth_focus : [],
    };
}

export async function reviewRepo(
    repoContent: RepoContent,
    taskLabel: string,
    requirements: string[]
): Promise<AIReviewResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(repoContent, taskLabel, requirements);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return parseAIResponse(text);
}
