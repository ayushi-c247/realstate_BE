import path from 'node:path';

import { OK } from '@constants';
import type { ICustomError } from '@customTypes';
import cors from 'cors';
import dotenv from 'dotenv';
// Third-party libraries
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import helmet from 'helmet';
import env from '@config/envVar';
import { indexRoute } from '@routes';
import { errorMiddleware } from '@middlewares';
// import { registerCrons } from './jobs/scheduler';

dotenv.config();

/**
 * Creates and configures an Express application.
 *
 * - Sets up static file serving for the public directory.
 * - Uses Helmet for security hardening.
 * - Configures JSON parsing with a custom raw body verification.
 * - Enables CORS with allowed origins and methods.
 * - Configures session management using express-session.
 * - Initializes and configures Passport for authentication.
 * - Defines the root route and main API routes.
 * - Sets up Swagger for API documentation.
 * - Includes error handling middleware.
 *
 * @returns {express.Express} The configured Express application.
 */

const createApp = () => {
  const app = express();
  // Serve static files from 'public' folder
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(helmet());
  app.use(
    express.json({
      limit: env.EXPRESS_JSON_LIMIT,
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error(`CORS blocked: ${origin}`);
          // callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,POST,PUT,PATCH,DELETE',
      // credentials: true // if you need cookies/authorization headers
    }),
  );

  // Serve the 'public' folder as static
  app.use(express.static('public'));

  // Root route
  app.get('/', async (_req: express.Request, res: express.Response) => {
    res.status(OK).send('*** Hello 👋 from Api server ***');
  });

  // registerCrons();

  // Define main routes
  // /v1/api/auth/login
  app.use('/', indexRoute);

  app.get('/api', (_req, res) => {
    res.send('Hello ✋ Realstate BE 🚀🥳🎉');
  });

  // Error handling middleware
  app.use(errorMiddleware);

  app.use(
    (err: ICustomError, _req: Request, res: Response, _next: NextFunction) => {
      const response = res.status(err.statusCode);
      if (
        err.sendErrMsgToCaller === true &&
        err.message !== null &&
        err.message !== ''
      ) {
        response.json(err.message);
        return;
      }
      response.send();
    },
  );

  return app;
};
export { createApp };
