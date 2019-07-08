import config from './app/config';
import {initDbConnectionAndModels} from './app/model';
import createApp from './app';
import createLogger from './app/lib/logger';

const logger = createLogger(config);
const handleExit = (dbConnection, logger) => dbConnection.close().then(() => {
  logger.info('Closed database');
  process.exit();
});

initDbConnectionAndModels(config, logger)
  .then(({dbConnection, model}) => {
    createApp(config, logger, model);

    process.on('SIGINT', () => handleExit(dbConnection, logger));
    process.on('SIGTERM', () => handleExit(dbConnection, logger));
    process.on('uncaughtException', logger.error);
  })
  .catch(logger.error);