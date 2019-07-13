import config from "config";
import { initDbConnectionAndModels } from "model";
import createApp from "app";
import createLogger from "lib/logger";

const logger = createLogger(config);
const handleExit = (dbConnection, logger) =>
  dbConnection.close().then(() => {
    logger.info("Closed database");
    process.exit();
  });

initDbConnectionAndModels(config, logger)
  .then(({ dbConnection, model }) => {
    createApp(config, logger, model);

    process.on("SIGINT", () => handleExit(dbConnection, logger));
    process.on("SIGTERM", () => handleExit(dbConnection, logger));
    process.on("uncaughtException", logger.error);
  })
  .catch(logger.error);
