import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { HealthCheckResponse } from '../types';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     description: Check if the API is running and basic services are available
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "OK"
 *               timestamp: "2023-06-25T10:30:00.000Z"
 *               services:
 *                 database: "connected"
 *                 groq: "available"
 *               version: "1.0.0"
 *               uptime: 3600
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthResponse: HealthCheckResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        groq: 'available',
      },
      version: '1.0.0',
      uptime: process.uptime(),
    };

    const allServicesUp = Object.values(healthResponse.services).every(
      status => status === 'connected' || status === 'available'
    );

    if (!allServicesUp) {
      healthResponse.status = 'ERROR';
    }

    const responseTime = Date.now() - startTime;
    
    logger.info('Health check completed', {
      status: healthResponse.status,
      responseTime: `${responseTime}ms`,
      services: healthResponse.services,
    });

    // Return appropriate status code
    const statusCode = healthResponse.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Health check failed', { error: errorMessage });
    
    const errorResponse: HealthCheckResponse = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        groq: 'unavailable',
      },
      version: '1.0.0',
      uptime: process.uptime(),
    };

    res.status(503).json(errorResponse);
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     tags: [Health]
 *     description: Get detailed information about system health, services, and performance
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [OK, ERROR]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 responseTime:
 *                   type: string
 *                   example: "45ms"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: string
 *                   example: "3600s"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         state:
 *                           type: string
 *                           enum: [connected, disconnected, connecting, disconnecting]
 *                         host:
 *                           type: string
 *                         name:
 *                           type: string
 *                         port:
 *                           type: number
 *                     groq:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         apiKey:
 *                           type: string
 *                 system:
 *                   type: object
 *                   properties:
 *                     nodeVersion:
 *                       type: string
 *                     platform:
 *                       type: string
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         external:
 *                           type: number
 *       503:
 *         description: System unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Detailed health check endpoint
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();

    // Check MongoDB connection with detailed info
    const dbConnectionState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbStatus = dbStates[dbConnectionState] || 'unknown';
    const dbDetails = {
      state: dbStatus,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
    };

    const groqDetails = {
      status: 'available',
      apiKey: process.env.GROQ_API_KEY ? 'configured' : 'not_configured',
    };

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
    };

    const responseTime = Date.now() - startTime;

    const detailedResponse = {
      status: dbStatus === 'connected' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      uptime: `${Math.floor(process.uptime())}s`,
      services: {
        database: dbDetails,
        groq: groqDetails,
      },
      system: systemInfo,
    };

    logger.info('Detailed health check completed', {
      responseTime: `${responseTime}ms`,
      dbStatus,
    });

    const statusCode = detailedResponse.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(detailedResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Detailed health check failed', { error: errorMessage });
    
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      version: '1.0.0',
    });
  }
});

router.get('/database', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();

    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const responseTime = Date.now() - startTime;

    const dbResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: collections.length,
      },
    };

    logger.info('Database health check completed', {
      responseTime: `${responseTime}ms`,
      collections: collections.length,
    });

    res.status(200).json(dbResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Database health check failed', { error: errorMessage });
    
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: errorMessage,
      },
    });
  }
});

router.get('/ready', async (req: Request, res: Response): Promise<void> => {
  try {
    const dbReady = mongoose.connection.readyState === 1;
    
    if (!dbReady) {
      throw new Error('Database not ready');
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
  }
});

router.get('/live', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter }; 