import express from "express";
import helmet from "helmet";
import createOAuthServer from "./lib/oauth2-server";

const loginForm = (client_id, redirect_uri, response_type, state) =>
  `
<html>
<head>
  <title>Login</title>
</head>
<body>
  <form action="/authorize">
    <div>
      <lable>Username:</label> &nbsp;
      <input type="text" name="username" value=""/>
    </div>
    <div>
      <lable>Password:</label> &nbsp;
      <input type="text" name="password" value=""/>
    </div>
    <div>
      <input type="submit" value="Submit"/>
      <input type="hidden" name="client_id" value="${client_id}"/>
      <input type="hidden" name="redirect_uri" value="${redirect_uri}"/>
      <input type="hidden" name="response_type" value="${response_type}"/>
      <input type="hidden" name="state" value="${state}"/>
    </div>
  </form>
</body>
</html>
`;

export default function createApp(config, logger, model) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb", strict: true }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  const oauth2Server = createOAuthServer(model);
  app.get("/login", (req, res) => {
    const { client_id, redirect_uri, response_type, state } = req.query;
    res
      .set("Content-Type", "text/html")
      .send(loginForm(client_id, redirect_uri, response_type, state));
  });
  app.post("/token", oauth2Server.token);
  app.get("/authorize", oauth2Server.authorize);
  app.post("/authorize", oauth2Server.authorize);
  app.get("/authenticate", oauth2Server.authenticate, (req, res) =>
    res.json(req.token)
  );
  // handle errors
  app.use((error, req, res, next) => {
    if (error instanceof oauth2Server.UnauthorizedRequestError) {
      const { client_id, redirect_uri, response_type, state } =
        req.method === "POST" ? req.body : req.query;
      res.redirect(
        `/login?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&state=${state}`
      );
      return;
    }
    if (error) {
      res
        .status(error.code || error.statusCode || error.status)
        .json({ error: error.name, error_description: error.message });
      return;
    }
    next();
  });

  const server = app.listen(config.port, () => {
    logger.info(`Server Listening At ${config.port}`);
  });

  return { app, server };
}
