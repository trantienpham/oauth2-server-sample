import config from "../config";
import GRANT_TYPES from "./grant_type";
import Hashids from "hashids";

const hashids = new Hashids(config.hashIdsSalt, config.hashIdsLength);

export default function createOAuthClientModel(dbConnection, type) {
  return dbConnection.define(
    "oauth_clients",
    {
      clientId: {
        type: type.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: type.UUIDV4(),
        field: "client_id"
      },
      clientSecret: {
        type: type.STRING(128),
        allowNull: false,
        defaultValue: function() {
          return hashids.encode(
            Date.now(),
            Math.floor(Math.random(1000) * 1000 + 1)
          );
        },
        field: "client_secret"
      },
      redirectUris: {
        type: type.TEXT,
        allowNull: false,
        field: "redirect_uris"
      },
      grants: {
        type: type.TEXT,
        allowNull: false,
        field: "grants",
        defaultValue: `${GRANT_TYPES.authorization_code},${
          GRANT_TYPES.password
        }`
      },
      userId: {
        type: type.UUID,
        allowNull: false,
        field: "user_id"
      }
    },
    {
      timestamps: false
    }
  );
}
