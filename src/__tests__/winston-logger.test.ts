import { log, logError, logId, logLabel } from 'vintasend';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import * as winston from 'winston';
import { WinstonLogger } from '../index';

vi.mock('winston', () => ({
  createLogger: vi.fn(),
  transports: {
    Console: vi.fn(),
  },
  format: {
    simple: vi.fn(),
  },
}));

describe('WinstonLogger', () => {
  let mockLogger: { info: Mock; error: Mock; warn: Mock; add: Mock };
  let winstonLogger: WinstonLogger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      add: vi.fn(),
    };
    (winston.createLogger as Mock).mockReturnValue(mockLogger);
    winstonLogger = new WinstonLogger();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default options', () => {
    expect(winston.createLogger).toHaveBeenCalledWith({});
  });

  it('should initialize with custom options', () => {
    const options = { level: 'info' };
    new WinstonLogger(options);
    expect(winston.createLogger).toHaveBeenCalledWith(options);
  });

  it('should add console transport in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    new WinstonLogger();

    expect(winston.transports.Console).toHaveBeenCalledWith({
      format: undefined, // because format.simple() is mocked
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should log info messages', () => {
    winstonLogger.info(log`Sent notification ${logId('123')} via ${logLabel('sendgrid')}`);
    expect(mockLogger.info).toHaveBeenCalledWith('Sent notification 123 via sendgrid');
  });

  it('should log error messages', () => {
    winstonLogger.error(log`Failed to send notification ${logId('123')}`);
    expect(mockLogger.error).toHaveBeenCalledWith('Failed to send notification 123');
  });

  it('should log warning messages', () => {
    winstonLogger.warn(log`Retrying notification ${logId('123')}`);
    expect(mockLogger.warn).toHaveBeenCalledWith('Retrying notification 123');
  });

  it('should not write error messages to winston', () => {
    const error = Object.assign(
      new Error('Could not deliver to Jane Synthetic <jane.synthetic@example.com>'),
      { status: 400 },
    );

    winstonLogger.error(log`Failed to send notification ${logId('123')}: ${logError(error)}`);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to send notification 123: Error (status 400)',
    );
    const written = JSON.stringify(mockLogger.error.mock.calls);
    expect(written).not.toContain('Jane Synthetic');
    expect(written).not.toContain('jane.synthetic@example.com');
  });
});
