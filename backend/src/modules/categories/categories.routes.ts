import { Router } from "express";
import { categoriesController } from "./categories.controller.ts";

export const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.list);
