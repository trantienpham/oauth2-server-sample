const express = require("express");
const request = require("request");
const { isNil } = require("lodash");
const app = express();
const port = 7474;
const state = "foobar";
const idProvider = "http://localhost:7475";
const clientId = "3647dfd8-b77e-4df8-a62a-a51433b3355b";
const clientSecret = "446d98d2437951e3b85e53478b1a72b45a406cfe";
const callbackUrl = `http://localhost:${port}/callback`;
const tokenUrl = `${idProvider}/token`;
const authorizeUrl = `${idProvider}/authorize`;
const authenticateUrl = `${idProvider}/authenticate`;

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "1mb", strict: true }));

// DEMO the authorization code grant type
app.get("/callback", (req, res, next) => {
  const code = req.query.code;
  request.post(
    {
      url: tokenUrl,
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl,
        code
      }
    },
    (error, response, body) => {
      if (error) next(error);
      else {
        const { access_token, token_type } = JSON.parse(body);
        res
          .status(302)
          .set(
            "Location",
            `http://localhost:7474/users?access_token=${access_token}&token_type=${token_type}`
          )
          .end();
      }
    }
  );
});
app.get(
  "/users",
  (req, res, next) => {
    const authorization =
      req.get("Authorization") ||
      `${req.query.token_type} ${req.query.access_token}`;
    const matches = authorization.match(/Bearer\s(\S+)/);
    if (matches) {
      request.get(
        authenticateUrl,
        { headers: { Authorization: authorization } },
        error => {
          if (error && error.error) res.json(error);
          else next(); // authenticated
        }
      );
    } else {
      const loginUrl = `${authorizeUrl}?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&state=${state}`;
      res.redirect(loginUrl);
    }
  },
  (req, res) => res.json([{ id: 1, name: "user1" }, { id: 2, name: "user2" }])
);
// ========================================

// Demo the password grant type
app.get("/login", (req, res) => {
  const loginForm = `
  <html>
  <head>
    <title>Login</title>
  </head>
  <body>
    <form action="/login" method="post">
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
      </div>
    </form>
  </body>
  </html>
  `;
  res.set("Content-Type", "text/html").send(loginForm);
});
app.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  request.post(
    {
      url: tokenUrl,
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "password",
        username,
        password
      }
    },
    (error, response, body) => {
      if (error) next(error);
      else res.json(body);
    }
  );
});
// ========================================

// Demo the client credetial grant type
app.get("/token", (req, res, next) => {
  request.post(
    {
      url: tokenUrl,
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials"
      }
    },
    (error, response, body) => {
      if (error) next(error);
      else res.json(body);
    }
  );
});
// ========================================

app.listen(port, error => {
  if (!isNil(error)) {
    console.error(error);
    process.exit();
  }
  console.log(`Server is listening at ${port}`);
});
