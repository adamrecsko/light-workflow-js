export const LOGGER = Symbol('LOGGER');

export interface Logger {
  log(level: string, message: string, ...args: any[]): void;

  debug(message: string, ...args: any[]): void;

  info(message: string, ...args: any[]): void;

  warn(message: string, ...args: any[]): void;

  error(message: string, ...args: any[]): void;
}