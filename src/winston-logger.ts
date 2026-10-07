import type { BaseLogger, LogMessage } from 'vintasend';
import { renderLogMessage } from 'vintasend';

import * as winston from 'winston';

export class WinstonLogger implements BaseLogger {
  private logger: winston.Logger;

  constructor(winstonOptions?: Parameters<typeof winston.createLogger>[0]) {
    this.logger = winston.createLogger(winstonOptions || {});

    if (process.env.NODE_ENV === 'development') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }

  info(message: LogMessage): void {
    this.logger.info(renderLogMessage(message));
  }

  error(message: LogMessage): void {
    this.logger.error(renderLogMessage(message));
  }

  warn(message: LogMessage): void {
    this.logger.warn(renderLogMessage(message));
  }
}
