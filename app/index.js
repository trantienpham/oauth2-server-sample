import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import createRouter, { swaggerDocument } from "router/v1";

export default function createApp(config, logger, model) {
  const app = express();
  const v1Router = createRouter(model);

  app.use(helmet());
  app.use(express.json({ limit: "1mb", strict: true }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api/v1", v1Router);

  const server = app.listen(config.port, () => {
    logger.info(`Server Listening At ${config.port}`);
  });

  return { app, server };
}
