import express from "express";
import { pinoHttp } from "pino-http";

export const app = express();
app.use(pinoHttp());

app.get("/health", (req, res) => {
  req.log.info("Health check");
  res.send({ status: "ok" });
});
