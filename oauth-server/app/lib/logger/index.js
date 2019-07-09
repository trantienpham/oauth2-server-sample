import bunyan from "bunyan";

export default function createLogger(config) {
  return bunyan.createLogger(config.loggerOptions);
}
