import { Logger } from '../../core/logging/logger';

export class TestLogger implements Logger {
  log(level: string, message: string, ...args: any[]): void {
    console.log(`${level}:${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }
}
