import { Logger } from './logger';
import * as winston from 'winston';
import { injectable } from 'inversify';

@injectable()
export class DefaultLogger implements Logger {
  private logger: any;

  constructor() {

    this.logger = (winston as any).createLogger({
      level: 'debug',
      format: (winston as any).format.json(),
      transports: [
        new winston.transports.Console({
          format: (winston as any).format.simple(),
        }),
      ],
    });
  }

  log(level: string, message: string, ...args: any[]): void {
    this.logger.log(level, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

}
