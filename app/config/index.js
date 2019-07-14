require("dotenv").config();
export default {
  port: process.env.PORT,

  hashIdsSalt: process.env.HASHIDS_SALT,
  hashIdsLength: parseInt(process.env.HASHIDS_LENGTH),
  salt: process.env.SALT,

  database: {
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    options: {
      host: process.env.DATABASE_HOST,
      dialect: process.env.DATABASE_TYPE,
      pool: {
        max: parseInt(process.env.DATABASE_POOL_MAX),
        min: parseInt(process.env.DATABASE_POOL_MIN),
        acquire: process.env.DATABASE_POOL_ACQUIRE,
        idle: process.env.DATABASE_POOL_IDLE
      },
      sync: { force: "true" === process.env.DATABASE_SYNC ? true : false }
    }
  },

  loggerOptions: {
    name: process.env.LOG_NAME,
    level: process.env.LOG_LEVEL
  }
};
