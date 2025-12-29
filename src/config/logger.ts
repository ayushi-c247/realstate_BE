import { commonHandler } from '@utils';

export const logger = {
  log: (message: string) => {
    if (commonHandler.isLogger) {
      logger.info(`[LOG]: ${message}`);
    }
  },
  error: (error: Error | string) => {
    if (commonHandler.isLogger) {
      console.error(`[ERROR]: ${error}`);
    }
  },
  info: (info: string) => {
    if (commonHandler.isLogger) {
      console.info(`[INFO]: ${info}`);
    }
  },
};
