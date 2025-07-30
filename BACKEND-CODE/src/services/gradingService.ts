import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Submission } from '../models/Submission';
import { openaiService } from './openaiService';

const execPromise = util.promisify(exec);

interface GradingResult {
  grade: 'pass' | 'fail';
  scores: {
    total: number;
    testScore: number;
    qualityScore: number;
    breakdown: any[];
  };
  report: string;
}

export class GradingService {
  async gradeSubmission(submission: any, fileGlobs?: string[]): Promise<GradingResult> {
    const tempDir = path.join(__dirname, `../../tmp/${submission._id}`);
    try {
      await this.cloneRepository(submission.githubUrl, tempDir);

      let npmRegistryData = {};
      try {
        const pkgPath = path.join(tempDir, 'package.json');
        const pkgRaw = await fs.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(pkgRaw);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        npmRegistryData = await fetchNpmVersions(allDeps);
      } catch (e) {
        npmRegistryData = { error: 'Could not read or parse package.json' };
      }

      await execPromise('npm install', { cwd: tempDir });

      const testResult = await this.runTests(tempDir);

      if (submission.metadata?.projectType === 'c') {
        const qualityResult = await openaiService.analyzeCode(tempDir, {}, submission.rubric, fileGlobs, npmRegistryData, 'c');
        const testScore = 0;
        type CQualityResult = { codeSmellScore: number; codeQualityScore: number; report: string };
        const cQualityResult = qualityResult as CQualityResult;
        let qualityScore = cQualityResult.codeQualityScore ?? 0;
        let codeSmellScore = cQualityResult.codeSmellScore ?? 0;
        if (!qualityScore || !codeSmellScore) {
          const extracted = extractScoresFromReport(cQualityResult.report || '');
          if (!qualityScore) qualityScore = extracted.codeQualityScore;
          if (!codeSmellScore) codeSmellScore = extracted.codeSmellScore;
        }
        const totalScore = qualityScore;
        const breakdown = Array.isArray(qualityResult.breakdown) && qualityResult.breakdown.length > 0
          ? qualityResult.breakdown
          : [
              { category: 'Code Quality', score: qualityScore, maxScore: 100, feedback: 'LLM code quality score' },
              { category: 'Code Smell', score: codeSmellScore, maxScore: 100, feedback: 'LLM code smell score' }
            ];
        const reportWithScores = `# Grading Report\n\n**Code Quality Score:** ${qualityScore} / 100  \n**Code Smell Score:** ${codeSmellScore} / 100\n\n${qualityResult.report}`;
        return {
          grade: totalScore >= 70 ? 'pass' : 'fail',
          scores: {
            total: totalScore,
            testScore,
            qualityScore,
            breakdown
          },
          report: reportWithScores
        };
      }

      const testScore = this.calculateTestScore(testResult);
      const qualityResult = await openaiService.analyzeCode(tempDir, {}, submission.rubric, fileGlobs, npmRegistryData, submission.projectType);
      const qualityScore = qualityResult.score ?? 0;
      const totalScore = (testScore * 0.8) + (qualityScore * 0.2);
      const report = this.generateReport(testResult, qualityResult);
      return {
        grade: totalScore >= 70 ? 'pass' : 'fail',
        scores: { total: totalScore, testScore, qualityScore, breakdown: [] },
        report
      };
    } catch (error: any) {
      throw new Error(`Grading failed: ${error.message}`);
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.warn('Cleanup failed:', cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr));
      }
    }
  }

  private async cloneRepository(url: string, dest: string): Promise<void> {
    await execPromise(`git clone ${url} ${dest}`);
  }

  private async runTests(cwd: string): Promise<any> {
    try {
      const { stdout } = await execPromise('npm test', { cwd });
      return this.parseTestResults(stdout);
    } catch (error: any) {
      return { passed: 0, total: 0, details: error.message };
    }
  }

  private parseTestResults(output: string): any {
    const passedMatch = output.match(/(\d+) passing/);
    const failedMatch = output.match(/(\d+) failing/);
    return {
      passed: parseInt(passedMatch?.[1] || '0'),
      total: parseInt(passedMatch?.[1] || '0') + parseInt(failedMatch?.[1] || '0'),
      details: output
    };
  }

  private calculateTestScore(testResult: any): number {
    return testResult.total > 0 ? (testResult.passed / testResult.total) * 100 : 0;
  }

  private generateReport(testResult: any, qualityResult: any): string {
    return `# Grading Report\n\n## Test Results\n- Passed: ${testResult.passed}/${testResult.total}\n\n## Code Quality\n${qualityResult.report}`;
  }
}

export const gradingService = new GradingService();

async function fetchNpmVersions(deps: Record<string, string>): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const fetch = (await import('node-fetch')).default;
  await Promise.all(Object.keys(deps || {}).map(async (dep) => {
    try {
      const res = await fetch(`https://registry.npmjs.org/${dep}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      result[dep] = data['dist-tags']?.latest || 'unknown';
    } catch {
      result[dep] = 'unknown';
    }
  }));
  return result;
}

function extractScoresFromReport(report: string): { codeQualityScore: number, codeSmellScore: number } {
  let codeQualityScore = 0;
  let codeSmellScore = 0;
  const qualityMatch = report.match(/Code Quality Score: (\d{1,3})\/100/i) ||
                       report.match(/\|\s*Code Quality\s*\|\s*(\d{1,3})\s*\|/i);
  const smellMatch = report.match(/Code Smell Score: (\d{1,3})\/100/i) ||
                     report.match(/\|\s*Code Smell\s*\|\s*(\d{1,3})\s*\|/i);
  if (qualityMatch) codeQualityScore = parseInt(qualityMatch[1], 10);
  if (smellMatch) codeSmellScore = parseInt(smellMatch[1], 10);
  return { codeQualityScore, codeSmellScore };
} 