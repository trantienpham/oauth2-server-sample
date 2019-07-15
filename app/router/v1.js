import express from "express";
import createOAuthServer from "lib/oauth2-server";

export const swaggerDocument = require("./swagger.json");
export const baseApiUrl = '/api/v1';

export default function createRouter(model) {
  const router = express.Router();
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
  const oauth2Server = createOAuthServer(model);
  router.get("/login", (req, res) => {
    const { client_id, redirect_uri, response_type, state } = req.query;
    res
      .set("Content-Type", "text/html")
      .send(loginForm(client_id, redirect_uri, response_type, state));
  });
  router.post("/token", oauth2Server.token);
  router.get("/authorize", oauth2Server.authorize);
  router.post("/authorize", oauth2Server.authorize);
  router.get("/authenticate", oauth2Server.authenticate, (req, res) =>
    res.json(req.token)
  );
  // handle errors
  router.use((error, req, res, next) => {
    if (error instanceof oauth2Server.UnauthorizedRequestError) {
      const { client_id, redirect_uri, response_type, state } =
        req.method === "POST" ? req.body : req.query;
      res.redirect(
        `${baseApiUrl}/login?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&state=${state}`
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

  return router;
}
