export default function createOAuthAuthorizationCodeModel(dbConnection, type) {
  return dbConnection.define(
    "oauth_authorization_codes",
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
      authorizationCode: {
        type: type.STRING(100),
        unique: true,
        allowNull: false,
        field: "authorization_code"
      },
      expiresAt: {
        type: type.DATE,
        allowNull: false,
        field: "expires_at"
      },
      redirectUri: {
        type: type.TEXT,
        allowNull: false,
        field: "redirect_uri"
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["authorization_code"]
        }
      ]
    }
  );
}
