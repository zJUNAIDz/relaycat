import pino from "pino";

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:mm:ss",
        ignore: "pid,hostname",
      },
    },
    {
      target: "pino-loki",
      options: {
        host: process.env.LOKI_URL || "http://localhost:3100",
        batching: false,
        interval: 5,

        labels: {
          app: "relaycat-server",
        },
      },
    },
  ],
});

transport.on("error", (err) => {
  console.error("Pino transport error:", err);
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: {
      service: "relaycat-server",
      env: process.env.NODE_ENV || "development",
    },
  },
  transport
);