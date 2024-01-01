import { Application, Request, Response, NextFunction } from 'express';
import { NotFoundError, ApplicationError, DuplicateError } from './app.errors';
import { ErrorObject } from './interfaces';
import { ErrorCode } from './constants';
import logger from './logger';

function ErrorHandler(app: Application) {

    // Default 
    app.use(() => {
        throw new NotFoundError('Route is not defined.');
    });

    // Request error handler
    app.use((
        error: ApplicationError,
        _req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        if (error instanceof ApplicationError) {
            if (error.message) {
                return res.status(error.code).json({ message: error.message });
            }
            return res.sendStatus(error.code);
        }
        next(error);
    });

    // Log all errors
    app.use(function (
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const userString = 'unknown user';
        const log = logger('LogError');

        if (err instanceof Error) {
            log.error(
                `${req.method} ${req.path}: Unhandled request error ${userString}. ${err.message}`,
            );
        } else if (typeof err === 'string') {
            log.error(
                `${req.method} ${req.path}: Unhandled request error ${userString}. ${err}`,
            );
        }

        next(err);
    });

    // Optional fallthrough error handler
    app.use(function (
        err: Error,
        _req: Request,
        res: Response,
        _next: NextFunction,
    ) {
        res.statusCode = 500;
        res.json({ message: err.message });
    });

    // Application level error handler
    process.on('unhandledRejection', (error, promise) => {
        throw error;
    });

    process.on('uncaughtException', async (error) => {
        const log = logger('ApplicationError');
        const defaultMessage = 'Something went wrong!';

        if (error instanceof Error) {
            log.error(error?.message || defaultMessage);
        } else if (typeof error === 'string') {
            log.error(error || defaultMessage);
        }

        // process.exit(1);
    });
}

function RepositoryCatcher(error: ErrorObject) {
    const { code, message } = error;
    const { PG_DUPLICATE_VALUE } = ErrorCode;
    switch (code) {
        case PG_DUPLICATE_VALUE: {
            return new DuplicateError(message);
        }
        default: {
            break;
        }
    }
}

export { ErrorHandler, RepositoryCatcher }
