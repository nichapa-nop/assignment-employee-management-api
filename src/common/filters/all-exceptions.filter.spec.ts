import {
  ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(url = '/api/employees') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', originalUrl: url }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

function createHttpError(statusCode: number, message: string, expose: boolean) {
  return Object.assign(new Error(message), { statusCode, expose });
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  let loggerError: jest.SpyInstance;

  beforeEach(() => {
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the status and message of an HttpException', () => {
    const { host, status, json } = createHost('/api/employees/999');

    filter.catch(new NotFoundException('Employee not found'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'Employee not found',
        path: '/api/employees/999',
      }),
    );
  });

  it('returns validation messages as an array', () => {
    const { host, json } = createHost();
    const messages = ['name should not be empty'];

    filter.catch(new BadRequestException(messages), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: messages }),
    );
  });

  it('maps body-parser client errors to their own status', () => {
    const { host, status, json } = createHost();

    filter.catch(createHttpError(413, 'request entity too large', true), host);

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Payload Too Large',
        message: 'request entity too large',
      }),
    );
    expect(loggerError).not.toHaveBeenCalled();
  });

  it('hides the message of non-exposed http errors', () => {
    const { host, json } = createHost();

    filter.catch(createHttpError(503, 'pool exhausted', false), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        message: 'Internal server error',
      }),
    );
  });

  it('returns a generic 500 for unexpected errors and logs them', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('connection refused at 10.0.0.5'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: 'Internal server error',
      }),
    );
    expect(loggerError).toHaveBeenCalled();
  });
});
