import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 1000000,
      // level: 'info',
    }),
    new winston.transports.File({
      filename: 'logs/app.verbose.log',
      maxsize: 1000000,
      level: 'verbose',
    }),
  ],
});

export default logger;
