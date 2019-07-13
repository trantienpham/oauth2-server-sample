import chai from "chai";
import chaiHttp from "chai-http";
import createApp from "../index";

chai.use(chaiHttp);
chai.should();

describe("app without real database", function() {
  describe("POST /token", function() {
    it("should return ok - http status 200 with the password grant", function(done) {
      const model = {
        getClient() {
          return { clientId: "clientId1", grants: ["password"] };
        },
        getUser() {
          return { id: "user1" };
        },
        saveToken(token, client, user) {
          return { accessToken: "accessToken", client, user };
        }
      };
      const config = { port: 3000 };
      const logger = {
        info() {},
        error(e) {
          done(e);
        }
      };
      const { app, server } = createApp(config, logger, model);
      const requester = chai.request(app).keepOpen();
      requester
        .post("/token")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          client_id: 1234,
          client_secret: "secret",
          grant_type: "password",
          username: "foo",
          password: "pass"
        })
        .then(res => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("access_token");
          res.body.should.have.property("token_type");
        })
        .catch(e => logger.error(e))
        .finally(() => {
          requester.close();
          server.close(done);
        });
    });
    it("should return ok - http status 200 with the authorization code grant", function(done) {
      const model = {
        getClient() {
          return {
            id: "clientId1",
            clientId: "clientId1",
            grants: ["authorization_code"]
          };
        },
        getAuthorizationCode(authorizationCode) {
          return {
            client: { id: "clientId1" },
            user: { id: "user1" },
            authorizationCode,
            expiresAt: new Date(new Date().getTime() + 10000),
            redirectUri: "http://example.com/cb"
          };
        },
        revokeAuthorizationCode() {
          return true;
        },
        saveToken(token, client, user) {
          return { accessToken: "accessToken", client, user };
        }
      };
      const config = { port: 3000 };
      const logger = {
        info() {},
        error(e) {
          done(e);
        }
      };
      const { app, server } = createApp(config, logger, model);
      const requester = chai.request(app).keepOpen();
      requester
        .post("/token")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          client_id: 1234,
          client_secret: "secret",
          grant_type: "authorization_code",
          code: "code",
          redirect_uri: "http://example.com/cb"
        })
        .then(res => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("access_token");
          res.body.should.have.property("token_type");
        })
        .catch(e => logger.error(e))
        .finally(() => {
          requester.close();
          server.close(done);
        });
    });
  });
  describe("GET /authorize", function() {
    it("should redirect to login page without access_token or username/password", function(done) {
      const model = {
        getAccessToken: function() {
          return {
            user: {},
            accessTokenExpiresAt: new Date(new Date().getTime() + 10000)
          };
        },
        getClient: function() {
          return {
            grants: ["authorization_code"],
            redirectUris: ["http://example.com/callback"]
          };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        },
        getUser: function() {
          return {};
        }
      };
      const config = { port: 3000 };
      const logger = {
        info() {},
        error(e) {
          done(e);
        }
      };
      const { app, server } = createApp(config, logger, model);
      const requester = chai.request(app).keepOpen();
      requester
        .get("/authorize")
        .set("content-type", "application/json")
        .query({
          client_id: 1234,
          client_secret: "secret",
          response_type: "code",
          redirect_uri: "http://example.com/callback",
          state: "foobar"
        })
        .redirects(0)
        .catch(e => e.response)
        .then(res => {
          res.should.have.status(302);
          res.should.have.header(
            "location",
            "/login?client_id=1234&redirect_uri=http://example.com/callback&response_type=code&state=foobar"
          );
        })
        .finally(() => {
          requester.close();
          server.close(done);
        });
    });
  });
});
