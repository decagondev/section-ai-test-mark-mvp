import { Router, Request, Response, NextFunction } from 'express';
import { gradingService } from '../services/gradingService';
import { Submission } from '../models/Submission';
import { MarkerUser } from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

async function getUserFromToken(req: Request, res: Response, next: Function) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const token = auth.slice(7);
    const jwtSecret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, jwtSecret) as any;
    const user = await MarkerUser.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function requireAdmin(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

/**
 * @swagger
 * /api/submissions/grade:
 *   post:
 *     summary: Submit repository for grading
 *     tags: [Submissions]
 *     description: Submit a GitHub repository URL for automated grading and analysis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeRequest'
 *     responses:
 *       202:
 *         description: Submission accepted for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submissionId:
 *                   type: string
 *                   example: "60d5ecb54b24a1001f5d2c8e"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/grade', getUserFromToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { githubUrl, rubric, projectType, fileGlobs } = req.body;
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Received projectType from body:', projectType);
    const submission = new Submission({
      githubUrl,
      rubric,
      projectType,
      userId,
      status: 'uploading',
      grade: 'pending',
      metadata: {
        projectType,
        dependencies: [],
        testResults: { passed: 0, total: 0, details: '-', duration: 0 },
        aiAnalysis: { promptTokens: 0, completionTokens: 0, analysisTime: 0, modelUsed: 'mock' }
      }
    });
    await submission.save();

    console.log('[SUBMISSION RECEIVED]', { id: submission._id, projectType: (submission as any).metadata?.projectType });

    gradingService.gradeSubmission(submission, fileGlobs)
      .then(async (result) => {
        submission.status = 'completed';
        submission.grade = result.grade;
        submission.scores = result.scores;
        submission.report = result.report;
        console.log('[SUBMISSION GRADED]', {
          id: submission._id,
          scores: result.scores,
          grade: result.grade,
          report: result.report?.slice(0, 200)
        });
        await submission.save();
      })
      .catch(async (error) => {
        submission.status = 'failed';
        submission.error = error.message;
        await submission.save();
      });

    res.status(202).json({ submissionId: submission._id });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get all submissions
 *     tags: [Submissions]
 *     description: Retrieve a list of submissions with optional filtering
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploading, installing, testing, reviewing, reporting, completed, failed]
 *         description: Filter by submission status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of submissions to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of submissions to skip
 *     responses:
 *       200:
 *         description: List of submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, status, limit = 50, skip = 0 } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const userIds = [...new Set(submissions.map((s: any) => s.userId))];
    const users = await MarkerUser.find({ _id: { $in: userIds } }, 'email');
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.email]));

    const submissionsWithEmail = submissions.map((s: any) => ({
      ...s.toObject(),
      userEmail: userMap[s.userId] || s.userId
    }));

    res.json(submissionsWithEmail);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 *     description: Retrieve detailed information about a specific submission
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    res.json(submission);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

router.get('/:id/report.md', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission || !submission.report) {
      res.status(404).send('Report not found');
      return;
    }
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="submission-${submission._id}.md"`);
    res.send(submission.report);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

router.patch('/:id', getUserFromToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, grade, error } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (status) submission.status = status;
    if (grade) submission.grade = grade;
    if (error) submission.error = error;
    await submission.save();
    return res.json(submission);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update submission' });
  }
});

router.delete('/:id', getUserFromToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    return res.json({ message: 'Submission deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export { router as submissionRouter }; 