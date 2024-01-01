import 'dotenv/config';
import express from 'express';
import { ErrorHandler } from './common/handler.errors';
import registerAccountRouter from './accounts/accounts.router';
import logger from './common/logger';
import configApp from './common/app.config';
const log = logger('Application');

const app = express();
function bootstrap() {

    // Common middleware
    configApp(app);

    // Register routers
    registerAccountRouter(app);

    // Error handling middleware
    ErrorHandler(app);

    // Run app
    const PORT = parseInt(process.env.PORT) || 3000;
    const HOST = process.env.HOST || '127.0.0.1';
    app.listen(PORT, HOST, () => {
        log.info(`Running Node.js version ${process.version}`);
        log.info(`App environment: ${process.env.NODE_ENV}`);
        log.info(`App is running on port ${PORT}`);
    }).on('error', err => {
        log.error(`Application error:  ${err}`);
    });
}

bootstrap();

export default app;