import OAuth2Server from "oauth2-server";
import createOAuthServer from "lib/oauth2-server";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const should = chai.should();
const { OAuthError, InvalidArgumentError } = OAuth2Server;

describe("oauth2-server", function() {
  it("should throw an error if `model` is missing", function() {
    try {
      createOAuthServer({});
    } catch (e) {
      e.should.be.an.instanceOf(InvalidArgumentError);
      e.message.should.equal("Missing parameter: `model`");
    }
  });
  it("should return the `model` has 3 functions `token`, `authenticate` and `authorize`", function() {
    const oauthServer = createOAuthServer({ model: {} });

    should.exist(oauthServer.token);
    should.exist(oauthServer.authenticate);
    should.exist(oauthServer.authorize);
  });

  describe("token()", function() {
    it("should response token with the password grant type", function(done) {
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
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          grant_type: "password",
          username: "foo",
          password: "pass"
        },
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "transfer-encoding": "chunked"
        },
        method: "POST",
        query: {}
      };
      const res = {
        body: {},
        headers: {},
        set() {},
        json(token) {
          token.should.have.property("access_token");
          token.access_token.should.equal("accessToken");
          done();
        }
      };

      server.token(req, res, () => {});
    });
    it("should response token with the authorization_code grant type", function(done) {
      const model = {
        getClient() {
          return { id: "clientId1", grants: ["authorization_code"] };
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
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          grant_type: "authorization_code",
          code: "code",
          redirect_uri: "http://example.com/cb"
        },
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "transfer-encoding": "chunked"
        },
        method: "POST",
        query: {}
      };
      const res = {
        body: {},
        headers: {},
        set() {},
        json(token) {
          token.should.have.property("access_token");
          token.access_token.should.equal("accessToken");
          done();
        }
      };

      server.token(req, res, () => {});
    });
    it("should throw error on next function", function(done) {
      const model = {
        getClient() {
          return Promise.reject(new OAuthError("throw error"));
        },
        getUser() {
          return {};
        },
        saveToken() {
          return { accessToken: "accessToken", client: {}, user: {} };
        },
        validateScope() {
          return "foo";
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          grant_type: "password",
          username: "foo",
          password: "pass",
          scope: "foo"
        },
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "transfer-encoding": "chunked"
        },
        method: "POST",
        query: {}
      };
      const res = { body: {}, headers: {} };
      const next = e => {
        e.should.be.an.instanceOf(OAuthError);
        e.message.should.equal("throw error");
        done();
      };

      server.token(req, res, next);
    });
    it("should return a promise", function(done) {
      const model = {
        getClient: function() {
          return { grants: ["password"] };
        },
        getUser: function() {
          return {};
        },
        saveToken: function() {
          return { accessToken: 1234, client: {}, user: {} };
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          grant_type: "password",
          username: "foo",
          password: "pass"
        },
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "transfer-encoding": "chunked"
        },
        method: "POST",
        query: {}
      };
      const res = {
        body: {},
        headers: {},
        set() {},
        json() {}
      };
      const next = () => {};
      const handler = server.token(req, res, next);

      handler.should.be.fulfilled.and.notify(done);
    });
  });

  describe("authorize()", function() {
    it("should response 302 and location", function(done) {
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
            redirectUris: ["http://example.com/cb"]
          };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        },
        getUser: function() {
          return {};
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          response_type: "code"
        },
        headers: { Authorization: "Bearer foo" },
        method: {},
        query: { state: "foobar" }
      };
      const res = {
        body: {},
        headers: {},
        status(status) {
          this.$status = status;
          return this;
        },
        set(headers) {
          this.headers = headers;
          return this;
        },
        end() {
          this.$status.should.equal(302);
          this.headers.should.have.property("location");
          this.headers.location.should.equal(
            "http://example.com/cb?code=123&state=foobar"
          );
          done();
        }
      };
      const next = () => {};
      server.authorize(req, res, next);
    });
    it("should throw error on next function", function(done) {
      const model = {
        getAccessToken: function() {
          return Promise.reject(new OAuthError("miss Authorization"));
        },
        getClient: function() {
          return {
            grants: ["authorization_code"],
            redirectUris: ["http://example.com/cb"]
          };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        },
        getUser: function() {
          return {};
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          response_type: "code"
        },
        headers: { Authorization: "Bearer foo" },
        method: "GET",
        query: { state: "foobar" }
      };
      const res = {
        body: {},
        headers: {}
      };
      const next = e => {
        e.should.be.an.instanceOf(OAuthError);
        e.message.should.equal("miss Authorization");
        done();
      };
      server.authorize(req, res, next);
    });
    it("should return a promise", function(done) {
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
            redirectUris: ["http://example.com/cb"]
          };
        },
        saveAuthorizationCode: function() {
          return { authorizationCode: 123 };
        },
        getUser: function() {
          return {};
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {
          client_id: 1234,
          client_secret: "secret",
          response_type: "code"
        },
        headers: { Authorization: "Bearer foo" },
        method: {},
        query: { state: "foobar" }
      };
      const res = {
        body: {},
        headers: {},
        status() {
          return this;
        },
        set() {
          return this;
        },
        end() {}
      };
      const next = () => {};
      const handler = server.authorize(req, res, next);

      handler.should.be.fulfilled.and.notify(done);
    });
  });

  describe("authenticate()", function() {
    it("should assign user into request and call next function", function(done) {
      const model = {
        getAccessToken: function() {
          return {
            user: {},
            accessTokenExpiresAt: new Date(new Date().getTime() + 10000)
          };
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {},
        headers: { Authorization: "Bearer foo" },
        method: {},
        query: {}
      };
      const res = {
        body: {},
        headers: {}
      };
      const next = e => {
        should.not.exist(e);
        should.exist(req.token);
        done();
      };
      server.authenticate(req, res, next);
    });
    it("should throw error on next function", function(done) {
      const model = {
        getAccessToken: function() {
          return Promise.reject(new OAuthError("miss Authorization"));
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {},
        headers: { Authorization: "Bearer foo" },
        method: {},
        query: {}
      };
      const res = {
        body: {},
        headers: {}
      };
      const next = e => {
        e.should.be.an.instanceOf(OAuthError);
        e.message.should.equal("miss Authorization");
        done();
      };
      server.authenticate(req, res, next);
    });
    it("should assign user into request and call next function", function(done) {
      const model = {
        getAccessToken: function() {
          return {
            user: {},
            accessTokenExpiresAt: new Date(new Date().getTime() + 10000)
          };
        }
      };
      const server = createOAuthServer(model);
      const req = {
        body: {},
        headers: { Authorization: "Bearer foo" },
        method: {},
        query: {}
      };
      const res = {
        body: {},
        headers: {}
      };
      const next = () => {};
      const handler = server.authenticate(req, res, next);

      handler.should.be.fulfilled.and.notify(done);
    });
  });
});
