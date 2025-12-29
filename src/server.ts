// Third-party libraries
import 'module-alias/register'; // Import at the top
import env from '@config/envVar';
import dotenv from 'dotenv';
import { createApp } from './app';
import './types/common.type';
import { logger } from '@config/logger';
dotenv.config();
const port: number = Number(env.PORT);

/**
 * Initializes the application by connecting to the database and starting the server.
 *
 * This function will exit the process if connecting to the database fails.
 */
const run = async (): Promise<void> => {
  try {
    logger.info('********************** HI, ✋😃 ********************** Testing deployment new changes');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(`Could not connect to: ${env.MONGODB_URI} : ${errorMessage}`);
    process.exit(1);
  }
  await startApplication();
};
/**
 * Starts the Express server by making it listen on the specified port.
 *
 * This function will trigger the {@link onServerListen} callback when the server
 * is successfully listening.
 */
const startApplication = async (): Promise<void> => {
  createApp().listen(port, () => onServerListen());
};

/**
 * Logs a message when the Express server is successfully listening on the specified port.
 *
 * @remarks This function is called by {@link startApplication} when the server is ready.
 */
const onServerListen = async (): Promise<void> => {
  console.info(`Express server is up and running at ${port} 🚀`);
};

(async () => {
  await run();
})();
