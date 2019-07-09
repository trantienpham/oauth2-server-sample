import { merge } from "lodash";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import config from "../../config";
import createLogger from "../../lib/logger";

chai.use(chaiAsPromised);
const should = chai.should();

describe("Model", () => {
  describe("initDbConnectionAndModels()", () => {
    it("should initialize connection successful", done => {
      const logger = createLogger(config);
      const { initDbConnectionAndModels } = require("../index");
      const clonedConfig = merge(
        { database: { options: { logging: () => {} } } },
        config
      );

      initDbConnectionAndModels(clonedConfig, logger)
        .then(result => {
          should.exist(result.dbConnection);
          should.exist(result.model);
          done();
        })
        .catch(done);
    });
  });
  describe("createDbConnection()", () => {
    it("should return instance of sequelize successful", () => {
      const { createDbConnection } = require("../index");
      const clonedConfig = merge(
        { database: { options: { logging: () => {} } } },
        config
      );
      const dbConnection = createDbConnection(clonedConfig);
      should.exist(dbConnection);
    });
  });
  describe("createModels()", () => {
    it("should return model successful", () => {
      const { createDbConnection, createModels } = require("../index");
      const clonedConfig = merge(
        { database: { options: { logging: () => {} } } },
        config
      );
      const dbConnection = createDbConnection(clonedConfig);
      const model = createModels(dbConnection);
      should.exist(dbConnection);
      should.exist(model);
      should.exist(model.getAccessToken);
      should.exist(model.getClient);
      should.exist(model.saveToken);
      should.exist(model.getAuthorizationCode);
      should.exist(model.saveAuthorizationCode);
      should.exist(model.revokeAuthorizationCode);
      should.exist(model.getUser);
      should.exist(model.getUserFromClient);
      should.exist(model.createClient);
      should.exist(model.createUser);
    });
    describe("getAccessToken()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const handler = model.getAccessToken("accessToken");

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("getClient()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const handler = model.getClient("clientId", "clientSecret");

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("saveToken()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const token = {
          accessToken: "accessToken",
          accessTokenExpiresAt: new Date(),
          refreshToken: "refreshToken",
          refreshTokenExpiresAt: new Date()
        };
        const client = { clientId: "clientId1" };
        const user = { id: "user1" };
        const handler = model.saveToken(token, client, user);

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("getAuthorizationCode()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const handler = model.getAuthorizationCode("code");

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("saveAuthorizationCode()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const code = {
          authorizationCode: "code",
          expiresAt: new Date(),
          redirectUri: "http://localhost"
        };
        const client = {
          clientId: "3647dfd8-b77e-4df8-a62a-a51433b3355b"
        };
        const user = {
          id: "3647dfd8-b77e-4df8-a62a-a51433b3355b"
        };
        const handler = model.saveAuthorizationCode(code, client, user);

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("revokeAuthorizationCode()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const handler = model.revokeAuthorizationCode({
          authorizationCode: "code"
        });

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("getUser()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const salt =
          "$2b$12$65E6uaPdXdZhEzijgdfQyemCj9inE4ceO4NiCP3DV2fuT0E6lAm0q";
        const model = createModels(dbConnection, salt);
        const handler = model.getUser("username", "password");

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("getUserFromClient()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const model = createModels(dbConnection);
        const handler = model.getUserFromClient({ userId: "userId" });

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("createClient()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const salt =
          "$2b$12$65E6uaPdXdZhEzijgdfQyemCj9inE4ceO4NiCP3DV2fuT0E6lAm0q";
        const model = createModels(dbConnection, salt);
        const client = {
          clientId: "3647dfd8-b77e-4df8-a62a-a51433b3355d",
          clientSecret: "446d98d2437951e3b85e53478b1a72b45a406cfe",
          redirectUris: ["http://localhost:7474/callback"],
          grants: ["authorization_code", "password", "client_credentials"],
          userId: "3647dfd8-b77e-4df8-a62a-a51433b3355c"
        };
        const handler = model.createClient(client);

        handler.should.be.fulfilled.and.notify(done);
      });
    });
    describe("createUser()", () => {
      it("should return a promise", done => {
        const { createDbConnection, createModels } = require("../index");
        const clonedConfig = merge(
          { database: { options: { logging: () => {} } } },
          config
        );
        const dbConnection = createDbConnection(clonedConfig);
        const salt =
          "$2b$12$65E6uaPdXdZhEzijgdfQyemCj9inE4ceO4NiCP3DV2fuT0E6lAm0q";
        const model = createModels(dbConnection, salt);
        const user = {
          username: "user1" + Date.now(),
          password: "p@ssword"
        };
        const handler = model.createUser(user);

        handler.should.be.fulfilled.and.notify(done);
      });
    });
  });
});
