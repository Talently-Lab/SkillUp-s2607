import express from "express";
import { pinoHttp } from "pino-http";
import { notFound } from "./shared/errors/not-found.ts";
import { errorHandler } from "./shared/middlewares/error-handler.ts";

export const app = express();
app.use(pinoHttp());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

app.use(notFound);
app.use(errorHandler);
