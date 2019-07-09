export default function createOAuthTokenModel(dbConnection, type) {
  return dbConnection.define(
    "oauth_tokens",
    {
      id: {
        type: type.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: type.UUIDV4()
      },
      clientId: {
        type: type.UUID,
        allowNull: false,
        field: "client_id"
      },
      userId: {
        type: type.UUID,
        allowNull: false,
        field: "user_id"
      },
      accessToken: {
        type: type.TEXT,
        allowNull: false,
        field: "access_token"
      },
      accessTokenExpiresAt: {
        type: type.DATE,
        allowNull: false,
        field: "access_token_expires_at"
      },
      refreshToken: {
        type: type.TEXT,
        allowNull: true,
        field: "refresh_token"
      },
      refreshTokenExpiresAt: {
        type: type.DATE,
        allowNull: true,
        field: "refresh_token_expires_at"
      },
      authorizationCode: {
        type: type.STRING(100),
        allowNull: true,
        field: "authorization_code"
      }
    },
    {
      timestamps: false
    }
  );
}
