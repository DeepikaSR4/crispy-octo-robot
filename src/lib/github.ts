import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface RepoContent {
    owner: string;
    repo: string;
    readme: string;
    fileTree: string[];
    sourceFiles: { path: string; content: string }[];
}

function parseRepoUrl(url: string): { owner: string; repo: string } {
    // Support: https://github.com/owner/repo or https://github.com/owner/repo.git
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/);
    if (!match) throw new Error('Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repo');
    return { owner: match[1], repo: match[2] };
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
    try {
        const { data } = await octokit.repos.getReadme({ owner, repo });
        return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
        return '(No README found)';
    }
}

async function fetchFileTree(owner: string, repo: string): Promise<string[]> {
    try {
        const { data } = await octokit.git.getTree({
            owner,
            repo,
            tree_sha: 'HEAD',
            recursive: '1',
        });
        return data.tree
            .filter((item) => item.type === 'blob')
            .map((item) => item.path ?? '')
            .filter(Boolean)
            .slice(0, 100); // cap at 100 paths
    } catch {
        return [];
    }
}

const SOURCE_EXTENSIONS = ['.dart', '.swift', '.ts', '.tsx', '.js', '.kt', '.py'];
const SKIP_PATHS = ['node_modules', '.dart_tool', 'build/', 'Pods/', '.git/', 'Packages/'];

function isSourceFile(path: string): boolean {
    const ext = SOURCE_EXTENSIONS.find((e) => path.endsWith(e));
    const skip = SKIP_PATHS.some((s) => path.includes(s));
    return !!ext && !skip;
}

async function fetchSourceFiles(
    owner: string,
    repo: string,
    fileTree: string[]
): Promise<{ path: string; content: string }[]> {
    const candidates = fileTree.filter(isSourceFile).slice(0, 8);
    const results: { path: string; content: string }[] = [];

    for (const filePath of candidates) {
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
            if ('content' in data && data.encoding === 'base64') {
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                results.push({ path: filePath, content: content.slice(0, 3000) }); // cap per file
            }
        } catch {
            // skip unreadable files
        }
    }

    return results;
}

export async function fetchRepoContent(repoUrl: string): Promise<RepoContent> {
    const { owner, repo } = parseRepoUrl(repoUrl);

    const [readme, fileTree] = await Promise.all([
        fetchReadme(owner, repo),
        fetchFileTree(owner, repo),
    ]);

    const sourceFiles = await fetchSourceFiles(owner, repo, fileTree);

    return { owner, repo, readme, fileTree, sourceFiles };
}
