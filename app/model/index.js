import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { split, isNil, join } from "lodash";
import createOAuthClientModel from "model/oauth_clients";
import createOAuthUserModel from "model/oauth_users";
import createOAuthTokenModel from "model/oauth_tokens";
import createOAuthAuthorizationCodeModel from "model/oauth_authorization_codes";
import createDefaultClientsIfNotExist from "model/seeds/create_client";
import createDefaultUsersIfNotExist from "model/seeds/create_user";

// create database
function createDbConnection(config) {
  return new Sequelize(
    config.database.name,
    config.database.username,
    config.database.password,
    config.database.options
  );
}
// create model base on schemas declared
function createModels(dbConnection, salt) {
  const Clients = createOAuthClientModel(dbConnection, Sequelize);
  const Users = createOAuthUserModel(dbConnection, Sequelize);
  const Tokens = createOAuthTokenModel(dbConnection, Sequelize);
  const AuthorizationCodes = createOAuthAuthorizationCodeModel(
    dbConnection,
    Sequelize
  );
  const model = {
    // used by the authorization code grant and the password grant.
    getAccessToken(accessToken) {
      return Tokens.findOne({ where: { accessToken } }).then(token => {
        if (!isNil(token)) {
          return {
            ...token.toJSON(),
            client: { id: token.clientId },
            user: { id: token.userId }
          };
        }
      });
    },
    getClient(clientId, clientSecret) {
      const where = isNil(clientSecret)
        ? { clientId }
        : { clientId, clientSecret };
      return Clients.findOne({ where }).then(client => {
        if (!isNil(client)) {
          return {
            ...client.toJSON(),
            id: client.clientId, // this property is used for the authorization_code grant type
            redirectUris: split(client.redirectUris, ","),
            grants: split(client.grants, ",")
          };
        }
        return client;
      });
    },
    saveToken(token, client, user) {
      return Tokens.create({
        clientId: client.clientId,
        userId: user.id,
        accessToken: token.accessToken,
        authorizationCode: token.authorizationCode,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt
      }).then(() => ({
        client: { id: client.clientId },
        user: { id: user.id },
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt
      }));
    },

    // the authorization code grant
    getAuthorizationCode(authorizationCode) {
      return AuthorizationCodes.findOne({ where: { authorizationCode } }).then(
        code => {
          if (!isNil(code)) {
            return {
              ...code.toJSON(),
              client: { id: code.clientId },
              user: { id: code.userId },
              expiresAt: new Date(code.expiresAt)
            };
          }
          return code;
        }
      );
    },
    saveAuthorizationCode(code, client, user) {
      return AuthorizationCodes.create({
        clientId: client.clientId,
        userId: user.id,
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri
      });
    },
    revokeAuthorizationCode({ authorizationCode }) {
      return AuthorizationCodes.destroy({ where: { authorizationCode } }).then(
        removed => !!removed
      );
    },

    // the password grant
    getUser(username, password) {
      const where = { username };
      if (!isNil(password)) {
        where.password = bcrypt.hashSync(password, salt);
      }
      return Users.findOne({ where }).then(user => {
        if (!isNil(user)) {
          return {
            id: user.id,
            userId: user.id,
            username: user.username
          };
        }
        return user;
      });
    },

    // the client credentials grant type
    getUserFromClient(client) {
      return Users.findOne({ where: { id: client.userId } });
    },

    // export additional methods to create Client and User
    createClient(client) {
      client.redirectUris = join(client.redirectUris, ",");
      client.grants = join(client.grants, ",");
      return Clients.create(client);
    },
    createUser(user) {
      if (!isNil(user) && !isNil(user.password)) {
        user.password = bcrypt.hashSync(user.password, salt);
      }
      return Users.create(user);
    }
  };
  return model;
}

function initDbConnectionAndModels(config) {
  const dbConnection = createDbConnection(config);
  const model = createModels(dbConnection, config.salt);
  return dbConnection
    .sync(config.database.options.sync)
    .then(() => createDefaultUsersIfNotExist(model))
    .then(([admin, user]) => createDefaultClientsIfNotExist(model, admin, user))
    .then(() => ({ dbConnection, model }));
}

export { createDbConnection, createModels, initDbConnectionAndModels };
