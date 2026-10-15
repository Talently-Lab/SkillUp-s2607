import { Router } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.ts";

export const docsRouter = Router();

// Swagger UI needs inline scripts and styles, so it gets its own CSP
docsRouter.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  }),
);
docsRouter.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
docsRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "SkillUp Campus API",
    swaggerOptions: { persistAuthorization: true },
  }),
);
