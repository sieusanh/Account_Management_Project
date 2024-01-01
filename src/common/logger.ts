import { createLogger, format, transports } from 'winston';
const { combine, label, timestamp, printf } = format;
const LOG_FILE_PATH = 'logs/events.log';

function logger(labelString: string) {
    return createLogger({
        format: combine(
            label({ label: labelString }),
            timestamp(),
            printf(({ level, message, label, timestamp }) =>
                `${timestamp} [${label}] ${level}: ${message}`)
        ),
        transports: [
            ...(process.env.NODE_ENV !== 'production')
                ? [new transports.Console()]
                : [new transports.File({
                    level: 'info',
                    filename: LOG_FILE_PATH,
                    maxsize: 5242880, // 5MB
                    maxFiles: 50
                })]
        ]
    });
}

export default logger;
