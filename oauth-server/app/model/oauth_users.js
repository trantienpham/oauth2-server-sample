export default function createOAuthUserModel(dbConnection, type) {
  return dbConnection.define(
    "oauth_users",
    {
      id: {
        type: type.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: type.UUIDV4()
      },
      username: {
        type: type.STRING(128),
        unique: true,
        allowNull: false
      },
      password: {
        type: type.STRING(64),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );
}
