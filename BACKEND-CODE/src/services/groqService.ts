import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface CodeAnalysis {
  score: number;
  report: string;
}

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error('GROQ_API_KEY environment variable is not set');
}
const groq = new Groq({ apiKey: groqApiKey as string });

export const groqService = {
  async analyzeCode(repoPath: string, testResult: any, rubric?: any): Promise<CodeAnalysis> {
    const files = await readRepoFiles(repoPath);
    const prompt = buildPrompt(files, testResult, rubric);

    try {
      const response = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      });

      const analysis = JSON.parse(response.choices[0].message.content as string);
      return {
        score: analysis.score || 0,
        report: analysis.report || 'No analysis provided'
      };
    } catch (error: any) {
      return {
        score: 0,
        report: `AI analysis failed: ${error.message}`
      };
    }
  }
};

async function readRepoFiles(repoPath: string): Promise<string> {
  let fileContents = '';
  let count = 0;
  async function readDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (count >= 20) break;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await readDir(fullPath);
      } else if (entry.isFile() && /\.(js|ts|tsx)$/.test(entry.name)) {
        let content = await fs.readFile(fullPath, 'utf-8');
        if (content.length > 10000) content = content.slice(0, 10000) + '\n// ...truncated...';
        fileContents += `// ${entry.name}\n${content}\n\n`;
        count++;
      }
    }
  }
  await readDir(repoPath);
  return fileContents;
}

function buildPrompt(files: string, testResult: any, rubric?: any): string {
  return `
You are an expert code reviewer for educational projects. Analyze the following code for quality, best practices, and maintainability. Consider the test results and (if provided) the rubric. Return a JSON with a score (0-100) and a markdown report with educational feedback.

## Code
${files}

## Test Results
${JSON.stringify(testResult, null, 2)}

## Rubric
${rubric ? JSON.stringify(rubric, null, 2) : 'Default grading criteria'}

## Output Format
{
  "score": number,
  "report": "# Code Quality Report\n\n..."
}
`;
} 