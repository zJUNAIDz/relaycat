import pino = require("pino");

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "relaycat-server",
    env: process.env.NODE_ENV || "development",
  },
  transport: {
    targets: [
      // Pretty console output
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:mm:ss",
          ignore: "pid,hostname",
        },
      },

      // Loki
      {
        target: "pino-loki",
        options: {
          host: process.env.LOKI_URL || "http://localhost:3100",
          labels: {
            app: "relaycat-server",
          },
        },
      },
    ],
  },
});
